import React, { useState } from "react";
import { PlusCircleIcon, ShareIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import DownloadModal from "./DownloadModal";

const AnimeMediaActions = ({ viewCount, downloadLink }) => {
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

    return (
        <>
            <div className="w-full text-sm flex gap-2 justify-between items-center my-2 px-2">
                <div className="p-1 text-gray-300 h-6 px-2 text-center min-w-16 text-xs bg-white/5 rounded-md">
                    {viewCount || "N/A"} views
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-white/5 hover:bg-white/10 active:bg-white/5 smoothie rounded-md py-2 text-sm px-3 flex items-center gap-2">
                        <PlusCircleIcon className="w-5 h-5" />
                        <span className="hidden lg:inline">Add to List</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="bg-white/5 hover:bg-white/10 active:bg-white/5 smoothie rounded-md py-2 text-sm px-3 flex items-center gap-2"
                    >
                        <ShareIcon className="w-5 h-5" />
                        <span className="hidden lg:inline">Share</span>
                    </button>
                    <button
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="bg-white/5 hover:bg-white/10 active:bg-white/5 smoothie rounded-md py-2 text-sm px-3 flex items-center gap-2"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span className="hidden lg:inline">Download</span>
                    </button>
                </div>
            </div>
            <DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} downloadLink={downloadLink} />
        </>
    );
};

export default AnimeMediaActions;
