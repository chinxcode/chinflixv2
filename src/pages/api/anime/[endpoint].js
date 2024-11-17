import { ANIME } from "@consumet/extensions";

const gogoanime = new ANIME.Gogoanime();

export default async function handler(req, res) {
    const { endpoint } = req.query;

    switch (endpoint) {
        case "trending":
            try {
                const trending = await gogoanime.fetchTopAiring(parseInt(req.query.page) || 1);
                res.json(trending);
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch trending anime" });
            }
            break;

        case "popular":
            try {
                const popular = await gogoanime.fetchPopular(parseInt(req.query.page) || 1);
                res.json(popular);
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch popular anime" });
            }
            break;

        case "search":
            try {
                const results = await gogoanime.search(req.query.query, parseInt(req.query.page) || 1);
                res.json(results);
            } catch (error) {
                res.status(500).json({ error: "Failed to search anime" });
            }
            break;

        case "info":
            try {
                const info = await gogoanime.fetchAnimeInfo(req.query.id);
                res.json(info);
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch anime info" });
            }
            break;

        case "episode":
            try {
                const sources = await gogoanime.fetchEpisodeSources(req.query.id);
                res.json(sources);
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch episode sources" });
            }
            break;

        case "download":
            try {
                const { url } = req.query;
                const downloadLinks = await gogoanime.fetchDirectDownloadLink(url);
                res.json({ downloadLinks });
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch download links" });
            }
            break;

        default:
            res.status(404).json({ error: "Endpoint not found" });
    }
}
