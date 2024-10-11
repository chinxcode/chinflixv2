export interface StreamingSources {
    flag: string;
    movie: string;
    tv: string;
}

export const streamingSources: { [key: string]: StreamingSources } = {
    "Server 1": {
        flag: "https://flagcdn.com/w20/in.png",
        movie: "https://kamitor316opk.com/play/{imdbId}",
        tv: "https://kamitor316opk.com/play/{imdbId}?s={season}&e={episode}",
    },
    "Server 2": {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://vidlink.pro/movie/{id}?icons=vid",
        tv: "https://vidlink.pro/tv/{id}/{season}/{episode}?icons=vid&nextbutton=true",
    },
    "Server 3": {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://vidsrc.pro/embed/movie/{id}?player=new",
        tv: "https://vidsrc.pro/embed/tv/{id}/{season}/{episode}?player=new",
    },
    "Server 4": {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://vidsrc.xyz/embed/movie?tmdb={id}",
        tv: "https://vidsrc.xyz/embed/tv?tmdb={id}&season={season}&episode={episode}",
    },
    "Server 5": {
        flag: "https://flagcdn.com/w20/gb.png",
        movie: "https://vidsrc.rip/embed/movie/{id}",
        tv: "https://vidsrc.rip/embed/tv/{id}/{season}/{episode}",
    },
    "Server 6": {
        flag: "https://flagcdn.com/w20/gb.png",
        movie: "https://vidsrc.cc/v2/embed/movie/{id}",
        tv: "https://vidsrc.cc/v2/embed/tv/{id}/{season}/{episode}",
    },
    "Server 7": {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://www.2embed.cc/embed/{id}",
        tv: "https://www.2embed.cc/embedtv/{id}&s={season}&e={episode}",
    },
    "Server 8": {
        flag: "https://flagcdn.com/w20/gb.png",
        movie: "https://embed-testing-v8.vercel.app/tests/rollerdice/{id}",
        tv: "https://embed-testing-v8.vercel.app/tests/rollerdice/{id}-{season}-{episode}",
    },
    "Server 9": {
        flag: "https://flagcdn.com/w20/gb.png",
        movie: "https://www.primewire.tf/embed/movie?tmdb={id}",
        tv: "https://www.primewire.tf/embed/tv?tmdb={id}&season={season}&episode={episode}",
    },
    "Server 10": {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://multiembed.mov/?video_id={id}&tmdb=1",
        tv: "https://multiembed.mov/?video_id={id}&tmdb={season}&s=1&e={episode}",
    },
    "Server 11": {
        flag: "https://flagcdn.com/w20/in.png",
        movie: "https://player.autoembed.cc/embed/movie/{id}?server=2",
        tv: "https://player.autoembed.cc/embed/tv/{id}/{season}/{episode}?server=2",
    },
    "Server 12": {
        flag: "https://flagcdn.com/w20/in.png",
        movie: "https://vidsrc.vip/embed/movie/{id}&server=3",
        tv: "https://vidsrc.vip/embed/tv/{id}/{season}/{episode}&server=3",
    },
    "Server 13": {
        flag: "https://flagcdn.com/w20/in.png",
        movie: "https://player.smashy.stream/movie/{id}",
        tv: "https://player.smashy.stream/tv/{id}?s={season}&e={episode}",
    },
    "Server 14": {
        flag: "https://flagcdn.com/w20/us.png",
        movie: "https://www.vidbinge.com/media/tmdb-movie-{id}",
        tv: "https://www.vidbinge.com/media/tmdb-tv-{id}/{seasonId}/{episodeId}",
    },
};
