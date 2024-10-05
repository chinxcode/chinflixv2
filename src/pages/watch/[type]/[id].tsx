import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { getMovieDetails, getTVShowDetails } from "@/lib/api";
import { StarIcon, ClockIcon, CalendarIcon } from "@heroicons/react/24/solid";

export default function Watch() {
    const router = useRouter();
    const { type, id } = router.query;
    const [details, setDetails] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (type && id) {
                const data = type === "movie" ? await getMovieDetails(id as string) : await getTVShowDetails(id as string);
                setDetails(data);
            }
        };
        fetchDetails();
    }, [type, id]);

    if (!details) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <>
            <Head>
                <title>{details.title || details.name} | ChinFlix</title>
                <meta name="description" content={details.overview} />
            </Head>
            <main>
                <div className="relative h-[70vh]">
                    <Image
                        src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
                        alt={details.title || details.name}
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
                </div>
                <div className="p-8 -mt-32 relative z-10">
                    <h1 className="text-5xl font-bold mb-4">{details.title || details.name}</h1>
                    <div className="flex items-center space-x-4 mb-6 text-gray-300">
                        <span className="flex items-center">
                            <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                            {details.vote_average.toFixed(1)}
                        </span>
                        <span className="flex items-center">
                            <ClockIcon className="h-5 w-5 mr-1" />
                            {details.runtime || details.episode_run_time[0]} min
                        </span>
                        <span className="flex items-center">
                            <CalendarIcon className="h-5 w-5 mr-1" />
                            {new Date(details.release_date || details.first_air_date).getFullYear()}
                        </span>
                    </div>
                    <p className="text-gray-300 mb-8 max-w-3xl">{details.overview}</p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition duration-300">
                        Watch Now
                    </button>
                </div>
            </main>
        </>
    );
}
