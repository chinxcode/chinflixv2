import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useState } from "react";

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

    return (
        <motion.div
            className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            {!imageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />}
            <Image
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                layout="fill"
                objectFit="cover"
                className={`rounded-lg transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold text-lg truncate">{item.title || item.name}</h3>
                <div className="flex items-center mt-2">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-white text-sm">
                        {item.vote_average && typeof item.vote_average === "number" ? item.vote_average.toFixed(1) : "N/A"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default MovieCard;
