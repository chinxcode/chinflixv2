import { Suspense } from "react";
import Head from "next/head";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import HistorySection from "@/components/HistorySection";

const HeroSlider = dynamic(() => import("@/components/HeroSlider"), {
    loading: () => <div className="aspect-video bg-gray-800 animate-pulse rounded-lg" />,
});

const CreateSection = dynamic(() => import("@/components/CreateSection"), {
    loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded" />,
});

export default function Home() {
    return (
        <>
            <Head>
                <title>ChinFlix - Discover and Watch Movies & TV Shows</title>
                <meta
                    name="description"
                    content="Discover and stream your favorite movies, TV shows, and anime series in high quality. ChinFlix offers a vast collection of entertainment content for free."
                />
                <meta property="og:title" content="ChinFlix - Discover and Watch Movies & TV Shows" />
                <meta
                    property="og:description"
                    content="Stream your favorite movies, TV shows, and anime series in high quality. Extensive collection of entertainment content available for free."
                />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://chinflix.vercel.app/icon.png" />
                <meta name="keywords" content="movies, tv shows, anime, streaming, watch online, free movies, series, entertainment" />
            </Head>
            <header className="lg:hidden bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-md py-4 px-4 fixed top-0 left-0 right-0 z-[60] flex justify-between items-center">
                <Link href="/" className="text-4xl font-bold hover:text-[#FF4D4D] smoothie">
                    ChinFlix
                </Link>
                <UserCircleIcon className="w-8 h-8 text-white cursor-pointer" />
            </header>
            <main className="size-full flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black gap-4 relative overflow-x-hidden overflow-y-auto py-16 lg:pt-0">
                <div className="flex flex-col w-full z-0 relative px-3 2xl:px-5 py-6">
                    <Suspense fallback={<div className="aspect-video bg-gray-800 animate-pulse rounded-lg" />}>
                        <HeroSlider />
                    </Suspense>
                    <div className="flex flex-col">
                        <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded" />}>
                            <HistorySection type={"all"} showEpisodeInfo={true} allTime={true} title={"Continue Watching"} />
                            <CreateSection type="movie" endpoint="trending" priority />
                            <CreateSection type="tv" endpoint="trending" />
                            <CreateSection type="anime" endpoint="trending" />
                        </Suspense>
                        <p className="text-left text-sm text-gray-400 p-4">
                            This site does not store any files on the server, we only linked to the media which is hosted on 3rd party
                            services.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
