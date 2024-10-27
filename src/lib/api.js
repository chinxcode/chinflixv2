import { streamingSources } from "./streamingSources";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const BASE_URL = "https://api.themoviedb.org/3";

export const getTrending = async (type) => {
    const response = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
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

export const searchMulti = async (query) => {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    return response.json();
};

export const getGenres = async (type) => {
    const response = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`);
    return response.json();
};

export const getCountries = async () => {
    const response = await fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`);
    return response.json();
};

export const discoverMovies = async (params) => {
    const queryParams = new URLSearchParams({ ...params, api_key: API_KEY }).toString();
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams}`);
    return response.json();
};

export const discoverTVShows = async (params) => {
    const queryParams = new URLSearchParams({ ...params, api_key: API_KEY }).toString();
    const response = await fetch(`${BASE_URL}/discover/tv?${queryParams}`);
    return response.json();
};

export const getMediaDetails = async (type, id) => {
    const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,recommendations`);
    return response.json();
};

export const getSeasonDetails = async (tvId, seasonNumber) => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    return response.json();
};

export const getExternalIds = async (type, id) => {
    const response = await fetch(`${BASE_URL}/${type}/${id}/external_ids?api_key=${API_KEY}`);
    return response.json();
};

export const getStreamingLinks = async (id, type, season, episode) => {
    const externalIds = await getExternalIds(type, id);
    const imdbId = externalIds.imdb_id;

    return Object.entries(streamingSources).map(([name, urls]) => {
        let url = urls[type].replace("{id}", id).replace("{imdbId}", imdbId);
        if (type === "tv" && season && episode) {
            url = url.replace("{season}", season.toString()).replace("{episode}", episode.toString());
        }
        return { name, url, flag: urls.flag };
    });
};
