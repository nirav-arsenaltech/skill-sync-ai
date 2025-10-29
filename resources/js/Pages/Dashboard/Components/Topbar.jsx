import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PowerIcon, UserCircleIcon, MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

export default function Topbar({ onMenuToggle }) {
    const [darkMode, setDarkMode] = useState(false);
    const { url } = usePage();

    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setDarkMode(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setDarkMode(true);
        }
    };

    const handleLogoutClick = () => {
        setIsModalOpen(true);
    };

    const confirmLogout = () => {
        setIsModalOpen(false);
        handleLogout();
        toast.success('Logged out successfully.')
    };

    const handleLogout = () => router.post('/logout');
    const handleProfileClick = () => router.visit('/profile');
    const isProfileActive = url.startsWith('/profile');

    return (
        <header className="h-16 bg-white dark:bg-gray-800 flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
            <Toaster position="top-right" />
            {/* Hamburger (mobile only) */}
            <button
                onClick={onMenuToggle}
                className="md:hidden text-gray-700 dark:text-gray-200 hover:text-blue-500"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white hidden md:block"></h2>
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button onClick={toggleTheme} title="Toggle theme"
                    className={`transition-colors ${darkMode
                            ? 'text-gray-700 dark:text-gray-200 hover:text-yellow-400 dark:hover:text-yellow-400'
                            : 'text-gray-700 dark:text-gray-200 hover:text-blue-400 dark:hover:text-blue-400'
                        }`}
                >
                    {darkMode ? ( <SunIcon className="h-5 w-5" />) : (<MoonIcon className="h-5 w-5" />)}
                </button>

                {/* Profile */}
                <button onClick={handleProfileClick} title="Profile"
                    className={`transition ${
                        isProfileActive
                            ? 'text-blue-500'
                            : 'text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-500'
                    }`}
                >
                    <UserCircleIcon className="h-6 w-6" />
                </button>
    
                {/* Logout */}
                <button
                    onClick={handleLogoutClick}
                    className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition"
                    title="Logout"
                >
                    <PowerIcon className="h-6 w-6" />
                </button>

                {/* logout Confirmation Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div
                            className="fixed inset-0 bg-black opacity-50"
                            onClick={() => setIsModalOpen(false)}
                        ></div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 z-50 w-96 relative">
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                                Confirm Logout
                            </h3>
                            <p className="mb-6 text-gray-600 dark:text-gray-300">
                                Are you sure you want to logout?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                                >
                                    No
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
