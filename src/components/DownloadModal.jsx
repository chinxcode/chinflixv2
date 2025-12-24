import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    XMarkIcon,
    ArrowDownTrayIcon,
    ServerIcon,
    ExclamationTriangleIcon,
    SparklesIcon,
    ClockIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Link from "next/link";
import { Switch } from "@headlessui/react";

const DownloadModal = ({ isOpen, onClose, mediaData, type, currentSeason, currentEpisode, title }) => {
    const modalRef = useRef(null);
    const [riveStreamLinks, setRiveStreamLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processedServers, setProcessedServers] = useState([]);
    const [totalServers, setTotalServers] = useState(0);
    const [error, setError] = useState(null);
    const [showHls, setShowHls] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchRiveStreamSources = async () => {
        if (!mediaData?.id) return;
        setIsLoading(true);
        setError(null);
        setRiveStreamLinks([]);
        setProcessedServers([]);
        setTotalServers(0);
        setHasFetched(true);

        try {
            // Step 1: Initialize - get source list and secret key (fast!)
            const initResponse = await axios.get("/api/download/init", {
                params: { id: mediaData.id.toString() },
            });

            if (!initResponse.data.success) {
                throw new Error(initResponse.data.error || "Failed to initialize download");
            }

            const { sourceList, secretKey, totalServers: total } = initResponse.data;
            setTotalServers(total);

            // Step 2: Fetch from each server in parallel (progressive results!)
            const baseParams = {
                id: mediaData.id.toString(),
                type: type,
                title: title,
                secretKey: secretKey,
            };

            // Add season and episode for TV shows and anime
            if (type === "tv" || type === "anime") {
                baseParams.season = currentSeason;
                baseParams.episode = currentEpisode;
            }

            // Create promises for all servers
            const serverPromises = sourceList.map(async (server) => {
                try {
                    const response = await axios.get("/api/download/server", {
                        params: { ...baseParams, server },
                        timeout: 12000,
                    });

                    // Update state immediately when this server responds
                    if (response.data.success && response.data.links.length > 0) {
                        setRiveStreamLinks((prev) => [...prev, ...response.data.links]);
                    }

                    setProcessedServers((prev) => [...prev, server]);

                    return response.data;
                } catch (error) {
                    console.error(`Failed to fetch from ${server}:`, error.message);
                    setProcessedServers((prev) => [...prev, server]);
                    return { success: false, server, links: [] };
                }
            });

            // Wait for all servers to complete
            await Promise.allSettled(serverPromises);
        } catch (error) {
            console.error("Error fetching download sources:", error);
            setError(error.response?.data?.error || error.message || "Failed to fetch download links");
        } finally {
            setIsLoading(false);
        }
    };

    const getExternalDownloadUrl = () => {
        return "https://chinfetcher.vercel.app/?q=" + encodeURIComponent(title);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setRiveStreamLinks([]);
            setError(null);
            setHasFetched(false);
            setIsLoading(false);
            setProcessedServers([]);
            setTotalServers(0);
        }
    }, [isOpen, mediaData?.id, currentSeason, currentEpisode]);

    const qualityOrder = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"];
    const sortedRiveStreamLinks = riveStreamLinks.sort((a, b) => {
        const aQuality = String(a.quality || "");
        const bQuality = String(b.quality || "");
        const aIndex = qualityOrder.findIndex((q) => aQuality.includes(q));
        const bIndex = qualityOrder.findIndex((q) => bQuality.includes(q));
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    // Group links by server
    const serverGroups = sortedRiveStreamLinks.reduce((acc, link) => {
        if (!acc[link.server]) {
            acc[link.server] = [];
        }
        acc[link.server].push(link);
        return acc;
    }, {});

    // Filter links based on showHls setting
    const filteredServerGroups = Object.entries(serverGroups).reduce((acc, [server, links]) => {
        const filteredLinks = showHls ? links : links.filter((link) => link.type !== "m3u8");
        if (filteredLinks.length > 0) {
            acc[server] = filteredLinks;
        }
        return acc;
    }, {});

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full bg-black/75 ring-[0.025em] max-w-[98vw] mx-auto ring-white/30 backdrop-blur relative rounded-3xl overflow-hidden sm:max-w-2xl">
                                {/* Header */}
                                <div className="relative p-6 border-b border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                                            <ArrowDownTrayIcon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-xl font-semibold text-white">Download {title}</Dialog.Title>
                                            {type === "tv" && (
                                                <p className="text-sm text-white/50">
                                                    Season {currentSeason}, Episode {currentEpisode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="absolute top-2 right-3">
                                        <XMarkIcon className="h-6 w-6 text-gray-300" />
                                    </button>
                                </div>

                                {/* Content area */}
                                <div className="flex-1 overflow-y-auto max-h-[calc(85vh-8rem)]">
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <SparklesIcon className="w-5 h-5 text-white/70" />
                                                <h3 className="text-lg font-medium text-white">Recommended</h3>
                                            </div>
                                            {/* ChinFetcher Card */}
                                            <Link
                                                href={getExternalDownloadUrl()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
                                            >
                                                <div className="flex flex-col justify-between sm:flex-row items-start sm:items-center gap-4">
                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                                                            <SparklesIcon className="w-6 h-6 text-blue-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-medium text-white">Search on ChinFetcher</h3>
                                                            <p className="text-xs text-white/50">Find more download options</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-lg text-white/90 text-sm transition-all duration-200 flex items-center justify-center gap-2">
                                                        <span>Search</span>
                                                        <MagnifyingGlassIcon className="w-4 h-4 opacity-50" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>

                                        {/* RiveStream Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ServerIcon className="w-5 h-5 text-white/70" />
                                                    <h3 className="text-lg font-medium text-white">Direct Downloads</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={showHls}
                                                        onChange={setShowHls}
                                                        className={`${
                                                            showHls ? "bg-blue-500" : "bg-white/10"
                                                        } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
                                                    >
                                                        <span className="sr-only">Show HLS streams</span>
                                                        <span
                                                            className={`${
                                                                showHls ? "translate-x-5" : "translate-x-1"
                                                            } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                                        />
                                                    </Switch>
                                                    <span className="text-xs text-white/50">Show HLS</span>
                                                </div>
                                            </div>

                                            {!hasFetched && !isLoading && (
                                                <button
                                                    onClick={fetchRiveStreamSources}
                                                    className="w-full p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
                                                >
                                                    <div className="flex flex-col justify-between sm:flex-row items-start sm:items-center gap-4">
                                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                                            <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg">
                                                                <ServerIcon className="w-6 h-6 text-green-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-medium text-white">Fetch from RiveStream</h3>
                                                                <p className="text-xs text-white/50">Get direct download links</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-lg text-white/90 text-sm transition-all duration-200 flex items-center justify-center gap-2">
                                                            <span>Fetch Links</span>
                                                            <ArrowDownTrayIcon className="w-4 h-4 opacity-50" />
                                                        </div>
                                                    </div>
                                                </button>
                                            )}

                                            {error && (
                                                <div className="flex items-center gap-3 p-4 bg-white/10 border border-white/10 rounded-lg">
                                                    <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                                                    <div>
                                                        <h4 className="font-medium text-white">Error</h4>
                                                        <p className="text-sm text-white/50">{error}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {Object.entries(filteredServerGroups).length > 0 && (
                                                <div className="space-y-2">
                                                    {Object.entries(filteredServerGroups).map(([server, links]) => (
                                                        <div
                                                            key={server}
                                                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-200"
                                                        >
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-white/90 font-medium">{server}</span>
                                                                <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/50">
                                                                    {links.length} qualities
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {links.map((link) => (
                                                                    <Link
                                                                        key={link.id}
                                                                        href={link.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        download={`${title}-${link.quality}.${link.type}`}
                                                                        className="px-4 py-1.5 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 
                                                                                     rounded-lg text-white/90 text-sm transition-all duration-200 flex items-center gap-2"
                                                                    >
                                                                        <span>{link.quality}</span>
                                                                        <ArrowDownTrayIcon className="w-3.5 h-3.5 opacity-50" />
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {isLoading && (
                                                        <div className="text-center py-2">
                                                            <span className="text-sm text-white/50 flex items-center gap-2 justify-center">
                                                                <ClockIcon className="w-4 h-4 animate-spin" />
                                                                Checking servers... ({processedServers.length}/{totalServers})
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!error && Object.entries(serverGroups).length === 0 && hasFetched && !isLoading && (
                                                <div className="text-center py-8 px-4 bg-white/5 rounded-xl border border-white/10">
                                                    <ServerIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                                    <p className="text-white/50 mb-3">No download links available</p>
                                                    <p className="text-xs text-white/40">Checked {processedServers.length} servers</p>
                                                </div>
                                            )}

                                            {isLoading && Object.entries(serverGroups).length === 0 && (
                                                <div className="text-center py-8 px-4 bg-white/5 rounded-xl border border-white/10">
                                                    <ClockIcon className="w-12 h-12 text-white/30 mx-auto mb-3 animate-spin" />
                                                    <p className="text-white/50 mb-2">Finding download links...</p>
                                                    <p className="text-xs text-white/40">
                                                        Checking servers: {processedServers.length}/{totalServers}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-white/10 bg-black/20">
                                    <p className="text-xs text-white/40 text-center">
                                        External download services are not affiliated with ChinFlix
                                    </p>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default DownloadModal;
