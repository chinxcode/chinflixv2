import Head from "next/head";

export default function Manga() {
    return (
        <>
            <Head>
                <title>Manga | ChinFlix</title>
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 pb-16">
                <h1 className="text-4xl font-bold">Manga</h1>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <p className="text-gray-400 text-lg">
                        This page is currently under development. You'll be able to read your favorite manga here soon.
                    </p>
                </div>
            </main>
        </>
    );
}
