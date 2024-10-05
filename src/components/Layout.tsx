import Sidebar from "./Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex bg-[#121212] text-white min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-x-hidden">{children}</div>
        </div>
    );
};

export default Layout;
