export const streamingSources = {
    vidxyz: {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://vidsrc.xyz/embed/movie?tmdb={id}",
        tv: "https://vidsrc.xyz/embed/tv?tmdb={id}&season={season}&episode={episode}",
        working: true,
    },
    vidpro: {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://vidlink.pro/movie/{id}?icons=vid",
        tv: "https://vidlink.pro/tv/{id}/{season}/{episode}?icons=vid&nextbutton=true",
        working: true,
    },
    embedsu: {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://embed.su/embed/movie/{id}",
        tv: "https://embed.su/embed/tv/{id}/{season}/{episode}",
        working: true,
    },
    vidrip: {
        flag: "https://flagcdn.com/w20/gb.png",
        movie: "https://vidsrc.rip/embed/movie/{id}",
        tv: "https://vidsrc.rip/embed/tv/{id}/{season}/{episode}",
        working: false,
    },
    onexbet: {
        flag: "https://flagcdn.com/w20/in.png",
        movie: "https://vd.1xplayer.com/play/{imdbId}",
        tv: "https://vd.1xplayer.com/play/{imdbId}?s={season}&e={episode}",
        working: true,
    },
    vidcc: {
        flag: "https://flagcdn.com/w20/gb.png",
        movie: "https://vidsrc.cc/v2/embed/movie/{id}",
        tv: "https://vidsrc.cc/v2/embed/tv/{id}/{season}/{episode}",
        working: true,
    },
    embedcc: {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://www.2embed.cc/embed/{id}",
        tv: "https://www.2embed.cc/embedtv/{id}&s={season}&e={episode}",
        working: true,
    },
    primewire: {
        flag: "https://flagcdn.com/w20/gb.png",
        movie: "https://www.primewire.tf/embed/movie?tmdb={id}",
        tv: "https://www.primewire.tf/embed/tv?tmdb={id}&season={season}&episode={episode}",
        working: true,
    },
    multimov: {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://multiembed.mov/?video_id={id}&tmdb=1",
        tv: "https://multiembed.mov/?video_id={id}&tmdb={season}&s=1&e={episode}",
        working: true,
    },
    autocc: {
        flag: "https://flagcdn.com/w20/in.png",
        movie: "https://player.autoembed.cc/embed/movie/{id}",
        tv: "https://player.autoembed.cc/embed/tv/{id}/{season}/{episode}",
        working: true,
    },
    vidvip: {
        flag: "https://flagcdn.com/w20/in.png",
        movie: "https://vidsrc.vip/embed/movie/{id}",
        tv: "https://vidsrc.vip/embed/tv/{id}/{season}/{episode}",
        working: true,
    },
    smashy: {
        flag: "https://flagcdn.com/w20/in.png",
        movie: "https://player.smashy.stream/movie/{id}",
        tv: "https://player.smashy.stream/tv/{id}?s={season}&e={episode}",
        working: true,
    },
    vidbinge: {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://www.vidbinge.com/media/tmdb-movie-{id}",
        tv: "https://www.vidbinge.com/media/tmdb-tv-{id}/{seasonId}/{episodeId}",
        working: false,
    },
};

/*

    "Server 8": {
        flag: "https://flagcdn.com/w20/gb.png",
        movie: "https://embed-testing-v8.vercel.app/tests/rollerdice/{id}",
        tv: "https://embed-testing-v8.vercel.app/tests/rollerdice/{id}-{season}-{episode}",
    },

*/
