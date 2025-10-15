import { useState, useEffect } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../Dashboard/Components/Layout';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Head } from '@inertiajs/react';

export default function Index({ resumes, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const { props } = usePage();
    const flash = props.flash || {};

    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        router.delete(`/resumes/${deleteId}`);
        setDeleteId(null);
    };

    const cancelDelete = () => setDeleteId(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(location.pathname, { search, per_page: resumes.per_page }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(location.pathname, { per_page: resumes.per_page }, { preserveState: true, replace: true });
    };

    return (
        <Layout>
            <Toaster position="top-right" />
            <Head title="Resumes" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Resumes</h2>
                    <Link
                        href="/resumes/create"
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        + Upload Resume
                    </Link>
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="mb-4 flex items-center space-x-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search resumes..."
                        className="border rounded px-3 py-2 w-full dark:bg-gray-800 dark:text-white"
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

                {/* Resumes Table */}
                <div className="overflow-x-auto rounded-lg shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    File
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {resumes.data.length > 0 ? (
                                resumes.data.map((resume) => (
                                    <tr key={resume.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                        <td className="px-6 py-4 text-gray-800 dark:text-white">{resume.name}</td>
                                        <td className="px-6 py-4 text-blue-600 dark:text-blue-400">
                                            <a href={`/storage/${resume.file_path}`} target="_blank" rel="noopener noreferrer">
                                                View File
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 flex space-x-3">
                                            <Link
                                                href={`/resumes/${resume.id}/edit`}
                                                className="text-green-600 hover:text-green-800"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(resume.id)}
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
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                        No resumes found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteId && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 relative">
                            {/* Close X */}
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                onClick={cancelDelete}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
                            <p className="mt-2 text-gray-700 dark:text-gray-300">Are you sure you want to delete this resume? This action cannot be undone.</p>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    No
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Pagination */}
                {resumes.total > 10 && (
                    <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                        {/* Per Page Selector */}
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-700 dark:text-gray-300">Show:</span>
                            <select
                                value={resumes.per_page}
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
                            <span className="text-gray-500 dark:text-gray-400">of {resumes.total} entries</span>
                        </div>

                        {/* Pagination Links */}
                        <div className="flex space-x-1 overflow-x-auto">
                            {resumes.links
                                .filter(link => link.url || link.label === '« Previous' || link.label === 'Next »')
                                .map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 border rounded-md transition whitespace-nowrap dark:border-gray-500 ${link.active
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
