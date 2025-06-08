import { streamingSources, animeStreamingSources } from "./streamingSources";

// Base URLs for our APIs
const TMDB_BASE_URL = "/api/tmdb";
const ANILIST_BASE_URL = "/api/anilist";

// Caching system to improve performance
const cache = new Map();
const CACHE_TIME = 1 * 24 * 60 * 60 * 1000; // 1 day cache

const fetchWithCache = async (key, fetchFn) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
        return cached.data;
    }
    const data = await fetchFn();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
};

const handleApiResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "API request failed");
    return data;
};

// Data source determination
const getDataSource = (type) => {
    return type === "anime" ? "anilist" : "tmdb";
};

// Unified search function that works with both sources
export const searchMedia = async (query, type, page = 1) => {
    const dataSource = getDataSource(type);

    return fetchWithCache(`search-${dataSource}-${type}-${query}-${page}`, async () => {
        let response, data;

        if (dataSource === "tmdb") {
            // TMDB search
            if (type === "multi") {
                response = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
            } else {
                response = await fetch(`${TMDB_BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&page=${page}`);
            }
            data = await handleApiResponse(response);

            return {
                results: data.results.map((item) => normalizeMediaItem(item, type !== "multi" ? type : item.media_type)),
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
            };
        } else {
            // AniList search
            response = await fetch(`${ANILIST_BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}`);
            data = await handleApiResponse(response);

            return {
                results: data.results.map((item) => normalizeAnimeItem(item)),
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
            };
        }
    });
};

// Get top rated items (works for both TMDB and AniList)
export const getTopRated = async (type, page = 1) => {
    const dataSource = getDataSource(type);

    return fetchWithCache(`toprated-${dataSource}-${type}-${page}`, async () => {
        let response, data;

        if (dataSource === "tmdb") {
            response = await fetch(`${TMDB_BASE_URL}/${type}/top_rated?page=${page}`);
            data = await handleApiResponse(response);

            return {
                results: data.results.map((item) => normalizeMediaItem(item, type)),
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
            };
        } else {
            response = await fetch(`${ANILIST_BASE_URL}/top-rated?page=${page}`);
            data = await handleApiResponse(response);

            return {
                results: data.results.map((item) => normalizeAnimeItem(item)),
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
            };
        }
    });
};

// Get popular items
export const getPopular = async (type, page = 1) => {
    const dataSource = getDataSource(type);

    return fetchWithCache(`popular-${dataSource}-${type}-${page}`, async () => {
        let response, data;

        if (dataSource === "tmdb") {
            response = await fetch(`${TMDB_BASE_URL}/${type}/popular?page=${page}`);
            data = await handleApiResponse(response);

            return {
                results: data.results.map((item) => normalizeMediaItem(item, type)),
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
            };
        } else {
            response = await fetch(`${ANILIST_BASE_URL}/popular?page=${page}`);
            data = await handleApiResponse(response);

            return {
                results: data.results.map((item) => normalizeAnimeItem(item)),
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
            };
        }
    });
};

// Get trending items
export const getTrending = async (type, page = 1) => {
    const dataSource = getDataSource(type);

    return fetchWithCache(`trending-${dataSource}-${type}-${page}`, async () => {
        let response, data;

        if (dataSource === "tmdb") {
            response = await fetch(`${TMDB_BASE_URL}/trending/${type}/week?page=${page}`);
            data = await handleApiResponse(response);

            return {
                results: data.results.map((item) => normalizeMediaItem(item, type)),
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
            };
        } else {
            response = await fetch(`${ANILIST_BASE_URL}/trending?page=${page}`);
            data = await handleApiResponse(response);

            return {
                results: data.results.map((item) => normalizeAnimeItem(item)),
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
            };
        }
    });
};

