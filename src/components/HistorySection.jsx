import { useState, useEffect, useRef, memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Skeleton from "./Skeleton";
import MediaHistoryCard from "./MediaHistoryCard";

// Helper function to get relative date string
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays === 1) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
};

// Get day category based on timestamp (0=today, 1=yesterday, 2+=specific date)
const getDayCategory = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 0;
    if (diffDays === 1) return 1;
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
};

const HistorySection = memo(({ type = "all", title, isWatchlist = false, showEpisodeInfo = true, allTime = false }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            try {
                // Load history data from localStorage
                const historyData = JSON.parse(localStorage.getItem("watch_history") || "[]");
                setItems(historyData);
            } catch (error) {
                console.error("Error loading history data:", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle removing an item from history
    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);

        // Update localStorage
        localStorage.setItem("watch_history", JSON.stringify(newItems));

        // Update state
        setItems(newItems);
    };

    // Filter and organize history items
    const organizedHistory = useMemo(() => {
        // First filter by type if needed
        const filteredItems = type === "all" ? items : items.filter((item) => item.type === type);

        if (allTime) {
            return { allItems: filteredItems };
        }

        // Organize by date
        const today = [];
        const yesterday = [];
        const daysAgo = {};

        filteredItems.forEach((item) => {
            const category = getDayCategory(item.timestamp);

            if (category === 0) {
                today.push(item);
            } else if (category === 1) {
                yesterday.push(item);
            } else {
                if (!daysAgo[category]) {
                    daysAgo[category] = [];
                }
                daysAgo[category].push(item);
            }
        });

        return { today, yesterday, daysAgo };
    }, [items, type, allTime]);

    const scroll = (direction, ref = scrollContainerRef) => {
        if (ref.current) {
            const scrollAmount = ref.current.clientWidth * 0.5;
            ref.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    // Create section title based on time period or custom title
    const getSectionTitle = (sectionType) => {
        if (title) {
            return (
                <div className="flex items-center gap-2">
                    <span>{title}</span>
                </div>
            );
        }

        // For all-time view with no date sections
        if (allTime) {
            let typeLabel = "";
            if (type === "movie") typeLabel = "Movies";
            else if (type === "tv") typeLabel = "TV Shows";
            else if (type === "anime") typeLabel = "Anime";
            else typeLabel = "Content";

            return (
                <div className="flex items-center gap-2">
                    <span>{`Watch History ${typeLabel !== "Content" ? `- ${typeLabel}` : ""}`}</span>
                </div>
            );
        }

        return sectionType;
    };

    // Render a specific time period section
    const renderTimeSection = (sectionTitle, sectionItems, sectionRef = scrollContainerRef) => {
        if (!sectionItems || sectionItems.length === 0) return null;

        return (
            <section className="mt-8 px-4 lg:px-0 relative">
                <div className="w-full flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[1.35rem] font-medium px-1">{getSectionTitle(sectionTitle)}</h2>
                        {allTime && (
                            <Link href="/history">
                                <ArrowUpRightIcon className="size-5" />
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center rounded-xl overflow-hidden justify-center gap-[1px]">
                        <button
                            onClick={() => scroll("left", sectionRef)}
                            className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                            aria-label="Scroll left"
                        >
                            <ArrowLeftIcon className="size-[1.1rem]" />
                        </button>
                        <button
                            onClick={() => scroll("right", sectionRef)}
                            className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                            aria-label="Scroll right"
                        >
                            <ArrowRightIcon className="size-[1.1rem]" />
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <div ref={sectionRef} className="flex gap-y-2 w-full smoothie overflow-x-auto overflow-y-hidden scrollbar-hide">
                        {loading
                            ? Array(12)
                                  .fill(0)
                                  .map((_, i) => (
                                      <div
                                          key={i}
                                          className="w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-[14.28%] 2xl:w-[12.5%] p-[.4rem] sm:p-2 !shrink-0"
                                      >
                                          <Skeleton className="w-full !aspect-[1.45/2] rounded-xl" />
                                      </div>
                                  ))
                            : sectionItems.map((item, index) => (
                                  <MediaHistoryCard
                                      key={`${item.id}-${item.type}-${index}`}
                                      item={item}
                                      index={items.findIndex((i) => i.id === item.id && i.type === item.type)}
                                      onRemove={handleRemoveItem}
                                      showEpisodeInfo={showEpisodeInfo}
                                      showRating={true}
                                      showDate={!isWatchlist}
                                      dateString={formatDate(item.timestamp)}
                                      isWatchlist={isWatchlist}
                                  />
                              ))}
                    </div>
                </div>
            </section>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {allTime ? (
                renderTimeSection(title || "Watch History", organizedHistory.allItems)
            ) : (
                <>
                    {renderTimeSection("Today", organizedHistory.today)}
                    {renderTimeSection("Yesterday", organizedHistory.yesterday)}
                    {Object.entries(organizedHistory.daysAgo).map(([date, items]) => renderTimeSection(date, items))}
                </>
            )}
        </motion.div>
    );
});

HistorySection.displayName = "HistorySection";
export default HistorySection;
