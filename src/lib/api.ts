const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const getTrending = async (type: "movie" | "tv") => {
    const response = await fetch(`${BASE_URL}/trending/${type}/day?api_key=${API_KEY}`);
    return response.json();
};

export const getPopularMovies = async () => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    return response.json();
};

export const getPopularTVShows = async () => {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    return response.json();
};

export const searchMulti = async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    return response.json();
};

export const getMovieDetails = async (id: string) => {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
    return response.json();
};

export const getTVShowDetails = async (id: string) => {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
    return response.json();
};

export const getGenres = async (type: "movie" | "tv") => {
    const response = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`);
    return response.json();
};
