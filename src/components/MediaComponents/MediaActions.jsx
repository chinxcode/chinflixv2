import React from "react";
import { ShareIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import WatchlistButton from "@/components/WatchlistButton";

const MediaActions = ({ type, id, currentSeason, currentEpisode, episodes, onEpisodeChange, posterUrl, title }) => {
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

    const getDownloadUrl = () => {
        return "https://chinfetcher.vercel.app/?q=" + encodeURIComponent(title);
    };

    const currentEpisodeData = episodes?.find((ep, index) => index + 1 === currentEpisode);

    return (
        <div className="w-full flex flex-col gap-3">
            {(type === "tv" || type === "anime") && episodes && (
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-white/80">Season {currentSeason}</div>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="text-sm font-medium text-white/80">Episode {currentEpisode}</div>
                        </div>
                        <div className="text-sm text-white/50">{episodes.length} Episodes</div>
                    </div>

                    <div className="flex items-stretch gap-2">
                        <button
                            onClick={() => onEpisodeChange(currentEpisode - 1)}
                            disabled={currentEpisode <= 1}
                            className="flex items-center px-3 bg-white/5 rounded-lg disabled:opacity-40"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>

                        <div className="flex-grow bg-white/5 rounded-lg px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <div className="text-sm text-white/50">Now Playing</div>
                                    <div className="font-medium text-white/90 line-clamp-1">{currentEpisodeData?.name}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <WatchlistButton
                                        mediaId={id}
                                        mediaType={type}
                                        title={title}
                                        image={posterUrl}
                                        className="bg-white/10 p-2 rounded-lg"
                                    />
                                    <button onClick={handleShare} className="bg-white/10 p-2 rounded-lg">
                                        <ShareIcon className="w-5 h-5" />
                                    </button>
                                    <a
                                        href={getDownloadUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white/10 p-2 rounded-lg"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onEpisodeChange(currentEpisode + 1)}
                            disabled={currentEpisode >= episodes.length}
                            className="flex items-center px-3 bg-white/5 rounded-lg disabled:opacity-40"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-2 px-1">
                        <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-red-500 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${(currentEpisode / episodes.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {type === "movie" && (
                <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                    <div className="flex flex-col">
                        <div className="text-sm text-white/50">Now Playing</div>
                        <div className="font-medium text-white/90 line-clamp-1">{title}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <WatchlistButton
                            mediaId={id}
                            mediaType={type}
                            title={title}
                            image={posterUrl}
                            className="bg-white/10 p-2 rounded-lg"
                        />
                        <button onClick={handleShare} className="bg-white/10 p-2 rounded-lg">
                            <ShareIcon className="w-5 h-5" />
                        </button>
                        <a href={getDownloadUrl()} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-lg">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaActions;
