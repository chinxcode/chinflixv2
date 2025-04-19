import Head from "next/head";

export default function Drama() {
    return (
        <>
            <Head>
                <title>K-Drama | ChinFlix</title>
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 pb-16">
                <h1 className="text-4xl font-bold">K-Drama</h1>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <p className="text-gray-400 text-lg">
                        This page is currently under development. You'll be able to watch your favorite K-Drama here soon.
                    </p>
                </div>
            </main>
        </>
    );
}
