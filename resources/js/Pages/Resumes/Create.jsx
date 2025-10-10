import Layout from '../Dashboard/Components/Layout';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        file: null,
    });

    const [fileName, setFileName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/resumes', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFileName('');
            },
        });
    };

    return (
        <Layout>
            <Toaster position="top-right" />
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Upload Resume</h2>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-lg">
                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                                Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white
                                ${errors.name ? 'border-red-600 border-2' : 'border border-gray-300 dark:border-gray-600'}`}
                                // required
                            />

                            {errors.name && <div className="mt-1 text-red-600">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                                File
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.json,.xml"
                                onChange={(e) => {
                                    setData('file', e.target.files[0]);
                                    setFileName(e.target.files[0]?.name || '');
                                }}
                                className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white
                                    ${errors.file ? 'border-red-600 border-2' : 'border border-gray-300 dark:border-gray-600'}`}
                            />

                            {fileName && <p className="mt-1 text-gray-500">{fileName}</p>}
                            {errors.file && <div className="mt-1 text-red-600">{errors.file}</div>}
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Upload
                            </button>
                            <Link
                                href="/resumes"
                                className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
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
