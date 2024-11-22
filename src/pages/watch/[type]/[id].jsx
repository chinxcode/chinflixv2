import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { getMediaDetails, getSeasonDetails, getStreamingLinks } from "@/lib/api";
import { VideoPlayer, RelationInfo, MediaInfo, SeasonEpisode, CastInfo, MediaActions } from "@/components/MediaComponents";
import StreamingServers from "@/components/StreamingServers";
import Skeleton from "@/components/Skeleton";
import { streamingSources } from "@/lib/streamingSources";

const WatchPage = () => {
    const router = useRouter();
    const { type, id, s, e, server } = router.query;
    const [mediaData, setMediaData] = useState(null);
    const [seasonData, setSeasonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSeason, setCurrentSeason] = useState(1);
    const [currentEpisode, setCurrentEpisode] = useState(1);
    const [streamingServers, setStreamingServers] = useState([]);
    const [currentServer, setCurrentServer] = useState("");
    const [selectedServerIndex, setSelectedServerIndex] = useState(0);
    const [isChangingMedia, setIsChangingMedia] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;

        // Load cached values first
        const cachedServer = localStorage.getItem("preferred_server");
        let initialServerIndex = selectedServerIndex;

        if (cachedServer) {
            const serverData = JSON.parse(cachedServer);
            if (serverData.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000) {
                initialServerIndex = serverData.serverIndex;
                setSelectedServerIndex(serverData.serverIndex);
            }
        }

        let initialSeason = currentSeason;
        let initialEpisode = currentEpisode;

        if (type === "tv") {
            const cachedEpisode = localStorage.getItem(`tv_${id}_episode`);
            if (cachedEpisode) {
                const episodeData = JSON.parse(cachedEpisode);
                if (episodeData.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000) {
                    initialSeason = episodeData.season;
                    initialEpisode = episodeData.episode;
                    setCurrentSeason(episodeData.season);
                    setCurrentEpisode(episodeData.episode);
                }
            }
        }

        // URL params override cached values
        if (s) initialSeason = parseInt(s);
        if (e) initialEpisode = parseInt(e);
        if (server) {
            const index = Object.keys(streamingSources).indexOf(server);
            if (index !== -1) initialServerIndex = index;
        }

        // Update URL with final values
        const newQuery = {
            ...router.query,
            ...(type === "tv" && { s: initialSeason }),
            ...(type === "tv" && { e: initialEpisode }),
            server: Object.keys(streamingSources)[initialServerIndex],
        };

        router.push(
            {
                pathname: router.pathname,
                query: newQuery,
            },
            undefined,
            { shallow: true }
        );
    }, [router.isReady]);

    // Save preferences to cache
    const saveToCache = (season, episode, serverIndex) => {
        // Save server preference (common for both movie and tv)
        if (serverIndex !== undefined) {
            localStorage.setItem(
                "preferred_server",
                JSON.stringify({
                    serverIndex,
                    timestamp: Date.now(),
                })
            );
        }

        // Save TV specific preferences
        if (type === "tv" && season && episode) {
            localStorage.setItem(
                `tv_${id}_episode`,
                JSON.stringify({
                    season,
                    episode,
                    timestamp: Date.now(),
                })
            );
        }
    };

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
                setCurrentServer(links[selectedServerIndex]?.url || links[0]?.url || "");
                setLoading(false);

                // Save current state to cache
                if (type === "tv") {
                    saveToCache(currentSeason, currentEpisode, selectedServerIndex);
                } else {
                    saveToCache(null, null, selectedServerIndex);
                }
            }
        };
        fetchData();
    }, [type, id, currentSeason, currentEpisode]);

    const updateURL = (season, episode, serverIndex) => {
        const newQuery = {
            ...router.query,
            ...(type === "tv" && season && { s: season }),
            ...(type === "tv" && episode && { e: episode }),
            ...(serverIndex !== undefined && { server: Object.keys(streamingSources)[serverIndex] }),
        };
        router.push(
            {
                pathname: router.pathname,
                query: newQuery,
            },
            undefined,
            { shallow: true }
        );
    };

    const handleSeasonChange = async (season) => {
        if (season === currentSeason) return;
        setIsChangingMedia(true);
        try {
            const [seasonDetails, links] = await Promise.all([getSeasonDetails(id, season), getStreamingLinks(id, type, season, 1)]);

            setCurrentSeason(season);
            setCurrentEpisode(1);
            setSeasonData(seasonDetails);
            setStreamingServers(links);
            setCurrentServer(links[selectedServerIndex]?.url || links[0]?.url || "");
            updateURL(season, 1, selectedServerIndex);
            saveToCache(season, 1, selectedServerIndex);
        } catch (error) {
            console.error("Failed to fetch season data:", error);
        } finally {
            setIsChangingMedia(false);
        }
    };

    const handleEpisodeChange = async (episode) => {
        if (episode === currentEpisode) return;
        setIsChangingMedia(true);
        try {
            const links = await getStreamingLinks(id, type, currentSeason, episode);
            setCurrentEpisode(episode);
            setStreamingServers(links);
            setCurrentServer(links[selectedServerIndex]?.url || links[0]?.url || "");
            updateURL(currentSeason, episode, selectedServerIndex);
            saveToCache(currentSeason, episode, selectedServerIndex);
        } catch (error) {
            console.error("Failed to fetch episode data:", error);
        } finally {
            setIsChangingMedia(false);
        }
    };

    const handleServerChange = (url, index) => {
        if (!isChangingMedia && index !== selectedServerIndex) {
            setCurrentServer(url);
            setSelectedServerIndex(index);
            updateURL(currentSeason, currentEpisode, index);
            saveToCache(currentSeason, currentEpisode, index);
        }
    };

    if (loading) {
        return (
            <div className="p-2 h-screen">
                <Skeleton className="w-full h-full rounded-lg" withLoader />
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
        <>
            <Head>
                <title>{`${mediaData.title || mediaData.name} | ChinFlix`}</title>
            </Head>
            <div className="lg:flex lg:flex-row lg:gap-2 lg:h-screen overflow-hidden">
                {/* Large screen layout */}
                <div className="hidden lg:flex lg:flex-row lg:gap-2 lg:p-2 lg:h-screen">
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
                            <span className="!line-clamp-1 flex-grow sm:text-lg mr-2">{mediaData.title || mediaData.name}</span>
                        </div>
                        <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                            <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col">
                                <VideoPlayer src={currentServer} isLoading={isChangingMedia} />
                            </div>
                            <MediaActions
                                viewCount={Number(mediaData.popularity.toFixed(0))}
                                type={type}
                                id={id}
                                currentSeason={currentSeason}
                                currentEpisode={currentEpisode}
                                episodes={seasonData?.episodes}
                                onEpisodeChange={handleEpisodeChange}
                            />
                            <StreamingServers
                                servers={streamingServers}
                                onServerChange={handleServerChange}
                                isLoading={isChangingMedia}
                                selectedServerIndex={selectedServerIndex}
                            />
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
                            <p className="text-left py-4 text-sm text-gray-400 px-4">
                                This site does not store any files on the server, we only linked to the media which is hosted on 3rd party
                                services.
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-1/3 h-full rounded-lg overflow-hidden border border-gray-800 flex flex-col">
                        <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                            {type === "tv" && seasonData && (
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <SeasonEpisode
                                        seasons={mediaData.seasons ? mediaData.seasons.map((s) => s.name) : []}
                                        episodes={seasonData.episodes.map((e) => ({ title: e.name }))}
                                        currentSeason={currentSeason}
                                        currentEpisode={currentEpisode}
                                        onSeasonChange={handleSeasonChange}
                                        onEpisodeChange={handleEpisodeChange}
                                        isLoading={isChangingMedia}
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
                                className="lucide lucide-arrow-left"
                            >
                                <path d="m12 19-7-7 7-7"></path>
                                <path d="M19 12H5"></path>
                            </svg>
                        </button>
                        <span className="!line-clamp-1 flex-grow sm:text-lg mr-2">{mediaData.title || mediaData.name}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg overflow-hidden border border-gray-700 flex flex-col">
                            <div className="max-h-full overflow-y-auto p-4 space-y-4">
                                <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col">
                                    <VideoPlayer src={currentServer} isLoading={isChangingMedia} />
                                </div>
                                <MediaActions
                                    viewCount={Number(mediaData.popularity.toFixed(0))}
                                    type={type}
                                    id={id}
                                    currentSeason={currentSeason}
                                    currentEpisode={currentEpisode}
                                    episodes={seasonData?.episodes}
                                    onEpisodeChange={handleEpisodeChange}
                                />
                                <StreamingServers
                                    servers={streamingServers}
                                    onServerChange={handleServerChange}
                                    isLoading={isChangingMedia}
                                    selectedServerIndex={selectedServerIndex}
                                />
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden border border-gray-700 flex flex-col">
                            <div className="max-h-full overflow-y-auto p-4 space-y-4">
                                {type === "tv" && seasonData && (
                                    <div className="bg-gray-900 rounded-lg p-4">
                                        <SeasonEpisode
                                            seasons={mediaData.seasons ? mediaData.seasons.map((s) => s.name) : []}
                                            episodes={seasonData.episodes.map((e) => ({ title: e.name }))}
                                            currentSeason={currentSeason}
                                            currentEpisode={currentEpisode}
                                            onSeasonChange={handleSeasonChange}
                                            onEpisodeChange={handleEpisodeChange}
                                            isLoading={isChangingMedia}
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default WatchPage;
