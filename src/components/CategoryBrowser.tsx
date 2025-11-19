// TODO: Fix vidstack imports - currently using basic HTML5 video as fallback
import React, { useEffect, useState } from 'react'
import {
    getCategories,
    getChannelsByCategory,
    getMoviesByCategory,
    getSeriesByCategory
} from '../services/db'
import { useAppStore } from '../store/useAppStore'

interface CategoryBrowserProps {
    type: 'live' | 'movie' | 'series'
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({ type }) => {
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    )
    const [items, setItems] = useState<any[]>([])
    const [playingItem, setPlayingItem] = useState<any | null>(null)

    useEffect(() => {
        loadCategories()
    }, [type])

    useEffect(() => {
        if (selectedCategory) {
            loadItems(selectedCategory)
        } else {
            setItems([])
        }
    }, [selectedCategory, type])

    const loadCategories = async () => {
        const cats = await getCategories(type)
        setCategories(cats as any[])
        if ((cats as any[]).length > 0 && !selectedCategory) {
            // Optional: Auto select first category?
            // setSelectedCategory((cats as any[])[0].id);
        }
    }

    const loadItems = async (categoryId: string) => {
        let data: any[] = []
        if (type === 'live') {
            data = (await getChannelsByCategory(categoryId)) as any[]
        } else if (type === 'movie') {
            data = (await getMoviesByCategory(categoryId)) as any[]
        } else if (type === 'series') {
            data = (await getSeriesByCategory(categoryId)) as any[]
        }
        setItems(data)
    }

    const handleItemClick = (item: any) => {
        setPlayingItem(item)
    }

    return (
        <div className="flex h-full text-white">
            {/* Categories Sidebar */}
            <div className="w-64 bg-gray-900 p-4 overflow-y-auto border-r border-gray-800">
                <h2 className="text-xl font-bold mb-4 capitalize">
                    {type} Categories
                </h2>
                <ul>
                    {categories.map((cat: any) => (
                        <li
                            key={cat.id}
                            className={`cursor-pointer p-2 rounded hover:bg-gray-800 ${selectedCategory === cat.id ? 'bg-blue-600' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Items Grid */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-950">
                {selectedCategory ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {items.map((item: any) => (
                            <div
                                key={item.id}
                                className="cursor-pointer group"
                                onClick={() => handleItemClick(item)}
                            >
                                <div className="aspect-video bg-gray-800 rounded overflow-hidden relative">
                                    {item.logo ? (
                                        <img
                                            src={item.logo}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            No Logo
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white font-bold">
                                            Play
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm truncate">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a category to view content
                    </div>
                )}
            </div>

            {/* Player Overlay */}
            {playingItem && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                    <button
                        className="absolute top-4 right-4 text-white text-2xl z-50"
                        onClick={() => setPlayingItem(null)}
                    >
                        &times;
                    </button>
                    <div className="w-full max-w-5xl aspect-video">
                        <Player item={playingItem} />
                    </div>
                </div>
            )}
        </div>
    )
}

const Player = ({ item }: { item: any }) => {
    const userProfile = useAppStore((state) => state.userProfile)

    if (!userProfile) return <div className="text-white">Error: No profile</div>

    // Construct URL based on type
    const baseUrl = userProfile.url
    const username = userProfile.username
    const password = userProfile.password

    const type = item.epg_id !== undefined ? 'live' : 'movie'

    let url = ''
    if (type === 'live') {
        url = `${baseUrl}/live/${username}/${password}/${item.stream_id}.m3u8`
    } else {
        url = `${baseUrl}/movie/${username}/${password}/${item.stream_id}.mp4`
    }

    // Using basic HTML5 video player as fallback until vidstack is properly configured
    return (
        <video className="w-full h-full" controls autoPlay src={url}>
            <source
                src={url}
                type={type === 'live' ? 'application/x-mpegURL' : 'video/mp4'}
            />
            Your browser does not support the video tag.
        </video>
    )
}
