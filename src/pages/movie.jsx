import dynamic from "next/dynamic";
import Head from "next/head";
import { Suspense } from "react";

const SearchContainer = dynamic(() => import("@/components/SearchContainer"), {
    loading: () => <div className="h-12 bg-gray-800 animate-pulse rounded" />,
});

const CreateSection = dynamic(() => import("@/components/CreateSection"), {
    loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded" />,
});

export default function Movies() {
    return (
        <>
            <Head>
                <title>Movies | ChinFlix</title>
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 pb-16">
                <Suspense fallback={<div className="h-12 bg-gray-800 animate-pulse rounded" />}>
                    <SearchContainer type="movie" showDropdown={false} />
                </Suspense>

                <div className="mt-12 space-y-12">
                    <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
                        <CreateSection type="movie" endpoint="popular" priority />
                        <CreateSection type="movie" endpoint="top_rated" />
                    </Suspense>
                </div>
                <p className="text-left text-sm text-gray-400 p-4">
                    This site does not store any files on the server, we only linked to the media which is hosted on 3rd party services.
                </p>
            </main>
        </>
    );
}
