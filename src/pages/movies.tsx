import Head from "next/head";
import SearchFilter from "@/components/SearchFilter";
import MovieCard from "@/components/MovieCard";
import { useState, useEffect } from "react";
import Skeleton from "@/components/Skeleton";
import { handleSearch, handleFilter } from "@/lib/searchUtils";

export default function Movies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        setLoading(true);
        const data = await handleFilter({}, "movie");
        setMovies(data);
        setLoading(false);
    };

    const handleSearchMovies = async (query: string) => {
        setLoading(true);
        const results = await handleSearch(query, "movie");
        setMovies(results);
        setLoading(false);
    };

    const handleFilterMovies = async (filters) => {
        setLoading(true);
        const results = await handleFilter(filters, "movie");
        setMovies(results);
        setLoading(false);
    };

    return (
        <>
            <Head>
                <title>Movies | MovieFlix</title>
                <meta name="description" content="Discover and watch your favorite movies on MovieFlix" />
            </Head>
            <main className="p-8">
                <h1 className="text-4xl font-bold mb-8">Movies</h1>
                <SearchFilter onSearch={handleSearchMovies} onFilter={handleFilterMovies} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {loading
                        ? Array(12)
                              .fill(0)
                              .map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)
                        : movies.map((movie) => <MovieCard key={movie.id} item={movie} />)}
                </div>
            </main>
        </>
    );
}
