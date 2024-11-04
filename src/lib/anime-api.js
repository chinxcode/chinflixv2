import { ANIME } from "@consumet/extensions";

const gogoanime = new ANIME.Gogoanime();
const ITEMS_PER_PAGE = 20;

export const getTrendingAnime = async (page = 1) => {
    const data = await gogoanime.fetchTopAiring(page);
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
    const data = await gogoanime.fetchPopular(page);
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
    const data = await gogoanime.search(query, page);
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
        total_pages: Math.min(Math.ceil((data.results.length * 5) / ITEMS_PER_PAGE), 50),
    };
};

export const getAnimeInfo = async (id) => {
    const data = await gogoanime.fetchAnimeInfo(id);
    return data;
};
