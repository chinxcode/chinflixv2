import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
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
    const [filters, setFilters] = useState({
        genre: "",
        year: "",
        sort_by: "popularity.desc",
        with_origin_country: "",
    });

    const fetchData = useCallback(async (type, query, filters) => {
        setLoading(true);
        let newResults;
        if (query && query.length >= 2) {
            newResults = await handleSearch(query, type);
        } else if (Object.values(filters).some((value) => value !== "")) {
            newResults = await handleFilter(filters, type);
        } else {
            const trendingData = await getTrending(type);
            newResults = trendingData.results;
        }
        setResults(newResults);
        setLoading(false);
    }, []);

    useEffect(() => {
        const { type } = router.query;
        const currentType = type || "movie";
        setSearchType(currentType);
        fetchData(currentType, searchQuery, filters);
    }, [router.query, searchQuery, filters, fetchData]);

    const handleSearchAll = (query) => {
        setSearchQuery(query);
    };

    const handleFilterAll = (newFilters) => {
        setFilters(newFilters);
    };

    const handleTypeChange = (newType) => {
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
                    type={searchType}
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
                        results.map((item) => (
                            <Link href={`/watch/${searchType}/${item.id}`} key={item.id} className="size-full bubbly">
                                <MovieCard
                                    item={{
                                        ...item,
                                        title: item.title || item.name || "Untitled",
                                    }}
                                />
                            </Link>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-400">No results found.</p>
                    )}
                </div>
            </main>
        </>
    );
}
