import Head from "next/head";

export default function Watchlist() {
    return (
        <>
            <Head>
                <title>Watchlist | ChinFlix</title>
            </Head>
            <main className="p-8">
                <h1 className="text-4xl font-bold mb-8">Watchlist</h1>
                <p className="text-gray-300">Your watchlist is empty. Add movies and TV shows to watch later!</p>
            </main>
        </>
    );
}
