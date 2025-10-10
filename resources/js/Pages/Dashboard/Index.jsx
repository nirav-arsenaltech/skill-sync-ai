import Layout from './Components/Layout';
import Card from './Components/Card';
import Table from './Components/Table';
import { Link } from '@inertiajs/react';
import { EyeIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ cards, recentJobs, recentResumes }) {
    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {cards.map((c, i) => (
                        <Card key={i} title={c.title} value={c.value} />
                    ))}
                </div>

                {/* Recent Jobs */}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Jobs</h3>
                {recentJobs.length > 0 ? (
                    <Table
                        data={recentJobs.map(job => ({
                            name: job.title,
                            date: job.date,
                            status: (
                                <Link
                                    href={`/jobs/${job.id}`}
                                    className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                                >
                                    <EyeIcon className="h-5 w-5" /> View
                                </Link>
                            )
                        }))}
                    />
                ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-500 dark:text-gray-400">
                        No jobs available
                    </div>
                )}

                {/* Recent Resumes */}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">Recent Resumes</h3>
                {recentResumes.length > 0 ? (
                    <Table data={recentResumes} />
                ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-500 dark:text-gray-400">
                        No resumes available
                    </div>
                )}
            </div>
        </Layout>
    );
}
