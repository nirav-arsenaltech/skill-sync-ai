import Layout from '../Dashboard/Components/Layout';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ job }) {
    const { data, setData, put, processing, errors } = useForm({
        title: job.title,
        description: job.description,
    });

    // Client-side validation state
    const [clientErrors, setClientErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation
        const newClientErrors = {};
        if (!data.title.trim()) newClientErrors.title = 'Title is required';
        if (!data.description.trim()) newClientErrors.description = 'Description is required';
        setClientErrors(newClientErrors);

        if (Object.keys(newClientErrors).length > 0) return; // stop submit if errors

        // Submit via Inertia (redirects to Index on success)
        put(`/jobs/${job.id}`, {
            preserveScroll: true,
        });
    };

    // Helper for input classes
    const getInputClass = (field) =>
        `w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
            clientErrors[field] || errors[field]
                ? 'border-red-600 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
        } dark:bg-gray-700 dark:text-white dark:border-gray-600`;

    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                    Edit Job
                </h2>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {/* Title */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={getInputClass('title')}
                            />
                            {(clientErrors.title || errors.title) && (
                                <div className="mt-1 text-red-600">
                                    {clientErrors.title || errors.title}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={getInputClass('description')}
                                rows="6"
                            />
                            {(clientErrors.description || errors.description) && (
                                <div className="mt-1 text-red-600">
                                    {clientErrors.description || errors.description}
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-5 py-2 rounded-md text-white font-medium transition ${
                                    processing
                                        ? 'bg-green-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {processing ? 'Updating...' : 'Update'}
                            </button>

                            <Link
                                href="/jobs"
                                className="px-5 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition font-medium"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
