// resources/js/Pages/Dashboard/Index.jsx
import Layout from './Components/Layout';
import Card from './Components/Card';
import Table from './Components/Table';

export default function Dashboard() {
    const cards = [
        { title: 'Total Resumes', value: 1234 },
        { title: 'Processed Resumes', value: 876 },
        { title: 'Pending Reviews', value: 54 },
    ];

    const tableData = [
        { name: 'John Doe', date: '2025-10-09', status: 'Completed' },
        { name: 'Jane Smith', date: '2025-10-08', status: 'Pending' },
        { name: 'Alice Johnson', date: '2025-10-07', status: 'Completed' },
    ];

    return (
        <Layout>
            <div className="p-6">

            <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                   
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {cards.map((c, i) => (
                    <Card key={i} title={c.title} value={c.value} />
                ))}
            </div>

            <Table data={tableData} />
            </div>
        </Layout>
    );
}
