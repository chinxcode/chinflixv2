import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getAnimeInfo, getEpisodeSources } from "@/lib/anime-api";
import Skeleton from "@/components/Skeleton";
import { VideoPlayer } from "@/components/MediaComponents";

// const AnimePlayer = dynamic(() => import("@/components/AnimeComponents/AnimePlayer"), {
//     ssr: false,
// });

const AnimeMediaActions = dynamic(() => import("@/components/AnimeComponents/AnimeMediaActions"));
const AnimeMediaInfo = dynamic(() => import("@/components/AnimeComponents/AnimeMediaInfo"));
const AnimeEpisodes = dynamic(() => import("@/components/AnimeComponents/AnimeEpisodes"));

const WatchAnimePage = () => {
    const router = useRouter();
    const { id, e } = router.query;
    const [animeData, setAnimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState(1);
    const [streamingUrl, setStreamingUrl] = useState("");
    const [isChangingEpisode, setIsChangingEpisode] = useState(false);
    const [downloadLink, setDownloadLink] = useState("");

    // Watch for URL changes with validation
    useEffect(() => {
        if (!animeData || !e) return;
        const episodeNumber = parseInt(e);

        // Validate episode number
        if (isNaN(episodeNumber) || episodeNumber < 1 || episodeNumber > animeData.episodes.length) {
            router.replace(
                {
                    pathname: router.pathname,
                    query: { id },
                },
                undefined,
                { shallow: true }
            );
            return;
        }

        const targetEpisode = animeData.episodes[episodeNumber - 1];
        if (targetEpisode && targetEpisode.id !== currentEpisode) {
            handleEpisodeChange(targetEpisode.id);
        }
    }, [e, animeData]);

    // Initial data load with validation
    useEffect(() => {
        if (!id) return;

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const data = await getAnimeInfo(id);
                setAnimeData(data);

                if (data.episodes.length > 0) {
                    let targetEpisodeNumber = 1;

                    const cachedEpisode = localStorage.getItem(`anime_${id}_episode`);
                    if (cachedEpisode) {
                        const episodeData = JSON.parse(cachedEpisode);
                        if (episodeData.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000) {
                            targetEpisodeNumber = episodeData.number;
                        }
                    }

                    if (e) {
                        const requestedEpisode = parseInt(e);
                        if (!isNaN(requestedEpisode) && requestedEpisode >= 1 && requestedEpisode <= data.episodes.length) {
                            targetEpisodeNumber = requestedEpisode;
                        }
                    }

                    const targetEpisode = data.episodes[targetEpisodeNumber - 1];
                    if (targetEpisode) {
                        const sources = await getEpisodeSources(targetEpisode.id);
                        setCurrentEpisode(targetEpisode.id);
                        setCurrentEpisodeNumber(targetEpisodeNumber);
                        setStreamingUrl(sources.sources.find((s) => s.quality === "default")?.url || sources.sources[2]?.url || "");
                        setDownloadLink(sources.download || "");

                        router.replace(
                            {
                                pathname: router.pathname,
                                query: { ...router.query, e: targetEpisodeNumber },
                            },
                            undefined,
                            { shallow: true }
                        );

                        localStorage.setItem(
                            `anime_${id}_episode`,
                            JSON.stringify({
                                number: targetEpisodeNumber,
                                timestamp: Date.now(),
                            })
                        );
                    }
                }
            } catch (error) {
                console.error("Failed to fetch anime data:", error);
            }
            setLoading(false);
        };

        fetchInitialData();
    }, [id]);

    const handleEpisodeChange = async (episodeId) => {
        if (episodeId === currentEpisode) return;
        setIsChangingEpisode(true);

        try {
            const episodeIndex = animeData.episodes.findIndex((ep) => ep.id === episodeId);
            const episodeNumber = episodeIndex + 1;

            const sources = await getEpisodeSources(episodeId);
            setCurrentEpisode(episodeId);
            setCurrentEpisodeNumber(episodeNumber);
            setStreamingUrl(sources.sources[0]?.url || "");
            setDownloadLink(sources.download || "");

            // Update URL
            router.replace(
                {
                    pathname: router.pathname,
                    query: { ...router.query, e: episodeNumber },
                },
                undefined,
                { shallow: true }
            );

            // Update cache
            localStorage.setItem(
                `anime_${id}_episode`,
                JSON.stringify({
                    number: episodeNumber,
                    timestamp: Date.now(),
                })
            );
        } catch (error) {
            console.error("Failed to fetch episode sources:", error);
        } finally {
            setIsChangingEpisode(false);
        }
    };

    if (loading) {
        return (
            <div className="p-2 h-screen">
                <Skeleton className="w-full h-full rounded-lg" withLoader />
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
            <div className="lg:flex p-2 lg:flex-row lg:gap-2 lg:h-screen overflow-hidden">
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
                        <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col">
                            {/* <AnimePlayer src={streamingUrl} isLoading={isChangingEpisode} /> */}
                            <VideoPlayer src={`https://ani-playerr.vercel.app/play?url=${streamingUrl}`} isLoading={isChangingEpisode} />
                        </div>
                        <AnimeMediaActions
                            viewCount={1000}
                            episodes={animeData.episodes}
                            currentEpisode={currentEpisode}
                            onEpisodeChange={handleEpisodeChange}
                            downloadLink={downloadLink}
                            isChangingEpisode={isChangingEpisode}
                            imageUrl={animeData.image}
                            title={animeData.title}
                            id={id}
                        />
                    </div>
                </div>

                <div className="lg:w-1/3 h-full rounded-lg overflow-hidden border border-gray-800 flex flex-col">
                    <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                        <div className="bg-gray-900 rounded-lg p-4">
                            <AnimeEpisodes
                                episodes={animeData.episodes}
                                currentEpisode={currentEpisode}
                                onEpisodeChange={handleEpisodeChange}
                                isLoading={isChangingEpisode}
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
        </>
    );
};

export default WatchAnimePage;
