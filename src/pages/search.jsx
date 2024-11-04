import Head from "next/head";
import SearchContainer from "@/components/SearchContainer";
import { useRouter } from "next/router";

export default function Search() {
    const router = useRouter();
    const { type = "movie" } = router.query;

    const getTitle = () => {
        switch (type) {
            case "movie":
                return "Movies";
            case "tv":
                return "TV Shows";
            case "anime":
                return "Anime";
            default:
                return "Search";
        }
    };

    return (
        <>
            <Head>
                <title>{`${getTitle()} Search | ChinFlix`}</title>
            </Head>
            <main className="p-8">
                <SearchContainer type={type} showDropdown={true} isSearchPage={true} />
            </main>
        </>
    );
}
