import React from "react";

interface VideoPlayerProps {
    src: string;
    poster: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
    return (
        <div className="w-full relative aspect-video bg-white/5 backdrop-blur-sm rounded-xl 2xl:rounded-2xl overflow-hidden shadow-md">
            <iframe
                src={src}
                width="100%"
                height="100%"
                allowFullScreen
                id="video-player"
                referrerPolicy="origin"
                className="size-full object-contain object-center"
            />
        </div>
    );
};

export default VideoPlayer;
