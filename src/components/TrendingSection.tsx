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
            setLoading(true);
            const data = await getTrending(type);
            setTrendingItems(data.results);
            setLoading(false);
        };
        fetchTrending();
    }, [type]);

    return (
        <section className="mt-8 px-4 lg:px-0">
            <h2 className="text-2xl font-bold mb-4">Trending {type === "movie" ? "Movies" : "Shows"}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {loading
                    ? Array(6)
                          .fill(0)
                          .map((_, i) => (
                              <div key={i} className="aspect-[2/3]">
                                  <Skeleton className="w-full h-full rounded-lg" />
                              </div>
                          ))
                    : trendingItems.map((item) => <MovieCard key={item.id} item={item} />)}
            </div>
        </section>
    );
};

export default TrendingSection;
