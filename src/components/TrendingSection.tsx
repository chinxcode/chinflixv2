import { useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import { getTrending } from "@/lib/api";
import Skeleton from "./Skeleton";

interface TrendingSectionProps {
    type: "movie" | "tv";
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ type }) => {
    const [trendingItems, setTrendingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            const data = await getTrending(type);
            setTrendingItems(data.results);
            setLoading(false);
        };
        fetchTrending();
    }, [type]);

    return (
        <section className="mt-8">
            <h2 className="text-[1.35rem] font-medium mb-3 px-1">Trending {type === "movie" ? "Movies" : "Shows"}</h2>
            <div className="flex w-full flex-wrap">
                {loading
                    ? Array(6)
                          .fill(0)
                          .map((_, i) => (
                              <div key={i} className="w-1/6 xl:w-[14.28%] 2xl:w-[12.5%] !aspect-[1.44/2] !p-2 !shrink-0">
                                  <Skeleton className="w-full h-full rounded-xl" />
                              </div>
                          ))
                    : trendingItems.map((item) => (
                          <div key={item.id} className="w-1/6 xl:w-[14.28%] 2xl:w-[12.5%] !aspect-[1.44/2] !p-2 !shrink-0">
                              <MovieCard item={item} />
                          </div>
                      ))}
            </div>
        </section>
    );
};

export default TrendingSection;
