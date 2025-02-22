import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import {
    HomeIcon,
    MagnifyingGlassIcon,
    FilmIcon,
    TvIcon,
    HeartIcon,
    GlobeAltIcon,
    SparklesIcon,
    BookOpenIcon,
    DocumentTextIcon,
    GlobeAsiaAustraliaIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const router = useRouter();

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
    ];

    const footerLinks = [
        { icon: DocumentTextIcon, label: "Legal", path: "/legal", external: false },
        { icon: GlobeAltIcon, label: "Old ChinFlix", path: "https://chinflix-old.vercel.app", external: true },
        { icon: GlobeAltIcon, label: "AnimeFlix", path: "https://ani-dl.vercel.app", external: true },
    ];

    const isActive = (path) => {
        return router.pathname === path;
    };

    const NavSection = ({ items, isExternal }) =>
        items.map((item) => (
            <Link
                key={item.path}
                href={item.path}
                target={isExternal && isExternal(item) ? "_blank" : "_self"}
                rel={isExternal && isExternal(item) ? "noopener noreferrer" : ""}
                className={`sidebar-link flex items-center gap-3 p-2 rounded-lg w-full hover:bg-white/5 transition-colors ${
                    isActive(item.path) ? "bg-white/10 text-white" : "text-[#E0E0E0] hover:text-white"
                }`}
                title={isCollapsed ? item.label : ""}
            >
                <item.icon className="w-6 h-6 min-w-6" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
        ));

    return (
        <div>
            <aside
                className={`${
                    isCollapsed ? "w-20" : "w-56"
                } bg-black pt-7 pb-2 flex flex-col space-y-8 h-screen fixed left-0 top-0 z-5 transition-all duration-300`}
            >
                <div className="flex items-center justify-center">
                    <Link href="/" className="text-4xl font-bold hover:text-[#FF4D4D] smoothie">
                        {isCollapsed ? <Image src="/icon.png" alt="ChinFlix" width={32} height={32} /> : "ChinFlix"}
                    </Link>
                </div>

                <div className="flex flex-col gap-2 px-2">
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/[.07]">
                        <NavSection items={mainNavItems} />
                    </div>

                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/[.07] flex-grow overflow-hidden">
                        <div className="space-y-1">
                            <div className="px-2 py-1">
                                <span className="text-xs font-medium text-gray-400">MEDIA</span>
                            </div>
                            <NavSection items={mediaNavItems} />
                        </div>

                        <div className="space-y-1 ">
                            <div className="px-2 py-1">
                                <span className="text-xs font-medium text-gray-400">MORE</span>
                            </div>
                            <NavSection items={footerLinks} isExternal={(item) => item.external} />
                        </div>
                    </div>
                </div>
            </aside>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`fixed top-1/2 -translate-y-5 z-50 bg-gray-800 hover:bg-gray-700 transition-all duration-300 py-7 rounded-r-lg ${
                    isCollapsed ? "left-20" : "left-56"
                }`}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};

export default Sidebar;
