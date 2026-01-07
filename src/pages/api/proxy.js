import axios from "axios";

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
    }

    try {
        // Forward the original headers from the client request
        const headers = {
            ...req.headers,
            host: new URL(url).host, // Set the correct host
        };

        // Remove problematic headers
        // delete headers['host'];
        // delete headers['referer'];
        // delete headers['origin'];
        // delete headers['connection'];

        const response = await axios({
            method: req.method,
            url: decodeURIComponent(url),
            headers: headers,
            data: req.method !== "GET" ? req.body : undefined,
            responseType: "arraybuffer",
        });

        // Set the response headers
        Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        return res.status(response.status).send(response.data);
    } catch (error) {
        console.error("Proxy error:", error);
        return res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data,
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "10mb",
        },
    },
};
