import { useState, useEffect } from "react";
import Head from "next/head";
import SearchFilter from "@/components/SearchFilter";
import MovieCard from "@/components/MovieCard";
import Skeleton from "@/components/Skeleton";
import { handleSearch, handleFilter } from "@/lib/searchUtils";

export default function Search() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearchAll = async (query: string) => {
        setLoading(true);
        const searchResults = await handleSearch(query, "multi");
        setResults(searchResults);
        setLoading(false);
    };

    const handleFilterAll = async (filters) => {
        setLoading(true);
        const movieResults = await handleFilter(filters, "movie");
        const tvResults = await handleFilter(filters, "tv");
        setResults([...movieResults, ...tvResults]);
        setLoading(false);
    };

    return (
        <>
            <Head>
                <title>Search | MovieFlix</title>
                <meta name="description" content="Search for movies and TV shows on MovieFlix" />
            </Head>
            <main className="p-8">
                <h1 className="text-4xl font-bold mb-8">Search</h1>
                <SearchFilter onSearch={handleSearchAll} onFilter={handleFilterAll} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {loading
                        ? Array(12)
                              .fill(0)
                              .map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)
                        : results.map((item) => <MovieCard key={item.id} item={item} />)}
                </div>
            </main>
        </>
    );
}
