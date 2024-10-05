import { searchMulti, discoverMovies, discoverTVShows } from "./api";

export const handleSearch = async (query: string, type: "movie" | "tv") => {
    if (query.length >= 2) {
        const data = await searchMulti(query);
        return data.results.filter((item) => item.media_type === type);
    }
    return [];
};

export const handleFilter = async (filters, type: "movie" | "tv") => {
    const params = {
        ...filters,
        with_genres: filters.genre && filters.genre !== "Any" ? filters.genre : undefined,
        primary_release_year: filters.year && filters.year !== "Any" ? filters.year : undefined,
        first_air_date_year: filters.year && filters.year !== "Any" ? filters.year : undefined,
    };

    Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);

    const apiFunction = type === "movie" ? discoverMovies : discoverTVShows;
    const data = await apiFunction(params);
    return data.results;
};
