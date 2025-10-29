import { useState, useEffect } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../Dashboard/Components/Layout';
import { EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Head } from '@inertiajs/react';

export default function Index({ jobs, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const { props } = usePage();
    const flash = props.flash || {};

    const [deleteId, setDeleteId] = useState(null); // id of job to delete
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/jobs/${deleteId}`);
        setIsModalOpen(false);
        setDeleteId(null);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            location.pathname,
            { search, per_page: jobs.per_page },
            { preserveState: true, replace: true }
        );
    };

    const clearSearch = () => {
        setSearch('');
        router.get(location.pathname, { per_page: jobs.per_page }, { preserveState: true, replace: true });
    };

    return (
        <Layout>
             <Toaster position="top-right" />
             <Head title="Jobs"/>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Jobs</h2>
                    <Link
                        href="/jobs/create"
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        + Create Job
                    </Link>
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="mb-4 flex items-center space-x-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search jobs..."
                        className="border rounded px-3 py-2 w-full dark:bg-gray-800 dark:text-white border-gray-400 dark:border-gray-600"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Search
                    </button>
                </form>

                <div className="overflow-x-auto rounded-lg shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    #ID
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {jobs.data.length > 0 ? (
                                jobs.data.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                        <td className="px-2 py-4 text-gray-800 dark:text-white w-16 text-center">{job.id}</td>
                                        <td className="px-6 py-4 text-gray-800 dark:text-white">{job.title}</td>
                                        <td className="px-6 py-4 flex space-x-3">
                                            <Link
                                                href={`/jobs/${job.id}`}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/jobs/${job.id}/edit`}
                                                className="text-green-600 hover:text-green-800"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                             <button
                                                onClick={() => confirmDelete(job.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-300"
                                    >
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Delete Confirmation Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 z-50 w-96 relative">
                            {/* Close X */}
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                                Confirm Delete
                            </h3>
                            <p className="mb-6 text-gray-600 dark:text-gray-300">
                                Are you sure you want to delete this job? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                                >
                                    No
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Pagination + Per Page Selector */}
                {jobs.total > 10 && (
                    <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                        {/* Per Page Selector */}
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-700 dark:text-gray-300">Show:</span>
                            <select
                                value={jobs.per_page}
                                onChange={(e) => {
                                    const perPage = e.target.value;
                                    router.get(
                                        location.pathname,
                                        { per_page: perPage, search },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                                className="border rounded px-5 py-1 dark:bg-gray-800 dark:text-white text-sm"
                            >
                                {[10, 25, 50, 100].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <span className="text-gray-500 dark:text-gray-400">of {jobs.total} entries</span>
                        </div>

                        {/* Pagination Links */}
                        <div className="flex space-x-1 overflow-x-auto">
                            {jobs.links
                                .filter(link => link.url || link.label === '« Previous' || link.label === 'Next »')
                                .map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 border rounded-md transition whitespace-nowrap dark:border-gray-500 ${
                                            link.active
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
