import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { BookmarkIcon, EyeIcon, PauseIcon, XMarkIcon, CheckIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import MediaHistoryCard from "@/components/MediaHistoryCard";

const CATEGORIES = [
    {
        id: "all",
        label: "All",
        icon: BookmarkIcon,
        color: "bg-purple-500/20 hover:bg-purple-500/30",
    },
    {
        id: "watching",
        label: "Watching",
        icon: EyeIcon,
        color: "bg-blue-500/20 hover:bg-blue-500/30",
    },
    {
        id: "planning",
        label: "Plan to Watch",
        icon: ClipboardDocumentListIcon,
        color: "bg-green-500/20 hover:bg-green-500/30",
    },
    {
        id: "completed",
        label: "Completed",
        icon: CheckIcon,
        color: "bg-emerald-500/20 hover:bg-emerald-500/30",
    },
    {
        id: "onHold",
        label: "On Hold",
        icon: PauseIcon,
        color: "bg-yellow-500/20 hover:bg-yellow-500/30",
    },
    {
        id: "dropped",
        label: "Dropped",
        icon: XMarkIcon,
        color: "bg-red-500/20 hover:bg-red-500/30",
    },
];

const TYPES = [
    { id: "all", label: "All Content" },
    { id: "movie", label: "Movies" },
    { id: "tv", label: "TV Shows" },
    { id: "anime", label: "Anime" },
];

export default function Watchlist() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [activeType, setActiveType] = useState("all");
    const [watchlist, setWatchlist] = useState([]);
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: "200px 0px",
    });

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("watchlist") || "{}");
        const items = Object.values(data).sort((a, b) => b.addedAt - a.addedAt);
        setWatchlist(items);
    }, []);

    const filteredList = watchlist.filter((item) => {
        const matchesCategory = activeCategory === "all" || item.status === activeCategory;
        const matchesType = activeType === "all" || item.type === activeType;
        return matchesCategory && matchesType;
    });

    const removeFromWatchlist = (index) => {
        if (index < 0 || index >= watchlist.length) return;

        const id = watchlist[index].id;
        const watchlistData = JSON.parse(localStorage.getItem("watchlist") || "{}");
        delete watchlistData[id];
        localStorage.setItem("watchlist", JSON.stringify(watchlistData));
        setWatchlist(Object.values(watchlistData));
    };

    return (
        <>
            <Head>
                <title>Watchlist | ChinFlix</title>
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
                <div className="max-w-[1920px] mx-auto p-8 pb-16 space-y-6">
                    <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold">
                        My Watchlist
                    </motion.h1>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                            {CATEGORIES.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={`
                                            flex items-center gap-2 
                                            px-3 py-2 rounded-lg transition-all duration-300
                                            ${
                                                activeCategory === category.id
                                                    ? `bg-red-500 hover:bg-red-600 `
                                                    : "bg-white/5 hover:bg-white/10"
                                            }
                                            flex-shrink-0
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 ${activeCategory === category.id ? "text-white" : "text-white/70"}`} />
                                        <span className="text-xs md:text-sm font-medium whitespace-nowrap">{category.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>

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
                            {filteredList.length > 0 ? (
                                <motion.div
                                    ref={ref}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex gap-y-2 w-full flex-wrap justify-start smoothie mb-4"
                                >
                                    {filteredList.map((item, index) => (
                                        <MediaHistoryCard
                                            key={item.id}
                                            item={item}
                                            index={watchlist.findIndex((w) => w.id === item.id)}
                                            onRemove={removeFromWatchlist}
                                            isWatchlist={true}
                                            showRating={false}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
                                >
                                    <BookmarkIcon className="w-12 h-12 text-white/10" />
                                    <p className="text-white/50 text-center text-sm">
                                        Your watchlist is empty. Start adding your favorite shows and movies!
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
