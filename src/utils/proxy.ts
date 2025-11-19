import { invoke } from '@tauri-apps/api/core'

let proxyPort: number | null = null

export async function getProxyUrl(targetUrl: string): Promise<string> {
    if (!targetUrl) return ''

    // If already a local proxy URL, return as is
    if (targetUrl.includes('localhost') && targetUrl.includes('/proxy?url=')) {
        return targetUrl
    }

    if (!proxyPort) {
        try {
            proxyPort = await invoke<number>('get_proxy_port')
            console.log('Proxy port loaded:', proxyPort)
        } catch (e) {
            console.error('Failed to get proxy port:', e)
            // If we can't get the port (e.g. in browser mode), return original
            return targetUrl
        }
    }

    if (!proxyPort) return targetUrl

    const encodedUrl = encodeURIComponent(targetUrl)
    return `http://localhost:${proxyPort}/proxy?url=${encodedUrl}`
}