// Get media details with all needed information
export const getMediaDetails = async (type, id) => {
    const dataSource = getDataSource(type);

    return fetchWithCache(`details-${dataSource}-${type}-${id}`, async () => {
        let response, data;

        if (dataSource === "tmdb") {
            response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?append_to_response=credits,recommendations,external_ids,videos`);
            data = await handleApiResponse(response);

            return normalizeMediaDetails(data, type);
        } else {
            response = await fetch(`${ANILIST_BASE_URL}/info/${id}`);
            data = await handleApiResponse(response);

            return normalizeAnimeDetails(data);
        }
    });
};

// Get season details for TV shows or episode details for anime
export const getSeasonDetails = async (mediaId, seasonNumber, type = "tv") => {
    const dataSource = getDataSource(type);

    return fetchWithCache(`season-${dataSource}-${mediaId}-${seasonNumber}`, async () => {
        let response, data;

        if (dataSource === "tmdb") {
            response = await fetch(`${TMDB_BASE_URL}/tv/${mediaId}/season/${seasonNumber}`);
            data = await handleApiResponse(response);

            return {
                id: data.id,
                name: data.name,
                overview: data.overview,
                season_number: data.season_number,
                episodes: data.episodes.map((ep) => ({
                    id: ep.id,
                    name: ep.name,
                    overview: ep.overview,
                    episode_number: ep.episode_number,
                    air_date: ep.air_date,
                    still_path: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
                    vote_average: ep.vote_average,
                })),
            };
        } else {
            // For anime, we get episodes from the main anime info
            response = await fetch(`${ANILIST_BASE_URL}/episodes/${mediaId}`);
            data = await handleApiResponse(response);

            return {
                id: data.id,
                name: `Season ${seasonNumber || 1}`,
                overview: data.overview || "",
                season_number: seasonNumber || 1,
                episodes: data.episodes.map((ep) => ({
                    id: ep.id,
                    name: ep.title || `Episode ${ep.number}`,
                    overview: ep.description || "",
                    episode_number: ep.number,
                    air_date: ep.airDate,
                    still_path: ep.image || null,
                    vote_average: ep.rating || 0,
                })),
            };
        }
    });
};

// Get external IDs for any media type
export const getExternalIds = async (type, id) => {
    const dataSource = getDataSource(type);

    return fetchWithCache(`external-${dataSource}-${type}-${id}`, async () => {
        if (dataSource === "tmdb") {
            const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/external_ids`);
            return handleApiResponse(response);
        } else {
            const response = await fetch(`${ANILIST_BASE_URL}/external-ids/${id}`);
            const data = await handleApiResponse(response);

            return {
                imdb_id: data.imdbId || null,
                tvdb_id: data.tvdbId || null,
                mal_id: data.malId || null,
            };
        }
    });
};

// Get streaming links for any media type
export const getStreamingLinks = async (id, type, season, episode) => {
    let externalIds = {};

    try {
        externalIds = await getExternalIds(type, id);
    } catch (error) {
        console.error("Error fetching external IDs:", error);
    }

    const imdbId = externalIds.imdb_id;
    const malId = externalIds.mal_id;

    // Use different source objects based on media type
    if (type === "anime") {
        return Object.entries(animeStreamingSources)
            .filter(([_, source]) => source.working)
            .map(([name, source]) => {
                let url = source.anime
                    .replace("{id}", id)
                    .replace("{episode}", episode || 1)
                    .replace("{malId}", malId || id);

                return {
                    name,
                    url,
                    flag: source.flag,
                    working: source.working,
                    recommended: source.recommended,
                };
            });
    } else {
        return Object.entries(streamingSources)
            .filter(([_, source]) => source[type] !== undefined && source.working)
            .map(([name, source]) => {
                let url = source[type].replace("{id}", id).replace("{imdbId}", imdbId || id);

                if (type === "tv" && season && episode) {
                    url = url.replace("{season}", season.toString()).replace("{episode}", episode.toString());
                }

                return {
                    name,
                    url,
                    flag: source.flag,
                    working: source.working,
                    recommended: source.recommended,
                };
            });
    }
};

// Normalize TMDB media items for consistent structure
const normalizeMediaItem = (item, type) => {
    return {
        id: item.id,
        title: item.title || item.name,
        name: item.name || item.title,
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
        backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        vote_average: item.vote_average || 0,
        overview: item.overview,
        release_date: item.release_date || item.first_air_date,
        media_type: type,
    };
};

// Normalize AniList items for consistent structure
const normalizeAnimeItem = (item) => {
    return {
        id: item.id,
        title: item.title.english || item.title.romaji || item.title.native,
        name: item.title.english || item.title.romaji || item.title.native,
        poster_path: item.coverImage.large || item.coverImage.medium,
        backdrop_path: item.bannerImage,
        vote_average: item.averageScore / 10 || 0, // Convert from 100-scale to 10-scale
        overview: item.description ? stripHtmlTags(item.description) : "",
        release_date: item.startDate ? `${item.startDate.year}-${item.startDate.month}-${item.startDate.day}` : null,
        media_type: "anime",
        total_episodes: item.episodes || 0,
        status: item.status,
        genres: item.genres || [],
    };
};

// Normalize detailed TMDB data
const normalizeMediaDetails = (data, type) => {
    // Extract the basic properties
    const result = {
        id: data.id,
        title: data.title || data.name,
        name: data.name || data.title,
        overview: data.overview,
        status: data.status,
        poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
        vote_average: data.vote_average || 0,
        popularity: data.popularity || 0,
        release_date: data.release_date || null,
        first_air_date: data.first_air_date || null,
        genres: data.genres || [],
        production_companies: data.production_companies || [],
        media_type: type,

        // TV-specific properties
        seasons: type === "tv" ? data.seasons || [] : [],
        number_of_seasons: type === "tv" ? data.number_of_seasons || 0 : 0,
        number_of_episodes: type === "tv" ? data.number_of_episodes || 0 : 0,

        // Credits
        credits: {
            cast: (data.credits?.cast || []).map((cast) => ({
                id: cast.id,
                name: cast.name,
                character: cast.character,
                profile_path: cast.profile_path ? `https://image.tmdb.org/t/p/w185${cast.profile_path}` : null,
            })),
        },

        // Recommendations
        recommendations: {
            results: (data.recommendations?.results || []).map((item) => normalizeMediaItem(item, item.media_type || type)),
        },

        // External IDs
        external_ids: data.external_ids || {},

        videos: (data.videos.results || [])
            .map((video, index) =>
                video.type === "Trailer"
                    ? {
                          id: video.id,
                          type: video.type,
                          key: video.key,
                          name: video.name || `Trailer ${index + 1}`,
                      }
                    : null
            )
            .filter(Boolean),
    };

    return result;
};

