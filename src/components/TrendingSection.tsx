import { useState, useEffect, useRef } from "react";
import MovieCard from "./MovieCard";
import { getTrending } from "@/lib/api";
import Skeleton from "./Skeleton";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface TrendingSectionProps {
    type: "movie" | "tv";
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ type }) => {
    const [trendingItems, setTrendingItems] = useState<
        { id: number; title: string; name: string; poster_path: string; vote_average: number; overview: string }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            const data = await getTrending(type);
            setTrendingItems(
                data.results.map(
                    (item: { id: number; title?: string; name?: string; poster_path: string; vote_average: number; overview: string }) => ({
                        id: item.id,
                        title: item.title || item.name,
                        name: item.name || item.title,
                        poster_path: item.poster_path,
                        vote_average: item.vote_average,
                        overview: item.overview,
                    })
                )
            );
            setLoading(false);
        };
        fetchTrending();
    }, [type]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="mt-8 px-4 lg:px-0 relative">
            <h2 className="text-2xl font-bold mb-4">Trending {type === "movie" ? "Movies" : "Shows"}</h2>
            <div className="relative">
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full lg:hidden"
                >
                    <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
                <div
                    ref={scrollContainerRef}
                    className="flex lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-4 w-full overflow-x-auto lg:overflow-x-visible scrollbar-hide"
                >
                    {loading
                        ? Array(6)
                              .fill(0)
                              .map((_, i) => (
                                  <div key={i} className="w-[32%] sm:w-[22%] md:w-[19%] lg:w-full !aspect-[1.44/2] !p-2 !shrink-0 lg:!p-0">
                                      <Skeleton className="w-full h-full rounded-xl" />
                                  </div>
                              ))
                        : trendingItems.map((item) => (
                              <div
                                  key={item.id}
                                  className="w-[32%] sm:w-[22%] md:w-[19%] lg:w-full !aspect-[1.44/2] !p-2 !shrink-0 lg:!p-0"
                              >
                                  <Link href={`/watch/${type}/${item.id}`} className="size-full bubbly">
                                      <MovieCard item={item} />
                                  </Link>
                              </div>
                          ))}
                </div>
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full lg:hidden"
                >
                    <ChevronRightIcon className="h-6 w-6 text-white" />
                </button>
            </div>
        </section>
    );
};

export default TrendingSection;
