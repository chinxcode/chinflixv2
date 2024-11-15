import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { getTrending } from "@/lib/api";
import Skeleton from "./Skeleton";

const HeroSlider = memo(({ type = "movie" }) => {
    const [trendingItems, setTrendingItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                setLoading(true);
                const data = await getTrending(type);
                setTrendingItems(data.results.slice(0, 10));
            } catch (error) {
                console.error("Error fetching trending items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, [type]);

    useEffect(() => {
        if (trendingItems.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingItems.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [trendingItems]);

    if (loading) {
        return (
            <div className="relative bg-[#1E1E1E] rounded-lg overflow-hidden md:aspect-[2.4/1] aspect-[16/9] lg:aspect-[2/.6] shadow-lg">
                <Skeleton className="w-full h-full aspect-video rounded-lg" />
            </div>
        );
    }

    if (trendingItems.length === 0) return null;

    const item = trendingItems[currentIndex];

    return (
        <div className="relative bg-[#1E1E1E] rounded-lg overflow-hidden md:aspect-[2.4/1] aspect-[16/9] lg:aspect-[2/.6] shadow-lg">
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
                        alt={item.title || item.name}
                        layout="fill"
                        priority
                        quality={90}
                        className="opacity-50 object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex items-center">
                <div className="w-full lg:w-2/3 p-4 sm:p-6 lg:p-10 flex flex-col gap-2 sm:gap-4">
                    <motion.h2
                        key={`${item.id}-title`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold line-clamp-2"
                    >
                        {item.title || item.name}
                    </motion.h2>

                    <motion.p
                        key={`${item.id}-overview`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#E0E0E0] text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 lg:line-clamp-4"
                    >
                        {item.overview}
                    </motion.p>

                    <motion.div
                        key={`${item.id}-buttons`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex space-x-2 sm:space-x-4"
                    >
                        <Link href={`/watch/${type}/${item.id}`}>
                            <button className="bg-white/10 rounded-full overflow-hidden active:bg-white/20 hover:bg-white/15 p-1 sm:p-2 px-2 sm:px-4 flex items-center space-x-1 sm:space-x-2 transition-colors duration-200">
                                <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">Watch Now</span>
                            </button>
                        </Link>
                        <button
                            className="bg-white/10 rounded-full overflow-hidden active:bg-white/20 hover:bg-white/15 p-1 sm:p-2 transition-colors duration-200"
                            aria-label="Add to watchlist"
                        >
                            <PlusIcon className="h-3 w-3 sm:h-5 sm:w-5" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
});

HeroSlider.displayName = "HeroSlider";
export default HeroSlider;
