import { memo } from "react";
import Image from "next/image";
import { SparklesIcon } from "@heroicons/react/20/solid";

const StreamingServers = memo(
    ({ servers, onServerChange, selectedServerName, isLoading, isLoadingCustom, customError, loadingProgress }) => {
        // Separate servers into custom and external
        const customServers = servers.filter((s) => s.isCustomPlayer);
        const externalServers = servers.filter((s) => !s.isCustomPlayer);

        return (
            <>
                <p className="text-left text-sm text-gray-400 px-4">
                    🚀 Please try different servers if one isn't working, and consider using ad blockers or the Brave browser 😊.
                </p>

                {/* Custom Player Section */}
                {(customServers.length > 0 || isLoadingCustom) && (
                    <div className="px-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-white/70">Main Player</h3>
                            {isLoadingCustom && loadingProgress && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/50">
                                        {loadingProgress.loaded}/{loadingProgress.total}
                                    </span>
                                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                                            style={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {customError && <div className="text-xs text-red-400 mb-2 p-2 bg-red-500/10 rounded">{customError}</div>}
                        {customServers.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-2">
                                {customServers.map((server, index) => (
                                    <button
                                        key={index}
                                        disabled={isLoading}
                                        className={`group relative flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 ${
                                            selectedServerName === server.name
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 ring-2 ring-white/30"
                                                : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30"
                                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => !isLoading && onServerChange(server.name)}
                                    >
                                        {server.recommended && (
                                            <div className="absolute top-1 left-1">
                                                <SparklesIcon className="w-3.5 h-3.5 text-yellow-400" />
                                            </div>
                                        )}
                                        <div className="relative w-4 h-3 mr-2">
                                            {typeof server.flag === "string" && server.flag.startsWith("http") ? (
                                                <Image src={server.flag} alt={`${server.name} flag`} layout="fill" objectFit="cover" />
                                            ) : (
                                                <span className="text-sm">{server.flag || "🌐"}</span>
                                            )}
                                        </div>
                                        <span className="font-medium">{server.name}</span>
                                        {server.quality && (
                                            <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded">{server.quality}</span>
                                        )}
                                        {server.working ? (
                                            <div className="w-2 h-2 ml-2 rounded-full bg-green-500" />
                                        ) : (
                                            <div className="w-2 h-2 ml-2 rounded-full bg-red-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* External Players Section */}
                {externalServers.length > 0 && (
                    <div className="px-4">
                        <h3 className="text-sm font-medium text-white/70 mb-2">External Players</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-2">
                            {externalServers.map((server, index) => (
                                <button
                                    key={index}
                                    disabled={isLoading}
                                    className={`group relative flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 ${
                                        selectedServerName === server.name
                                            ? "bg-white/30 ring-2 ring-white/20"
                                            : "bg-gray-700 hover:bg-gray-600"
                                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    </div>
                )}
            </>
        );
    }
);

StreamingServers.displayName = "StreamingServers";
export default StreamingServers;
