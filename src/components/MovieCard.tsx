import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

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
    return (
        <motion.div
            className="relative aspect-[2/3] rounded-xl overflow-hidden hover-scale"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
        >
            <Image
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white font-semibold">{item.title || item.name}</h3>
                    <div className="flex items-center mt-1">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-white text-sm">{item.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MovieCard;
