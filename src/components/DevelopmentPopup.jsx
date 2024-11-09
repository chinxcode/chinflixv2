import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const DevelopmentPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const lastShown = localStorage.getItem("devPopupLastShown");
        const shouldShow = !lastShown || Date.now() - parseInt(lastShown) > 1 * 10 * 60 * 1000;

        if (shouldShow) {
            setIsOpen(true);
            localStorage.setItem("devPopupLastShown", Date.now().toString());
        }
    }, []);

    const closePopup = () => setIsOpen(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] lg:ml-64">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closePopup}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="w-[90%] max-w-md"
                        >
                            <div className="bg-gray-900/95 border border-gray-800 rounded-xl p-6 shadow-xl">
                                <button onClick={closePopup} className="absolute right-4 top-4 text-gray-400 hover:text-white smoothie">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold mb-2">Under Development</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            The section is currently under development. You might experience slower loading times and UI
                                            inconsistencies. We're working to improve your experience!
                                        </p>
                                    </div>

                                    <button
                                        onClick={closePopup}
                                        className="mt-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-lg smoothie"
                                    >
                                        Got it
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DevelopmentPopup;
