import { streamingSources } from "./streamingSources";

const BASE_URL = "/api/tmdb";

export const searchMulti = async (query, page = 1) => {
    const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
};

export const getTopRated = async (type, page = 1) => {
    const response = await fetch(`${BASE_URL}/${type}/top_rated?page=${page}`);
    return response.json();
};

export const getPopular = async (type, page = 1) => {
    const response = await fetch(`${BASE_URL}/${type}/popular?page=${page}`);
    return response.json();
};

export const getTrending = async (type, page = 1) => {
    const response = await fetch(`${BASE_URL}/trending/${type}/week?page=${page}`);
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
