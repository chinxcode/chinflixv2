const cache = new Map();
const CACHE_TIME = 1 * 24 * 60 * 60 * 1000;
const ITEMS_PER_PAGE = 20;

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

export const getTrendingAnime = async (page = 1) => {
    return fetchWithCache(`trending-${page}`, async () => {
        const response = await fetch(`/api/anime/trending?page=${page}`);
        const data = await handleApiResponse(response);
        return {
            results: data.results.map(({ id, title, image, releaseDate, subOrDub, episodeNumber, genres }) => ({
                id,
                title,
                image,
                releaseDate,
                subOrDub,
                episodeNumber,
                genres,
            })),
            currentPage: page,
            hasNextPage: data.hasNextPage,
            total_pages: 50,
        };
    });
};

export const getPopularAnime = async (page = 1) => {
    return fetchWithCache(`popular-${page}`, async () => {
        const response = await fetch(`/api/anime/popular?page=${page}`);
        const data = await handleApiResponse(response);
        return {
            results: data.results.map(({ id, title, image, releaseDate, subOrDub, episodeNumber, genres }) => ({
                id,
                title,
                image,
                releaseDate,
                subOrDub,
                episodeNumber,
                genres,
            })),
            currentPage: page,
            hasNextPage: data.hasNextPage,
            total_pages: 50,
        };
    });
};

export const searchAnime = async (query, page = 1) => {
    const cacheKey = `search-${query}-${page}`;
    return fetchWithCache(cacheKey, async () => {
        const response = await fetch(`/api/anime/search?query=${query}&page=${page}`);
        const data = await handleApiResponse(response);
        return {
            results: data.results.map(({ id, title, image, releaseDate, subOrDub, episodeNumber, genres }) => ({
                id,
                title,
                image,
                releaseDate,
                subOrDub,
                episodeNumber,
                genres,
            })),
            currentPage: page,
            hasNextPage: data.hasNextPage,
            total_pages: Math.ceil(data.totalResults / ITEMS_PER_PAGE),
        };
    });
};

export const getAnimeInfo = async (id) => {
    return fetchWithCache(`info-${id}`, async () => {
        const response = await fetch(`/api/anime/info?id=${id}`);
        const data = await handleApiResponse(response);
        return {
            id: data.id,
            title: data.title,
            image: data.image,
            description: data.description || "No description available",
            genres: data.genres || [],
            status: data.status,
            releaseDate: data.releaseDate,
            totalEpisodes: data.totalEpisodes,
            episodes:
                data.episodes?.map(({ id, number, title }) => ({
                    id,
                    number,
                    title: title || `Episode ${number}`,
                })) || [],
            subOrDub: data.subOrDub,
        };
    });
};

export const getEpisodeSources = async (episodeId) => {
    const response = await fetch(`/api/anime/episode?id=${episodeId}`);
    const data = await handleApiResponse(response);

    return {
        sources: data.sources
            .map(({ url, quality, isM3U8 }) => ({
                url,
                quality,
                isM3U8,
            }))
            .sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0)),
        download: data.download,
    };
};
