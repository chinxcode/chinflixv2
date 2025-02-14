import dynamic from "next/dynamic";
import { Suspense } from "react";
import Head from "next/head";

const SearchContainer = dynamic(() => import("@/components/SearchContainer"), {
    loading: () => <div className="h-12 bg-gray-800 animate-pulse rounded" />,
});

const CreateSection = dynamic(() => import("@/components/CreateSection"), {
    loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded" />,
});

const DevelopmentPopup = dynamic(() => import("@/components/DevelopmentPopup"));

export default function Anime() {
    return (
        <>
            <Head>
                <title>Anime | ChinFlix</title>
            </Head>
            {/* <main className="p-8 pb-16">
                <DevelopmentPopup />
                <Suspense fallback={<div className="h-12 bg-gray-800 animate-pulse rounded" />}>
                    <SearchContainer type="anime" showDropdown={false} />
                </Suspense>

                <div className="mt-12 space-y-12">
                    <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
                        <CreateSection type="anime" endpoint="popular" priority />
                    </Suspense>
                    <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
                        <CreateSection type="anime" endpoint="trending" />
                    </Suspense>
                </div>
                <p className="text-left text-sm text-gray-400 p-4">
                    This site does not store any files on the server, we only linked to the media which is hosted on 3rd party services.
                </p>
            </main> */}
            <main className="p-8">
                <h1 className="text-4xl font-bold">K-Drama</h1>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <p className="text-gray-400 text-lg">
                        This page is currently under development. You'll be able to watch your favorite Anime here soon.
                    </p>
                </div>
            </main>
        </>
    );
}
