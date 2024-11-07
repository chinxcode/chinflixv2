import React from "react";
import { PlayIcon } from "@heroicons/react/24/solid";

const SeasonEpisode = ({ seasons, episodes, currentSeason, currentEpisode, onSeasonChange, onEpisodeChange }) => {
    return (
        <div className="w-full min-h-[50%] max-h-[70%] shrink-0 rounded-lg overflow-hidden flex flex-col gap-4">
            <div className="flex w-full gap-1 h-9 items-center bg-white/5 shrink-0">
                <div className="w-[45%] shrink-0">
                    <select
                        className="flex h-9 items-center justify-between rounded-lg px-3 text-sm placeholder:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50 w-full !bg-gray-700"
                        value={currentSeason}
                        onChange={(e) => onSeasonChange(Number(e.target.value))}
                    >
                        {seasons
                            .filter((season) => season.startsWith("Season"))
                            .map((season, index) => (
                                <option key={index} value={index + 1}>
                                    {season}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="flex-grow h-full !bg-white/5 rounded-md">
                    <input
                        type="number"
                        className="bg-transparent p-1 px-3 size-full rounded-md text-sm appearance-[textfield]"
                        placeholder="Episode No."
                        value={currentEpisode}
                        onChange={(e) => onEpisodeChange(Number(e.target.value))}
                    />
                </div>
            </div>
            <div className="flex w-full gap-2 flex-col max-h-[400px] overflow-y-auto overflow-x-hidden rounded-md">
                {episodes.map((episode, index) => (
                    <div
                        key={index}
                        className={`${
                            index + 1 === currentEpisode
                                ? "brightness-[.7] pointer-events-none"
                                : "bubbly hover:scale-[.97] active:!scale-95"
                        } w-full bg-white/5 rounded-xl overflow-hidden smoothie shrink-0`}
                        onClick={() => onEpisodeChange(index + 1)}
                    >
                        <button className="flex w-full !line-clamp-2 rounded-lg p-3 gap-2 overflow-hidden">
                            <div className="!flex gap-1 flex-colw-full tracking-wide items-center !line-clamp-1 font-medium">
                                <span className="text-sm 2xl:text-base text-gray-200 font-medium !leading-tight !shrink-0">
                                    {index + 1}.
                                </span>
                                <span className="!line-clamp-1 text-sm 2xl:text-base text-gray-200 font-light !leading-tight flex-grow">
                                    {episode.title}
                                </span>
                                {index + 1 === currentEpisode && <PlayIcon className="h-5 w-5 text-slate-50 shrink-0" />}
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeasonEpisode;
