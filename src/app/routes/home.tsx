export function HomePage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center p-4 space-y-4">
            <h1 className="text-2xl font-bold">StreamHub Player Test</h1>
            <div className="w-full max-w-4xl">
                <Player
                    src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                    title="Big Buck Bunny (Test Stream)"
                    poster="https://image.mux.com/x36xhzz/thumbnail.jpg"
                    autoPlay={false}
                />
            </div>
            <div className="text-sm text-muted-foreground">
                Testing native player integration with @vidstack/react
            </div>
        </div>
    )
}

// Necessary for react router to lazy load.
export const Component = HomePage
