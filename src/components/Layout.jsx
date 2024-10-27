import { useState } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const Layout = ({ children }) => {
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    return (
        <div className="flex bg-[#121212] text-white min-h-screen">
            <div className="hidden lg:block">
                <Sidebar />
            </div>
            <div className="flex-1 lg:ml-64 overflow-x-hidden">{children}</div>
            <div className="lg:hidden fixed bottom-0 left-0 right-0">
                <BottomNav showMoreMenu={showMoreMenu} setShowMoreMenu={setShowMoreMenu} />
            </div>
        </div>
    );
};

export default Layout;
