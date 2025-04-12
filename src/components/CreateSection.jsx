import { useState, useEffect, useRef, memo } from "react";
import dynamic from "next/dynamic";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { getTrending, getTopRated, getPopular } from "@/lib/api";
import Skeleton from "./Skeleton";

const MovieCard = dynamic(() => import("./MovieCard"));

const CreateSection = memo(({ type, endpoint, priority = false, title }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let data;

                switch (endpoint) {
                    case "trending":
                        data = await getTrending(type);
                        break;
                    case "top_rated":
                    case "top-rated":
                        data = await getTopRated(type);
                        break;
                    case "popular":
                        data = await getPopular(type);
                        break;
                    default:
                        data = await getTrending(type);
                }

                setItems(data.results);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, endpoint]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.5;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    // Determine section title
    const getSectionTitle = () => {
        if (title) return title;

        if (endpoint === "trending") return `Trending ${type === "anime" ? "Anime" : type === "movie" ? "Movies" : "Shows"}`;
        if (endpoint === "top_rated" || endpoint === "top-rated")
            return `Top Rated ${type === "anime" ? "Anime" : type === "movie" ? "Movies" : "Shows"}`;
        if (endpoint === "popular") return `Popular ${type === "anime" ? "Anime" : type === "movie" ? "Movies" : "Shows"}`;

        return "Featured Content";
    };

    return (
        <section className="mt-8 px-4 lg:px-0 relative">
            <div className="w-full flex items-center justify-between mb-4">
                <h2 className="text-[1.35rem] font-medium px-1">{getSectionTitle()}</h2>
                <div className="flex items-center rounded-xl overflow-hidden justify-center gap-[1px]">
                    <button
                        onClick={() => scroll("left")}
                        className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                        aria-label="Scroll left"
                    >
                        <ArrowLeftIcon className="size-[1.1rem]" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                        aria-label="Scroll right"
                    >
                        <ArrowRightIcon className="size-[1.1rem]" />
                    </button>
                </div>
            </div>
            <div className="relative">
                <div ref={scrollContainerRef} className="flex gap-y-2 w-full smoothie overflow-x-auto overflow-y-hidden scrollbar-hide">
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
                        : items.map((item) => <MovieCard key={item.id} item={item} type={item.media_type || type} priority={priority} />)}
                </div>
            </div>
        </section>
    );
});

CreateSection.displayName = "CreateSection";
export default CreateSection;
