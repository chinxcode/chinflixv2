import { memo } from "react";
import Image from "next/image";
import { SparklesIcon } from "@heroicons/react/20/solid";

const StreamingServers = memo(({ servers, onServerChange, selectedServerName, isLoading }) => {
    return (
        <>
            <p className="text-left text-sm text-gray-400 px-4">
                🚀 Please try different servers if one isn't working, and consider using ad blockers or the Brave browser 😊.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-2 px-4">
                {servers.map((server, index) => (
                    <button
                        key={index}
                        className={`group relative flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 ${
                            selectedServerName === server.name ? "bg-white/30 ring-2 ring-white/20" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => !isLoading && onServerChange(server.name)}
                    >
                        {server.recommended && (
                            <div className="absolute top-1 left-1">
                                <SparklesIcon className="w-3.5 h-3.5 text-[#ff4d4d]" />
                            </div>
                        )}
                        <div className="relative w-4 h-3 mr-2">
                            {typeof server.flag === "string" && server.flag.startsWith("http") ? (
                                <Image src={server.flag} alt={`${server.name} flag`} layout="fill" objectFit="cover" />
                            ) : (
                                <span className="text-sm">{server.flag || "🌐"}</span>
                            )}
                        </div>
                        <span>{server.name}</span>
                        {server.working ? (
                            <div className="w-2 h-2 ml-2 rounded-full bg-green-500" />
                        ) : (
                            <div className="w-2 h-2 ml-2 rounded-full bg-red-500" />
                        )}
                    </button>
                ))}
            </div>
        </>
    );
});

StreamingServers.displayName = "StreamingServers";
export default StreamingServers;
