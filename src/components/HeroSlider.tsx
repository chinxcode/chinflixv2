import { useState, useEffect } from "react";
import Image from "next/image";
import { PlayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { getTrending } from "@/lib/api";
import Skeleton from "./Skeleton";

const HeroSlider = () => {
    const [trendingItems, setTrendingItems] = useState<
        { id: number; title?: string; name?: string; backdrop_path: string; overview: string }[]
    >([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            const data = await getTrending("movie");
            setTrendingItems(data.results.slice(0, 5));
            setLoading(false);
        };
        fetchTrending();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingItems.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [trendingItems]);

    if (loading) {
        return <Skeleton className="w-full aspect-[2/.63] lg:aspect-[2/.6] md:aspect-[2.4/1] rounded-lg" />;
    }

    if (trendingItems.length === 0) return null;

    const item = trendingItems[currentIndex];

    return (
        <div className="relative bg-[#1E1E1E] rounded-lg overflow-hidden md:aspect-[2.4/1] aspect-[2/.63] lg:aspect-[2/.6] shadow-lg">
            <AnimatePresence initial={false}>
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                        alt={item.title || item.name || "Trending item"}
                        layout="fill"
                        objectFit="cover"
                        className="opacity-50"
                    />
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 flex items-end md:items-center">
                <div className="w-full md:w-1/2 p-4 md:p-6 lg:p-10 flex flex-col gap-2 md:gap-4 lg:gap-6 pb-8 md:pb-0">
                    <motion.h2
                        key={`${item.id}-title`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold"
                    >
                        {item.title || item.name}
                    </motion.h2>
                    <motion.p
                        key={`${item.id}-overview`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#E0E0E0] text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3"
                    >
                        {item.overview}
                    </motion.p>
                    <motion.div
                        key={`${item.id}-buttons`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex space-x-2 md:space-x-4"
                    >
                        <button className="bg-white/10 rounded-full overflow-hidden active:bg-white/20 hover:bg-white/15 p-1 sm:p-2 px-2 sm:px-4 flex items-center space-x-1 sm:space-x-2 transition-colors duration-200">
                            <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                            <span className="text-xs sm:text-sm md:text-base">Watch Now</span>
                        </button>
                        <button className="bg-white/10 rounded-full overflow-hidden active:bg-white/20 hover:bg-white/15 p-1 sm:p-2 transition-colors duration-200">
                            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;
