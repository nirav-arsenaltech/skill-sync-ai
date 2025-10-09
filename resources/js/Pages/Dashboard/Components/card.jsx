// resources/js/Pages/Dashboard/Components/Card.jsx
export default function Card({ title, value }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}
