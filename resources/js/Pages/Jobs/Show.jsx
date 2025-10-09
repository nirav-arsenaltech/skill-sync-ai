// resources/js/Pages/Jobs/Show.jsx
import Layout from '../Dashboard/Components/Layout';
import { Link } from '@inertiajs/react';

export default function Show({ job }) {
    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                    Job Details
                </h2>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Title
                        </h3>
                        <p className="text-gray-900 dark:text-white">{job.title}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </h3>
                        <p className="text-gray-900 dark:text-white">{job.description}</p>
                    </div>

                    <div>
                        <Link
                            href="/jobs"
                            className="inline-block px-5 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition font-medium"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
