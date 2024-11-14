import Head from "next/head";
import DevelopmentPopup from "@/components/DevelopmentPopup";
import SearchContainer from "@/components/SearchContainer";
import CreateSection from "@/components/CreateSection";

export default function Anime() {
    return (
        <>
            <Head>
                <title>Anime | ChinFlix</title>
            </Head>
            <main className="p-8">
                <DevelopmentPopup />
                <SearchContainer type="anime" showDropdown={false} />

                <div className="mt-12 space-y-12">
                    <CreateSection type="anime" endpoint="popular" />
                    <CreateSection type="anime" endpoint="trending" />
                    <p className="text-left py-4 text-sm text-gray-400 px-4">
                        This site does not store any files on the server, we only linked to the media which is hosted on 3rd party services.
                    </p>
                </div>
            </main>
        </>
    );
}
