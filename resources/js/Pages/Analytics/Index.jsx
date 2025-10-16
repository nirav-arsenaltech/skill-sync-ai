import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { usePage, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../Dashboard/Components/Layout';
import { ChartBarIcon, EyeIcon, CheckIcon, PencilIcon, TrashIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import Select from 'react-select';

export default function Analytics({ jobs, resumes, matchedHistory: initialHistory, pagination }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const matchedHistoryRef = useRef(null); 

    const [selectedJob, setSelectedJob] = useState('');
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [aiResult, setAiResult] = useState(null);
    const [matchedHistory, setMatchedHistory] = useState(initialHistory || []);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [matchToDelete, setMatchToDelete] = useState(null);
    const [downloading, setDownloading] = useState(null);
    const [showAllSkills, setShowAllSkills] = useState(false);
    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [currentPage, setCurrentPage] = useState(pagination.current_page || 1);

    const scrollToMatchedHistory = () => {
        const matchedHistoryElement = document.querySelector('.matched-history-table');  // Target the table directly by class
        if (matchedHistoryElement) {
            window.scrollTo({
                top: matchedHistoryElement.offsetTop - 100,
                behavior: 'smooth',
            });
        }
    };

    const handlePerPageChange = (e) => {
        const newPerPage = e.target.value;
        setPerPage(newPerPage);
        setCurrentPage(1);
        router.get(location.pathname, { per_page: newPerPage, page: 1 });
        setTimeout(scrollToMatchedHistory, 300);
    };

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);
    const jobOptions = jobs.map(job => ({
        value: job.id,
        label: job.title,
    }));

    const handleChange = (selectedOption) => {
        setSelectedJob(selectedOption);
    };

    const handleDownload = async (matchId) => {
        setDownloading(matchId);

        try {
            const match = matchedHistory.find(m => m.id === matchId);
            if (!match) throw new Error('Match not found');
            const aiData =
                typeof match.ai_result === 'string'
                    ? (() => { try { return JSON.parse(match.ai_result); } catch { return { ai_text: match.ai_result }; } })()
                    : match.ai_result || { ai_text: 'No report available' };

            const reportElement = document.getElementById(`report-content-${matchId}`);
            if (!reportElement) throw new Error('Report not found');

            const cloned = reportElement.cloneNode(true);
            cloned.style.display = 'block';
            cloned.classList.remove('hidden');
            cloned.style.background = 'white';
            cloned.style.padding = '20px';
            const swElements = cloned.querySelectorAll('.strength-weakness');
            swElements.forEach(el => el.style.breakInside = 'avoid');
            document.body.appendChild(cloned);
            // Use html2canvas + jsPDF
            const canvas = await html2canvas(cloned, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            const pageHeight = pdf.internal.pageSize.getHeight();
            let remainingHeight = pdfHeight;
            let position = 0;

            while (remainingHeight > 0) {
                const heightToUse = Math.min(remainingHeight, pageHeight);
                pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
                remainingHeight -= pageHeight;
                position += pageHeight;
                if (remainingHeight > 0) pdf.addPage();
            }

            pdf.save(`match-report-${matchId}.pdf`);
            document.body.removeChild(cloned);
            toast.success('PDF downloaded successfully!');

        } catch (err) {
            console.error('[PDF] Error during download:', err);
            toast.error('Failed to download PDF.');
        } finally {
            setDownloading(null);
        }
    };

    const handleResumeSelect = (id) => {
        setSelectedResumes(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const confirmDelete = (matchId) => {
        setMatchToDelete(matchId);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (!matchToDelete) return;

        router.delete(route('analytics.destroy', matchToDelete), {
            preserveState: true,
            onSuccess: (page) => {
                toast.success(page.props.flash?.success || 'Record successfully Deleted');
                setMatchedHistory(prev => prev.filter(m => m.id !== matchToDelete));
                setIsModalOpen(false);
                setMatchToDelete(null);
            },
            onError: () => {
                toast.error('Failed to delete match.');
                setIsModalOpen(false);
                setMatchToDelete(null);
            }
        });
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
        const jobId = typeof selectedJob == 'object' ? selectedJob.value : selectedJob;
        router.post('/analytics/scan', { job_id: jobId, resume_ids: selectedResumes }, {
            preserveState: true,
            replace: true,
            onSuccess: (page) => {
                setLoading(false);
                // if (page.props.flash?.success) toast.success(page.props.flash.success);
                toast.success(page.props.flash?.success || 'Scanned successfully');
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
            <Head title="Analytics" />
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
                            Select Resumes
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-72 overflow-y-auto border dark:border-gray-500 rounded-lg p-3">
                            {resumes.length > 0 ? (
                                resumes.map((resume) => (
                                    <div
                                        key={resume.id}
                                        onClick={() => handleResumeSelect(resume.id)}
                                        className={`cursor-pointer border rounded-lg p-3 flex justify-between items-center transition 
                                            ${selectedResumes.includes(resume.id)
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


                    {isModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div
                                className="fixed inset-0 bg-black opacity-50"
                                onClick={() => setIsModalOpen(false)}
                            ></div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 z-50 w-96 relative">
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
                                    Are you sure you want to delete this match? This action cannot be undone.
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

                </div>
                {matchedHistory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 mt-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 matched-history-table">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                Scan History
                            </h3>

                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr className="border-b border-gray-300 dark:border-gray-600">
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resume</th>
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job</th>
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Match %</th>
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">ATS Score %</th>
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semantic Score %</th>
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Keyword Score %</th>
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Keyword Gap</th>
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-2 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchedHistory.map((match) => {
                                        const aiData =
                                            typeof match.ai_result === 'string'
                                                ? (() => {
                                                    try { return JSON.parse(match.ai_result); }
                                                    catch { return { ai_text: match.ai_result }; }
                                                })()
                                                : match.ai_result || { ai_text: 'No report available' };

                                        return (
                                            <React.Fragment key={match.id}>
                                                {/* Main Row */}
                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                    <td className="p-2">{match.resume_name || aiData.resume_name || 'N/A'}</td>
                                                    <td className="p-2">
                                                        <Link
                                                            href={`/jobs/${match.job_description_id}`}
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            {jobs.find((job) => job.id === match.job_description_id)?.title || 'N/A'}
                                                        </Link>
                                                    </td>
                                                    <td className="p-2">{aiData.overall_match_percentage ?? '-'}</td>
                                                    <td className="p-2">{aiData.ats_best_practice?.ats_score ?? 0}</td>
                                                    <td className="p-2">{aiData.scores?.semantic_score ?? '-'}</td>
                                                    <td className="p-2">{aiData.scores?.keyword_score ?? '-'}</td>
                                                    <td className="p-2">{aiData.scores?.keyword_gap ?? '-'}</td>
                                                    <td className="p-2">
                                                        {new Date(match.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-2 flex space-x-2">

                                                        <button
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="view"
                                                            onClick={() => Inertia.get(`/analytics/match-history/${match.id}`)}
                                                            // onClick={() => {
                                                            //     const report = document.getElementById(`report-${match.id}`);
                                                            //     report.classList.toggle('hidden');
                                                            // }}
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(match.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(match.id)}
                                                            disabled={downloading === match.id}
                                                            className={`text-green-600 hover:text-green-800 flex items-center ${downloading === match.id ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                            title="Download PDF"
                                                        >
                                                            {downloading === match.id ? 'Processing...' : <ArrowDownTrayIcon className="h-5 w-5" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {matchedHistory.map((match) => {
                                const aiData =
                                    typeof match.ai_result === 'string'
                                        ? (() => {
                                            try { return JSON.parse(match.ai_result); }
                                            catch { return { ai_text: match.ai_result }; }
                                        })()
                                        : match.ai_result || { ai_text: 'No report available' };

                                return (
                                    <div
                                        key={`report-${match.id}`}
                                        id={`report-content-${match.id}`}
                                        className="hidden w-full p-6 bg-white"
                                        style={{ background: 'white', padding: '20px', fontSize: '20px', lineHeight: 'normal' }}
                                    >
                                        {/* Logo */}
                                        <div className="flex items-center justify-center mb-6">
                                            {/* <img src='/images/skillsync-title.png' alt="SkillSync.ai" className="h-12 object-contain" /> */}
                                            <img src="/images/skillsync-logo.png" alt="SkillSync.ai" className="h-12 object-contain" />
                                        </div>

                                        <div className="space-y-6" style={{ fontSize: '20px', lineHeight: 'normal' }}>
                                            {/* Overall Match & ATS Score*/}
                                            <div className="flex space-x-4 mb-6">
                                                {/* Overall Match */}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 mb-3" style={{ fontSize: '20px', lineHeight: 'normal' }}>
                                                        Overall Match: {aiData.overall_match_percentage ?? 0}%
                                                    </h4>
                                                    <div className="w-full bg-gray-200 rounded-full h-5">
                                                        <div
                                                            className="bg-indigo-500 h-5 rounded-full transition-all duration-500"
                                                            style={{ width: `${aiData.overall_match_percentage ?? 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                {/* ATS Score */}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 mb-3" style={{ fontSize: '20px', lineHeight: 'normal' }}>
                                                        ATS Score: {aiData.ats_best_practice?.ats_score ?? 0}%
                                                    </h4>
                                                    <div className="w-full bg-gray-200 rounded-full h-5">
                                                        <div
                                                            className="bg-green-500 h-5 rounded-full transition-all duration-500"
                                                            style={{ width: `${aiData.ats_best_practice?.ats_score ?? 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Scores Bars */}
                                            <div className="grid grid-cols-3 gap-4">
                                                {['semantic_score', 'keyword_score', 'keyword_gap'].map((key) => (
                                                    <div key={key}>
                                                        <h5 className="text-gray-700 text-base font-medium capitalize mb-3" style={{ fontSize: '20px', lineHeight: 'normal' }}>
                                                            {key.replace('_', ' ')}
                                                        </h5>
                                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                                            <div
                                                                className="bg-rose-500 h-4 rounded-full transition-all duration-500"
                                                                style={{ width: `${aiData.scores?.[key] ?? 0}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1" style={{ fontSize: '16px', lineHeight: 'normal' }}>
                                                            {aiData.scores?.[key] ?? 0}%
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mb-6">
                                                <h4 className="text-gray-800  font-semibold mb-3">ATS Best Practices</h4>
                                                {/* ATS Details Table */}
                                                <table className="w-full text-left border-collapse">
                                                    <tbody>
                                                        {aiData.ats_best_practice &&
                                                            Object.entries(aiData.ats_best_practice)
                                                                .filter(([key]) => key !== 'ats_score')
                                                                .map(([key, value]) => (
                                                                    <tr key={key} className="border-b border-gray-200">
                                                                        <td className="px-2 py-2 font-medium text-gray-700 capitalize">
                                                                            {key.replace(/_/g, ' ')}
                                                                        </td>
                                                                        <td className="px-2 py-2 text-gray-600">{value}</td>
                                                                    </tr>
                                                                ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Skills Table */}
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-left border border-gray-300 rounded" style={{ fontSize: '22px', lineHeight: 'normal' }}>
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="p-2">Skills</th>
                                                            <th className="p-2">Resume</th>
                                                            <th className="p-2">Job Description</th>
                                                            <th className="p-2">Gap</th>
                                                            <th className="p-2">Matched</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {aiData.skills_analysis?.map((skill) => (
                                                            <tr key={skill.skill} className="border-t border-gray-200">
                                                                <td className="p-2">{skill.skill}</td>
                                                                <td className="p-2">{skill.resume_count}</td>
                                                                <td className="p-2">{skill.job_count}</td>
                                                                <td className="p-2">{skill.gap}</td>
                                                                <td className="p-2">{skill.matched ? <CheckIcon className="h-5 w-5 text-green-500" /> : '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Strengths & Weaknesses */}
                                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 break-inside-avoid">
                                                <div className="flex-1">
                                                    <h5 className="text-gray-800 font-semibold mb-3" style={{ fontSize: '22px' }}>Strengths</h5>
                                                    <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '20px', lineHeight: 'normal' }}>
                                                        {aiData.strengths ?? 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-gray-800 font-semibold mb-3" style={{ fontSize: '22px' }}>Weaknesses</h5>
                                                    <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '20px', lineHeight: 'normal' }}>
                                                        {aiData.weaknesses ?? 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Detailed AI Text */}
                                            <div>
                                                <h5 className="text-gray-800 font-semibold mb-3" style={{ fontSize: '22px' }}>Detailed Analysis</h5>
                                                <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '20px', lineHeight: 'normal' }}>
                                                    {aiData.ai_text || 'No report available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Pagination + Per Page Selector */}
                        <div className="container mt-6">
                            <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                                {/* Per Page Selector */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-700 dark:text-gray-300">Show:</span>
                                    <select
                                        value={perPage}
                                        onChange={handlePerPageChange}
                                        className="border rounded px-5 py-1 dark:bg-gray-800 dark:text-white text-sm"
                                    >
                                        {[10, 25, 50, 100].map((n) => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                    <span className="text-gray-500 dark:text-gray-400">of {pagination.total} entries</span>
                                </div>

                                {/* Pagination Links */}
                                <div className="flex space-x-1 overflow-x-auto">
                                    {pagination.links
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
