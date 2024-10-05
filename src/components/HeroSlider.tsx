import { useState, useEffect } from "react";
import Image from "next/image";
import { PlayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { getTrending } from "@/lib/api";
import Skeleton from "./Skeleton";

const HeroSlider = () => {
    const [trendingItems, setTrendingItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
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
        return <Skeleton className="w-full aspect-[2/.63] rounded-[1.4rem]" />;
    }

    if (trendingItems.length === 0) return null;

    const item = trendingItems[currentIndex];

    return (
        <div className="relative bg-[#1E1E1E] rounded-[1.4rem] 2xl:rounded-3xl overflow-hidden aspect-[2/.63] lg:aspect-[2/.6] shadow">
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
                        fill
                        style={{ objectFit: "cover" }}
                        className="opacity-50"
                    />
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 flex">
                <div className="w-1/2 xl:p-10 p-6 flex z-10 flex-col gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 my-auto">
                    <motion.h2
                        key={`${item.id}-title`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-bold"
                    >
                        {item.title || item.name}
                    </motion.h2>
                    <motion.div
                        key={`${item.id}-info`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center space-x-4 text-sm text-[#E0E0E0]"
                    >
                        <span>{item.media_type.toUpperCase()}</span>
                        <span>{new Date(item.release_date || item.first_air_date).getFullYear()}</span>
                        <span className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {item.vote_average.toFixed(1)}
                        </span>
                    </motion.div>
                    <motion.p
                        key={`${item.id}-overview`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-[#E0E0E0] text-sm line-clamp-3"
                    >
                        {item.overview}
                    </motion.p>
                    <motion.div
                        key={`${item.id}-buttons`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex space-x-4"
                    >
                        <button className="bg-white/10 rounded-full overflow-hidden active:bg-white/20 hover:bg-white/15 p-2 px-4 flex items-center space-x-2 smoothie">
                            <PlayIcon className="h-5 w-5" />
                            <span>Watch Now</span>
                        </button>
                        <button className="bg-white/10 rounded-full overflow-hidden active:bg-white/20 hover:bg-white/15 p-2 smoothie">
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;
