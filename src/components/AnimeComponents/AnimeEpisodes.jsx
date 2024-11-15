import { memo } from "react";
import { PlayIcon } from "@heroicons/react/24/solid";

const AnimeEpisodes = memo(({ episodes, currentEpisode, onEpisodeChange }) => {
    return (
        <div className="w-full min-h-[50%] max-h-[70%] shrink-0 rounded-lg overflow-hidden flex flex-col gap-4">
            <div className="flex w-full gap-2 flex-col max-h-[400px] overflow-y-auto overflow-x-hidden rounded-md">
                {episodes.map((episode) => (
                    <div
                        key={episode.id}
                        className={`${
                            episode.id === currentEpisode
                                ? "brightness-[.7] pointer-events-none"
                                : "bubbly hover:scale-[.97] active:!scale-95"
                        } w-full bg-white/5 rounded-xl overflow-hidden smoothie shrink-0`}
                        onClick={() => onEpisodeChange(episode.id)}
                    >
                        <button
                            className="flex w-full !line-clamp-2 rounded-lg p-3 gap-2 overflow-hidden"
                            aria-label={`Play Episode ${episode.number}`}
                        >
                            <div className="!flex gap-1 flex-colw-full tracking-wide items-center !line-clamp-1 font-medium">
                                <span className="text-sm 2xl:text-base text-gray-200 font-medium !leading-tight !shrink-0">
                                    Episode {episode.number}
                                </span>
                                {episode.id === currentEpisode && <PlayIcon className="h-5 w-5 text-slate-50 shrink-0" />}
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
