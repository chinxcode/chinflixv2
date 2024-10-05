import Head from "next/head";
import SearchFilter from "@/components/SearchFilter";
import MovieCard from "@/components/MovieCard";
import { useState, useEffect } from "react";
import Skeleton from "@/components/Skeleton";
import { handleSearch, handleFilter } from "@/lib/searchUtils";

export default function TVShows() {
    const [tvShows, setTVShows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTVShows();
    }, []);

    const fetchTVShows = async () => {
        setLoading(true);
        const data = await handleFilter({}, "tv");
        setTVShows(data);
        setLoading(false);
    };

    const handleSearchTVShows = async (query: string) => {
        setLoading(true);
        const results = await handleSearch(query, "tv");
        setTVShows(results);
        setLoading(false);
    };

    const handleFilterTVShows = async (filters) => {
        setLoading(true);
        const results = await handleFilter(filters, "tv");
        setTVShows(results);
        setLoading(false);
    };

    return (
        <>
            <Head>
                <title>TV Shows | MovieFlix</title>
                <meta name="description" content="Discover and watch your favorite TV shows on MovieFlix" />
            </Head>
            <main className="p-8">
                <h1 className="text-4xl font-bold mb-8">TV Shows</h1>
                <SearchFilter onSearch={handleSearchTVShows} onFilter={handleFilterTVShows} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {loading
                        ? Array(12)
                              .fill(0)
                              .map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)
                        : tvShows.map((show) => <MovieCard key={show.id} item={show} />)}
                </div>
            </main>
        </>
    );
}
