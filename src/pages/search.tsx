import { useState, useEffect } from "react";
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
    const [filters, setFilters] = useState({
        genre: "",
        year: "",
        sort_by: "popularity.desc",
        with_origin_country: "",
    });

    useEffect(() => {
        const { type, query, ...urlFilters } = router.query;
        setSearchType((type as string) || "movie");

        if (query) {
            handleSearchAll(query as string);
        } else if (Object.keys(urlFilters).length > 0) {
            const newFilters = {
                genre: (urlFilters.genre as string) || "",
                year: (urlFilters.year as string) || "",
                sort_by: (urlFilters.sort_by as string) || "popularity.desc",
                with_origin_country: (urlFilters.with_origin_country as string) || "",
            };
            setFilters(newFilters);
            handleFilterAll(newFilters);
        } else {
            fetchTrending();
        }
    }, [router.query]);

    const fetchTrending = async () => {
        setLoading(true);
        const data = await getTrending(searchType as "movie" | "tv");
        setResults(data.results);
        setLoading(false);
    };

    const handleSearchAll = async (query: string) => {
        setLoading(true);
        const searchResults = await handleSearch(query, searchType as "movie" | "tv");
        setResults(searchResults);
        setLoading(false);
    };

    const handleFilterAll = async (newFilters) => {
        setLoading(true);
        setFilters(newFilters);
        const filterResults = await handleFilter(newFilters, searchType as "movie" | "tv");
        setResults(filterResults);
        setLoading(false);
    };

    return (
        <>
            <Head>
                <title>Search | MovieFlix</title>
                <meta name="description" content="Search for movies and TV shows on MovieFlix" />
            </Head>
            <main className="p-8">
                <h1 className="text-4xl font-bold mb-8">Search {searchType === "movie" ? "Movies" : "TV Shows"}</h1>
                <SearchFilter onSearch={handleSearchAll} onFilter={handleFilterAll} type={searchType as "movie" | "tv"} />
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
