const ITEMS_PER_PAGE = 20;

export const getTrendingAnime = async (page = 1) => {
    const response = await fetch(`/api/anime/trending?page=${page}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return {
        results: data.results.map((item) => ({
            id: item.id,
            title: item.title,
            image: item.image,
            releaseDate: item.releaseDate,
            subOrDub: item.subOrDub,
            episodeNumber: item.episodeNumber,
            genres: item.genres,
        })),
        currentPage: page,
        hasNextPage: data.hasNextPage,
        total_pages: 50,
    };
};

export const getPopularAnime = async (page = 1) => {
    const response = await fetch(`/api/anime/popular?page=${page}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return {
        results: data.results.map((item) => ({
            id: item.id,
            title: item.title,
            image: item.image,
            releaseDate: item.releaseDate,
            subOrDub: item.subOrDub,
            episodeNumber: item.episodeNumber,
            genres: item.genres,
        })),
        currentPage: page,
        hasNextPage: data.hasNextPage,
        total_pages: 50,
    };
};

export const searchAnime = async (query, page = 1) => {
    const response = await fetch(`/api/anime/search?query=${query}&page=${page}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return {
        results: data.results.map((item) => ({
            id: item.id,
            title: item.title,
            image: item.image,
            releaseDate: item.releaseDate,
            subOrDub: item.subOrDub,
            episodeNumber: item.episodeNumber,
            genres: item.genres,
        })),
        currentPage: page,
        hasNextPage: data.hasNextPage,
        total_pages: Math.ceil(data.totalResults / ITEMS_PER_PAGE),
    };
};

export const getAnimeInfo = async (id) => {
    const response = await fetch(`/api/anime/info?id=${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

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
            data.episodes?.map((episode) => ({
                id: episode.id,
                number: episode.number,
                title: episode.title || `Episode ${episode.number}`,
            })) || [],
        subOrDub: data.subOrDub,
    };
};

export const getEpisodeSources = async (episodeId) => {
    const response = await fetch(`/api/anime/episode?id=${episodeId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return {
        sources: data.sources
            .map((source) => ({
                url: source.url,
                quality: source.quality,
                isM3U8: source.isM3U8,
            }))
            .sort((a, b) => {
                const qualityA = parseInt(a.quality) || 0;
                const qualityB = parseInt(b.quality) || 0;
                return qualityB - qualityA;
            }),
        download: data.download,
    };
};

export const getRecentEpisodes = async (page = 1) => {
    const response = await fetch(`/api/anime/recent?page=${page}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return {
        results: data.results.map((item) => ({
            id: item.id,
            title: item.title,
            image: item.image,
            episodeNumber: item.episodeNumber,
            releaseDate: item.releaseDate,
        })),
        currentPage: page,
        hasNextPage: data.hasNextPage,
    };
};
