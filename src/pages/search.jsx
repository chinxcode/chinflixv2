import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { Suspense } from "react";

const SearchContainer = dynamic(() => import("@/components/SearchContainer"), {
    loading: () => <div className="h-12 bg-gray-800 animate-pulse rounded" />,
});

export default function Search() {
    const router = useRouter();
    const { type = "movie" } = router.query;

    const getTitle = () => {
        const titles = {
            movie: "Movies",
            tv: "TV Shows",
            anime: "Anime",
        };
        return titles[type] || "Search";
    };

    return (
        <>
            <Head>
                <title>{`${getTitle()} Search | ChinFlix`}</title>
                <meta
                    name="description"
                    content={`Search and discover ${getTitle().toLowerCase()}. Find your favorite content in our extensive library of movies, TV shows, and anime.`}
                />
                <meta property="og:title" content={`${getTitle()} Search | ChinFlix`} />
                <meta
                    property="og:description"
                    content={`Search and discover ${getTitle().toLowerCase()}. Find your favorite content in our extensive library of movies, TV shows, and anime.`}
                />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://chinflix.vercel.app/icon.png" />
                <meta
                    name="keywords"
                    content={`search ${getTitle().toLowerCase()}, find content, discover ${getTitle().toLowerCase()}, streaming content, online entertainment`}
                />
                <meta name="robots" content="noindex, follow" />
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 pb-16">
                <Suspense fallback={<div className="h-screen bg-gray-800 animate-pulse rounded" />}>
                    <SearchContainer type={type} showDropdown={true} isSearchPage={true} />
                </Suspense>
            </main>
        </>
    );
}
