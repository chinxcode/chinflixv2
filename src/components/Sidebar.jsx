import Link from "next/link";
import { useRouter } from "next/router";
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
} from "@heroicons/react/24/outline";

const Sidebar = () => {
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
        { icon: DocumentTextIcon, label: "Legal", path: "/legal" },
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
                target={isExternal ? "_blank" : "_self"}
                rel={isExternal ? "noopener noreferrer" : ""}
                className={`sidebar-link flex items-center space-x-2 p-2 rounded-lg w-full ${
                    isActive(item.path) ? "bg-white/10 text-white" : "text-[#E0E0E0] hover:text-white"
                }`}
            >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
            </Link>
        ));

    return (
        <aside className="w-64 bg-black pt-7 pb-2 px-2 flex flex-col items-center space-y-8 h-screen fixed left-0 top-0 z-50">
            <Link href="/" className="text-4xl font-bold hover:text-[#FF4D4D] smoothie">
                ChinFlix
            </Link>
            <div className="flex flex-col gap-2 size-full items-center justify-center">
                <div className="w-full flex flex-col p-3 gap-2 rounded-lg xl:rounded-xl bg-white/[.07] shrink-0">
                    <NavSection items={mainNavItems} />
                </div>
                <div className="w-full flex flex-col items-center flex-grow p-3 gap-2 rounded-lg overflow-y-auto xl:rounded-xl bg-white/[.07] custom-scrollbar">
                    <div className="w-full">
                        <span className="text-xs text-gray-500 px-2">MEDIA</span>
                        <NavSection items={mediaNavItems} />
                    </div>

                    <div className="w-full">
                        <span className="text-xs text-gray-500 px-2">MORE</span>
                        <NavSection items={footerLinks} isExternal={(item) => item.external} />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
