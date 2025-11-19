import React, { useState } from 'react'
import { syncContent } from '../services/syncService'
import { useAppStore } from '../store/useAppStore'

export const Login: React.FC = () => {
    const [url, setUrl] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const login = useAppStore((state) => state.login)
    const setSyncProgress = useAppStore((state) => state.setSyncProgress)
    const syncProgress = useAppStore((state) => state.syncProgress)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSyncProgress({ message: 'Starting sync...', percent: 0 })

        try {
            const profile = { url, username, password }
            await syncContent(profile, (progress) => {
                setSyncProgress(progress)
            })

            login(profile)
        } catch (err) {
            setError('Login failed. Please check your credentials and URL.')
            setSyncProgress(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
            <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">
                    StreamHub
                </h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Host URL
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="http://example.com:8080"
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {syncProgress && (
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${syncProgress.percent}%` }}
                            ></div>
                            <p className="text-xs text-center mt-1 text-gray-400">
                                {syncProgress.message}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Connecting...' : 'Connect'}
                    </button>
                </form>
            </div>
        </div>
    )
}
