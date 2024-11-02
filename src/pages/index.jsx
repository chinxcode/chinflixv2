import Head from "next/head";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import HeroSlider from "@/components/HeroSlider";
import CreateSection from "@/components/CreateSection";

export default function Home() {
    return (
        <>
            <Head>
                <title>ChinFlix - Discover and Watch Movies & TV Shows</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header className="lg:hidden bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-md py-4 px-3 fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
                <Link href="/" className="text-4xl font-bold hover:text-[#FF4D4D] smoothie">
                    ChinFlix
                </Link>
                <UserCircleIcon className="w-8 h-8 text-white cursor-pointer" />
            </header>
            <main className="size-full flex flex-col gap-4 relative overflow-x-hidden overflow-y-auto pb-16 lg:pb-0 mt-16 lg:mt-0">
                <div className="flex flex-col w-full z-0 relative px-3 2xl:px-5 py-6">
                    <HeroSlider />
                    <div className="flex flex-col">
                        <CreateSection type="movie" endpoint="trending" />
                        <CreateSection type="tv" endpoint="trending" />
                    </div>
                </div>
            </main>
        </>
    );
}
