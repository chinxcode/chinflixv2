import axios from "axios";

const RiveStreamAPI = "https://watch.rivestream.app";

// Retry helper
const retry = async (fn, attempts = 2) => {
    let error;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            error = err;
        }
    }
    throw error;
};

const formatHlsUrl = (url, params) => {
    const urlParams = new URLSearchParams({
        url: url,
        id: params.id || "",
        season: params.season || "",
        episode: params.episode || "",
        title: params.title || "",
        downloadTitle: `${params.title}${params.season ? `-${params.season}-${params.episode}` : ""}`,
    });
    return `https://hlsforge.com/?${urlParams.toString()}`;
};

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id, type, season, episode, title, server, secretKey } = req.query;

    // Validate required parameters
    if (!id || !type || !title || !server || !secretKey) {
        return res.status(400).json({
            error: "Missing required parameters",
            required: ["id", "type", "title", "server", "secretKey"],
        });
    }

    try {
        // Build the source stream link
        const sourceStreamLink =
            season && episode
                ? `${RiveStreamAPI}/api/backendfetch?requestID=tvVideoProvider&id=${id}&season=${season}&episode=${episode}&service=${server}&secretKey=${secretKey}`
                : `${RiveStreamAPI}/api/backendfetch?requestID=movieVideoProvider&id=${id}&service=${server}&secretKey=${secretKey}`;

        // Fetch from the specific server
        const sourceJson = await retry(async () => {
            const response = await axios.get(sourceStreamLink, { timeout: 10000 });
            return response.data;
        });

        if (!sourceJson?.data?.sources || sourceJson.data.sources.length === 0) {
            return res.status(200).json({
                success: true,
                server: server,
                links: [],
                message: "No sources found for this server",
            });
        }

        // Process and format the links
        const hlsParams = { id, season, episode, title };
        const links = sourceJson.data.sources.map((src) => {
            if (src.url.includes("m3u8-proxy?url")) {
                const href = decodeURIComponent(src.url.split("m3u8-proxy?url=")[1].split("&headers=")[0]);
                return {
                    id: `${server}-${src.quality}-${Date.now()}`,
                    name: `${src.source} ${src.quality}`,
                    url: formatHlsUrl(href, hlsParams),
                    type: "m3u8",
                    server: server,
                    quality: src.quality,
                    referer: "https://megacloud.store/",
                };
            } else {
                const linkType = src.url.toLowerCase().includes(".m3u8") ? "m3u8" : "mp4";
                return {
                    id: `${server}-${src.quality}-${Date.now()}`,
                    name: `${src.source} ${src.quality}`,
                    url: linkType === "m3u8" ? formatHlsUrl(src.url, hlsParams) : src.url,
                    type: linkType,
                    server: server,
                    quality: src.quality,
                    referer: "",
                };
            }
        });

        // Extract captions if available
        const captions = sourceJson.data.captions || [];

        return res.status(200).json({
            success: true,
            server: server,
            links: links,
            captions: captions,
        });
    } catch (error) {
        console.error(`Error fetching from server ${server}:`, error.message);
        // Return empty result instead of error to allow other servers to continue
        return res.status(200).json({
            success: false,
            server: server,
            links: [],
            error: error.message,
        });
    }
}
