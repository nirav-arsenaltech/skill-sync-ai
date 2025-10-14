import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { PowerIcon, UserCircleIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function Topbar() {
    const [darkMode, setDarkMode] = useState(false);

    // Load theme on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setDarkMode(false);
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

    const handleLogout = () => {
        router.post('/logout', {}, {
            onStart: () => console.log('Logout initiated...'),
            onFinish: () => console.log('Logout request finished.')
        });
    };

    const handleProfileClick = () => {
        router.visit('/profile');
    };

    return (
        <header className="h-16 bg-white dark:bg-gray-800 flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white"></h2>
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="text-gray-700 dark:text-gray-200"
                    title="Toggle theme"
                >
                    {darkMode ? (
                        <SunIcon className="h-5 w-5" />
                    ) : (
                        <MoonIcon className="h-5 w-5" />
                    )}
                </button>

                {/* Profile */}
                <button className="text-gray-700 dark:text-gray-200" title="Profile" onClick={handleProfileClick}>
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
