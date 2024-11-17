import { memo, useRef } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

const AnimePlayer = memo(({ src, isLoading }) => {
    const playerRef = useRef();

    const handleSkip = () => {
        if (playerRef.current) {
            playerRef.current.currentTime += 85;
        }
    };

    return (
        <div className="relative w-full aspect-video bg-black/90">
            <MediaPlayer ref={playerRef} className="w-full h-full" src={src} load="visible">
                <MediaProvider>
                    <DefaultVideoLayout
                        icons={defaultLayoutIcons}
                        slots={{
                            skipButton: (
                                <button className="vds-button" onClick={handleSkip}>
                                    <span style={{ color: "red", fontSize: "1.1rem", fontWeight: 600 }}>+85s</span>
                                </button>
                            ),
                        }}
                    />
                </MediaProvider>
            </MediaPlayer>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
                </div>
            )}
        </div>
    );
});

AnimePlayer.displayName = "AnimePlayer";
export default AnimePlayer;
