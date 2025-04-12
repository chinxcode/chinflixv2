import axios from "axios";

// AniList GraphQL API endpoint
const ANILIST_API_URL = "https://graphql.anilist.co";

// Common GraphQL queries for different endpoints
const QUERIES = {
    search: `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            medium
            large
          }
          bannerImage
          description
          episodes
          status
          genres
          averageScore
          popularity
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `,
    popular: `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            medium
            large
          }
          bannerImage
          description
          episodes
          status
          genres
          averageScore
          popularity
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `,
    trending: `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            medium
            large
          }
          bannerImage
          description
          episodes
          status
          genres
          averageScore
          popularity
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `,
    "top-rated": `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(type: ANIME, sort: SCORE_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            medium
            large
          }
          bannerImage
          description
          episodes
          status
          genres
          averageScore
          popularity
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `,
    info: `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        bannerImage
        description
        episodes
        duration
        status
        genres
        averageScore
        popularity
        isAdult
        source
        format
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        studios {
          nodes {
            id
            name
          }
        }
        characters {
          nodes {
            id
            name {
              full
            }
            image {
              large
              medium
            }
            role
          }
        }
        staff {
          nodes {
            id
            name {
              full
            }
            image {
              large
              medium
            }
            role
          }
        }
        relations {
          edges {
            relationType
            node {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                medium
                large
              }
              bannerImage
              description
              episodes
              status
              genres
              averageScore
              popularity
              format
            }
          }
        }
        recommendations {
          nodes {
            mediaRecommendation {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                medium
                large
              }
              bannerImage
              episodes
              status
              genres
              averageScore
              popularity
            }
          }
        }
      }
    }
  `,
    episodes: `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
        }
        episodes
        streamingEpisodes {
          title
          thumbnail
          url
          site
        }
      }
    }
  `,
    "external-ids": `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        externalLinks {
          url
          site
        }
      }
    }
  `,
};

// Helper to format responses in a consistent way
const formatAnilistResponse = (data, endpoint) => {
    if (["search", "popular", "trending", "top-rated"].includes(endpoint)) {
        return {
            results: data.Page.media,
            page: data.Page.pageInfo.currentPage,
            total_pages: data.Page.pageInfo.lastPage,
            total_results: data.Page.pageInfo.total,
        };
    }

    return data.Media;
};

// Helper to format episodes data
const formatEpisodesResponse = (data) => {
    // Create dummy episode data based on episode count since AniList doesn't provide detailed episode info
    const episodes = [];
    for (let i = 1; i <= (data.Media.episodes || 0); i++) {
        episodes.push({
            id: i,
            number: i,
            title: `Episode ${i}`,
            description: "",
            airDate: null,
            image: null,
            rating: null,
        });
    }

    // Add any streaming episodes if available
    if (data.Media.streamingEpisodes && data.Media.streamingEpisodes.length > 0) {
        data.Media.streamingEpisodes.forEach((ep, index) => {
            if (index < episodes.length) {
                episodes[index].title = ep.title || episodes[index].title;
                episodes[index].image = ep.thumbnail || episodes[index].image;
            }
        });
    }

    return {
        id: data.Media.id,
        title: data.Media.title.english || data.Media.title.romaji,
        episodes: episodes,
    };
};

// Helper to format external IDs
const formatExternalIds = (data) => {
    const result = {
        anilist_id: data.Media.id,
        mal_id: data.Media.idMal,
    };

    // Extract other external IDs from external links
    if (data.Media.externalLinks) {
        data.Media.externalLinks.forEach((link) => {
            if (link.site === "TVDB") {
                const tvdbId = link.url.match(/\/series\/(\d+)/);
                if (tvdbId && tvdbId[1]) {
                    result.tvdb_id = tvdbId[1];
                }
            } else if (link.site === "IMDb") {
                const imdbId = link.url.match(/\/title\/(tt\d+)/);
                if (imdbId && imdbId[1]) {
                    result.imdb_id = imdbId[1];
                }
            }
        });
    }

    return result;
};

