import dynamic from "next/dynamic";
import Head from "next/head";
import { Suspense } from "react";

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
                <meta name="description" content="Stream your favorite TV shows on ChinFlix" />
            </Head>
            <main className="p-8">
                <Suspense fallback={<div className="h-12 bg-gray-800 animate-pulse rounded" />}>
                    <SearchContainer type="tv" showDropdown={false} />
                </Suspense>

                <div className="mt-12 space-y-12">
                    <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
                        <CreateSection type="tv" endpoint="popular" priority />
                        <CreateSection type="tv" endpoint="top_rated" />
                    </Suspense>
                </div>
            </main>
        </>
    );
}
