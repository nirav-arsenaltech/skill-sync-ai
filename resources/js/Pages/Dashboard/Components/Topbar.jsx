// resources/js/Pages/Dashboard/Components/Topbar.jsx
import { router } from '@inertiajs/react';
import { PowerIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Topbar() {
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
            <header className="h-16 bg-white dark:bg-gray-800 flex items-center justify-between px-6 shadow-sm sticky top-0 z-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white"></h2>
                <div className="flex items-center gap-4">
                    <button className="text-gray-700 dark:text-gray-200" title="profile"  onClick={handleProfileClick}> 
                        <UserCircleIcon className="h-6 w-6" />
                    </button>
    
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
