import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { getTrending } from "@/lib/api";
import Skeleton from "./Skeleton";
import { useSwipeable } from "react-swipeable";
import WatchlistButton from "@/components/WatchlistButton";

const HeroSlider = memo(({ type = "movie" }) => {
    const [trendingItems, setTrendingItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const handlers = useSwipeable({
        onSwipedLeft: () => setCurrentIndex((prev) => (prev + 1) % trendingItems.length),
        onSwipedRight: () => setCurrentIndex((prev) => (prev - 1 + trendingItems.length) % trendingItems.length),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

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
                <Skeleton className="w-full h-full aspect-video rounded-2xl" />
            </div>
        );
    }

    if (trendingItems.length === 0) return null;

    const item = trendingItems[currentIndex];

    return (
        <div {...handlers} className="relative rounded-2xl overflow-hidden md:aspect-[2.4/1] aspect-[16/9] lg:aspect-[2/.6] shadow-2xl">
            <AnimatePresence initial={false}>
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                        alt={item.title || item.name}
                        layout="fill"
                        priority
                        quality={90}
                        className="opacity-60 object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex items-center">
                <div className="w-full lg:w-2/3 p-4 sm:p-6 lg:p-10 flex flex-col gap-2 sm:gap-4">
                    <motion.h2
                        key={`${item.id}-title`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold line-clamp-2 text-white/90"
                    >
                        {item.title || item.name}
                    </motion.h2>

                    <motion.p
                        key={`${item.id}-overview`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-[#e0e0e0a7] text-xs sm:text-sm md:text-base line-clamp-2 font-normal"
                    >
                        {item.overview}
                    </motion.p>

                    <motion.div
                        key={`${item.id}-buttons`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="flex space-x-3 sm:space-x-4"
                    >
                        <Link href={`/watch/${type}/${item.id}`}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/90 text-black rounded-full overflow-hidden hover:bg-white p-1.5 sm:p-2 px-3 sm:px-4 flex items-center space-x-1 sm:space-x-2 transition-all duration-200 shadow-lg"
                            >
                                <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm font-medium">Watch Now</span>
                            </motion.button>
                        </Link>
                        <WatchlistButton
                            mediaId={item.id}
                            mediaType={type}
                            title={item.title || item.name}
                            image={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                            className="bg-white/10 backdrop-blur-sm rounded-full overflow-hidden hover:bg-white/20 p-1.5 sm:p-2 transition-all duration-200 shadow-lg "
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
});

HeroSlider.displayName = "HeroSlider";
export default HeroSlider;
