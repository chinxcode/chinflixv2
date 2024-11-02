import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import SearchFilter from "@/components/SearchFilter";
import MovieCard from "@/components/MovieCard";
import Skeleton from "@/components/Skeleton";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { searchMulti, getTrending } from "@/lib/api";

export default function Search() {
    const router = useRouter();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState("movie");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleSearch = async (query, type, currentPage) => {
        if (query.length >= 2) {
            const data = await searchMulti(query, currentPage);
            setTotalPages(data.total_pages);
            return data.results.filter((item) => item.media_type === type);
        }
        return [];
    };

    const fetchData = useCallback(async (type, query, currentPage) => {
        setLoading(true);
        let newResults;
        if (query && query.length >= 2) {
            newResults = await handleSearch(query, type, currentPage);
        } else {
            const trendingData = await getTrending(type, currentPage);
            setTotalPages(trendingData.total_pages);
            newResults = trendingData.results;
        }
        setResults(newResults);
        setLoading(false);
    }, []);

    useEffect(() => {
        const { type, page: pageQuery } = router.query;
        const currentType = type || "movie";
        const currentPage = parseInt(pageQuery) || 1;
        setSearchType(currentType);
        setPage(currentPage);
        fetchData(currentType, searchQuery, currentPage);
    }, [router.query, searchQuery, fetchData]);

    const handleSearchAll = (query) => {
        setSearchQuery(query);
        setPage(1);
    };

    const handleTypeChange = (newType) => {
        router.push({ pathname: router.pathname, query: { type: newType, page: 1 } }, undefined, { shallow: true });
    };

    const handlePageChange = (newPage) => {
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, page: newPage },
            },
            undefined,
            { shallow: true }
        );
    };

    return (
        <>
            <Head>
                <title>Search | MovieFlix</title>
            </Head>
            <main className="p-8">
                <h1 className="text-4xl font-bold mb-8">
                    {searchQuery && searchQuery.length >= 2
                        ? `Search Results for "${searchQuery}"`
                        : `Trending ${searchType === "movie" ? "Movies" : "TV Shows"}`}
                </h1>
                <SearchFilter onSearch={handleSearchAll} type={searchType} onTypeChange={handleTypeChange} initialQuery={searchQuery} />
                <div className="flex flex-col w-full gap-2">
                    <div className="flex items-center justify-end w-full pl-1 sm:px-2 text-sm">
                        <div className="flex items-center max-w-full text-sm">
                            <button className="flex items-center rounded-lg overflow-hidden justify-center gap-1 min-w-16 p-2 hover:bg-white/10 lg:hover:bg-white/5 px-3">
                                {page} - {totalPages}
                            </button>
                            <button
                                title="Previous Page"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="flex items-center rounded-lg disabled:brightness-90 overflow-hidden justify-center gap-1 p-2 hover:bg-white/10 lg:hover:bg-white/5 active:bg-white/5 px-3"
                            >
                                <ArrowLeftIcon className="h-[18px] w-[18px]" />
                            </button>
                            <button
                                title="Next Page"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="flex items-center rounded-lg disabled:brightness-90 overflow-hidden justify-center gap-1 p-2 hover:bg-white/10 lg:hover:bg-white/5 active:bg-white/5 px-3"
                            >
                                <ArrowRightIcon className="h-[18px] w-[18px]" />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-y-2 w-full flex-wrap justify-start smoothie mb-4">
                        {loading ? (
                            Array(12)
                                .fill(0)
                                .map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-[14.28%] 2xl:w-[12.5%] p-[.4rem] sm:p-2 !shrink-0"
                                    >
                                        <Skeleton className="w-full !aspect-[1.45/2] rounded-xl" />
                                    </div>
                                ))
                        ) : results && results.length > 0 ? (
                            results.map((item) => <MovieCard key={item.id} item={item} type={searchType} />)
                        ) : (
                            <p className="col-span-full text-center text-gray-400">No results found.</p>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
