import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAnimeInfo, getEpisodeSources } from "@/lib/anime-api";
import { AnimeMediaActions, AnimeMediaInfo, AnimeEpisodes, AnimePlayer } from "@/components/AnimeComponents";
import Skeleton from "@/components/Skeleton";

const WatchAnimePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [animeData, setAnimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [streamingUrl, setStreamingUrl] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                setLoading(true);
                const data = await getAnimeInfo(id);
                setAnimeData(data);
                if (data.episodes.length > 0) {
                    const firstEpisode = data.episodes[0];
                    setCurrentEpisode(firstEpisode.id);
                    const sources = await getEpisodeSources(firstEpisode.id);
                    setStreamingUrl(sources.sources.find((source) => source.quality === "default")?.url || "");
                }
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleEpisodeChange = async (episodeId) => {
        setCurrentEpisode(episodeId);
        const sources = await getEpisodeSources(episodeId);
        setStreamingUrl(sources.sources[0]?.url || "");
    };

    if (loading) {
        return (
            <div className="p-2 h-screen">
                <Skeleton className="w-full h-full" />
            </div>
        );
    }

    if (!animeData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-2xl">Anime not found</p>
            </div>
        );
    }

    return (
        <div className="lg:flex lg:flex-row lg:gap-2 lg:h-screen overflow-hidden">
            <div className="lg:w-2/3 h-full rounded-lg overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex gap-2 w-full h-12 items-center">
                    <button className="w-9 h-full flex items-center shrink-0 justify-center" onClick={() => router.back()}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-arrow-left"
                        >
                            <path d="m12 19-7-7 7-7"></path>
                            <path d="M19 12H5"></path>
                        </svg>
                    </button>
                    <span className="!line-clamp-1 flex-grow sm:text-lg mr-2">{animeData.title}</span>
                </div>
                <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                    <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col">
                        <AnimePlayer src={streamingUrl} />
                        <AnimeMediaActions viewCount={1000} />
                    </div>
                </div>
            </div>

            <div className="lg:w-1/3 h-full rounded-lg overflow-hidden border border-gray-800 flex flex-col">
                <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4">
                        <AnimeEpisodes
                            episodes={animeData.episodes}
                            currentEpisode={currentEpisode}
                            onEpisodeChange={handleEpisodeChange}
                        />
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                        <AnimeMediaInfo
                            title={animeData.title}
                            image={animeData.image}
                            status={animeData.status}
                            releaseDate={animeData.releaseDate}
                            description={animeData.description}
                            genres={animeData.genres}
                            subOrDub={animeData.subOrDub}
                            totalEpisodes={animeData.totalEpisodes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchAnimePage;
