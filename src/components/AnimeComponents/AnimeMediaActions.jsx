import React, { useState } from "react";
import { PlusCircleIcon, ShareIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import DownloadModal from "./DownloadModal";
import WatchlistButton from "@/components/WatchlistButton";

const AnimeMediaActions = ({
    viewCount,
    episodes,
    currentEpisode,
    onEpisodeChange,
    downloadLink,
    isChangingEpisode,
    imageUrl,
    title,
    id,
}) => {
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    const handleShare = async () => {
        const pageTitle = document.title;
        const shareData = {
            title: pageTitle,
            text: `Check out ${pageTitle.split("|")[0].trim()} on ChinFlix`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch (error) {
            console.log("Share failed:", error);
        }
    };

    const currentEpisodeData = episodes?.find((ep) => ep.id === currentEpisode);
    const currentEpisodeIndex = episodes?.findIndex((ep) => ep.id === currentEpisode);
    const nextEpisode = episodes?.[currentEpisodeIndex + 1]?.id;
    const prevEpisode = episodes?.[currentEpisodeIndex - 1]?.id;

    return (
        <>
            <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-white/80">Episode {currentEpisodeData?.number}</div>
                        </div>
                        <div className="text-sm text-white/50">{episodes?.length} Episodes</div>
                    </div>

                    <div className="flex items-stretch gap-2">
                        <button
                            onClick={() => onEpisodeChange(prevEpisode)}
                            disabled={!prevEpisode}
                            className="flex items-center px-3 bg-white/5 rounded-lg disabled:opacity-40"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>

                        <div className="flex-grow bg-white/5 rounded-lg px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <div className="text-sm text-white/50">Now Playing</div>
                                    <div className="font-medium text-white/90 line-clamp-1">{currentEpisodeData?.title}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* <button className="bg-white/10 p-2 rounded-lg disabled:opacity-40" disabled>
                                        <PlusCircleIcon className="w-5 h-5" />
                                    </button> */}
                                    <WatchlistButton
                                        mediaId={id}
                                        mediaType="anime"
                                        title={title}
                                        image={imageUrl}
                                        className="bg-white/10 p-2 rounded-lg"
                                    />
                                    <button onClick={handleShare} className="bg-white/10 p-2 rounded-lg ">
                                        <ShareIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsDownloadModalOpen(true)}
                                        disabled={isChangingEpisode}
                                        className="bg-white/10 p-2 rounded-lg disabled:opacity-40"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onEpisodeChange(nextEpisode)}
                            disabled={!nextEpisode}
                            className="flex items-center px-3 bg-white/5 rounded-lg disabled:opacity-40"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-2 px-1">
                        <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-red-500 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${((currentEpisodeIndex + 1) / episodes?.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} downloadLink={downloadLink} />
        </>
    );
};

export default AnimeMediaActions;
