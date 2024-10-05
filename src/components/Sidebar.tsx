import Link from "next/link";
import { useRouter } from "next/router";
import { HomeIcon, MagnifyingGlassIcon, FilmIcon, TvIcon, HeartIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

const Sidebar = () => {
    const router = useRouter();

    const navItems = [
        { icon: HomeIcon, label: "Home", path: "/" },
        { icon: MagnifyingGlassIcon, label: "Search", path: "/search" },
        { icon: FilmIcon, label: "Movies", path: "/movies" },
        { icon: TvIcon, label: "TV Shows", path: "/tvshows" },
        { icon: HeartIcon, label: "Watchlist", path: "/watchlist" },
        { icon: Cog6ToothIcon, label: "Settings", path: "/settings" },
    ];

    return (
        <aside className="w-64 bg-black p-4 flex flex-col items-center space-y-8 h-screen fixed left-0 top-0 z-50">
            <Link href="/" className="text-2xl font-bold hover:text-[#FF4D4D] smoothie">
                MovieFlix
            </Link>
            <div className="flex flex-col gap-2 size-full items-center justify-center">
                <div className="w-full flex flex-col p-3 gap-2 rounded-lg xl:rounded-xl bg-white/[.07] shrink-0">
                    {navItems.slice(0, 2).map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`sidebar-link flex items-center space-x-2 p-2 rounded-lg ${
                                router.pathname === item.path ? "bg-white/10 text-white" : "text-[#E0E0E0] hover:text-white"
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="w-full flex flex-col items-center flex-grow p-3 gap-1 rounded-lg overflow-y-auto xl:rounded-xl bg-white/[.07] custom-scrollbar">
                    {navItems.slice(2).map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`sidebar-link flex items-center space-x-2 p-2 rounded-lg w-full ${
                                router.pathname === item.path ? "bg-white/10 text-white" : "text-[#E0E0E0] hover:text-white"
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
