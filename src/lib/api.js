import { streamingSources } from "./streamingSources";

const BASE_URL = "/api/tmdb";

const cache = new Map();
const CACHE_TIME = 1 * 24 * 60 * 60 * 1000;

const fetchWithCache = async (key, fetchFn) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
        return cached.data;
    }
    const data = await fetchFn();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
};

const handleApiResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};

export const searchMulti = async (query, page = 1) => {
    return fetchWithCache(`search-${query}-${page}`, async () => {
        const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
        return handleApiResponse(response);
    });
};

export const getTopRated = async (type, page = 1) => {
    return fetchWithCache(`toprated-${type}-${page}`, async () => {
        const response = await fetch(`${BASE_URL}/${type}/top_rated?page=${page}`);
        return handleApiResponse(response);
    });
};

export const getPopular = async (type, page = 1) => {
    return fetchWithCache(`popular-${type}-${page}`, async () => {
        const response = await fetch(`${BASE_URL}/${type}/popular?page=${page}`);
        return handleApiResponse(response);
    });
};

export const getTrending = async (type, page = 1) => {
    return fetchWithCache(`trending-${type}-${page}`, async () => {
        const response = await fetch(`${BASE_URL}/trending/${type}/week?page=${page}`);
        return handleApiResponse(response);
    });
};

export const getMediaDetails = async (type, id) => {
    return fetchWithCache(`details-${type}-${id}`, async () => {
        const response = await fetch(`${BASE_URL}/${type}/${id}?append_to_response=credits,recommendations`);
        return handleApiResponse(response);
    });
};

export const getSeasonDetails = async (tvId, seasonNumber) => {
    return fetchWithCache(`season-${tvId}-${seasonNumber}`, async () => {
        const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}`);
        return handleApiResponse(response);
    });
};

export const getExternalIds = async (type, id) => {
    return fetchWithCache(`external-${type}-${id}`, async () => {
        const response = await fetch(`${BASE_URL}/${type}/${id}/external_ids`);
        return handleApiResponse(response);
    });
};

export const getStreamingLinks = async (id, type, season, episode) => {
    const externalIds = await getExternalIds(type, id);
    const imdbId = externalIds.imdb_id;

    return Object.entries(streamingSources).map(([name, urls]) => {
        let url = urls[type].replace("{id}", id).replace("{imdbId}", imdbId);
        if (type === "tv" && season && episode) {
            url = url.replace("{season}", season.toString()).replace("{episode}", episode.toString());
        }
        return { name, url, flag: urls.flag, working: urls.working, recommended: urls.recommended };
    });
};
