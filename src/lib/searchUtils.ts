import { searchMulti, discoverMovies, discoverTVShows } from "./api";

export const handleSearch = async (query: string, type: "movie" | "tv") => {
    if (query.length >= 2) {
        const data = await searchMulti(query);
        return data.results.filter((item: { media_type: string }) => item.media_type === type);
    }
    return [];
};

interface Filters {
    genre?: string;
    year?: string;
    [key: string]: string | undefined;
}

export const handleFilter = async (filters: Filters, type: "movie" | "tv") => {
    const params: { [key: string]: string | undefined } = {
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
