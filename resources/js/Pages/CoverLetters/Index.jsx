import Layout from '../Dashboard/Components/Layout';
import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { Head } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import {
    TrashIcon,
    PlusCircleIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

export default function CoverLettersIndex() {
    const { props } = usePage();
    const { coverLetters, flash } = props;
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/cover-letters/${deleteId}`, {
            onSuccess: (page) => {
                toast.success(page.props.flash?.success || 'Cover Letter  Deleted successfully!');
                setIsModalOpen(false);
                setDeleteId(null);
            },
        });
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsModalOpen(true);
    };

    return (
        <Layout>
            <Toaster position="top-right" />
            <Head title="Cover Letters" />

            <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Cover Letters
                    </h1>

                    <Link
                        href="/cover-letters/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                    >
                        + Create Cover Letter
                    </Link>
                </div>


                {/* Table */}
                <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Resume
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Job
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {coverLetters?.data?.length > 0 ? (
                                coverLetters.data.map((cl) => (
                                    <tr
                                        key={cl.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-100">
                                            {cl.resume?.name || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-100">
                                            <Link
                                                href={`/jobs/${cl.job_description_id}`}
                                                className="text-blue-500 hover:underline"
                                            >
                                                {cl.job?.title || '—'}
                                            </Link>
                                        </td>

                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-100">
                                            {cl.company_name || '—'}
                                        </td>
                                        <td className="px-6 py-4 flex items-center space-x-4">
                                            <button
                                                className="text-blue-600 hover:text-blue-800"
                                                title="view"
                                                onClick={() => Inertia.get(`/cover-letters/${cl.id}`)}
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            {cl.file_path ? (
                                                <a
                                                    href={`/storage/${cl.file_path}`}
                                                    download
                                                    className="text-green-600 hover:text-green-800 flex items-center"
                                                    title="Download DPF"
                                                >
                                                    <ArrowDownTrayIcon className="h-5 w-5" />

                                                </a>
                                            ) : (
                                                <span className="text-gray-500">No file</span>
                                            )}

                                            <button
                                                onClick={() => confirmDelete(cl.id)}
                                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                            >
                                                <TrashIcon className="h-5 w-5" title="Delete" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-300"
                                    >
                                        No cover letters found.
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
                                Are you sure you want to delete this Cover Letter? This action cannot be undone.
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
                {coverLetters.total > 10 && (
                    <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                        {/* Per Page Selector */}
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-700 dark:text-gray-300">Show:</span>
                            <select
                                value={coverLetters.per_page}
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
                            <span className="text-gray-500 dark:text-gray-400">
                                of {coverLetters.total} entries
                            </span>
                        </div>

                        {/* Pagination Links */}
                        <div className="flex space-x-1 overflow-x-auto">
                            {coverLetters.links
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
