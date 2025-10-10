import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../Dashboard/Components/Layout';
import { ChartBarIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';


export default function Analytics({ jobs, resumes, matchedHistory: initialHistory }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [selectedJob, setSelectedJob] = useState('');
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [aiResult, setAiResult] = useState(null);
    const [matchedHistory, setMatchedHistory] = useState(initialHistory || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const handleResumeSelect = (id) => {
        setSelectedResumes(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleScan = () => {
        if (!selectedJob) {
            toast.error('Please select a job.');
            return;
        }
        if (selectedResumes.length === 0) {
            toast.error('Please select at least one resume.');
            return;
        }

        setLoading(true);
        router.post('/analytics/scan', { job_id: selectedJob, resume_ids: selectedResumes }, {
            preserveState: true,
            replace: true,
            onSuccess: (page) => {
                setLoading(false);
                if (page.props.flash?.success) toast.success(page.props.flash.success);

                // Update AI result (if returned)
                if (page.props.ai_result) setAiResult(page.props.ai_result);

                // Update scan history table
                if (page.props.matchedHistory) setMatchedHistory(page.props.matchedHistory);

                setSelectedResumes([]); // Clear selected resumes
                setSelectedJob([]); // Clear selected resumes
            },
            onError: () => setLoading(false)
        });
    };


    return (
        <Layout>
            <Toaster position="top-right" />
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Analytics</h2>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                    {/* Job Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Select Job
                        </label>
                        <select
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">-- Select a Job --</option>
                            {jobs.map((job) => (
                                <option key={job.id} value={job.id}>
                                    {job.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Resume Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Select Resumes (You can choose multiple)
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-72 overflow-y-auto border rounded-lg p-3">
                            {resumes.length > 0 ? (
                                resumes.map((resume) => (
                                    <div
                                        key={resume.id}
                                        onClick={() => handleResumeSelect(resume.id)}
                                        className={`cursor-pointer border rounded-lg p-3 flex justify-between items-center transition 
                                            ${selectedResumes.includes(resume.id)
                                                ? 'bg-blue-100 border-blue-500 dark:bg-blue-900'
                                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
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
                                        {selectedResumes.includes(resume.id) && (
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

                    {/* Scan Button */}
                    <div className="text-right">
                        <button
                            onClick={handleScan}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            🔍 Scan Selected
                        </button>
                    </div>



                </div>
                {matchedHistory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 mt-4">
                        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                Scan History
                            </h3>

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-300 dark:border-gray-600">
                                        <th className="p-2">Resume</th>
                                        <th className="p-2">Job</th>
                                        <th className="p-2">Match %</th>
                                        <th className="p-2">Semantic Score</th>
                                        <th className="p-2">Keyword Score</th>
                                        <th className="p-2">Keyword Gap</th>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchedHistory.map((match) => {
                                        const aiData =
                                            typeof match.ai_result === 'string'
                                                ? (() => {
                                                    try {
                                                        return JSON.parse(match.ai_result);
                                                    } catch {
                                                        return { ai_text: match.ai_result };
                                                    }
                                                })()
                                                : match.ai_result || { ai_text: 'No report available' };

                                        return (
                                            <React.Fragment key={match.id}>
                                                {/* Main Row */}
                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                    <td className="p-2">{match.resume_name || aiData.resume_name || 'N/A'}</td>
                                                    <td className="p-2">
                                                        {jobs.find((job) => job.id === match.job_description_id)?.title || 'N/A'}
                                                    </td>
                                                    <td className="p-2">{match.match_percentage ?? '-'}</td>
                                                    <td className="p-2">{match.semantic_score ?? '-'}</td>
                                                    <td className="p-2">{match.keyword_score ?? '-'}</td>
                                                    <td className="p-2">{match.keyword_gap ?? '-'}</td>
                                                    <td className="p-2">{(() => {
                                                        const d = new Date(match.created_at);
                                                        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                                                        const day = String(d.getDate()).padStart(2, '0');
                                                        const year = d.getFullYear();
                                                        return `${month}/${day}/${year}`;
                                                    })()}</td>
                                                    <td className="p-2">
                                                        <button
                                                            className="text-blue-600 hover:underline"
                                                            onClick={() => {
                                                                const report = document.getElementById(`report-${match.id}`);
                                                                report.classList.toggle('hidden');
                                                            }}
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Toggle Row */}
                                                <tr id={`report-${match.id}`} className="hidden bg-gray-50 dark:bg-gray-700">
                                                    <td colSpan={8} className="p-3 border-t border-gray-200 dark:border-gray-600">
                                                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                                                            {aiData.ai_text || 'No report available'}
                                                        </pre>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

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
