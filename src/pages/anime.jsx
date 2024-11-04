import Head from "next/head";
import SearchContainer from "@/components/SearchContainer";
import CreateSection from "@/components/CreateSection";

export default function Anime() {
    return (
        <>
            <Head>
                <title>Anime | ChinFlix</title>
            </Head>
            <main className="p-8">
                <SearchContainer type="anime" showDropdown={false} />

                <div className="mt-12 space-y-12">
                    <CreateSection type="anime" endpoint="popular" />
                    <CreateSection type="anime" endpoint="trending" />
                </div>
            </main>
        </>
    );
}
