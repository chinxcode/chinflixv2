import dynamic from "next/dynamic";
import Head from "next/head";
import { Suspense } from "react";
import HistorySection from "@/components/HistorySection";

const SearchContainer = dynamic(() => import("@/components/SearchContainer"), {
    loading: () => <div className="h-12 bg-gray-800 animate-pulse rounded" />,
});

const CreateSection = dynamic(() => import("@/components/CreateSection"), {
    loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded" />,
});

export default function Anime() {
    return (
        <>
            <Head>
                <title>Anime | ChinFlix</title>
                <meta
                    name="description"
                    content="Watch your favorite anime series and movies with high quality streaming. Access a vast collection of subbed and dubbed anime content."
                />
                <meta property="og:title" content="Anime | ChinFlix" />
                <meta
                    property="og:description"
                    content="Watch your favorite anime series and movies with high quality streaming. Access a vast collection of subbed and dubbed anime content."
                />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://chinflix.vercel.app/icon.png" />
                <meta
                    name="keywords"
                    content="anime, watch anime online, anime streaming, subbed anime, dubbed anime, anime series, anime movies"
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        name: "Anime on ChinFlix",
                        description: "Watch your favorite anime series and movies with high quality streaming",
                        url: "https://chinflix.vercel.app/anime",
                        provider: {
                            "@type": "Organization",
                            name: "ChinFlix",
                            logo: "https://chinflix.vercel.app/icon.png",
                        },
                    })}
                </script>
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 pb-16">
                <Suspense fallback={<div className="h-12 bg-gray-800 animate-pulse rounded" />}>
                    <SearchContainer type="anime" showDropdown={false} />
                </Suspense>

                <div className="mt-12 space-y-12">
                    <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
                        <CreateSection type="anime" endpoint="popular" title="Popular Anime" />
                        <CreateSection type="anime" endpoint="top-rated" title="Top Rated Anime" />
                        <HistorySection type="anime" showEpisodeInfo={true} allTime={true} title="Continue Watching" />
                    </Suspense>
                </div>
                <p className="text-left text-sm text-gray-400 p-4">
                    This site does not store any files on the server, we only linked to the media which is hosted on 3rd party services.
                </p>
            </main>
        </>
    );
}
