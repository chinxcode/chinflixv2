/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "flagcdn.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "image.tmdb.org",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "artworks.thetvdb.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "s4.anilist.co",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "gogocdn.net",
                pathname: "/**",
            },
        ],
        unoptimized: true,
    },
};

export default nextConfig;
