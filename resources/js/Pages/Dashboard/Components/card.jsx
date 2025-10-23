import { Link } from '@inertiajs/react'; 
export default function Card({ title, value }) {
    const cardRoutes = {
        'Total Resumes': '/resumes',
        'Total Jobs': '/jobs',
        'Total Matches': '/analytics',
        'Total Cover Letters': '/cover-letters',
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                <Link href={cardRoutes[title]} className="text-blue-600 no-underline">
                    {value}
                </Link>
            </p>
        </div>
    );
}
