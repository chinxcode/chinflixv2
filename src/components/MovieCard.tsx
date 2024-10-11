import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useInView } from "react-intersection-observer";

interface MovieCardProps {
    item: {
        id: number;
        title: string;
        name: string;
        poster_path: string;
        vote_average: number;
    };
}

const MovieCard: React.FC<MovieCardProps> = ({ item }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: "200px 0px",
    });

    return (
        <div className="flex flex-col gap-1 sm:gap-2">
            <div ref={ref} className="relative aspect-[1.45/2] rounded-xl shadow overflow-hidden bg-white/10 cursor-pointer">
                {!imageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-xl" />}
                {inView && (
                    <Image
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={item.title || item.name}
                        layout="fill"
                        objectFit="cover"
                        className={`size-full object-cover object-center !select-none shrink-0 ${
                            imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />
                )}
                <span className="flex flex-col gap-1 absolute items-end text-xs right-1 top-1 smoothie">
                    <span className="bg-black/75 p-[.1rem] px-1 gap-1 rounded-md flex items-center">
                        <StarIcon className="h-3 w-3 text-yellow-400" />
                        {item.vote_average && typeof item.vote_average === "number" ? item.vote_average.toFixed(1) : "N/A"}
                    </span>
                </span>
            </div>
            <div className="flex w-full text-[.82rem] sm:text-sm font-medium !line-clamp-2 tracking-wider">{item.title || item.name}</div>
        </div>
    );
};

export default MovieCard;
