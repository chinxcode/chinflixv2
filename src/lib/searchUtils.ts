import { searchMulti, getPopularMovies, getPopularTVShows } from "./api";

export const handleSearch = async (query: string, type: "movie" | "tv" | "multi") => {
    if (query.length >= 2) {
        if (type === "multi") {
            const data = await searchMulti(query);
            return data.results;
        } else {
            const data = await searchMulti(query);
            return data.results.filter((item) => item.media_type === type);
        }
    }
    return [];
};

export const handleFilter = async (filters, type: "movie" | "tv") => {
    let apiFunction = type === "movie" ? getPopularMovies : getPopularTVShows;
    const data = await apiFunction();
    let filtered = data.results;

    if (filters.genre !== "Any") {
        filtered = filtered.filter((item) => item.genre_ids.includes(getGenreId(filters.genre)));
    }
    if (filters.year !== "Any") {
        filtered = filtered.filter((item) => (item.release_date || item.first_air_date).startsWith(filters.year));
    }
    // Implement other filters as needed

    return filtered;
};

const getGenreId = (genreName: string) => {
    // Implement genre name to ID mapping
    // This is a placeholder, you should replace it with actual genre IDs from TMDB
    const genreMap = {
        Action: 28,
        Comedy: 35,
        Drama: 18,
        "Sci-Fi": 878,
    };
    return genreMap[genreName] || 0;
};
