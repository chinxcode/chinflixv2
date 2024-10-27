import Link from "next/link";
import { useRouter } from "next/router";
import { HomeIcon, MagnifyingGlassIcon, EllipsisHorizontalIcon, GlobeAltIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { FilmIcon, TvIcon, HeartIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const BottomNav = ({ showMoreMenu, setShowMoreMenu }) => {
    const router = useRouter();

    const isActive = (path) => router.pathname === path;

    const moreMenuItems = [
        { icon: FilmIcon, label: "Movies", path: "/search?type=movie" },
        { icon: TvIcon, label: "TV Shows", path: "/search?type=tv" },
        { icon: HeartIcon, label: "Watchlist", path: "/watchlist" },
        { icon: GlobeAltIcon, label: "Old ChinFlix", path: "https://chinflix-old.vercel.app" },
        { icon: SparklesIcon, label: "AnimeFlix", path: "https://ani-dl.vercel.app" },
    ];

    return (
        <nav className="bg-gradient-to-t from-black/80 to-black/60 backdrop-blur-md text-white py-2">
            <div className="flex justify-around items-center">
                <NavItem href="/" icon={HomeIcon} label="Home" isActive={isActive("/")} onClick={() => {}} />
                <NavItem href="/search" icon={MagnifyingGlassIcon} label="Search" isActive={isActive("/search")} onClick={() => {}} />
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
                        className="absolute bottom-full left-0 right-0 bg-gradient-to-t from-black/80 to-black/60 backdrop-blur-md p-4 rounded-t-lg"
                    >
                        <div className="flex flex-wrap gap-y-4">
                            {moreMenuItems.map((item, index) => (
                                <div key={item.path} className="w-1/4">
                                    <NavItem
                                        href={item.path}
                                        icon={item.icon}
                                        label={item.label}
                                        isActive={isActive(item.path)}
                                        onClick={() => setShowMoreMenu(false)}
                                    />
                                </div>
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
