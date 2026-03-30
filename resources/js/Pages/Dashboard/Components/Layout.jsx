// resources/js/Pages/Dashboard/Components/Layout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div
            className="h-screen min-w-0 overflow-hidden"
            style={{
                background: "var(--ss-bg)",
                color: "var(--ss-text)",
            }}
        >
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main content area */}
            <div className="flex h-screen min-w-0 flex-1 flex-col lg:pl-64">
                {/* ✅ Global Topbar */}
                <Topbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Page Content */}
                <main
                    className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 lg:px-6"
                    style={{ background: "var(--ss-bg)" }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
