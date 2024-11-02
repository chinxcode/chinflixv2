import Head from "next/head";

export default function Watchlist() {
    return (
        <>
            <Head>
                <title>Watchlist | ChinFlix</title>
            </Head>
            <main className="p-8">
                <h1 className="text-4xl font-bold">Watchlist</h1>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <p className="text-gray-400 text-lg">
                        This feature is currently under development. You'll be able to save your favorite movies and TV shows here soon.
                    </p>
                </div>
            </main>
        </>
    );
}