// Normalize detailed AniList data
const normalizeAnimeDetails = (data) => {
    // Process relations (sequels, prequels, etc.)
    // const recommendations = {
    //     results: (data.recommendations || []).map((item) => normalizeAnimeItem(item.media)),
    // };

    // Process cast/characters
    const cast = (data.characters?.nodes || []).map((char) => ({
        id: char.id,
        name: char.name.full,
        character: char.name.full,
        role: char.role,
        profile_path: char.image.large || char.image.medium,
    }));

    // Process staff
    const staff = (data.staff?.nodes || []).map((person) => ({
        id: person.id,
        name: person.name.full,
        role: person.role,
        profile_path: person.image.large || person.image.medium,
    }));

    // Create seasons array to match TV show format
    const seasons = [
        {
            id: 1,
            name: "Season 1",
            season_number: 1,
            episode_count: data.episodes || 0,
        },
    ];

    // If there are multiple seasons, add them
    if (data.relations && data.relations.edges) {
        let seasonNum = 2;
        data.relations.edges
            .filter((edge) => ["SEQUEL", "PREQUEL"].includes(edge.relationType))
            .forEach((edge) => {
                seasons.push({
                    id: edge.node.id,
                    name: `Season ${seasonNum}`,
                    season_number: seasonNum,
                    episode_count: edge.node.episodes || 0,
                });
                seasonNum++;
            });
    }

    const normalizedData = {
        id: data.id,
        title: data.title.english || data.title.romaji,
        name: data.title.english || data.title.romaji,
        native_title: data.title.native,
        overview: stripHtmlTags(data.description || ""),
        status: mapAnimeStatus(data.status),
        poster_path: data.coverImage.large || data.coverImage.medium,
        backdrop_path: data.bannerImage,
        vote_average: data.averageScore / 10 || 0,
        popularity: data.popularity || 0,
        release_date: null,
        first_air_date: data.startDate ? `${data.startDate.year}-${data.startDate.month || 1}-${data.startDate.day || 1}` : null,
        genres: data.genres || [],
        production_companies:
            data.studios?.nodes?.map((studio) => ({
                id: studio.id,
                name: studio.name,
            })) || [],
        media_type: "anime",

        // Anime-specific properties
        format: data.format,
        episodes: data.episodes,
        duration: data.duration,
        is_adult: data.isAdult,
        source: data.source,
        seasons: seasons,
        number_of_seasons: seasons.length,
        number_of_episodes: data.episodes || 0,

        // Relations
        relations: {
            sequels: extractRelations(data.relations, "SEQUEL"),
            prequels: extractRelations(data.relations, "PREQUEL"),
            side_stories: extractRelations(data.relations, "SIDE_STORY"),
            spin_offs: extractRelations(data.relations, "SPIN_OFF"),
            adaptations: extractRelations(data.relations, "ADAPTATION"),
            related: extractRelations(data.relations, "RELATED"),
        },

        // Credits
        credits: {
            cast: cast,
        },

        // Staff
        staff: staff,

        // Recommendations
        // recommendations: recommendations,

        // External IDs (if available)
        external_ids: {
            mal_id: data.idMal,
            anilist_id: data.id,
        },
    };

    console.log("Normalized Anime Details:", normalizedData);

    return normalizedData;
};

// Helper to extract specific relation types from AniList data
const extractRelations = (relations, relationType) => {
    if (!relations || !relations.edges) return [];

    return relations.edges.filter((edge) => edge.relationType === relationType).map((edge) => normalizeAnimeItem(edge.node));
};

// Map AniList status to a format consistent with TMDB
const mapAnimeStatus = (status) => {
    const statusMap = {
        FINISHED: "Released",
        RELEASING: "Ongoing",
        NOT_YET_RELEASED: "Upcoming",
        CANCELLED: "Canceled",
        HIATUS: "On Hiatus",
    };

    return statusMap[status] || status;
};

// Helper to strip HTML tags from text
const stripHtmlTags = (html) => {
    if (!html) return "";
    return html.replace(/<\/?[^>]+(>|$)/g, "");
};

// Unified search function - convenience method that calls searchMedia
export const searchMulti = async (query, page = 1) => {
    return searchMedia(query, "multi", page);
};
