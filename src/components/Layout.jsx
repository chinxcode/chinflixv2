import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const preloadRoutes = ["/index", "/search", "/movie", "/tv", "/anime", "/manga", "/drama", "/watchlist", "/legal"];

        // Preload on page load
        if (typeof window !== "undefined") {
            requestIdleCallback(() => {
                preloadRoutes.forEach((route) => {
                    router.prefetch(route);
                });
            });
        }

        // Preload on hover of any link
        const handleLinkHover = (e) => {
            const href = e.target.getAttribute("href");
            if (href && href.startsWith("/")) {
                router.prefetch(href);
            }
        };

        document.addEventListener("mouseover", handleLinkHover);

        return () => {
            document.removeEventListener("mouseover", handleLinkHover);
        };
    }, [router]);

    return (
        <div className="flex bg-[#121212] text-white min-h-screen">
            <div className={`hidden lg:block ${isSidebarCollapsed ? "w-20" : "w-56"} transition-all duration-300`}>
                <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
            </div>
            <div className={`flex-1 overflow-x-hidden will-change-transform transition-all duration-300`}>{children}</div>
            <div className="lg:hidden fixed bottom-0 left-0 right-0">
                <BottomNav showMoreMenu={showMoreMenu} setShowMoreMenu={setShowMoreMenu} />
            </div>
        </div>
    );
};

export default Layout;
