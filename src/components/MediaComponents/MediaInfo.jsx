import { memo } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { PlayIcon } from "@heroicons/react/24/outline";

const MediaInfo = memo(({ title, poster, rating, status, production, aired, description, genres, videos, setTrailer }) => {
    return (
        <div className="flex flex-col w-full gap-5">
            <div className="flex gap-3 w-full">
                <div className="w-[37%] !aspect-[1/1.4] min-w-[7rem] rounded-xl overflow-hidden bg-white/5 relative flex-grow-0 !shrink-0">
                    <Image
                        src={poster}
                        alt={title}
                        width={400}
                        height={600}
                        className="size-full object-cover object-center !select-none"
                        priority
                    />
                    <span className="bg-black/75 p-[.1rem] px-1 gap-1 rounded-md flex items-center absolute top-1 text-xs right-1">
                        <StarIcon className="h-3 w-3 text-yellow-400" />
                        {rating.toFixed(1)}
                    </span>
                </div>
                <div className="flex flex-col gap-4 flex-grow w-1/2 justify-end text-white shrink-0 text-sm 2xl:text-base !tracking-wider">
                    <div className="flex gap-1 flex-col tracking-wider">
                        <span className="font-light text-gray-200 !shrink-0">Status</span>
                        {status}
                    </div>
                    <div className="flex gap-2 flex-col tracking-wider">
                        <span className="font-light text-gray-200 !shrink-0">Production</span>
                        <button className="smoothie bubbly rounded flex-grow-0 size-fit">{production}</button>
                    </div>
                    <div className="flex flex-col gap-1 tracking-wider">
                        <span className="font-light text-gray-200 !shrink-0">Aired</span>
                        <span>{aired}</span>
                    </div>
                </div>
            </div>
            <div className="flex-grow flex flex-col gap-4">
                <div className="flex flex-col gap-4 w-full">
                    <span className="xl:text-[1.33rem] pl-1 font-semibold tracking-wide text-white !leading-tight">{title}</span>
                    <div className="flex items-center rounded-lg p-3 hover:bg-white/10 bg-white/5 smoothie">
                        <span className="line-clamp-4 cursor-pointer text-xs xl:text-[.8rem] 2xl:text-sm tracking-wider text-gray-200 smoothie">
                            {description}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <div className="flex gap-2 flex-wrap items-center text-[.95rem] 2xl:text-base">
                            {genres.map((genre, index) => (
                                <button
                                    key={index}
                                    className="p-1 px-2 bg-white/5 hover:bg-white/10 active:bg-white/5 smoothie bubbly rounded"
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {videos.length > 0 && (
                        <>
                            <span className="xl:text-[1.33rem] mt-4 pl-1 font-semibold tracking-wide text-white !leading-tight">
                                Trailers
                            </span>
                            <div className=" grid grid-cols-1 md:grid-cols-2 gap-2">
                                {videos.map((video, index) => (
                                    <button
                                        key={index}
                                        className="flex items-center justify-between rounded-lg p-3 hover:bg-white/10 bg-white/5 smoothie group"
                                        onClick={() => setTrailer("https://www.youtube.com/embed/" + video.key)}
                                    >
                                        <span className="text-sm text-white line-clamp-1">{video.name}</span>
                                        <PlayIcon className="h-5 w-5 text-white" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

MediaInfo.displayName = "MediaInfo";
export default MediaInfo;
