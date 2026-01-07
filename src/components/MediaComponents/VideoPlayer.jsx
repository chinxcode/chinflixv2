import { memo, useMemo } from "react";
import dynamic from "next/dynamic";

// const CustomPlayer = dynamic(() => import("../CustomPlayer"), { ssr: false });
const SimplePlayer = dynamic(() => import("../SimplePlayer"), { ssr: false });

const VideoPlayer = memo(({ src, useCustomPlayer, playerData, isLoading }) => {
    // Memoize the props to pass to SimplePlayer to ensure re-render when data changes
    const playerProps = useMemo(() => {
        if (!playerData || !playerData.sources || playerData.sources.length === 0) return null;

        const firstSource = playerData.sources[0];
        // console.log("First source for player:", firstSource);
        const format = firstSource?.type === "m3u8" ? "hls" : "mp4";

        // console.log("captions:", playerData.captions);

        return {
            option: {
                url: firstSource.url,
            },
            captions: playerData.captions || [],
            format,
            sources: playerData.sources || [],
        };
    }, [playerData]);

    if (useCustomPlayer && playerProps) {
        // Use simple custom player
        return (
            <div className="w-full relative aspect-video bg-black/90">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
                <SimplePlayer key={playerProps.option.url} {...playerProps} />
            </div>
        );
    }

    // Use iframe for external players
    return (
        <div className="w-full relative aspect-video bg-black/90">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
            <iframe
                key={src}
                src={src}
                allowFullScreen
                className="absolute inset-0 w-full h-full object-contain object-center z-10"
                title="Video Player"
                loading="lazy"
            />
        </div>
    );
});

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;
