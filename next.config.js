/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["flagcdn.com", "image.tmdb.org"],
    },
};

module.exports = nextConfig;
