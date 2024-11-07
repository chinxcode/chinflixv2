import React from "react";
import Image from "next/image";

const AnimeMediaInfo = ({ title, image, status, releaseDate, description, genres, subOrDub, totalEpisodes }) => {
    return (
        <div className="flex flex-col w-full gap-5">
            <div className="flex gap-3 w-full">
                <div className="w-[37%] !aspect-[1/1.4] min-w-[7rem] rounded-xl overflow-hidden bg-white/5 relative flex-grow-0 !shrink-0">
                    <Image
                        src={image}
                        alt={title}
                        layout="fill"
                        objectFit="cover"
                        className="size-full object-cover object-center !select-none shrink-0"
                    />
                    <span className="bg-black/75 p-[.1rem] px-1 rounded-md absolute top-1 right-1 text-xs">{subOrDub}</span>
                </div>
                <div className="flex flex-col gap-4 flex-grow w-1/2 justify-end text-white shrink-0 text-sm 2xl:text-base !tracking-wider">
                    <div className="flex gap-1 flex-col">
                        <span className="font-light text-gray-200">Status</span>
                        {status}
                    </div>
                    <div className="flex gap-1 flex-col">
                        <span className="font-light text-gray-200">Episodes</span>
                        {totalEpisodes}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-light text-gray-200">Released</span>
                        <span>{releaseDate}</span>
                    </div>
                </div>
            </div>
            <div className="flex-grow flex flex-col gap-4">
                <div className="flex flex-col gap-4 w-full">
                    <span className="xl:text-[1.33rem] pl-1 font-semibold tracking-wide text-white !leading-tight">{title}</span>
                    <div className="flex items-center rounded-lg p-3 hover:bg-white/10 bg-white/5 smoothie">
                        <span className="line-clamp-4 cursor-pointer text-xs xl:text-[.8rem] 2xl:text-sm tracking-wider text-gray-200">
                            {description}
                        </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {genres.map((genre, index) => (
                            <button key={index} className="p-1 px-2 bg-white/5 hover:bg-white/10 active:bg-white/5 smoothie rounded">
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimeMediaInfo;
