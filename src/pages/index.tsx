import Head from "next/head";
import HeroSlider from "@/components/HeroSlider";
import TrendingSection from "@/components/TrendingSection";

export default function Home() {
    return (
        <>
            <Head>
                <title>ChinFlix - Discover and Watch Movies & TV Shows</title>
                <meta name="description" content="Discover and watch your favorite movies and TV shows on ChinFlix" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main id="center-div" className="size-full flex flex-col gap-4 relative overflow-x-hidden overflow-y-auto">
                <div className="flex flex-col w-full z-0 relative px-3 2xl:px-5 py-6">
                    <HeroSlider />
                    <div className="flex flex-col">
                        <TrendingSection type="movie" />
                        <TrendingSection type="tv" />
                    </div>
                </div>
            </main>
        </>
    );
}
