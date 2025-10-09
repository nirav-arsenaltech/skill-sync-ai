// resources/js/Pages/Dashboard/Components/Table.jsx
export default function Table({ data }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mt-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((row, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{row.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row.date}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${row.status === 'Completed' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                {row.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
