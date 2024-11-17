import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { getDirectDownloadLink } from "@/lib/anime-api";

const formatQuality = (source) => {
    const quality = source.match(/\((.*?)\)/)[1].split(" - ")[0];
    return quality.trim();
};

const DownloadModal = ({ isOpen, onClose, downloadLink }) => {
    const [processedLinks, setProcessedLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && downloadLink) {
            setIsLoading(true);
            getDirectDownloadLink(downloadLink)
                .then((data) => {
                    const formattedLinks = data.downloadLinks.map((item) => ({
                        quality: formatQuality(item.source),
                        url: item.link,
                    }));
                    setProcessedLinks(formattedLinks);
                })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, downloadLink]);

    useEffect(() => {
        setProcessedLinks([]);
    }, [downloadLink]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div
                className="relative max-w-xl w-full bg-gray-900 rounded-xl shadow-2xl transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold font-outfit">Select Download Quality</h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 min-h-[200px] relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {processedLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10">
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{link.quality}</span>
                                            <span className="text-sm text-gray-400">Direct Download</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm px-3 py-1 rounded-full bg-white/5 group-hover:bg-white/10">
                                            {link.quality.includes("1080") ? "FHD" : link.quality.includes("720") ? "HD" : "SD"}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400 text-center">Downloads are provided by external sources</p>
                </div>
            </div>
        </div>
    );
};
export default DownloadModal;
