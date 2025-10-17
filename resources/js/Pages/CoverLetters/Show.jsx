import Layout from '../Dashboard/Components/Layout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ coverLetter }) {

    return (
        <Layout>
            <Head title={`Cover Letter - ${coverLetter.company_name || 'View'}`} />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Cover Letter Preview #{coverLetter.id}</h3>
                    <Link
                        href="/cover-letters"
                        className="text-blue-600 hover:underline"
                    >
                        ← Back to List
                    </Link>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mx-auto overflow-auto margin-0"
                    dangerouslySetInnerHTML={{ __html: coverLetter.html }}
                />
            </div>
        </Layout>
    );
}

