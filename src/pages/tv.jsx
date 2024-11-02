import Head from "next/head";
import SearchContainer from "@/components/SearchContainer";
import CreateSection from "@/components/CreateSection";

export default function TVShows() {
    return (
        <>
            <Head>
                <title>TV Shows | ChinFlix</title>
            </Head>
            <main className="p-8">
                <SearchContainer type="tv" showDropdown={false} />

                <div className="mt-12 space-y-12">
                    <CreateSection type="tv" endpoint="popular" />
                    <CreateSection type="tv" endpoint="top_rated" />
                </div>
            </main>
        </>
    );
}
