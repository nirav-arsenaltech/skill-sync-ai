import Layout from './Components/Layout';
import Card from './Components/card';
import Table from './Components/Table';
import { Link } from '@inertiajs/react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Head } from '@inertiajs/react';

export default function Dashboard({ cards, recentJobs, recentResumes, recentCoverLetters, recentInterviewPreps }) {
    return (
        <Layout>
            <Head title="Dashboard" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {cards.map((c, i) => (
                        <Card key={i} title={c.title} value={c.value} />
                    ))}
                </div>

                {/* Recent Jobs */}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Jobs</h3>
                {recentJobs.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mt-6">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Job Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {recentJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white" style={{ minWidth: '200px', maxWidth: '300px', wordBreak: 'break-word' }}>
                                            {job.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white" style={{ minWidth: '150px', maxWidth: '200px', wordBreak: 'break-word' }}>
                                            {job.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white">
                                            <Link
                                                href={`/jobs/${job.id}`}
                                                className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                                            >
                                                <EyeIcon className="h-5 w-5" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-500 dark:text-gray-400">
                        No jobs available
                    </div>
                )}

                {/* Recent Resumes */}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">Recent Resumes</h3>
                {recentResumes.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mt-6">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Resume Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {recentResumes.map(resume => (
                                    <tr key={resume.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white" style={{ minWidth: '200px', maxWidth: '300px', wordBreak: 'break-word' }}>
                                            {resume.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white" style={{ minWidth: '150px', maxWidth: '200px', wordBreak: 'break-word' }}>
                                            {resume.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white">
                                            <Link
                                                href={`/resumes/${resume.id}/edit`}
                                                className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                                            >
                                                <EyeIcon className="h-5 w-5" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-500 dark:text-gray-400">
                        No resumes available
                    </div>
                )}

                {/* Recent Cover letters */}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">Recent Cover Letters</h3>
                {recentCoverLetters.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mt-6">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Company Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {recentCoverLetters.map(coverLetter => (
                                    <tr key={coverLetter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white" style={{ minWidth: '200px', maxWidth: '300px', wordBreak: 'break-word' }}>
                                            {coverLetter.company_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white" style={{ minWidth: '150px', maxWidth: '200px', wordBreak: 'break-word' }}>
                                            {coverLetter.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white">
                                            <Link
                                                href={`/cover-letters/${coverLetter.id}`}
                                                className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                                            >
                                                <EyeIcon className="h-5 w-5" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-500 dark:text-gray-400">
                        No Cover Letters available
                    </div>
                )}

                {/* Recenet Interview Preps */}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">Recent Interview Preps</h3>
                {recentInterviewPreps.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mt-6">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Job Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {recentInterviewPreps.map(interviewPreps => (
                                    <tr key={interviewPreps.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white" style={{ minWidth: '200px', maxWidth: '300px', wordBreak: 'break-word' }}>
                                            {interviewPreps.job_title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white" style={{ minWidth: '150px', maxWidth: '200px', wordBreak: 'break-word' }}>
                                            {interviewPreps.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white">
                                            <Link
                                                href={`/interview-preps/${interviewPreps.id}`}
                                                className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                                            >
                                                <EyeIcon className="h-5 w-5" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-500 dark:text-gray-400">
                        No Interview Preps available
                    </div>
                )}
            </div>
        </Layout>
    );
}
