import { useState, useEffect, useRef } from "react";
import MovieCard from "./MovieCard";
import { getTrending } from "@/lib/api";
import Skeleton from "./Skeleton";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

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
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.5;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="mt-8 px-4 lg:px-0 relative">
            <div className="w-full flex items-center justify-between mb-4">
                <h2 className="text-[1.35rem] font-medium px-1">Trending {type === "movie" ? "Movies" : "Shows"}</h2>
                <div className="flex items-center rounded-xl overflow-hidden justify-center gap-[1px]">
                    <button
                        onClick={() => scroll("left")}
                        className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                    >
                        <ArrowLeftIcon className="size-[1.1rem]" />
                        <span className="sr-only">Previous slide</span>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                    >
                        <ArrowRightIcon className="size-[1.1rem]" />
                        <span className="sr-only">Next slide</span>
                    </button>
                </div>
            </div>
            <div className="relative">
                <div ref={scrollContainerRef} className="flex gap-4 w-full overflow-x-auto scrollbar-hide">
                    {loading
                        ? Array(6)
                              .fill(0)
                              .map((_, i) => (
                                  <div key={i} className="w-[32%] sm:w-[22%] md:w-[19%] lg:w-[15%] xl:w-[12%] !aspect-[1.44/2] !shrink-0">
                                      <Skeleton className="w-full h-full rounded-xl" />
                                  </div>
                              ))
                        : trendingItems.map((item) => (
                              <div key={item.id} className="w-[32%] sm:w-[22%] md:w-[19%] lg:w-[15%] xl:w-[12%] !aspect-[1.44/2] !shrink-0">
                                  <Link href={`/watch/${type}/${item.id}`} className="size-full bubbly">
                                      <MovieCard item={item} />
                                  </Link>
                              </div>
                          ))}
                </div>
            </div>
        </section>
    );
};

export default TrendingSection;
