import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { PowerIcon, UserCircleIcon, MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/outline';

export default function Topbar({ onMenuToggle }) {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        }
    }, []);

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

    const handleLogout = () => router.post('/logout');
    const handleProfileClick = () => router.visit('/profile');

    return (
        <header className="h-16 bg-white dark:bg-gray-800 flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
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
                <button onClick={toggleTheme} className="text-gray-700 dark:text-gray-200" title="Toggle theme">
                    {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>

                {/* Profile */}
                <button onClick={handleProfileClick} className="text-gray-700 dark:text-gray-200" title="Profile">
                    <UserCircleIcon className="h-6 w-6" />
                </button>
    
                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="text-gray-700 dark:text-gray-200 hover:text-red-600 transition"
                    title="Logout"
                >
                    <PowerIcon className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
}
