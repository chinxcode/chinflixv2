import axios from "axios";

export default async function handler(req, res) {
    const { path } = req.query;

    try {
        const response = await axios({
            url: `https://api.themoviedb.org/3/${path.join("/")}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Server Error" });
    }
}
