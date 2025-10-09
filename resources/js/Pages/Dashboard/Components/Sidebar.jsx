// resources/js/Pages/Dashboard/Components/Sidebar.jsx
import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon,
    BriefcaseIcon,
    DocumentTextIcon,
    ChartBarIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
    const { url } = usePage();

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="h-5 w-5 mr-3" /> },
        { name: 'Jobs', href: '/jobs', icon: <BriefcaseIcon className="h-5 w-5 mr-3" /> },
        { name: 'Resumes', href: '/resumes', icon: <DocumentTextIcon className="h-5 w-5 mr-3" /> },
        { name: 'Analytics', href: '/analytics', icon: <ChartBarIcon className="h-5 w-5 mr-3" /> },
        { name: 'Settings', href: '/settings', icon: <Cog6ToothIcon className="h-5 w-5 mr-3" /> },
    ];

    return (
        <aside className="w-72 bg-white dark:bg-gray-800 shadow-lg h-screen sticky top-0 flex flex-col z-20">
            <div className="h-16 px-6 py-6 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400 dark:from-blue-400 dark:to-purple-500">
                    SkillSync.ai
                </h1>
            </div>


            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item, index) => {
                    const isActive = url === item.href;
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200
                                ${isActive
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as <span className="font-medium text-gray-900 dark:text-white"> </span></p>
            </div>
        </aside>
    );
}
