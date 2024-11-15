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
                <meta name="description" content="Watch the latest and greatest movies on ChinFlix" />
            </Head>
            <main className="p-8">
                <Suspense fallback={<div className="h-12 bg-gray-800 animate-pulse rounded" />}>
                    <SearchContainer type="movie" showDropdown={false} />
                </Suspense>

                <div className="mt-12 space-y-12">
                    <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
                        <CreateSection type="movie" endpoint="popular" priority />
                        <CreateSection type="movie" endpoint="top_rated" />
                    </Suspense>
                </div>
            </main>
        </>
    );
}
