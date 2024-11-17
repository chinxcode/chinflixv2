import { memo } from "react";

const VideoPlayer = memo(({ src }) => {
    return (
        <div className="w-full relative aspect-video bg-black/90 ">
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
