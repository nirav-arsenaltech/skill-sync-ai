import Layout from '../Dashboard/Components/Layout';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { PaperClipIcon } from '@heroicons/react/24/outline';

export default function Edit({ resume }) {
    const { data, setData, put, processing, errors } = useForm({
        name: resume.name,
        file: null,
    });

    const [fileName, setFileName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        if (data.file) formData.append('file', data.file);

        put(`/resumes/${resume.id}`, {
            data: formData,
            preserveScroll: true,
            onError: () => toast.error('Failed to update resume.'),
        });
    };

    return (
        <Layout>
            {/* <Toaster position="top-right" /> */}
            <Head title="Edit Resume" />
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Edit Resume</h2>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-full">
                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                                Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                            {errors.name && <div className="mt-1 text-red-600">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                                File (optional, replace)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                    setData('file', e.target.files[0]);
                                    setFileName(e.target.files[0]?.name || '');
                                }}
                                className="hidden"
                                id="file_input_edit"
                            />

                            <label
                                htmlFor="file_input_edit"
                                className={`cursor-pointer border border-gray-300 dark:bg-gray-900 dark:border-gray-700 rounded-md py-2 px-4 inline-flex items-center
                                ${errors.file ? 'border-red-600 dark:border-red-600 border-2' : ''}`}
                            >
                                <PaperClipIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                <span className="truncate">{fileName || 'Choose a file'}</span>
                            </label>
                            {fileName ? (
                                <p className="mt-1 text-gray-500">{fileName}</p>
                            ) : (
                                <p className="mt-1 text-blue-600">
                                    Current: <a href={`/storage/${resume.file_path}`} target="_blank" rel="noopener noreferrer">View File</a>
                                </p>
                            )}
                            {errors.file && <div className="mt-1 text-red-600">{errors.file}</div>}
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                                Update
                            </button>
                            <Link
                                href="/resumes"
                                className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-500 dark:hover:bg-gray-600 transition"
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
