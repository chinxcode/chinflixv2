import Link from "next/link";
import { useRouter } from "next/router";
import { HomeIcon, MagnifyingGlassIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { FilmIcon, TvIcon, HeartIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
interface BottomNavProps {
    showMoreMenu: boolean;

    setShowMoreMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const BottomNav: React.FC<BottomNavProps> = ({ showMoreMenu, setShowMoreMenu }) => {
    const router = useRouter();

    const isActive = (path: string) => router.pathname === path;

    const moreMenuItems = [
        { icon: FilmIcon, label: "Movies", path: "/search?type=movie" },
        { icon: TvIcon, label: "TV Shows", path: "/search?type=tv" },
        { icon: HeartIcon, label: "Watchlist", path: "/watchlist" },
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

interface NavItemProps {
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem = ({ href, icon: Icon, label, isActive, onClick }: NavItemProps) => (
    <Link href={href} className={`flex flex-col items-center ${isActive ? "text-[#FF4D4D]" : ""}`} onClick={onClick}>
        <Icon className="w-6 h-6" />
        <span className="text-xs">{label}</span>
    </Link>
);

export default BottomNav;
