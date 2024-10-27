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
        ],
        unoptimized: true,
    },
};

export default nextConfig;
