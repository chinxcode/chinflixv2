import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkIcon, EyeIcon, PauseIcon, XMarkIcon, CheckIcon, PlayIcon } from "@heroicons/react/24/outline";

const watchlistOptions = [
    { id: "planning", label: "Plan to Watch", icon: BookmarkIcon },
    { id: "watching", label: "Watching", icon: PlayIcon },
    { id: "onHold", label: "On Hold", icon: PauseIcon },
    { id: "completed", label: "Finished", icon: CheckIcon },
    { id: "dropped", label: "Dropped", icon: XMarkIcon },
];

const WatchlistModal = ({ isOpen, onClose, onSelect, currentStatus, buttonRef }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        if (!buttonRef?.current || !modalRef?.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const modalRect = modalRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let xPosition = buttonRect.left;
        let yPosition = buttonRect.bottom + 8;

        if (xPosition + modalRect.width > windowWidth) {
            xPosition = buttonRect.right - modalRect.width;
        }

        if (yPosition + modalRect.height > windowHeight) {
            yPosition = buttonRect.top - modalRect.height - 8;
        }

        modalRef.current.style.left = `${xPosition}px`;
        modalRef.current.style.top = `${yPosition}px`;
    }, [isOpen, buttonRef]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="fixed z-50 w-48 rounded-xl bg-gray-900 shadow-xl border border-white/10 overflow-hidden"
                >
                    <div className="p-1">
                        {watchlistOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => onSelect(currentStatus === option.id ? null : option.id)}
                                    className={`w-full p-2 rounded-lg flex items-center gap-2 text-sm ${
                                        currentStatus === option.id ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/80"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="flex-grow text-left">{option.label}</span>
                                    {currentStatus === option.id && (
                                        <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WatchlistModal;
