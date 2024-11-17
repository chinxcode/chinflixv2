import { memo } from "react";
import Image from "next/image";

const StreamingServers = memo(({ servers, onServerChange }) => {
    return (
        <>
            <p className="text-left text-sm text-gray-400 px-4">
                🚀 Please try different servers if one isn't working, and consider using ad blockers or the Brave browser 😊.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-2 px-4">
                {servers.map((server, index) => (
                    <button
                        key={index}
                        className="flex items-center justify-center px-2 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        onClick={() => onServerChange(server.url, index)}
                        aria-label={`Play on ${server.name} server`}
                    >
                        <div className="relative w-4 h-3 mr-2">
                            <Image src={server.flag} alt={`${server.name} flag`} layout="fill" objectFit="cover" />
                        </div>
                        <span>{server.name}</span>
                    </button>
                ))}
            </div>
        </>
    );
});

StreamingServers.displayName = "StreamingServers";
export default StreamingServers;
