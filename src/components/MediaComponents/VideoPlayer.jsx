import { memo } from "react";
import dynamic from "next/dynamic";

const CustomPlayer = dynamic(() => import("../CustomPlayer"), { ssr: false });

const VideoPlayer = memo(({ src, useCustomPlayer, playerData, isLoading }) => {
    if (useCustomPlayer && playerData) {
        // Determine format from the first source
        const firstSource = playerData.sources[0];
        console.log("First source for custom player:", firstSource);
        const format = firstSource?.type === "m3u8" ? "hls" : "mp4";

        // Extract headers from first source if available
        const headers = firstSource?.headers || null;

        // Use custom player with direct sources
        return (
            <div className="w-full relative aspect-video bg-black/90">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
                <CustomPlayer
                    option={{
                        url: firstSource.url,
                    }}
                    captions={playerData.captions || []}
                    format={format}
                    sources={playerData.sources || []}
                    headers={headers}
                />
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
