import Head from "next/head";
import SearchContainer from "@/components/SearchContainer";
import { useRouter } from "next/router";

export default function Search() {
    const router = useRouter();
    const { type = "movie" } = router.query;

    return (
        <>
            <Head>
                <title>Search | ChinFlix</title>
            </Head>
            <main className="p-8">
                <SearchContainer type={type} showDropdown={true} isSearchPage={true} />
            </main>
        </>
    );
}
