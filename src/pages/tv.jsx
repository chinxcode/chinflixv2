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

export default function TVShows() {
    return (
        <>
            <Head>
                <title>TV Shows | ChinFlix</title>
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 pb-16">
                <Suspense fallback={<div className="h-12 bg-gray-800 animate-pulse rounded" />}>
                    <SearchContainer type="tv" showDropdown={false} />
                </Suspense>

                <div className="mt-12 space-y-12">
                    <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
                        <CreateSection type="tv" endpoint="popular" priority />
                        <CreateSection type="tv" endpoint="top_rated" />
                        <HistorySection type="tv" showEpisodeInfo={true} allTime={true} title="Continue Watching" />
                    </Suspense>
                </div>
                <p className="text-left text-sm text-gray-400 p-4">
                    This site does not store any files on the server, we only linked to the media which is hosted on 3rd party services.
                </p>
            </main>
        </>
    );
}
