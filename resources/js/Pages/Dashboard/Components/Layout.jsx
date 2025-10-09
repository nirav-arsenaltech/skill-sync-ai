// resources/js/Pages/Dashboard/Components/Layout.jsx
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
            {/* Sidebar (always visible) */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
                {/* ✅ Global Topbar */}
                <Topbar />

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
