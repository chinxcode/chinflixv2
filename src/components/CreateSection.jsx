import { useState, useEffect, useRef } from "react";
import MovieCard from "./MovieCard";
import { getTrending, getTopRated, getPopular } from "@/lib/api";
import Skeleton from "./Skeleton";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const CreateSection = ({ type, endpoint }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            let data;

            switch (endpoint) {
                case "trending":
                    data = await getTrending(type);
                    break;
                case "top_rated":
                    data = await getTopRated(type);
                    break;
                case "popular":
                    data = await getPopular(type);
                    break;
                default:
                    data = await getTrending(type);
            }

            setItems(
                data.results.map((item) => ({
                    id: item.id,
                    title: item.title || item.name,
                    name: item.name || item.title,
                    poster_path: item.poster_path,
                    vote_average: item.vote_average,
                    overview: item.overview,
                    release_date: item.release_date || item.first_air_date,
                    media_type: type,
                }))
            );
            setLoading(false);
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

    return (
        <section className="mt-8 px-4 lg:px-0 relative">
            <div className="w-full flex items-center justify-between mb-4">
                <h2 className="text-[1.35rem] font-medium px-1">
                    {endpoint === "trending" && `Trending ${type === "movie" ? "Movies" : "Shows"}`}
                    {endpoint === "top_rated" && `Top Rated ${type === "movie" ? "Movies" : "Shows"}`}
                    {endpoint === "popular" && `Popular ${type === "movie" ? "Movies" : "Shows"}`}
                </h2>
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
                        : items.map((item) => <MovieCard key={item.id} item={item} type={type} />)}
                </div>
            </div>
        </section>
    );
};

export default CreateSection;
