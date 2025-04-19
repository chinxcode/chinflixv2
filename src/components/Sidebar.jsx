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
    ClockIcon,
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
        { icon: ClockIcon, label: "History", path: "/history" },
    ];

    const footerLinks = [
        { icon: DocumentTextIcon, label: "Legal", path: "/legal", external: false },
        { icon: GlobeAltIcon, label: "Old ChinFlix", path: "https://chinflix-old.vercel.app", external: true },
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
                className={`sidebar-link flex items-center space-x-2 p-2 rounded-lg w-full ${
                    isActive(item.path) ? "bg-white/10 text-white" : "text-[#E0E0E0] hover:text-white"
                }`}
                title={isCollapsed ? item.label : ""}
            >
                <item.icon className="w-6 h-6" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
        ));

    return (
        <div>
            <aside
                className={`${
                    isCollapsed ? "w-20" : "w-64"
                } bg-black pt-7 pb-2 px-2 flex flex-col items-center space-y-8 h-screen fixed left-0 top-0 z-50 transition-all duration-300`}
            >
                <div className="flex items-center justify-center">
                    <Link href="/" className="text-4xl font-bold hover:text-[#FF4D4D] smoothie">
                        {isCollapsed ? <Image src="/icon.png" alt="ChinFlix" width={32} height={32} /> : "ChinFlix"}
                    </Link>
                </div>

                <div className="flex flex-col gap-2 size-full items-center justify-center">
                    <div className="w-full flex flex-col p-3 gap-2 rounded-lg xl:rounded-xl bg-white/[.07] shrink-0">
                        <NavSection items={mainNavItems} />
                    </div>

                    <div className="w-full flex flex-col items-center flex-grow p-3 gap-2 rounded-lg overflow-y-auto xl:rounded-xl bg-white/[.07] custom-scrollbar">
                        <div className="w-full">
                            <span className="text-xs text-gray-500 px-1">MEDIA</span>
                            <NavSection items={mediaNavItems} />
                        </div>

                        <div className="w-full">
                            <span className="text-xs text-gray-500 px-1">MORE</span>
                            <NavSection items={footerLinks} isExternal={(item) => item.external} />
                        </div>
                    </div>
                </div>
            </aside>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`fixed top-1/2 -translate-y-5 z-50 bg-gray-800 hover:bg-gray-700 transition-all duration-300 py-7 rounded-r-lg ${
                    isCollapsed ? "left-20" : "left-64"
                }`}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};

export default Sidebar;
