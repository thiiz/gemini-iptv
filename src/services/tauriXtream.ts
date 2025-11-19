import { fetch } from '@tauri-apps/plugin-http'

// Custom Xtream API client that uses Tauri's HTTP plugin instead of browser fetch
// This bypasses CORS restrictions since requests are made from the native backend

export interface XtreamProfile {
    user_info: {
        username: string
        password: string
        message: string
        auth: number
        status: string
        exp_date: string
        is_trial: string
        active_cons: string
        created_at: string
        max_connections: string
        allowed_output_formats: string[]
    }
    server_info: {
        url: string
        port: string
        https_port: string
        server_protocol: string
        rtmp_port: string
        timezone: string
        timestamp_now: number
        time_now: string
    }
}

export interface Category {
    category_id: string
    category_name: string
    parent_id: number
}

export interface Channel {
    num: number
    name: string
    stream_type: string
    stream_id: number
    stream_icon: string
    epg_channel_id: string
    added: string
    category_id: string
    custom_sid: string
    tv_archive: number
    direct_source: string
    tv_archive_duration: number
}

export interface Movie {
    num: number
    name: string
    stream_type: string
    stream_id: number
    stream_icon: string
    rating: string
    rating_5based: number
    added: string
    category_id: string
    container_extension: string
    custom_sid: string
    direct_source: string
}

export interface Series {
    num: number
    name: string
    series_id: number
    cover: string
    plot: string
    cast: string
    director: string
    genre: string
    releaseDate: string
    last_modified: string
    rating: string
    rating_5based: number
    backdrop_path: string[]
    youtube_trailer: string
    episode_run_time: string
    category_id: string
}

export class TauriXtream {
    private baseUrl: string
    private username: string
    private password: string

    constructor(config: { url: string; username: string; password: string }) {
        this.baseUrl = config.url.replace(/\/$/, '') // Remove trailing slash
        this.username = config.username
        this.password = config.password
    }

    private buildUrl(
        action: string,
        additionalParams?: Record<string, string>
    ): string {
        const params = new URLSearchParams({
            username: this.username,
            password: this.password,
            action,
            ...additionalParams
        })
        return `${this.baseUrl}/player_api.php?${params.toString()}`
    }

    async getProfile(): Promise<XtreamProfile> {
        const url = this.buildUrl('get_profile')
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    }

    async getChannelCategories(): Promise<Category[]> {
        const url = this.buildUrl('get_live_categories')
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    }

    async getChannels(categoryId?: string): Promise<Channel[]> {
        const params = categoryId ? { category_id: categoryId } : undefined
        const url = this.buildUrl('get_live_streams', params)
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    }

    async getMovieCategories(): Promise<Category[]> {
        const url = this.buildUrl('get_vod_categories')
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    }

    async getMovies(categoryId?: string): Promise<Movie[]> {
        const params = categoryId ? { category_id: categoryId } : undefined
        const url = this.buildUrl('get_vod_streams', params)
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    }

    async getShowCategories(): Promise<Category[]> {
        const url = this.buildUrl('get_series_categories')
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    }

    async getShows(categoryId?: string): Promise<Series[]> {
        const params = categoryId ? { category_id: categoryId } : undefined
        const url = this.buildUrl('get_series', params)
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    }
}
