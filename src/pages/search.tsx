import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import SearchFilter from "@/components/SearchFilter";
import MovieCard from "@/components/MovieCard";
import Skeleton from "@/components/Skeleton";
import { handleSearch, handleFilter } from "@/lib/searchUtils";
import { getTrending } from "@/lib/api";

export default function Search() {
    const router = useRouter();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState("movie");
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});

    const fetchData = useCallback(async (type: string, query: string, filters: any) => {
        setLoading(true);
        let newResults;
        if (query && query.length >= 2) {
            newResults = await handleSearch(query, type as "movie" | "tv");
        } else if (Object.keys(filters).length > 0) {
            newResults = await handleFilter(filters, type as "movie" | "tv");
        } else {
            const trendingData = await getTrending(type as "movie" | "tv");
            newResults = trendingData.results;
        }
        setResults(newResults);
        setLoading(false);
    }, []);

    useEffect(() => {
        const { type } = router.query;
        const currentType = (type as string) || "movie";
        setSearchType(currentType);
        fetchData(currentType, searchQuery, filters);
    }, [router.query.type, searchQuery, filters, fetchData]);

    const handleSearchAll = (query: string) => {
        setSearchQuery(query);
    };

    const handleFilterAll = (newFilters: any) => {
        setFilters(newFilters);
    };

    const handleTypeChange = (newType: "movie" | "tv") => {
        router.push({ pathname: router.pathname, query: { type: newType } }, undefined, { shallow: true });
    };

    return (
        <>
            <Head>
                <title>Search | MovieFlix</title>
                <meta name="description" content="Search for movies and TV shows on MovieFlix" />
            </Head>
            <main className="p-8">
                <h1 className="text-4xl font-bold mb-8">Search {searchType === "movie" ? "Movies" : "TV Shows"}</h1>
                <SearchFilter
                    onSearch={handleSearchAll}
                    onFilter={handleFilterAll}
                    type={searchType as "movie" | "tv"}
                    onTypeChange={handleTypeChange}
                    initialQuery={searchQuery}
                    initialFilters={filters}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {loading ? (
                        Array(12)
                            .fill(0)
                            .map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)
                    ) : results && results.length > 0 ? (
                        results.map((item) => <MovieCard key={item.id} item={item} />)
                    ) : (
                        <p className="col-span-full text-center text-gray-400">No results found.</p>
                    )}
                </div>
            </main>
        </>
    );
}
