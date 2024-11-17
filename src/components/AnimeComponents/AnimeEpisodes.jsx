import { memo } from "react";
import { PlayIcon } from "@heroicons/react/24/solid";

const AnimeEpisodes = memo(({ episodes, currentEpisode, onEpisodeChange, isLoading }) => {
    return (
        <div className="w-full min-h-[50%] max-h-[70%] shrink-0 rounded-lg overflow-hidden flex flex-col gap-4">
            <div className="flex w-full gap-2 flex-col max-h-[400px] overflow-y-auto overflow-x-hidden rounded-md">
                {episodes.map((episode) => (
                    <div
                        key={episode.id}
                        className={`w-full rounded-xl overflow-hidden smoothie shrink-0 ${
                            episode.id === currentEpisode
                                ? "bg-white/20 ring-2 ring-white/20"
                                : "bg-white/5 hover:scale-[.97] active:!scale-95"
                        }`}
                        onClick={() => !isLoading && onEpisodeChange(episode.id)}
                    >
                        <button className="flex w-full !line-clamp-2 rounded-lg p-3 gap-2 overflow-hidden">
                            <div className="!flex gap-1 w-full tracking-wide items-center !line-clamp-1 font-medium">
                                <span className="text-sm 2xl:text-base text-gray-200 font-medium !leading-tight !shrink-0">
                                    {episode.number}.
                                </span>
                                <span className="!line-clamp-1 text-sm 2xl:text-base text-gray-200 font-light !leading-tight flex-grow">
                                    {episode.title}
                                </span>
                                {episode.id === currentEpisode &&
                                    (isLoading ? (
                                        <span className="loader-spinner !h-5 !w-5" />
                                    ) : (
                                        <PlayIcon className="h-5 w-5 text-slate-50 shrink-0" />
                                    ))}
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

AnimeEpisodes.displayName = "AnimeEpisodes";
export default AnimeEpisodes;
