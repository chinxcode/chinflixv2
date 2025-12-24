import axios from "axios";

// RiveStream API configuration
const RiveStreamAPI = "https://watch.rivestream.app";

// Retry helper
const retry = async (fn, attempts = 3) => {
    let error;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            error = err;
            if (i < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    throw error;
};

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            error: "Missing required parameter: id",
        });
    }

    try {
        // Get source list
        const sourceApiUrl = `${RiveStreamAPI}/api/backendfetch?requestID=VideoProviderServices&secretKey=rive`;
        const sourceList = await retry(async () => {
            const response = await axios.get(sourceApiUrl, { timeout: 15000 });
            return response.data;
        });

        if (!sourceList?.data) {
            throw new Error("No sources available");
        }

        // Fetch the main page to get the app script
        const docHtml = await retry(async () => {
            const response = await axios.get(RiveStreamAPI, { timeout: 15000 });
            return response.data;
        });

        // Parse HTML to find app script
        const appScriptMatch = docHtml.match(/<script[^>]*src="([^"]*_app[^"]*)"[^>]*>/i);
        if (!appScriptMatch) {
            throw new Error("Could not find app script");
        }

        const appScriptSrc = appScriptMatch[1];

        // Fetch the app script
        const js = await retry(async () => {
            const response = await axios.get(`${RiveStreamAPI}${appScriptSrc}`, { timeout: 15000 });
            return response.data;
        });

        // Extract key list from the script
        const regex = /let\s+c\s*=\s*(\[[^\]]*])/;
        const match = js.match(regex);
        const arrayText = match?.[1];
        const keyList = arrayText ? Array.from(arrayText.matchAll(/"([^"]+)"/g), (m) => m[1]) : [];

        // Get secret key
        const secretKey = await retry(async () => {
            const response = await axios.get(`https://rivestream.supe2372.workers.dev/?input=${id}&cList=${keyList.join(",")}`, {
                timeout: 15000,
            });
            return response.data;
        });

        // Return initialization data
        return res.status(200).json({
            success: true,
            sourceList: sourceList.data,
            secretKey: secretKey,
            totalServers: sourceList.data.length,
        });
    } catch (error) {
        console.error("Error initializing download:", error);
        return res.status(500).json({
            error: error.message || "Failed to initialize download",
        });
    }
}
