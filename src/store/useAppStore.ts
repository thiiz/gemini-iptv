import { create } from 'zustand'

interface AppState {
    isAuthenticated: boolean
    userProfile: any | null
    syncProgress: { message: string; percent: number } | null
    login: (profile: any) => void
    logout: () => void
    setSyncProgress: (
        progress: { message: string; percent: number } | null
    ) => void
}

export const useAppStore = create<AppState>((set) => ({
    isAuthenticated: false,
    userProfile: null,
    syncProgress: null,
    login: (profile) => set({ isAuthenticated: true, userProfile: profile }),
    logout: () => set({ isAuthenticated: false, userProfile: null }),
    setSyncProgress: (progress) => set({ syncProgress: progress })
}))
