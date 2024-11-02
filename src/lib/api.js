import { streamingSources } from "./streamingSources";

const BASE_URL = "/api/tmdb";

export const getTrending = async (type) => {
    const response = await fetch(`${BASE_URL}/trending/${type}/week`);
    return response.json();
};

export const getPopularMovies = async () => {
    const response = await fetch(`${BASE_URL}/movie/popular`);
    return response.json();
};

export const getPopularTVShows = async () => {
    const response = await fetch(`${BASE_URL}/tv/popular`);
    return response.json();
};

export const searchMulti = async (query) => {
    const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`);
    return response.json();
};

export const getGenres = async (type) => {
    const response = await fetch(`${BASE_URL}/genre/${type}/list`);
    return response.json();
};

export const getCountries = async () => {
    const response = await fetch(`${BASE_URL}/configuration/countries`);
    return response.json();
};

export const discoverMovies = async (params) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams}`);
    return response.json();
};

export const discoverTVShows = async (params) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}/discover/tv?${queryParams}`);
    return response.json();
};

export const getMediaDetails = async (type, id) => {
    const response = await fetch(`${BASE_URL}/${type}/${id}?append_to_response=credits,recommendations`);
    return response.json();
};

export const getSeasonDetails = async (tvId, seasonNumber) => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}`);
    return response.json();
};

export const getExternalIds = async (type, id) => {
    const response = await fetch(`${BASE_URL}/${type}/${id}/external_ids`);
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
