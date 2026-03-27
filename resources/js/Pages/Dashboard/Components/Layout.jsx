// resources/js/Pages/Dashboard/Components/Layout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div
            className="flex min-h-screen min-w-fit"
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
            <div className="flex-1 flex flex-col">
                {/* ✅ Global Topbar */}
                <Topbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Page Content */}
                <main
                    className="flex-1 overflow-y-auto p-6"
                    style={{ background: "var(--ss-bg)" }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
