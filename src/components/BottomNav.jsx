import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import {
    HomeIcon,
    MagnifyingGlassIcon,
    EllipsisHorizontalIcon,
    FilmIcon,
    TvIcon,
    HeartIcon,
    GlobeAltIcon,
    SparklesIcon,
    BookOpenIcon,
    GlobeAsiaAustraliaIcon,
    DocumentTextIcon,
    ClockIcon,
    ArrowDownOnSquareIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const BottomNav = ({ showMoreMenu, setShowMoreMenu }) => {
    const router = useRouter();
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const mainNavItems = [
        { icon: HomeIcon, label: "Home", path: "/" },
        { icon: MagnifyingGlassIcon, label: "Search", path: "/search" },
    ];

    const mediaNavItems = [
        { icon: FilmIcon, label: "Movies", path: "/movie" },
        { icon: TvIcon, label: "TV Shows", path: "/tv" },
        { icon: SparklesIcon, label: "Anime", path: "/anime" },
        { icon: BookOpenIcon, label: "Manga", path: "/manga" },
        { icon: GlobeAsiaAustraliaIcon, label: "K-Drama", path: "/drama" },
        { icon: HeartIcon, label: "Watchlist", path: "/watchlist" },
        { icon: ClockIcon, label: "History", path: "/history" },
    ];

    const footerLinks = [
        { icon: DocumentTextIcon, label: "Legal", path: "/legal" },
        { icon: ArrowDownOnSquareIcon, label: "Downloader", path: "https://chinfetcher.vercel.app", external: true },
        { icon: GlobeAltIcon, label: "Old ChinFlix", path: "https://chinflix-old.vercel.app", external: true },
    ];

    const isActive = (path) => router.pathname === path;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
                setShowMoreMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setShowMoreMenu]);

    return (
        <nav className="bg-gradient-to-t from-black/80 to-black/60 backdrop-blur-md text-white py-2">
            <div className="flex justify-around items-center">
                {mainNavItems.map((item) => (
                    <NavItem key={item.path} href={item.path} icon={item.icon} label={item.label} isActive={isActive(item.path)} />
                ))}
                <button
                    ref={buttonRef}
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className={`flex flex-col items-center ${showMoreMenu ? "text-[#FF4D4D]" : ""}`}
                >
                    <EllipsisHorizontalIcon className="w-6 h-6" />
                    <span className="text-xs">More</span>
                </button>
            </div>

            <AnimatePresence>
                {showMoreMenu && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full mb-2 left-2 right-2 bg-black/90 backdrop-blur-md rounded-2xl p-4 mx-auto max-w-md"
                    >
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-medium text-[#FF4D4D] mb-2">MEDIA</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {mediaNavItems.map((item) => (
                                        <NavItem
                                            key={item.path}
                                            href={item.path}
                                            icon={item.icon}
                                            label={item.label}
                                            isActive={isActive(item.path)}
                                            onClick={() => setShowMoreMenu(false)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-medium text-[#FF4D4D] mb-2">MORE</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {footerLinks.map((item) => (
                                        <NavItem
                                            key={item.path}
                                            href={item.path}
                                            icon={item.icon}
                                            label={item.label}
                                            external={item.external}
                                            onClick={() => setShowMoreMenu(false)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const NavItem = ({ href, icon: Icon, label, isActive, onClick, external }) => (
    <Link
        href={href}
        className={`flex flex-col items-center ${isActive ? "text-[#FF4D4D]" : ""}`}
        onClick={onClick}
        target={external ? "_blank" : "_self"}
        rel={external ? "noopener noreferrer" : ""}
    >
        <Icon className="w-6 h-6" />
        <span className="text-xs mt-1">{label}</span>
    </Link>
);

export default BottomNav;
