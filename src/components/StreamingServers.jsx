import React from "react";
import Image from "next/image";

const StreamingServers = ({ servers, onServerChange }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-2 p-4">
            {servers.map((server, index) => (
                <button
                    key={index}
                    className="flex items-center justify-center px-2 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={() => onServerChange(server.url)}
                >
                    <div className="relative w-4 h-4 mr-2">
                        <Image src={server.flag} alt={`${server.name} flag`} layout="fill" objectFit="cover" />
                    </div>
                    <span>{server.name}</span>
                </button>
            ))}
        </div>
    );
};

export default StreamingServers;
