import React from "react";
import { PlusCircleIcon, ShareIcon, FlagIcon } from "@heroicons/react/24/outline";

const AnimeMediaActions = ({ viewCount }) => {
    return (
        <div className="w-full text-sm flex gap-2 justify-between items-center my-2 px-2">
            <div className="p-1 text-gray-300 h-6 px-2 text-center min-w-16 text-xs bg-white/5 rounded-md">{viewCount || "N/A"} views</div>
            <div className="flex items-center gap-2">
                <button className="bg-white/5 hover:bg-white/10 active:bg-white/5 smoothie rounded-md py-2 text-sm px-3 flex items-center gap-2">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span className="hidden lg:inline">Add to List</span>
                </button>
                <button className="bg-white/5 hover:bg-white/10 active:bg-white/5 smoothie rounded-md py-2 text-sm px-3 flex items-center gap-2">
                    <ShareIcon className="w-5 h-5" />
                    <span className="hidden lg:inline">Share</span>
                </button>
                <button className="bg-white/5 hover:bg-white/10 active:bg-white/5 smoothie rounded-md py-2 text-sm px-3 flex items-center gap-2">
                    <FlagIcon className="w-5 h-5" />
                    <span className="hidden lg:inline">Report</span>
                </button>
            </div>
        </div>
    );
};

export default AnimeMediaActions;
