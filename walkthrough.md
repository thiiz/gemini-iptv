# StreamHub Walkthrough

## Overview

StreamHub is a desktop IPTV application built with Tauri v2, React 19, and Tailwind v4. It features an offline-first architecture using SQLite and synchronizes content from Xtream API.

## Features Implemented

- **Database**: SQLite integration with `profiles`, `categories`, `channels`, `movies`, `series` tables.
- **Sync Service**: Fetches and saves content from Xtream API.
- **UI**:
    - **Login**: Authenticates with Xtream credentials.
    - **Dashboard**: Main hub (placeholder for recent items).
    - **Category Browser**: Browses Live TV, Movies, and Series.
    - **Player**: Video player using `@vidstack/react`.
- **State Management**: Zustand store for user profile and sync progress.

## How to Run

1. **Install Dependencies**:
    ```bash
    bun install
    ```
2. **Run Development Server**:
    ```bash
    bun tauri dev
    ```

## Verification Steps

1. **Launch App**: Ensure the app starts and shows the Login screen.
2. **Login**: Enter valid Xtream credentials (URL, Username, Password).
3. **Sync**: Watch the progress bar as it fetches data.
4. **Browse**: Navigate through Live TV, Movies, and Series.
5. **Play**: Click an item to open the player.

## Notes

- The `@iptv/xtream-api` package is assumed to be available.
- The player uses HLS for Live TV and MP4 for VOD (default assumption).
