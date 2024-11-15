import { memo } from "react";

const VideoPlayer = memo(({ src }) => {
    return (
        <div className="w-full relative aspect-video bg-white/5 backdrop-blur-sm rounded-xl 2xl:rounded-2xl overflow-hidden shadow-md">
            <iframe src={src} allowFullScreen className="size-full object-contain object-center" title="Video Player" loading="lazy" />
        </div>
    );
});

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;
