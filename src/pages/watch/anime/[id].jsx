import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { getAnimeInfo, getEpisodeSources } from "@/lib/anime-api";
import Skeleton from "@/components/Skeleton";

const AnimePlayer = dynamic(() => import("@/components/AnimeComponents/AnimePlayer"), {
    ssr: false,
    loading: () => <div className="aspect-video bg-gray-800 animate-pulse" />,
});

const AnimeMediaActions = dynamic(() => import("@/components/AnimeComponents/AnimeMediaActions"));
const AnimeMediaInfo = dynamic(() => import("@/components/AnimeComponents/AnimeMediaInfo"));
const AnimeEpisodes = dynamic(() => import("@/components/AnimeComponents/AnimeEpisodes"));

const WatchAnimePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [animeData, setAnimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [streamingUrl, setStreamingUrl] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const data = await getAnimeInfo(id);
                setAnimeData(data);

                if (data.episodes.length > 0) {
                    const firstEpisode = data.episodes[0];
                    setCurrentEpisode(firstEpisode.id);

                    // Load episode source after initial render
                    requestIdleCallback(async () => {
                        const sources = await getEpisodeSources(firstEpisode.id);
                        setStreamingUrl(sources.sources.find((s) => s.quality === "default")?.url || sources.sources[0]?.url || "");
                    });
                }
            } catch (error) {
                console.error("Failed to fetch anime data:", error);
            }
            setLoading(false);
        };

        fetchInitialData();
    }, [id]);

    const handleEpisodeChange = async (episodeId) => {
        setCurrentEpisode(episodeId);
        try {
            const sources = await getEpisodeSources(episodeId);
            setStreamingUrl(sources.sources[0]?.url || "");
        } catch (error) {
            console.error("Failed to fetch episode sources:", error);
        }
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
        <>
            <Head>
                <title>{`${animeData.title} | ChinFlix`}</title>
                <meta name="description" content={animeData.description} />
            </Head>
            <div className="lg:flex lg:flex-row lg:gap-2 lg:h-screen overflow-hidden">
                <div className="lg:w-2/3 h-full rounded-lg overflow-hidden border border-gray-800 flex flex-col">
                    <div className="flex gap-2 w-full h-12 items-center">
                        <button
                            className="w-9 h-full flex items-center shrink-0 justify-center"
                            onClick={() => router.back()}
                            aria-label="Go back"
                        >
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
                            >
                                <path d="m12 19-7-7 7-7"></path>
                                <path d="M19 12H5"></path>
                            </svg>
                        </button>
                        <span className="!line-clamp-1 flex-grow sm:text-lg mr-2">{animeData.title}</span>
                    </div>
                    <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                        <Suspense fallback={<div className="aspect-video bg-gray-800 animate-pulse" />}>
                            <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col">
                                <AnimePlayer src={streamingUrl} />
                                <AnimeMediaActions viewCount={1000} />
                            </div>
                        </Suspense>
                        <p className="text-left py-4 text-sm text-gray-400 px-4">
                            This site does not store any files on the server, we only linked to the media which is hosted on 3rd party
                            services.
                        </p>
                    </div>
                </div>

                <div className="lg:w-1/3 h-full rounded-lg overflow-hidden border border-gray-800 flex flex-col">
                    <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                        <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
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
                        </Suspense>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WatchAnimePage;
