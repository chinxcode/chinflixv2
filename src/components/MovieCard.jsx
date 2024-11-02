import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useInView } from "react-intersection-observer";

const MovieCard = ({ item, type }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: "200px 0px",
    });
    const year = new Date(item.release_date || item.first_air_date).getFullYear();

    return (
        <div className="w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-[14.28%] 2xl:w-[12.5%] p-[.4rem] sm:p-2 !shrink-0 gap-1 sm:gap-2 flex flex-col">
            <div className="flex w-full !aspect-[1.45/2] cursor-pointer rounded-xl shadow overflow-hidden relative bg-white/10">
                <div ref={ref} className="size-full">
                    <Link href={`/watch/${type}/${item.id}`} className="size-full relative group flex smoothie">
                        {!imageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-xl" />}
                        {inView && (
                            <Image
                                fill
                                src={`http://image.tmdb.org/t/p/w342${item.poster_path}`}
                                alt={item.title || item.name}
                                className={`size-full object-cover object-center !select-none shrink-0 ${
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                }`}
                                onLoad={() => setImageLoaded(true)}
                                loading="lazy"
                            />
                        )}
                        <span className="flex flex-col gap-1 absolute items-end text-xs right-1 top-1 smoothie">
                            <span className="bg-black/75 p-[.1rem] px-1 gap-1 rounded-md flex items-center">
                                <StarIcon className="w-3 h-3 text-yellow-400" />
                                {item.vote_average.toFixed(1) || "N/A"}
                            </span>
                        </span>
                    </Link>
                </div>
            </div>
            <Link href={`/watch/${type}/${item.id}`} className="flex w-full flex-col gap-1">
                <div className="flex text-xs text-gray-300 justify-between">
                    <span className="uppercase">{item.media_type || type}</span>
                    <span>{year}</span>
                </div>
                <div className="flex w-full text-[.82rem] sm:text-sm font-medium !line-clamp-2 tracking-wider">
                    {item.title || item.name}
                </div>
            </Link>
        </div>
    );
};

export default MovieCard;
