import { useState, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import HistorySection from "@/components/HistorySection";

const TYPES = [
    { id: "all", label: "All Content" },
    { id: "movie", label: "Movies" },
    { id: "tv", label: "TV Shows" },
    { id: "anime", label: "Anime" },
];

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

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear your watch history?")) {
            localStorage.setItem("watch_history", "[]");
            setWatchHistory([]);
        }
    };

    const removeFromHistory = (index) => {
        if (index < 0 || index >= watchHistory.length) return;

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
                            {watchHistory.length > 0 ? (
                                <motion.div
                                    ref={ref}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <HistorySection type={activeType} onRemove={removeFromHistory} showEpisodeInfo={true} />
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
