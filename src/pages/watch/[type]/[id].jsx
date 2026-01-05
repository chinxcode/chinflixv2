import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef } from "react";
import Head from "next/head";
import { getMediaDetails, getSeasonDetails, getStreamingLinks } from "@/lib/api";
import { VideoPlayer, RelationInfo, MediaInfo, SeasonEpisode, CastInfo, MediaActions, AnimeRelations } from "@/components/MediaComponents";
import StreamingServers from "@/components/StreamingServers";
// import Skeleton from "@/components/Skeleton";
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
    const [currentServerName, setCurrentServerName] = useState("");
    const [trailerUrl, setTrailerUrl] = useState("");
    const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
    const [isChangingMedia, setIsChangingMedia] = useState(false);
    const [isInfoPanelCollapsed, setIsInfoPanelCollapsed] = useState(false);

    // Custom player states
    const [customPlayerData, setCustomPlayerData] = useState(null);
    const [isLoadingCustomPlayer, setIsLoadingCustomPlayer] = useState(false);
    const [customPlayerError, setCustomPlayerError] = useState(null);
    const [customLoadingProgress, setCustomLoadingProgress] = useState({ loaded: 0, total: 0 });

    // Track if user has manually changed server (to prevent auto-switch)
    const hasUserChangedServerRef = useRef(false);
    const initialServerNameRef = useRef("");
    const firstCustomServerLoadedRef = useRef(false); // Derive current server URL and data
    const currentServerData = streamingServers.find((s) => s.name === currentServerName);
    const currentServer = isPlayingTrailer ? trailerUrl : currentServerData?.url || streamingServers[0]?.url || "";

    const resetAllScrolls = useCallback(() => {
        // Reset main page scroll
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Reset all scrollable containers
        document.querySelectorAll(".overflow-y-auto").forEach((container) => {
            container.scrollTo({ top: 0, behavior: "smooth" });
        });
    }, []);

    // Fetch custom player download links with progressive loading
    const fetchCustomPlayerLinks = async (mediaId, mediaType, season, episode, shouldAutoSwitch = false) => {
        setIsLoadingCustomPlayer(true);
        setCustomPlayerError(null);
        firstCustomServerLoadedRef.current = false;

        // Helper function to format HLS URLs
        const formatHlsUrl = (url) => {
            // if url starts with "https://hlsforge.com" then remove it
            if (url.startsWith("https://hlsforge.com")) {
                url = decodeURIComponent(url.replace("https://hlsforge.com/?url=", ""));
            }

            //if url has &id= remove it and keep only url before it
            if (url.includes("&id=")) {
                url = url.split("&id=")[0];
            }
            return url;
        };

        // Helper function to extract headers from MP4 URLs
        const extractHeadersfrommp4 = (url) => {
            // decode headers from url if exists
            if (url.includes("&headers=")) {
                const headersString = url.split("&headers=")[1];
                try {
                    return JSON.parse(decodeURIComponent(headersString));
                } catch (e) {
                    console.error("Failed to parse headers:", e);
                    return null;
                }
            }
            return null;
        };

        try {
            const params = {
                id: mediaId.toString(),
                type: mediaType,
                title: mediaData?.title || mediaData?.name || "Untitled",
            };

            if (mediaType === "tv" || mediaType === "anime") {
                params.season = season;
                params.episode = episode;
            }

            const response = await fetch(`/api/download/init?${new URLSearchParams({ id: params.id })}`);
            const initData = await response.json();

            if (!initData.success || !initData.sourceList || initData.sourceList.length === 0) {
                throw new Error("No sources available");
            }

            const totalServers = initData.sourceList.length;
            setCustomLoadingProgress({ loaded: 0, total: totalServers });

            const captionsMap = new Map();
            let loadedCount = 0;
            let firstServerReturned = false;

            // Fetch first server immediately, then others in background
            const fetchServer = async (server, index) => {
                try {
                    const serverParams = {
                        ...params,
                        server,
                        secretKey: initData.secretKey,
                    };

                    const serverResponse = await fetch(`/api/download/server?${new URLSearchParams(serverParams)}`);
                    const serverData = await serverResponse.json();

                    loadedCount++;
                    setCustomLoadingProgress({ loaded: loadedCount, total: totalServers });

                    if (serverData.success && serverData.links && serverData.links.length > 0) {
                        if (serverData.captions && serverData.captions.length > 0) {
                            serverData.captions.forEach((caption) => {
                                if (caption.file && !captionsMap.has(caption.file)) {
                                    captionsMap.set(caption.file, {
                                        label: caption.label,
                                        file: caption.file,
                                    });
                                }
                            });
                        }

                        // Process links: format URLs and extract headers
                        const processedLinks = serverData.links.map((link) => {
                            const processedLink = { ...link };

                            if (link.type === "m3u8") {
                                // Format HLS URLs
                                processedLink.url = formatHlsUrl(link.url);
                            } else if (link.type === "mp4") {
                                // Extract headers from MP4 URLs
                                const headers = extractHeadersfrommp4(link.url);
                                if (headers) {
                                    processedLink.headers = headers;
                                }
                            }

                            return processedLink;
                        });

                        // Sort this server's links by quality
                        const sortedLinks = processedLinks.sort((a, b) => {
                            const qualityOrder = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"];
                            const aQuality = String(a.quality || "");
                            const bQuality = String(b.quality || "");
                            const aIndex = qualityOrder.findIndex((q) => aQuality.includes(q));
                            const bIndex = qualityOrder.findIndex((q) => bQuality.includes(q));
                            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
                        });

                        const defaultLink = sortedLinks[0];
                        const allCaptions = Array.from(captionsMap.values());

                        // Instead of bundling all links as a single playerData entry,
                        // create an individual streaming server entry for each returned link
                        // so all links appear in the main server list.
                        const newServers = sortedLinks.map((link, idx) => {
                            const name = `${serverData.server} - ${link.quality || `link${idx + 1}`}`;
                            return {
                                name,
                                url: link.url,
                                format: link.type,
                                quality: link.quality,
                                headers: link.headers,
                                flag: "⭐",
                                working: true,
                                // mark the first custom server loaded overall as recommended
                                recommended: !firstCustomServerLoadedRef.current && idx === 0,
                                isCustomPlayer: true,
                                // keep playerData minimal and per-entry (single source),
                                // this prevents grouping all links under one server
                                playerData: {
                                    sources: [link],
                                    captions: allCaptions,
                                },
                            };
                        });

                        console.log("Loaded custom servers:", newServers);

                        // Add new server entries to the main streaming servers list,
                        // preserving ordering: existing custom servers first, then new ones, then external servers.
                        const newNames = newServers.map((s) => s.name);
                        setStreamingServers((prev) => {
                            const filtered = prev.filter((s) => !newNames.includes(s.name));
                            const existingCustom = filtered.filter((s) => s.isCustomPlayer);
                            const externalServers = filtered.filter((s) => !s.isCustomPlayer);
                            return [...existingCustom, ...newServers, ...externalServers];
                        });

                        // If this is the very first custom server batch loaded, mark ref
                        const isFirstServer = !firstCustomServerLoadedRef.current && newServers.length > 0;
                        if (isFirstServer) {
                            firstCustomServerLoadedRef.current = true;
                        }

                        // Return the first new server entry (used by auto-switch logic)
                        return { server: newServers[0], isFirst: isFirstServer };
                    }
                    return null;
                } catch (error) {
                    loadedCount++;
                    setCustomLoadingProgress({ loaded: loadedCount, total: totalServers });
                    console.error(`Failed to fetch from ${server}:`, error);
                    return null;
                }
            };

            // Fetch first server and wait for it
            const firstResult = await fetchServer(initData.sourceList[0], 0);

            // If we got first server and should auto-switch, return it immediately
            if (firstResult && shouldAutoSwitch && !hasUserChangedServerRef.current) {
                firstServerReturned = true;

                // Continue loading other servers in background
                const remainingPromises = initData.sourceList.slice(1).map((server, index) => fetchServer(server, index + 1));

                Promise.allSettled(remainingPromises).then(() => {
                    setIsLoadingCustomPlayer(false);
                });

                return firstResult.server;
            }

            // If not auto-switching, fetch all servers in parallel (old behavior)
            const remainingPromises = initData.sourceList.slice(1).map((server, index) => fetchServer(server, index + 1));

            await Promise.allSettled(remainingPromises);
            setIsLoadingCustomPlayer(false);

            return firstResult ? firstResult.server : null;
        } catch (error) {
            console.error("Error fetching custom player links:", error);
            setCustomPlayerError(error.message || "Failed to load custom player");
            setIsLoadingCustomPlayer(false);
        }
        return null;
    };

    useEffect(() => {
        resetAllScrolls();
    }, [id, resetAllScrolls]);

    // Track previous values to prevent unnecessary reloads
    const prevValuesRef = useRef({ type: null, id: null, s: null, e: null });

    useEffect(() => {
        if (!router.isReady || !type || !id) return;

        // Check if only server param changed (don't reload for server-only changes)
        const currentValues = { type, id, s, e };
        const prevValues = prevValuesRef.current;

        const onlyServerChanged = prevValues.type === type && prevValues.id === id && prevValues.s === s && prevValues.e === e;

        // If only server changed, don't reload everything
        if (onlyServerChanged && prevValues.type !== null) {
            console.log("Only server changed, skipping reload");
            return;
        }

        // Update previous values
        prevValuesRef.current = currentValues;

        const loadInitialState = async () => {
            try {
                const data = await getMediaDetails(type, id);
                setMediaData(data);
                // console.log("Media data loaded:", data);

                let initialSeason = 1;
                let initialEpisode = 1;
                let initialServerName = "";

                if (type === "anime") {
                    const cachedServer = JSON.parse(localStorage.getItem("preferred_anime_server") || "null");
                    if (cachedServer && Date.now() - cachedServer.timestamp < 7 * 24 * 60 * 60 * 1000) {
                        initialServerName = cachedServer.serverName;
                    }
                } else {
                    const cachedServer = JSON.parse(localStorage.getItem("preferred_regular_server") || "null");
                    if (cachedServer && Date.now() - cachedServer.timestamp < 7 * 24 * 60 * 60 * 1000) {
                        initialServerName = cachedServer.serverName;
                    } else {
                        initialServerName = "custom";
                    }
                }

                if (type === "tv" || type === "anime") {
                    const cachedEpisode = JSON.parse(localStorage.getItem(`${type}_${id}_episode`) || "null");
                    if (cachedEpisode && Date.now() - cachedEpisode.timestamp < 30 * 24 * 60 * 60 * 1000) {
                        initialSeason = cachedEpisode.season;
                        initialEpisode = cachedEpisode.episode;
                    }

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
                    initialServerName = server;
                }

                // Store initial server name for auto-switch check
                initialServerNameRef.current = initialServerName;
                hasUserChangedServerRef.current = false;

                // Load external servers immediately for fast page load
                const links = await getStreamingLinks(id, type, initialSeason, initialEpisode);
                setStreamingServers(links);

                // Find preferred server in external servers only (custom servers will load later)
                let serverToUse = "";
                let isPreferredCustom = false;

                if (initialServerName) {
                    // Check if preferred server is "Custom" (generic custom player preference)
                    if (initialServerName === "custom") {
                        isPreferredCustom = true;
                        console.log("User prefers custom servers, will auto-switch when they load");
                    } else {
                        // Try to find specific external server
                        const preferredServer = links.find((s) => s.name === initialServerName);
                        if (preferredServer) {
                            serverToUse = initialServerName;
                            console.log("Found preferred external server:", serverToUse);
                        }
                    }
                }

                // If no preferred server found or is custom, use first external server temporarily
                if (!serverToUse) {
                    serverToUse = links[0]?.name || "";
                }

                setCurrentServerName(serverToUse);
                setCurrentSeason(initialSeason);
                setCurrentEpisode(initialEpisode);
                updateURL(initialSeason, initialEpisode, serverToUse);
                if (!isPreferredCustom) {
                    saveToCache(initialSeason, initialEpisode, serverToUse);
                }

                // Fetch custom player links - behavior depends on preference
                if (isPreferredCustom) {
                    // If custom is preferred, fetch first server and switch immediately
                    console.log("Custom server preferred - fetching first server and auto-switching");
                    fetchCustomPlayerLinks(id, type, initialSeason, initialEpisode, true)
                        .then((firstCustomServer) => {
                            if (firstCustomServer && !hasUserChangedServerRef.current) {
                                console.log("Auto-switching to first custom server:", firstCustomServer.name);
                                setCurrentServerName(firstCustomServer.name);
                                updateURL(initialSeason, initialEpisode, "custom");
                                saveToCache(initialSeason, initialEpisode, "custom");
                            }
                        })
                        .catch((error) => {
                            console.error("Error loading custom servers:", error);
                        });
                } else {
                    // If custom is NOT preferred, fetch all custom servers in background without switching
                    console.log("External server preferred - fetching custom servers in background");
                    fetchCustomPlayerLinks(id, type, initialSeason, initialEpisode, false).catch((error) => {
                        console.error("Error loading custom servers:", error);
                    });
                }
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
        }

        if (mediaData) {
            const watchHistory = JSON.parse(localStorage.getItem("watch_history") || "[]");
            const historyEntry = {
                id,
                type,
                title: mediaData.title || mediaData.name,
                poster_path: mediaData.poster_path,
                year: mediaData.release_date || mediaData.first_air_date,
                timestamp: Date.now(),
                ...(type === "tv" || type === "anime" ? { season, episode } : {}),
                genres: mediaData.genres?.map((g) => g.name || g).slice(0, 3) || [],
                rating: mediaData.vote_average || 0,
            };

            const existingIndex = watchHistory.findIndex((item) => item.id === id && item.type === type);
            if (existingIndex !== -1) {
                watchHistory[existingIndex] = historyEntry;
            } else {
                watchHistory.unshift(historyEntry);
            }

            const MAX_HISTORY = 100;
            if (watchHistory.length > MAX_HISTORY) {
                watchHistory.splice(MAX_HISTORY);
            }

            localStorage.setItem("watch_history", JSON.stringify(watchHistory));
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
        setIsPlayingTrailer(false);
        resetAllScrolls();

        // Reset manual change flag for new season
        hasUserChangedServerRef.current = false;

        // Check if current server is custom player before changing
        const wasCustomPlayer = streamingServers.find((s) => s.name === currentServerName)?.isCustomPlayer;

        try {
            const seasonDetails = await getSeasonDetails(id, season, type);
            const links = await getStreamingLinks(id, type, season, 1);

            setSeasonData(seasonDetails);
            setCurrentSeason(season);
            setCurrentEpisode(1);

            // Remove old Custom server before adding new links
            const filteredLinks = links.filter((s) => !s.isCustomPlayer);
            setStreamingServers(filteredLinks);

            // Try to keep the same server if it exists (excluding Custom), otherwise use first
            const sameServer = filteredLinks.find((s) => s.name === currentServerName);
            const serverToUse = sameServer ? currentServerName : filteredLinks[0]?.name || "";
            setCurrentServerName(serverToUse);

            // Save "Custom" if previous was custom player, otherwise save actual server name
            const serverNameToSave = wasCustomPlayer ? "custom" : serverToUse;
            updateURL(season, 1, serverNameToSave);
            saveToCache(season, 1, serverNameToSave);

            // Refetch custom player links for new season
            // If user was on custom player, auto-switch to first custom server when ready
            if (wasCustomPlayer) {
                fetchCustomPlayerLinks(id, type, season, 1, true).then((firstCustomServer) => {
                    if (firstCustomServer && !hasUserChangedServerRef.current) {
                        setCurrentServerName(firstCustomServer.name);
                        updateURL(season, 1, "custom");
                    }
                });
            } else {
                // Otherwise just load in background
                fetchCustomPlayerLinks(id, type, season, 1, false);
            }
        } catch (error) {
            console.error("Failed to change season:", error);
        } finally {
            setIsChangingMedia(false);
        }
    };

    const handleEpisodeChange = async (episode) => {
        if (episode === currentEpisode) return;
        setIsChangingMedia(true);
        setIsPlayingTrailer(false);
        resetAllScrolls();

        // Reset manual change flag for new episode
        hasUserChangedServerRef.current = false;

        // Check if current server is custom player before changing
        const wasCustomPlayer = streamingServers.find((s) => s.name === currentServerName)?.isCustomPlayer;

        try {
            const links = await getStreamingLinks(id, type, currentSeason, episode);
            setCurrentEpisode(episode);

            // Remove old Custom server before adding new links
            const filteredLinks = links.filter((s) => !s.isCustomPlayer);
            setStreamingServers(filteredLinks);

            // Try to keep the same server if it exists (excluding Custom), otherwise use first
            const sameServer = filteredLinks.find((s) => s.name === currentServerName);
            const serverToUse = sameServer ? currentServerName : filteredLinks[0]?.name || "";
            setCurrentServerName(serverToUse);

            // Save "Custom" if previous was custom player, otherwise save actual server name
            const serverNameToSave = wasCustomPlayer ? "custom" : serverToUse;
            updateURL(currentSeason, episode, serverNameToSave);
            saveToCache(currentSeason, episode, serverNameToSave);

            // Refetch custom player links for new episode
            // If user was on custom player, auto-switch to first custom server when ready
            if (wasCustomPlayer) {
                fetchCustomPlayerLinks(id, type, currentSeason, episode, true).then((firstCustomServer) => {
                    if (firstCustomServer && !hasUserChangedServerRef.current) {
                        setCurrentServerName(firstCustomServer.name);
                        updateURL(currentSeason, episode, "custom");
                    }
                });
            } else {
                // Otherwise just load in background
                fetchCustomPlayerLinks(id, type, currentSeason, episode, false);
            }
        } catch (error) {
            console.error("Failed to change episode:", error);
        } finally {
            setIsChangingMedia(false);
        }
    };

    const handleServerChange = (serverName) => {
        if (!isChangingMedia && serverName !== currentServerName) {
            // Mark that user has manually changed server (prevent auto-switch)
            hasUserChangedServerRef.current = true;

            resetAllScrolls();
            setCurrentServerName(serverName);
            setIsPlayingTrailer(false);

            // Save "Custom" if it's a custom player, otherwise save actual server name
            const selectedServer = streamingServers.find((s) => s.name === serverName);
            const serverNameToSave = selectedServer?.isCustomPlayer ? "custom" : serverName;

            // Update URL and cache with "Custom" for custom players
            updateURL(currentSeason, currentEpisode, serverNameToSave);
            saveToCache(currentSeason, currentEpisode, serverNameToSave);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-xl">Loading...</div>
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

    const formattedRecommendations =
        mediaData.recommendations?.results?.map((item) => ({
            link: `/watch/${item.media_type || type}/${item.id}`,
            image: item.poster_path,
            title: item.title || item.name || "Untitled",
            rating: item.vote_average,
        })) || [];

    const formattedCast = (mediaData.credits?.cast || []).map((c) => ({
        name: c.character,
        actor: c.name,
        image: c.profile_path,
    }));

    const seasonsList =
        type === "anime"
            ? (mediaData.seasons || []).map((s, index) => s.name || `Season ${index + 1}`)
            : (mediaData.seasons || []).map((s) => s.name);

    const productionName =
        type === "anime"
            ? mediaData.studios?.nodes?.[0]?.name || mediaData.production_companies?.[0]?.name || "N/A"
            : mediaData.production_companies?.[0]?.name || "N/A";

    return (
        <>
            <Head>
                <title>{`${mediaData.title || mediaData.name} | ChinFlix`}</title>
                <meta name="description" content={mediaData.overview?.substring(0, 160) || `Watch ${mediaData.title || mediaData.name}`} />
                <meta property="og:title" content={`${mediaData.title || mediaData.name} | ChinFlix`} />
                <meta
                    property="og:description"
                    content={mediaData.overview?.substring(0, 160) || `Watch ${mediaData.title || mediaData.name}`}
                />
                <meta property="og:type" content="video.movie" />
                <meta property="og:image" content={`https://image.tmdb.org/t/p/w500${mediaData.poster_path}`} />
                {mediaData.genres && (
                    <meta
                        name="keywords"
                        content={`${mediaData.title || mediaData.name}, ${type}, ${mediaData.genres
                            .map((g) => g.name || g)
                            .join(", ")}, watch online, streaming`}
                    />
                )}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": type === "movie" ? "Movie" : "TVSeries",
                        name: mediaData.title || mediaData.name,
                        description: mediaData.overview,
                        image: `https://image.tmdb.org/t/p/w500${mediaData.poster_path}`,
                        datePublished: mediaData.release_date || mediaData.first_air_date,
                        aggregateRating: {
                            "@type": "AggregateRating",
                            ratingValue: mediaData.vote_average,
                            ratingCount: mediaData.vote_count,
                        },
                        genre: mediaData.genres?.map((g) => g.name || g),
                    })}
                </script>
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
                                <VideoPlayer
                                    src={currentServer}
                                    isLoading={isChangingMedia}
                                    useCustomPlayer={currentServerData?.isCustomPlayer}
                                    playerData={currentServerData?.playerData}
                                />
                            </div>
                            <MediaActions
                                type={type}
                                id={id}
                                currentSeason={currentSeason}
                                currentEpisode={currentEpisode}
                                episodes={seasonData?.episodes}
                                onEpisodeChange={handleEpisodeChange}
                                posterUrl={mediaData.poster_path}
                                title={mediaData.title || mediaData.name}
                                mediaData={mediaData}
                            />
                            <StreamingServers
                                servers={streamingServers}
                                onServerChange={handleServerChange}
                                isLoading={isChangingMedia}
                                selectedServerName={currentServerName}
                                isLoadingCustom={isLoadingCustomPlayer}
                                customError={customPlayerError}
                                loadingProgress={customLoadingProgress}
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
                                    videos={mediaData.videos || []}
                                    setTrailer={(url) => {
                                        if (url) {
                                            setTrailerUrl(url);
                                            setIsPlayingTrailer(true);
                                        }
                                    }}
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
                                    <VideoPlayer
                                        src={currentServer}
                                        isLoading={isChangingMedia}
                                        useCustomPlayer={currentServerData?.isCustomPlayer}
                                        playerData={currentServerData?.playerData}
                                    />
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
                                    mediaData={mediaData}
                                />
                                <StreamingServers
                                    servers={streamingServers}
                                    onServerChange={handleServerChange}
                                    isLoading={isChangingMedia}
                                    selectedServerName={currentServerName}
                                    isLoadingCustom={isLoadingCustomPlayer}
                                    customError={customPlayerError}
                                    loadingProgress={customLoadingProgress}
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
                                        videos={mediaData.videos || []}
                                        setTrailer={(url) => {
                                            if (url) {
                                                setTrailerUrl(url);
                                                setIsPlayingTrailer(true);
                                            }
                                        }}
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
