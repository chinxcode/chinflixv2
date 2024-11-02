import axios from "axios";

export default async function handler(req, res) {
    const { path } = req.query;
    const queryParams = new URLSearchParams(req.query);
    queryParams.delete("path");
    queryParams.append("api_key", process.env.NEXT_PUBLIC_TMDB_API_KEY);

    try {
        const response = await axios({
            method: req.method,
            url: `https://api.themoviedb.org/3/${path.join("/")}`,
            params: queryParams,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                Origin: "https://api.themoviedb.org",
                Referer: "https://api.themoviedb.org",
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error details:", error);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Server Error" });
    }
}
