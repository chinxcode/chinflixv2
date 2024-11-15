import { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { searchMulti, getTrending } from "@/lib/api";
import { searchAnime, getTrendingAnime } from "@/lib/anime-api";
import Skeleton from "./Skeleton";

const SearchFilter = dynamic(() => import("./SearchFilter"));
const MovieCard = dynamic(() => import("./MovieCard"));

const SearchContainer = memo(({ type, showDropdown = true, isSearchPage = false }) => {
    const router = useRouter();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(parseInt(router.query.page) || 1);
    const [totalPages, setTotalPages] = useState(1);

    const handleSearch = async (query, currentPage) => {
        if (query.length >= 2) {
            if (type === "anime") {
                const data = await searchAnime(query, currentPage);
                setTotalPages(data.total_pages);
                return data.results;
            } else {
                const data = await searchMulti(query, currentPage);
                setTotalPages(data.total_pages);
                return data.results.filter((item) => item.media_type === type);
            }
        }
        return [];
    };

    const fetchData = useCallback(
        async (query, currentPage) => {
            setLoading(true);
            try {
                let newResults;
                if (query && query.length >= 2) {
                    newResults = await handleSearch(query, currentPage);
                } else {
                    const data = type === "anime" ? await getTrendingAnime(currentPage) : await getTrending(type, currentPage);
                    setTotalPages(data.total_pages);
                    newResults = data.results;
                }
                setResults(newResults);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        },
        [type]
    );

    useEffect(() => {
        const currentPage = parseInt(router.query.page) || 1;
        setPage(currentPage);
        fetchData(searchQuery, currentPage);
    }, [router.query.page, searchQuery, fetchData]);

    const handleSearchAll = (query) => {
        setSearchQuery(query);
        if (router.query.page !== "1") {
            router.push({
                pathname: router.pathname,
                query: { ...router.query, page: 1 },
            });
        }
    };

    const handleTypeChange = (newType) => {
        if (showDropdown) {
            router.push(
                {
                    pathname: router.pathname,
                    query: { ...router.query, type: newType, page: 1 },
                },
                undefined,
                { shallow: true }
            );
        }
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

    const getContentType = () =>
        ({
            movie: "Movies",
            tv: "TV Shows",
            anime: "Anime",
        }[type] || "Content");

    return (
        <>
            <h1 className="text-4xl font-bold mb-8">
                {searchQuery && searchQuery.length >= 2
                    ? `Search Results for "${searchQuery}"`
                    : isSearchPage
                    ? `Search ${getContentType()}`
                    : getContentType()}
            </h1>

            <SearchFilter
                onSearch={handleSearchAll}
                type={type}
                onTypeChange={handleTypeChange}
                initialQuery={searchQuery}
                showDropdown={showDropdown}
            />

            <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between w-full pl-1 sm:px-2 text-sm">
                    <h2 className="text-[1.35rem] font-medium px-1">
                        {searchQuery && searchQuery.length >= 2 ? "Search Results" : `Trending ${getContentType()}`}
                    </h2>
                    <div className="flex items-center max-w-full text-sm">
                        <button className="flex items-center rounded-lg overflow-hidden justify-center gap-1 min-w-16 p-2 hover:bg-white/10 lg:hover:bg-white/5 px-3">
                            {page} - {totalPages}
                        </button>
                        <div className="flex items-center rounded-xl overflow-hidden justify-center gap-[1px]">
                            <button
                                title="Previous Page"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                            >
                                <ArrowLeftIcon className="size-[1.1rem]" />
                                <span className="sr-only">Previous page</span>
                            </button>
                            <button
                                title="Next Page"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                            >
                                <ArrowRightIcon className="size-[1.1rem]" />
                                <span className="sr-only">Next page</span>
                            </button>
                        </div>
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
                    ) : results?.length > 0 ? (
                        results.map((item) => <MovieCard key={item.id} item={item} type={type} />)
                    ) : (
                        <p className="col-span-full text-center text-gray-400">No results found.</p>
                    )}
                </div>
            </div>
        </>
    );
});

SearchContainer.displayName = "SearchContainer";
export default SearchContainer;
