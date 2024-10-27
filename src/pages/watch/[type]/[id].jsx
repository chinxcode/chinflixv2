import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getMediaDetails, getSeasonDetails, getStreamingLinks } from "@/lib/api";
import { VideoPlayer, RelationInfo, MediaInfo, SeasonEpisode, CastInfo, MediaActions } from "@/components/MediaComponents";
import StreamingServers from "@/components/StreamingServers";
import Skeleton from "@/components/Skeleton";

const WatchPage = () => {
    const router = useRouter();
    const { type, id } = router.query;
    const [mediaData, setMediaData] = useState(null);
    const [seasonData, setSeasonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSeason, setCurrentSeason] = useState(1);
    const [currentEpisode, setCurrentEpisode] = useState(1);
    const [streamingServers, setStreamingServers] = useState([]);
    const [currentServer, setCurrentServer] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (type && id) {
                setLoading(true);
                const data = await getMediaDetails(type, id);
                setMediaData(data);
                if (type === "tv") {
                    const seasonDetails = await getSeasonDetails(id, currentSeason);
                    setSeasonData(seasonDetails);
                }
                const links = await getStreamingLinks(id, type, currentSeason, currentEpisode);
                setStreamingServers(links);
                setCurrentServer(links[0]?.url || "");
                setLoading(false);
            }
        };
        fetchData();
    }, [type, id, currentSeason, currentEpisode]);

    const handleSeasonChange = async (season) => {
        setCurrentSeason(season);
        setCurrentEpisode(1);
        if (type === "tv" && id) {
            const seasonDetails = await getSeasonDetails(id, season);
            setSeasonData(seasonDetails);
            const links = await getStreamingLinks(id, "tv", season, 1);
            setStreamingServers(links);
            setCurrentServer(links[0]?.url || "");
        }
    };

    const handleServerChange = (url) => {
        setCurrentServer(url);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 h-screen">
                <Skeleton className="w-full h-64" />
                <Skeleton className="w-full h-40" />
                <Skeleton className="w-full h-40" />
            </div>
        );
    }

    if (!mediaData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-2xl">Media not found</p>
            </div>
        );
    }

    return (
        <div className="lg:flex lg:flex-row lg:gap-2 lg:p-2 lg:h-screen">
            {/* Large screen layout */}
            <div className="hidden lg:flex lg:flex-row lg:gap-2 lg:p-2 lg:h-screen">
                <div className="lg:w-2/3 h-full rounded-lg overflow-hidden border border-gray-700 flex flex-col">
                    <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                        <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col">
                            <VideoPlayer src={currentServer} />
                            <MediaActions viewCount={Number(mediaData.popularity.toFixed(0))} />
                        </div>
                        <StreamingServers servers={streamingServers} onServerChange={handleServerChange} />
                        <div className="bg-gray-900 rounded-lg p-4">
                            <RelationInfo
                                title="Recommended"
                                recommendations={mediaData.recommendations.results.map((item) => ({
                                    link: `/watch/${type}/${item.id}`,
                                    image: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
                                    title: item.title || item.name || "Untitled",
                                    rating: item.vote_average,
                                }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/3 h-full rounded-lg overflow-hidden border border-gray-700 flex flex-col">
                    <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                        {type === "tv" && seasonData && (
                            <div className="bg-gray-900 rounded-lg p-4">
                                <SeasonEpisode
                                    seasons={mediaData.seasons ? mediaData.seasons.map((s) => s.name) : []}
                                    episodes={seasonData.episodes.map((e) => ({ title: e.name }))}
                                    currentSeason={currentSeason}
                                    currentEpisode={currentEpisode}
                                    onSeasonChange={handleSeasonChange}
                                    onEpisodeChange={setCurrentEpisode}
                                />
                            </div>
                        )}
                        <div className="bg-gray-900 rounded-lg p-4">
                            <MediaInfo
                                title={mediaData.title || mediaData.name || "Untitled"}
                                poster={`https://image.tmdb.org/t/p/w500${mediaData.poster_path}`}
                                rating={mediaData.vote_average}
                                status={mediaData.status}
                                production={mediaData.production_companies[0]?.name || "N/A"}
                                aired={mediaData.release_date || mediaData.first_air_date || "N/A"}
                                description={mediaData.overview}
                                genres={mediaData.genres.map((g) => g.name)}
                            />
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4">
                            <CastInfo
                                cast={mediaData.credits.cast.map((c) => ({
                                    name: c.character,
                                    actor: c.name,
                                    image: `https://image.tmdb.org/t/p/w185${c.profile_path}`,
                                }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Small screen layout */}
            <div className="lg:hidden w-full flex flex-col gap-2 pb-28 sm:px-2">
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
                            className="lucide lucide-arrow-left bubbly smoothie"
                        >
                            <path d="m12 19-7-7 7-7"></path>
                            <path d="M19 12H5"></path>
                        </svg>
                    </button>
                    <span className="!line-clamp-1 flex-grow sm:text-lg mr-2">{mediaData.title || mediaData.name}</span>
                </div>
                <div className="w-full flex flex-col gap-3 mb-2">
                    <div className="flex w-full relative h-[60vh] sm:h-full sm:aspect-video rounded-lg overflow-hidden bg-white/10">
                        <VideoPlayer src={currentServer} />
                    </div>
                    <div className="w-full">
                        <div className="flex w-full flex-col gap-5">
                            <div
                                title={mediaData.overview}
                                className="text-gray-200 max-w-[95%] !line-clamp-2 px-1 sm:text-lg !leading-tight"
                            >
                                {mediaData.overview}
                            </div>
                            <MediaActions viewCount={parseInt(mediaData.popularity.toFixed(0))} />
                        </div>
                    </div>
                    <StreamingServers servers={streamingServers} onServerChange={handleServerChange} />
                </div>
                <div className="flex flex-col w-full gap-5 mt-4">
                    <MediaInfo
                        title={mediaData.title || mediaData.name || "Untitled"}
                        poster={`https://image.tmdb.org/t/p/w500${mediaData.poster_path}`}
                        rating={mediaData.vote_average}
                        status={mediaData.status}
                        production={mediaData.production_companies[0]?.name || "N/A"}
                        aired={mediaData.release_date || mediaData.first_air_date || "N/A"}
                        description={mediaData.overview}
                        genres={mediaData.genres.map((g) => g.name)}
                    />
                    <CastInfo
                        cast={mediaData.credits.cast.map((c) => ({
                            name: c.character,
                            actor: c.name,
                            image: `https://image.tmdb.org/t/p/w185${c.profile_path}`,
                        }))}
                    />
                    <RelationInfo
                        title="Recommended"
                        recommendations={mediaData.recommendations.results.map((item) => ({
                            link: `/watch/${type}/${item.id}`,
                            image: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
                            title: item.title || item.name || "Untitled",
                            rating: item.vote_average,
                        }))}
                    />
                </div>
            </div>
        </div>
    );
};

export default WatchPage;
