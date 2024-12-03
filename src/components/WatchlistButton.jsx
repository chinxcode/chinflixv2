import { useState, useCallback, useRef } from "react";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import WatchlistModal from "./WatchlistModal";

const WatchlistButton = ({ mediaId, mediaType, title, image, className, iconClassName = "h-5 w-5 " }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const buttonRef = useRef(null);
    const [status, setStatus] = useState(() => {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "{}");
        return watchlist[mediaId]?.status || null;
    });

    const handleStatusChange = useCallback(
        (newStatus) => {
            const watchlist = JSON.parse(localStorage.getItem("watchlist") || "{}");

            if (newStatus) {
                watchlist[mediaId] = {
                    id: mediaId,
                    type: mediaType,
                    title,
                    image,
                    status: newStatus,
                    addedAt: Date.now(),
                };
            } else {
                delete watchlist[mediaId];
            }

            localStorage.setItem("watchlist", JSON.stringify(watchlist));
            setStatus(newStatus);
            setIsModalOpen(false);
        },
        [mediaId, mediaType, title, image]
    );

    return (
        <>
            <button ref={buttonRef} onClick={() => setIsModalOpen(true)} className={className}>
                {status ? <CheckIcon className={iconClassName} /> : <PlusIcon className={iconClassName} />}
            </button>

            <WatchlistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleStatusChange}
                currentStatus={status}
                buttonRef={buttonRef}
            />
        </>
    );
};

export default WatchlistButton;
