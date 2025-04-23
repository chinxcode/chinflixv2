import Image from "next/image";
import Link from "next/link";
import { StarIcon, PlayIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

const MediaHistoryCard = ({
    item,
    index,
    onRemove,
    showEpisodeInfo = false,
    showRating = true,
    showDate = false,
    dateString = "",
    isWatchlist = false,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: "200px 0px",
    });

    // Helper function to get image URL, handling both TMDB and AniList paths
    const getImageUrl = () => {
        if (!item.poster_path && !item.image) {
            return "/placeholder-poster.png";
        }

        // If the URL already includes http/https, it's from AniList or a direct path
        if ((item.poster_path && item.poster_path.startsWith("http")) || (item.image && item.image.startsWith("http"))) {
            return item.poster_path || item.image;
        }

        // Otherwise it's a TMDB path
        return `https://image.tmdb.org/t/p/w342${item.poster_path || item.image}`;
    };

    // Helper function to extract year from release date
    const getYear = () => {
        if (item.release_date || item.first_air_date) {
            try {
                return new Date(item.release_date || item.first_air_date).getFullYear();
            } catch (e) {
                return new Date().getFullYear();
            }
        }
        return new Date().getFullYear();
    };

    // Helper function to get title
    const getTitle = () => {
        return item.title || item.name || "Untitled";
    };

    // Builds appropriate link URL based on media type
    const getLinkUrl = () => {
        const baseUrl = `/watch/${item.type}/${item.id}`;
        if ((item.type === "tv" || item.type === "anime") && item.season && item.episode) {
            return `${baseUrl}?s=${item.season}&e=${item.episode}`;
        }
        return baseUrl;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-[14.28%] 2xl:w-[12.5%] p-[.4rem] sm:p-2 !shrink-0 gap-1 sm:gap-2 flex flex-col"
        >
            <motion.div
                whileHover={{ scale: 1.04 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex w-full !aspect-[1.45/2] cursor-pointer rounded-xl shadow overflow-hidden relative bg-white/10"
            >
                <div ref={ref} className="size-full">
                    <Link href={getLinkUrl()} className="size-full relative group flex">
                        {!imageLoaded && (
                            <motion.div
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: 1 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gray-800 rounded-xl"
                            />
                        )}
                        {inView && (
                            <Image
                                fill
                                src={getImageUrl()}
                                alt={getTitle()}
                                className={`size-full object-cover object-center !select-none shrink-0 transition-opacity duration-300 ${
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                }`}
                                onLoad={() => setImageLoaded(true)}
                                loading="lazy"
                            />
                        )}

                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 180 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 15,
                                        }}
                                        className="bg-white/25 backdrop-blur-sm p-4 rounded-full hover:bg-white/30 transition-colors"
                                    >
                                        <PlayIcon className="w-8 h-8 text-white drop-shadow-lg" />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="absolute inset-0">
                            {/* Rating badge - right top */}
                            {showRating && (item.rating > 0 || item.vote_average > 0) && (
                                <motion.span
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute left-1 top-1"
                                >
                                    <span className="bg-black/75 backdrop-blur-sm p-[.1rem] px-1 gap-1 rounded-md flex items-center text-xs">
                                        <StarIcon className="w-3 h-3 text-yellow-400" />
                                        {item.rating?.toFixed(1) || item.vote_average?.toFixed(1) || "N/A"}
                                    </span>
                                </motion.span>
                            )}

                            {/* Delete button - top left */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onRemove(index);
                                }}
                                className="absolute right-1 top-1 p-1 bg-black/25  hover:bg-black/50 rounded-full backdrop-blur-sm z-10"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </motion.button>

                            {/* Episode info badge - bottom left */}
                            {showEpisodeInfo && (item.type === "tv" || item.type === "anime") && item.season && item.episode && (
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute left-1 bottom-3"
                                >
                                    <span className="bg-black/75 backdrop-blur-sm p-[.1rem] px-1 rounded-md flex items-center gap-1 text-xs">
                                        <EyeIcon className="w-3 h-3 text-white/90" />S{item.season} E{item.episode}
                                    </span>
                                </motion.span>
                            )}
                        </div>
                    </Link>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: 0.2 }}>
                <Link href={getLinkUrl()} className="flex w-full flex-col gap-1">
                    <div className="flex text-xs text-gray-300 justify-between">
                        <span className="uppercase">{item.type}</span>
                    </div>
                    <div className="flex w-full text-[.82rem] sm:text-sm font-medium !line-clamp-2 tracking-wider">{getTitle()}</div>
                </Link>
            </motion.div>
        </motion.div>
    );
};

export default MediaHistoryCard;
