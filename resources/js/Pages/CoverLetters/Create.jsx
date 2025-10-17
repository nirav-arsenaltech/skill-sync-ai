import Layout from '../Dashboard/Components/Layout';
import { useForm,router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Select from 'react-select';

export default function Create({ jobs, resumes }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        job_id: '',
        resume_id: '',
    });

    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedResume, setSelectedResume] = useState(null);
    const [loading, setLoading] = useState(false);

    const jobOptions = jobs.map(job => ({
        value: job.id,
        label: job.title,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedJob) {
            toast.error('Please select a job.');
            return;
        }

        if (!selectedResume) {
            toast.error('Please select a resume.');
            return;
        }

        if (!data.name || data.name.trim() === '') {
            toast.error('Please add company name.');
            return;
        }

        setLoading(true);
        router.post('/cover-letters', { job_id: selectedJob.value, resume_id: selectedResume,company_name: data.name},{
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setLoading(false);
                setSelectedJob(null);
                setSelectedResume(null);
            },
            onError: () => setLoading(false)
        });
    };

    const handleChange = (selectedOption) => {
        setSelectedJob(selectedOption);
    };

    const handleResumeSelect = (id) => {
        setSelectedResume(prev => (prev === id ? null : id));
    };

    return (
        <Layout>
            <Toaster position="top-right" />
            <Head title="Create Cover Letter" />
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
                </div>
            )}
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Create Cover Letter</h2>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-full">
                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        {/* Job Selection */}
                        <div className="w-full">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Select Job
                            </label>
                            <Select
                                value={selectedJob}
                                onChange={handleChange}
                                options={jobOptions}
                                placeholder="Search and Select a Job"
                                classNamePrefix="react-select"
                                isClearable
                                isSearchable
                            />
                        </div>

                        {/* Resume Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Select Resume
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-72 overflow-y-auto border dark:border-gray-500 rounded-lg p-3">
                                {resumes.length > 0 ? (
                                    resumes.map((resume) => (
                                        <div
                                            key={resume.id}
                                            onClick={() => handleResumeSelect(resume.id)}
                                            className={`cursor-pointer border rounded-lg p-3 flex justify-between items-center transition 
                                            ${selectedResume === resume.id
                                                ? 'bg-blue-100 border-blue-500 dark:bg-blue-900'
                                                : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-white">{resume.name}</h4>
                                                <a
                                                    href={`/storage/${resume.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 dark:text-blue-400"
                                                >
                                                    View File
                                                </a>
                                            </div>
                                            {selectedResume === resume.id && (
                                                <span className="text-blue-600 font-bold">✓</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center col-span-full">
                                        No resumes found.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white
                                ${errors.name ? 'border-red-600 border-2' : 'border border-gray-300 dark:border-gray-600'}`}
                            />
                            {errors.name && <div className="mt-1 text-red-600">{errors.name}</div>}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center space-x-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Create
                            </button>
                            <Link
                                href="/cover-letters"
                                className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-500 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            {/* Loader CSS */}
            <style>{`
                .loader {
                    border-top-color: #3498db;
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Layout>
    );
}
