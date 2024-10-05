const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const getTrending = async (type: "movie" | "tv") => {
    const response = await fetch(`${BASE_URL}/trending/${type}/day?api_key=${API_KEY}`);
    return response.json();
};

export const getPopularMovies = async (page = 1) => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    return response.json();
};

export const getPopularTVShows = async (page = 1) => {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
    return response.json();
};

export const getGenres = async (type: "movie" | "tv") => {
    const response = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`);
    return response.json();
};

export const getCountries = async () => {
    const response = await fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`);
    return response.json();
};

export const searchMulti = async (query: string, page = 1) => {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
};

export const discoverMovies = async (params: object, page = 1) => {
    const queryParams = new URLSearchParams({ ...params, api_key: API_KEY, page: page.toString() }).toString();
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams}`);
    return response.json();
};

export const discoverTVShows = async (params: object, page = 1) => {
    const queryParams = new URLSearchParams({ ...params, api_key: API_KEY, page: page.toString() }).toString();
    const response = await fetch(`${BASE_URL}/discover/tv?${queryParams}`);
    return response.json();
};
