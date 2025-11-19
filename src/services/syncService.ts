import {
    saveCategories,
    saveChannels,
    saveMovies,
    saveProfile,
    saveSeries
} from './db'
import { TauriXtream } from './tauriXtream'

export interface SyncProgress {
    message: string
    percent: number
}

export const syncContent = async (
    profile: any,
    onProgress?: (progress: SyncProgress) => void
) => {
    try {
        onProgress?.({ message: 'Connecting to Xtream API...', percent: 0 })

        const xtream = new TauriXtream({
            url: profile.url,
            username: profile.username,
            password: profile.password
        })

        // Validate login and save profile
        const accountInfo = await xtream.getProfile()
        await saveProfile({ ...profile, server_info: accountInfo })
        onProgress?.({
            message: 'Authenticated. Fetching Live Categories...',
            percent: 10
        })

        // Live Categories
        const liveCategories = await xtream.getChannelCategories()
        await saveCategories(liveCategories, 'live')
        onProgress?.({ message: 'Fetching Live Channels...', percent: 20 })

        // Live Channels
        const liveStreams = await xtream.getChannels()
        await saveChannels(liveStreams)
        onProgress?.({ message: 'Fetching Movie Categories...', percent: 40 })

        // Movie Categories
        const movieCategories = await xtream.getMovieCategories()
        await saveCategories(movieCategories, 'movie')
        onProgress?.({ message: 'Fetching Movies...', percent: 50 })

        // Movies
        const movies = await xtream.getMovies()
        await saveMovies(movies)
        onProgress?.({ message: 'Fetching Series Categories...', percent: 70 })

        // Series Categories
        const seriesCategories = await xtream.getShowCategories()
        await saveCategories(seriesCategories, 'series')
        onProgress?.({ message: 'Fetching Series...', percent: 80 })

        // Series
        const series = await xtream.getShows()
        await saveSeries(series)
        onProgress?.({ message: 'Sync Complete!', percent: 100 })

        return true
    } catch (error) {
        console.error('Sync failed:', error)
        onProgress?.({ message: `Sync failed: ${error}`, percent: 0 })
        throw error
    }
}
