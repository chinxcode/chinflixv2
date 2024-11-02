import Head from "next/head";
import SearchContainer from "@/components/SearchContainer";
import CreateSection from "@/components/CreateSection";

export default function Movies() {
    return (
        <>
            <Head>
                <title>Movies | ChinFlix</title>
            </Head>
            <main className="p-8">
                <SearchContainer type="movie" showDropdown={false} />

                <div className="mt-12 space-y-12">
                    <CreateSection type="movie" endpoint="popular" />
                    <CreateSection type="movie" endpoint="top_rated" />
                </div>
            </main>
        </>
    );
}
