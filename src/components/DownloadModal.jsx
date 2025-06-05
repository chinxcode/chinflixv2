import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    XMarkIcon,
    ArrowDownTrayIcon,
    ServerIcon,
    CheckCircleIcon,
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
    const [currentServerIndex, setCurrentServerIndex] = useState(0);
    const [processedServers, setProcessedServers] = useState([]);
    const [error, setError] = useState(null);
    const [showHls, setShowHls] = useState(false);

    // RiveStream API configuration
    const RiveStreamAPI = "https://rivestream.org";
    const headers = {};

    // Retry helper
    const retry = async (fn, attempts = 3) => {
        let error;
        for (let i = 0; i < attempts; i++) {
            try {
                return await fn();
            } catch (err) {
                error = err;
            }
        }
        throw error;
    };

    const formatHlsUrl = (url) => {
        const params = new URLSearchParams({
            url: url,
            id: mediaData?.id || "",
            season: currentSeason || "",
            episode: currentEpisode || "",
            title: title || "",
            downloadTitle: `${title}${currentSeason ? `-${currentSeason}-${currentEpisode}` : ""}`,
        });
        return `https://hlsforge.com/?${params.toString()}`;
    };

    // Helper function to proxy URLs
    const proxyUrl = (url) => `/api/proxy?url=${encodeURIComponent(url)}`;

    const fetchRiveStreamSources = async () => {
        if (!mediaData?.id) return;
        setIsLoading(true);
        setError(null);
        setRiveStreamLinks([]);

        try {
            const id = mediaData.id.toString();
            const season = type === "tv" || type === "anime" ? currentSeason : null;
            const episode = type === "tv" || type === "anime" ? currentEpisode : null;

            // Get source list using proxy
            const sourceApiUrl = proxyUrl(`${RiveStreamAPI}/api/backendfetch?requestID=VideoProviderServices&secretKey=rive`);
            const sourceList = await retry(async () => {
                const res = await axios.get(sourceApiUrl, { headers });
                return res.data;
            });

            if (!sourceList?.data) {
                throw new Error("No sources available");
            }

            const docHtml = await retry(async () => {
                const res = await axios.get(proxyUrl(RiveStreamAPI), { headers, timeout: 20000 });
                return res.data;
            });
            const parser = new DOMParser();
            const doc = parser.parseFromString(docHtml, "text/html");
            const scripts = doc.querySelectorAll("script");
            let appScriptSrc = null;

            scripts.forEach((script) => {
                const src = script.getAttribute("src");
                if (src && src.includes("_app")) {
                    appScriptSrc = src;
                }
            });

            if (!appScriptSrc) {
                throw new Error("Could not find app script");
            }

            const js = await retry(async () => {
                const res = await axios.get(proxyUrl(`${RiveStreamAPI}${appScriptSrc}`));
                return res.data;
            });

            const regex = /let\s+c\s*=\s*(\[[^\]]*])/;
            const match = js.match(regex);
            const arrayText = match?.[1];
            const keyList = arrayText ? Array.from(arrayText.matchAll(/"([^"]+)"/g), (m) => m[1]) : [];

            const secretKey = await retry(async () => {
                const res = await axios.get(proxyUrl(`https://rivestream.supe2372.workers.dev/?input=${id}&cList=${keyList.join(",")}`));
                return res.data;
            });

            const allLinks = [];

            // Process each server
            for (const [index, source] of sourceList.data.entries()) {
                try {
                    setCurrentServerIndex(index + 1);
                    setProcessedServers((prev) => [...prev, source]);

                    const sourceStreamLink = proxyUrl(
                        season == null
                            ? `${RiveStreamAPI}/api/backendfetch?requestID=movieVideoProvider&id=${id}&service=${source}&secretKey=${secretKey}`
                            : `${RiveStreamAPI}/api/backendfetch?requestID=tvVideoProvider&id=${id}&season=${season}&episode=${episode}&service=${source}&secretKey=${secretKey}`
                    );

                    const sourceJson = await retry(async () => {
                        const res = await axios.get(sourceStreamLink, { headers, timeout: 10000 });
                        return res.data;
                    });

                    if (sourceJson?.data?.sources) {
                        const newLinks = sourceJson.data.sources.map((src) => {
                            if (src.url.includes("m3u8-proxy?url")) {
                                const href = decodeURIComponent(src.url.split("m3u8-proxy?url=")[1].split("&headers=")[0]);
                                return {
                                    id: `${source}-${src.quality}-${Date.now()}`,
                                    name: `${src.source} ${src.quality}`,
                                    url: formatHlsUrl(href),
                                    type: "m3u8",
                                    server: source,
                                    quality: src.quality,
                                    referer: "https://megacloud.store/",
                                };
                            } else {
                                const type = src.url.toLowerCase().includes(".m3u8") ? "m3u8" : "mp4";
                                return {
                                    id: `${source}-${src.quality}-${Date.now()}`,
                                    name: `${src.source} ${src.quality}`,
                                    url: type === "m3u8" ? formatHlsUrl(src.url) : src.url,
                                    type,
                                    server: source,
                                    quality: src.quality,
                                    referer: "",
                                };
                            }
                        });

                        allLinks.push(...newLinks);
                        // Update links immediately when found for each server
                        setRiveStreamLinks((prev) => [...prev, ...newLinks]);
                    }
                } catch (e) {
                    console.error(`Failed to process source: ${source}`, e.message);
                }
            }

            if (allLinks.length === 0) {
                setError("No download links found from any server");
            }
        } catch (error) {
            console.error("Error fetching RiveStream sources:", error);
            setError(error.message);
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
            fetchRiveStreamSources();
        }
    }, [isOpen, mediaData?.id, currentSeason, currentEpisode]);

    const qualityOrder = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"];
    const sortedRiveStreamLinks = riveStreamLinks.sort((a, b) => {
        const aIndex = qualityOrder.findIndex((q) => a.quality?.includes(q));
        const bIndex = qualityOrder.findIndex((q) => b.quality?.includes(q));
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

                                            {error && (
                                                <div className="flex items-center gap-3 p-4 bg-white/10 border border-white/10 rounded-lg">
                                                    <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                                                    <div>
                                                        <h4 className="font-medium text-white">Error</h4>
                                                        <p className="text-sm text-white/50">{error}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Modified Server List */}
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
                                                                Checking more servers...
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!error && Object.entries(serverGroups).length === 0 && (
                                                <div className="text-center py-8 px-4 bg-white/5 rounded-xl border border-white/10">
                                                    <ServerIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                                    <p className="text-white/50 mb-3">
                                                        {isLoading ? "Finding download links..." : "No download links available"}
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
