import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ClockIcon, PlayIcon, TrashIcon, ArrowPathIcon, EyeIcon } from "@heroicons/react/24/outline";

const TYPES = [
    { id: "all", label: "All Content" },
    { id: "movie", label: "Movies" },
    { id: "tv", label: "TV Shows" },
    { id: "anime", label: "Anime" },
];

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays === 1) {
        return "Yesterday";
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`;
    } else {
        return date.toLocaleDateString();
    }
};

export default function History() {
    const [activeType, setActiveType] = useState("all");
    const [watchHistory, setWatchHistory] = useState([]);
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: "200px 0px",
    });

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("watch_history") || "[]");
        setWatchHistory(history);
    }, []);

    const filteredHistory = watchHistory.filter((item) => activeType === "all" || item.type === activeType);

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear your watch history?")) {
            localStorage.setItem("watch_history", "[]");
            setWatchHistory([]);
        }
    };

    const removeFromHistory = (index) => {
        const newHistory = [...watchHistory];
        newHistory.splice(index, 1);
        localStorage.setItem("watch_history", JSON.stringify(newHistory));
        setWatchHistory(newHistory);
    };

    return (
        <>
            <Head>
                <title>Watch History | ChinFlix</title>
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
                <div className="max-w-[1920px] mx-auto p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl font-bold"
                        >
                            Watch History
                        </motion.h1>

                        {watchHistory.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={clearHistory}
                                className="px-3 py-1.5 rounded-lg text-xs md:text-sm bg-red-500/20 hover:bg-red-500/40 transition-colors flex items-center gap-1"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Clear History
                            </motion.button>
                        )}
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {TYPES.map((type) => (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={type.id}
                                    onClick={() => setActiveType(type.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs md:text-sm whitespace-nowrap transition-all duration-300
                                        ${
                                            activeType === type.id ? "bg-white/20 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
                                        }`}
                                >
                                    {type.label}
                                </motion.button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {filteredHistory.length > 0 ? (
                                <motion.div
                                    ref={ref}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
                                >
                                    {filteredHistory.map((item, index) => (
                                        <motion.div
                                            key={`${item.id}-${item.type}-${index}`}
                                            layout
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            className="flex flex-col gap-1.5"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.03 }}
                                                className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 group"
                                            >
                                                {item.poster_path ? (
                                                    <Image
                                                        src={item.poster_path}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                        <span className="text-white/50">No Image</span>
                                                    </div>
                                                )}

                                                {/* Play Icon Animation */}
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        whileHover={{ scale: 1.1 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        exit={{ scale: 0, rotate: 180 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 200,
                                                            damping: 15,
                                                        }}
                                                        className="bg-white/25 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors"
                                                    >
                                                        <Link
                                                            href={`/watch/${item.type}/${item.id}${
                                                                item.type === "tv" || item.type === "anime"
                                                                    ? `?s=${item.season}&e=${item.episode}`
                                                                    : ""
                                                            }`}
                                                        >
                                                            <PlayIcon className="w-6 h-6 text-white drop-shadow-lg" />
                                                        </Link>
                                                    </motion.div>
                                                </div>

                                                {/* Top Status Bar */}
                                                <div className="absolute top-0 inset-x-0 p-1.5 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded">
                                                        {item.type.toUpperCase()}
                                                    </span>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeFromHistory(index)}
                                                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-full backdrop-blur-sm"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </motion.button>
                                                </div>

                                                {/* Bottom Episode Info */}
                                                {(item.type === "tv" || item.type === "anime") && (
                                                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                        <div className="flex items-center gap-1.5">
                                                            <EyeIcon className="w-3 h-3 text-white/90" />
                                                            <span className="text-[10px] text-white/90">
                                                                S{item.season} E{item.episode}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                            <div className="flex flex-col px-0.5">
                                                <span className="font-medium text-xs line-clamp-1">{item.title}</span>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-white/50">{formatDate(item.timestamp)}</span>
                                                    {item.rating > 0 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-sm">
                                                            ★ {item.rating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
                                >
                                    <ClockIcon className="w-12 h-12 text-white/10" />
                                    <p className="text-white/50 text-center text-sm">
                                        Your watch history is empty. Start watching shows and movies to track your progress!
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>
        </>
    );
}