export default async function handler(req, res) {
    const { path } = req.query;

    // Handle case when path is undefined or empty
    if (!path || path.length === 0) {
        return res.status(400).json({ error: "Invalid request path" });
    }

    const endpoint = path[0];

    if (!QUERIES[endpoint]) {
        return res.status(404).json({ error: "Endpoint not found" });
    }

    try {
        // Parse variables from query parameters
        const variables = {};

        // Add ID if available (from path or query)
        if (path.length > 1) {
            variables.id = parseInt(path[1]);

            // Validate that ID is a valid number
            if (isNaN(variables.id)) {
                return res.status(400).json({ error: "Invalid anime ID" });
            }
        } else if (req.query.id) {
            variables.id = parseInt(req.query.id);

            // Validate that ID is a valid number
            if (isNaN(variables.id)) {
                return res.status(400).json({ error: "Invalid anime ID" });
            }
        }

        // Add search query if available
        if (req.query.query) {
            variables.search = req.query.query;
        }

        // Add pagination variables
        variables.page = parseInt(req.query.page) || 1;
        variables.perPage = parseInt(req.query.perPage) || 20;

        // Basic request configuration
        const requestConfig = {
            url: ANILIST_API_URL,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            data: {
                query: QUERIES[endpoint],
                variables: variables,
            },
        };

        let response;

        try {
            // Make GraphQL request to AniList API
            response = await axios(requestConfig);
        } catch (requestError) {
            // If this is the info endpoint and we got an error, try with a simplified query
            if (endpoint === "info") {
                console.log("Trying fallback query for anime info");
                const fallbackQuery = `
                    query ($id: Int) {
                        Media(id: $id, type: ANIME) {
                            id
                            title {
                                romaji
                                english
                                native
                            }
                            coverImage {
                                large
                                medium
                            }
                            bannerImage
                            description
                            episodes
                            status
                            genres
                            averageScore
                            popularity
                        }
                    }
                `;

                requestConfig.data.query = fallbackQuery;
                response = await axios(requestConfig);
            } else {
                // Re-throw the error for other endpoints
                throw requestError;
            }
        }

        // Check for GraphQL errors in the response
        if (response.data.errors && response.data.errors.length > 0) {
            console.error("AniList GraphQL errors:", response.data.errors);
            return res.status(400).json({
                error: "AniList GraphQL errors",
                details: response.data.errors,
            });
        }

        // Handle specialized formatting for certain endpoints
        if (endpoint === "episodes") {
            return res.status(200).json(formatEpisodesResponse(response.data.data));
        } else if (endpoint === "external-ids") {
            return res.status(200).json(formatExternalIds(response.data.data));
        } else {
            // Standard formatting for other endpoints
            return res.status(200).json(formatAnilistResponse(response.data.data, endpoint));
        }
    } catch (error) {
        console.error("AniList API error:", error);

        // If we have specific error details, include them
        const errorMessage = error.response?.data?.message || "Failed to fetch anime data. Please try again later.";

        // Return a generic placeholder data for the info endpoint in case of error
        if (endpoint === "info" && path.length > 1) {
            const animeId = parseInt(path[1]);

            return res.status(200).json({
                id: animeId,
                title: {
                    english: "Anime Information Unavailable",
                    romaji: "Anime Information Unavailable",
                    native: "アニメ情報は利用できません",
                },
                name: "Anime Information Unavailable",
                overview: "We couldn't load the information for this anime. Please try again later.",
                status: "Unknown",
                poster_path: "/placeholder-poster.png",
                backdrop_path: null,
                vote_average: 0,
                popularity: 0,
                release_date: null,
                first_air_date: null,
                genres: [],
                production_companies: [],
                media_type: "anime",
                seasons: [
                    {
                        id: 1,
                        name: "Season 1",
                        season_number: 1,
                        episode_count: 0,
                    },
                ],
                number_of_seasons: 1,
                number_of_episodes: 0,
                relations: {
                    sequels: [],
                    prequels: [],
                    side_stories: [],
                    spin_offs: [],
                    adaptations: [],
                    related: [],
                },
                credits: {
                    cast: [],
                },
                recommendations: {
                    results: [],
                },
            });
        }

        // For other endpoints, return the error
        return res.status(500).json({
            error: errorMessage,
        });
    }
}
