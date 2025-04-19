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
                <meta name="description" content="Watch your favorite anime series and movies with high quality streaming" />
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
