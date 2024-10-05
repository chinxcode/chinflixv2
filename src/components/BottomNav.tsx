import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { HomeIcon, MagnifyingGlassIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { FilmIcon, TvIcon, HeartIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const BottomNav = () => {
    const router = useRouter();
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const isActive = (path: string) => router.pathname === path;

    const moreMenuItems = [
        { icon: FilmIcon, label: "Movies", path: "/search?type=movie" },
        { icon: TvIcon, label: "TV Shows", path: "/search?type=tv" },
        { icon: HeartIcon, label: "Watchlist", path: "/watchlist" },
    ];

    return (
        <nav className="bg-black text-white py-2">
            <div className="flex justify-around items-center">
                <NavItem href="/" icon={HomeIcon} label="Home" isActive={isActive("/")} />
                <NavItem href="/search" icon={MagnifyingGlassIcon} label="Search" isActive={isActive("/search")} />
                <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="flex flex-col items-center">
                    <EllipsisHorizontalIcon className="w-6 h-6" />
                    <span className="text-xs">More</span>
                </button>
            </div>
            <AnimatePresence>
                {showMoreMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 right-0 bg-black p-4 rounded-t-lg"
                    >
                        <div className="flex justify-around">
                            {moreMenuItems.map((item) => (
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
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const NavItem = ({ href, icon: Icon, label, isActive, onClick }) => (
    <Link href={href} className={`flex flex-col items-center ${isActive ? "text-[#FF4D4D]" : ""}`} onClick={onClick}>
        <Icon className="w-6 h-6" />
        <span className="text-xs">{label}</span>
    </Link>
);

export default BottomNav;
