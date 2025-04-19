import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { getMediaDetails, getSeasonDetails, getStreamingLinks } from "@/lib/api";
import { VideoPlayer, RelationInfo, MediaInfo, SeasonEpisode, CastInfo, MediaActions, AnimeRelations } from "@/components/MediaComponents";
import StreamingServers from "@/components/StreamingServers";
import Skeleton from "@/components/Skeleton";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

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
    const [isInfoPanelCollapsed, setIsInfoPanelCollapsed] = useState(false);

    // Load initial data and handle cache
    useEffect(() => {
        if (!router.isReady || !type || !id) return;

        const loadInitialState = async () => {
            try {
                const data = await getMediaDetails(type, id);
                setMediaData(data);

                let initialSeason = 1;
                let initialEpisode = 1;
                let initialServerName = "";

                // Load cached preferences based on content type
                if (type === "anime") {
                    const cachedServer = JSON.parse(localStorage.getItem("preferred_anime_server") || "null");
                    if (cachedServer && Date.now() - cachedServer.timestamp < 7 * 24 * 60 * 60 * 1000) {
                        initialServerName = cachedServer.serverName;
                    }
                } else {
                    const cachedServer = JSON.parse(localStorage.getItem("preferred_regular_server") || "null");
                    if (cachedServer && Date.now() - cachedServer.timestamp < 7 * 24 * 60 * 60 * 1000) {
                        initialServerName = cachedServer.serverName;
                    }
                }

                // Handle TV shows and anime episode selection
                if (type === "tv" || type === "anime") {
                    const cachedEpisode = JSON.parse(localStorage.getItem(`${type}_${id}_episode`) || "null");
                    if (cachedEpisode && Date.now() - cachedEpisode.timestamp < 30 * 24 * 60 * 60 * 1000) {
                        initialSeason = cachedEpisode.season;
                        initialEpisode = cachedEpisode.episode;
                    }

                    // Validate and apply URL parameters
                    if (s) {
                        const seasonNum = parseInt(s);
                        if (
                            !isNaN(seasonNum) &&
                            seasonNum >= 1 &&
                            ((type === "tv" && data.seasons && seasonNum <= data.seasons.length) ||
                                (type === "anime" && data.number_of_seasons && seasonNum <= data.number_of_seasons))
                        ) {
                            initialSeason = seasonNum;
                        }
                    }

                    const seasonDetails = await getSeasonDetails(id, initialSeason, type);
                    setSeasonData(seasonDetails);

                    if (e) {
                        const episodeNum = parseInt(e);
                        if (
                            !isNaN(episodeNum) &&
                            episodeNum >= 1 &&
                            seasonDetails.episodes &&
                            episodeNum <= seasonDetails.episodes.length
                        ) {
                            initialEpisode = episodeNum;
                        }
                    }
                }

                if (server) {
                    // Use server name from URL if provided
                    initialServerName = server;
                }

                const links = await getStreamingLinks(id, type, initialSeason, initialEpisode);
                setStreamingServers(links);

                // Find server index based on server name
                const serverIndex = links.findIndex((s) => s.name === initialServerName);
                const selectedIndex = serverIndex !== -1 ? serverIndex : 0;
                setSelectedServerIndex(selectedIndex);
                setCurrentServer(links[selectedIndex]?.url || links[0]?.url || "");

                setCurrentSeason(initialSeason);
                setCurrentEpisode(initialEpisode);

                // Update URL with validated values
                updateURL(initialSeason, initialEpisode, links[selectedIndex]?.name);
                saveToCache(initialSeason, initialEpisode, links[selectedIndex]?.name);
            } catch (error) {
                console.error("Failed to load initial data:", error);
            }
            setLoading(false);
        };

        loadInitialState();
    }, [type, id, router.isReady, s, e, server]);

    const saveToCache = (season, episode, serverName) => {
        if (serverName) {
            if (type === "anime") {
                localStorage.setItem(
                    "preferred_anime_server",
                    JSON.stringify({
                        serverName,
                        timestamp: Date.now(),
                    })
                );
            } else {
                localStorage.setItem(
                    "preferred_regular_server",
                    JSON.stringify({
                        serverName,
                        timestamp: Date.now(),
                    })
                );
            }
        }

        if ((type === "tv" || type === "anime") && season && episode) {
            localStorage.setItem(
                `${type}_${id}_episode`,
                JSON.stringify({
                    season,
                    episode,
                    timestamp: Date.now(),
                })
            );

            // Save to watch history
            if (mediaData) {
                const watchHistory = JSON.parse(localStorage.getItem("watch_history") || "[]");
                const historyEntry = {
                    id,
                    type,
                    title: mediaData.title || mediaData.name,
                    poster_path: mediaData.poster_path,
                    season: season,
                    episode: episode,
                    timestamp: Date.now(),
                    // Additional useful metadata
                    genres: mediaData.genres?.map((g) => g.name || g).slice(0, 3) || [],
                    rating: mediaData.vote_average || 0,
                };

                // Update or add the entry
                const existingIndex = watchHistory.findIndex((item) => item.id === id && item.type === type);
                if (existingIndex !== -1) {
                    watchHistory[existingIndex] = historyEntry;
                } else {
                    watchHistory.unshift(historyEntry);
                }

                // Limit history length
                const MAX_HISTORY = 100;
                if (watchHistory.length > MAX_HISTORY) {
                    watchHistory.splice(MAX_HISTORY);
                }

                localStorage.setItem("watch_history", JSON.stringify(watchHistory));
            }
        }
    };

    const updateURL = (season, episode, serverName) => {
        const newQuery = {
            ...router.query,
            ...((type === "tv" || type === "anime") && season && { s: season }),
            ...((type === "tv" || type === "anime") && episode && { e: episode }),
            ...(serverName && { server: serverName }),
        };
        router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
    };

    const handleSeasonChange = async (season) => {
        if (season === currentSeason) return;
        setIsChangingMedia(true);
        try {
            const seasonDetails = await getSeasonDetails(id, season, type);
            const links = await getStreamingLinks(id, type, season, 1);

            setSeasonData(seasonDetails);
            setCurrentSeason(season);
            setCurrentEpisode(1);
            setStreamingServers(links);
            setCurrentServer(links[selectedServerIndex]?.url || links[0]?.url || "");

            updateURL(season, 1, links[selectedServerIndex]?.name);
            saveToCache(season, 1, links[selectedServerIndex]?.name);
        } catch (error) {
            console.error("Failed to change season:", error);
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

            updateURL(currentSeason, episode, links[selectedServerIndex]?.name);
            saveToCache(currentSeason, episode, links[selectedServerIndex]?.name);
        } catch (error) {
            console.error("Failed to change episode:", error);
        } finally {
            setIsChangingMedia(false);
        }
    };

    const handleServerChange = (url, index) => {
        if (!isChangingMedia && index !== selectedServerIndex) {
            setCurrentServer(url);
            setSelectedServerIndex(index);
            updateURL(currentSeason, currentEpisode, streamingServers[index]?.name);
            saveToCache(currentSeason, currentEpisode, streamingServers[index]?.name);
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

    // Format recommendations based on media type
    const formattedRecommendations =
        mediaData.recommendations?.results?.map((item) => ({
            link: `/watch/${item.media_type || type}/${item.id}`,
            image: item.poster_path,
            title: item.title || item.name || "Untitled",
            rating: item.vote_average,
        })) || [];

    // Format cast information based on media type
    const formattedCast = (mediaData.credits?.cast || []).map((c) => ({
        name: c.character,
        actor: c.name,
        image: c.profile_path,
    }));

    // Get seasons list based on media type
    const seasonsList =
        type === "anime"
            ? (mediaData.seasons || []).map((s, index) => s.name || `Season ${index + 1}`)
            : (mediaData.seasons || []).map((s) => s.name);

    // Get production name based on media type
    const productionName =
        type === "anime"
            ? mediaData.studios?.nodes?.[0]?.name || mediaData.production_companies?.[0]?.name || "N/A"
            : mediaData.production_companies?.[0]?.name || "N/A";

    return (
        <>
            <Head>
                <title>{`${mediaData.title || mediaData.name} | ChinFlix`}</title>
                <meta name="description" content={mediaData.overview?.substring(0, 160) || `Watch ${mediaData.title || mediaData.name}`} />
            </Head>
            <div className="lg:flex lg:flex-row lg:gap-2 lg:h-screen overflow-hidden">
                {/* Large screen layout */}
                <div className="hidden lg:flex lg:flex-row lg:gap-2 lg:p-2 lg:h-screen relative">
                    <div
                        className={`${
                            isInfoPanelCollapsed ? "lg:w-[calc(100%-4rem)]" : "lg:w-2/3"
                        } h-full rounded-lg overflow-hidden border border-gray-800 flex flex-col transition-all duration-300`}
                    >
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
                                viewCount={Number(mediaData.popularity?.toFixed(0)) || 0}
                                type={type}
                                id={id}
                                currentSeason={currentSeason}
                                currentEpisode={currentEpisode}
                                episodes={seasonData?.episodes}
                                onEpisodeChange={handleEpisodeChange}
                                posterUrl={mediaData.poster_path}
                                title={mediaData.title || mediaData.name}
                            />
                            <StreamingServers
                                servers={streamingServers}
                                onServerChange={handleServerChange}
                                isLoading={isChangingMedia}
                                selectedServerIndex={selectedServerIndex}
                            />
                            {type !== "anime" && (
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <RelationInfo title="Recommended" recommendations={formattedRecommendations} />
                                </div>
                            )}
                            {type === "anime" && mediaData.relations && <AnimeRelations relations={mediaData.relations} />}
                            <p className="text-left py-4 text-sm text-gray-400 px-4">
                                This site does not store any files on the server, we only linked to the media which is hosted on 3rd party
                                services.
                            </p>
                        </div>
                    </div>

                    {/* Floating toggle button */}
                    <button
                        onClick={() => setIsInfoPanelCollapsed(!isInfoPanelCollapsed)}
                        className={`fixed top-1/2 -translate-y-5 z-50 py-7 rounded-r-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 ${
                            isInfoPanelCollapsed ? "right-12" : "right-[31.5%]"
                        }`}
                        title={isInfoPanelCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isInfoPanelCollapsed ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
                    </button>

                    {/* Info panel */}
                    <div
                        className={`${
                            isInfoPanelCollapsed ? "lg:w-12 opacity-0 invisible" : "lg:w-1/3 opacity-100 visible"
                        } h-full rounded-lg overflow-hidden border border-gray-800 flex flex-col transition-all duration-300`}
                    >
                        <div className="h-full max-h-full overflow-y-auto p-4 space-y-4">
                            {(type === "tv" || type === "anime") && seasonData && (
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <SeasonEpisode
                                        seasons={seasonsList}
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
                                    poster={mediaData.poster_path}
                                    rating={mediaData.vote_average}
                                    status={mediaData.status}
                                    production={productionName}
                                    aired={mediaData.release_date || mediaData.first_air_date || "N/A"}
                                    description={mediaData.overview}
                                    genres={mediaData.genres?.map((g) => g.name || g) || []}
                                />
                            </div>
                            {formattedCast.length > 0 && (
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <CastInfo cast={formattedCast} />
                                </div>
                            )}
                            {type === "anime" && mediaData.staff && mediaData.staff.length > 0 && (
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <CastInfo
                                        cast={mediaData.staff.map((s) => ({
                                            name: s.role,
                                            actor: s.name,
                                            image: s.profile_path,
                                        }))}
                                        title="Staff"
                                    />
                                </div>
                            )}
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
                                    viewCount={Number(mediaData.popularity?.toFixed(0)) || 0}
                                    type={type}
                                    id={id}
                                    currentSeason={currentSeason}
                                    currentEpisode={currentEpisode}
                                    episodes={seasonData?.episodes}
                                    onEpisodeChange={handleEpisodeChange}
                                    posterUrl={mediaData.poster_path}
                                    title={mediaData.title || mediaData.name}
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
                                {(type === "tv" || type === "anime") && seasonData && (
                                    <div className="bg-gray-900 rounded-lg p-4">
                                        <SeasonEpisode
                                            seasons={seasonsList}
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
                                        poster={mediaData.poster_path}
                                        rating={mediaData.vote_average}
                                        status={mediaData.status}
                                        production={productionName}
                                        aired={mediaData.release_date || mediaData.first_air_date || "N/A"}
                                        description={mediaData.overview}
                                        genres={mediaData.genres?.map((g) => g.name || g) || []}
                                    />
                                </div>
                                {formattedCast.length > 0 && (
                                    <div className="bg-gray-900 rounded-lg p-4">
                                        <CastInfo cast={formattedCast} />
                                    </div>
                                )}
                                {type === "anime" && mediaData.staff && mediaData.staff.length > 0 && (
                                    <div className="bg-gray-900 rounded-lg p-4">
                                        <CastInfo
                                            cast={mediaData.staff.map((s) => ({
                                                name: s.role,
                                                actor: s.name,
                                                image: s.profile_path,
                                            }))}
                                            title="Staff"
                                        />
                                    </div>
                                )}
                                {type !== "anime" && (
                                    <div className="bg-gray-900 rounded-lg p-4">
                                        <RelationInfo title="Recommended" recommendations={formattedRecommendations} />
                                    </div>
                                )}
                                {type === "anime" && mediaData.relations && <AnimeRelations relations={mediaData.relations} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WatchPage;
