import {
    Film,
    Home,
    LogOut,
    RefreshCw,
    Settings,
    Tv,
    Video
} from 'lucide-react'
import { useState } from 'react'
import { CategoryBrowser } from './components/CategoryBrowser'
import { Login } from './components/Login'
import { syncContent } from './services/syncService'
import { useAppStore } from './store/useAppStore'

function App() {
    const isAuthenticated = useAppStore((state) => state.isAuthenticated)
    const userProfile = useAppStore((state) => state.userProfile)
    const logout = useAppStore((state) => state.logout)
    const setSyncProgress = useAppStore((state) => state.setSyncProgress)

    const [currentView, setCurrentView] = useState<
        'dashboard' | 'live' | 'movie' | 'series' | 'settings'
    >('dashboard')

    const handleSync = async () => {
        if (userProfile) {
            await syncContent(userProfile, setSyncProgress)
        }
    }

    if (!isAuthenticated) {
        return <Login />
    }

    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-20 flex flex-col items-center py-4 bg-gray-900 border-r border-gray-800 space-y-8">
                <div className="p-2 bg-blue-600 rounded-lg">
                    <Tv className="w-6 h-6 text-white" />
                </div>

                <nav className="flex flex-col space-y-6 w-full items-center flex-1">
                    <NavItem
                        icon={<Home />}
                        active={currentView === 'dashboard'}
                        onClick={() => setCurrentView('dashboard')}
                        label="Home"
                    />
                    <NavItem
                        icon={<Tv />}
                        active={currentView === 'live'}
                        onClick={() => setCurrentView('live')}
                        label="Live TV"
                    />
                    <NavItem
                        icon={<Film />}
                        active={currentView === 'movie'}
                        onClick={() => setCurrentView('movie')}
                        label="Movies"
                    />
                    <NavItem
                        icon={<Video />}
                        active={currentView === 'series'}
                        onClick={() => setCurrentView('series')}
                        label="Series"
                    />
                    <NavItem
                        icon={<Settings />}
                        active={currentView === 'settings'}
                        onClick={() => setCurrentView('settings')}
                        label="Settings"
                    />
                </nav>

                <div className="flex flex-col space-y-6 w-full items-center mb-4">
                    <button
                        onClick={handleSync}
                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        title="Sync"
                    >
                        <RefreshCw className="w-6 h-6" />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'live' && <CategoryBrowser type="live" />}
                {currentView === 'movie' && <CategoryBrowser type="movie" />}
                {currentView === 'series' && <CategoryBrowser type="series" />}
                {currentView === 'settings' && (
                    <div className="p-8">Settings Placeholder</div>
                )}
            </div>
        </div>
    )
}

const NavItem = ({ icon, active, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-xl transition-all duration-200 group relative ${
            active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
        {icon}
        <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {label}
        </span>
    </button>
)

const Dashboard = () => (
    <div className="p-8 overflow-y-auto h-full">
        <h1 className="text-3xl font-bold mb-6">Welcome Back</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold mb-4">Recent Live TV</h3>
                <div className="text-gray-500">No recent channels</div>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold mb-4">New Movies</h3>
                <div className="text-gray-500">No new movies</div>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold mb-4">
                    Continue Watching
                </h3>
                <div className="text-gray-500">Nothing to resume</div>
            </div>
        </div>
    </div>
)

export default App
