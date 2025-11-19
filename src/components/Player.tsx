import '@vidstack/react/player/styles/default/layouts/video.css'
import '@vidstack/react/player/styles/default/theme.css'

import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react'
import {
    defaultLayoutIcons,
    DefaultVideoLayout
} from '@vidstack/react/player/layouts/default'

import { getProxyUrl } from '@/utils/proxy'
import { useEffect, useState } from 'react'

interface PlayerProps {
    src: string
    title?: string
    poster?: string
    className?: string
    autoPlay?: boolean
}

export function Player({
    src,
    title,
    poster,
    className,
    autoPlay = false
}: PlayerProps) {
    const [proxiedSrc, setProxiedSrc] = useState<string>('')

    useEffect(() => {
        let mounted = true
        const resolveUrl = async () => {
            try {
                const url = await getProxyUrl(src)
                if (mounted) setProxiedSrc(url)
            } catch (e) {
                console.error('Error resolving proxy URL:', e)
                if (mounted) setProxiedSrc(src)
            }
        }
        resolveUrl()
        return () => {
            mounted = false
        }
    }, [src])

    if (!proxiedSrc) {
        return (
            <div
                className={`w-full aspect-video bg-slate-900 flex items-center justify-center text-white/50 ${className}`}
            >
                Loading stream...
            </div>
        )
    }

    return (
        <MediaPlayer
            title={title}
            src={proxiedSrc}
            autoPlay={autoPlay}
            className={`w-full aspect-video bg-slate-900 text-white font-sans overflow-hidden rounded-md ring-media-focus data-[focus]:ring-4 ${className}`}
        >
            <MediaProvider>
                {poster && (
                    <Poster
                        className="absolute inset-0 block h-full w-full rounded-md opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
                        src={poster}
                        alt={title}
                    />
                )}
            </MediaProvider>
            <DefaultVideoLayout
                icons={defaultLayoutIcons}
                slots={{
                    googleCastButton: null // Disable cast for now as it might need extra config
                }}
            />
        </MediaPlayer>
    )
}
