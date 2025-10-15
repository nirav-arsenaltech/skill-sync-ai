import Layout from '../Dashboard/Components/Layout';
import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ChartBarIcon, CheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function MatchHistory({ match, aiData, jobTitle, resumeName }) {
    const [showAllSkills, setShowAllSkills] = useState(false);

    return (
        <Layout>
            <Head title="Match history" />
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 mt-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Match History Details #{match.id}
                    </h3>
                    <Link
                        href="/analytics"
                        className="text-blue-500 hover:underline"
                    >
                        Back to History
                    </Link>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700">
                    <div className="p-4 border-t border-gray-200 dark:border-gray-600">

                        <div className="space-y-4">
                            {/* Overall Match Bar */}
                            {/* Match & ATS Score Bars */}
                            <div className="flex space-x-4 mb-6">
                                {/* Overall Match */}
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                                        Overall Match: {aiData.overall_match_percentage ?? 0}%
                                    </h4>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                                        <div
                                            className="bg-indigo-500 h-4 rounded-full transition-all duration-500"
                                            style={{ width: `${aiData.overall_match_percentage ?? 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* ATS Score */}
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                                        ATS Score: {aiData.ats_best_practice?.ats_score ?? 0}%
                                    </h4>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                                        <div
                                            className="bg-green-500 h-4 rounded-full transition-all duration-500"
                                            style={{ width: `${aiData.ats_best_practice?.ats_score ?? 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Scores Bars */}
                            <div className="flex space-x-4">
                                {['semantic_score', 'keyword_score', 'keyword_gap'].map((key) => (
                                    <div key={key} className="flex-1">
                                        <h5 className="text-gray-700 dark:text-gray-300 text-sm font-medium capitalize mb-1">
                                            {key.replace('_', ' ')}
                                        </h5>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                            <div
                                                className="bg-rose-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${aiData.scores?.[key] ?? 0}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {aiData.scores?.[key] ?? 0}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {/* ats best practice section */}
                            <div className="mb-6">
                                <h4 className="text-gray-800 dark:text-white font-semibold mb-2">ATS Best Practices</h4>

                                {/* ATS Details Table */}
                                <table className="w-full text-left border-collapse">
                                    <tbody>
                                        {aiData.ats_best_practice &&
                                            Object.entries(aiData.ats_best_practice)
                                                .filter(([key]) => key !== 'ats_score')
                                                .map(([key, value]) => (
                                                    <tr key={key} className="border-b border-gray-200 dark:border-gray-600">
                                                        <td className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300 capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </td>
                                                        <td className="px-2 py-2 text-gray-600 dark:text-gray-200">{value}</td>
                                                    </tr>
                                                ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Skills Gap Table */}
                            <div className="overflow-x-auto mt-4">
                                <table className="min-w-full text-left border border-gray-300 dark:border-gray-600 rounded">
                                    <thead className="bg-gray-100 dark:bg-gray-600">
                                        <tr>
                                            <th className="p-2">Skills</th>
                                            <th className="p-2">Resume</th>
                                            <th className="p-2">Job Description</th>
                                            <th className="p-2">Gap</th>
                                            <th className="p-2">Matched</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {aiData.skills_analysis &&
                                            aiData.skills_analysis.slice(0, showAllSkills ? aiData.skills_analysis.length : 6).map((skill) => (
                                                <tr key={skill.skill} className="border-t border-gray-200 dark:border-gray-600">
                                                    <td className="p-2">{skill.skill}</td>
                                                    <td className="p-2">{skill.resume_count}</td>
                                                    <td className="p-2">{skill.job_count}</td>
                                                    <td className="p-2">{skill.gap}</td>
                                                    <td className="p-2">
                                                        {skill.matched ? (
                                                            <CheckIcon className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {/* Show More / Hide Button */}
                                {aiData.skills_analysis?.length > 6 && (
                                    <div className="flex justify-center mt-4">
                                        <button
                                            onClick={() => setShowAllSkills(!showAllSkills)}
                                            className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-500 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            {showAllSkills ? "Hide more skills" : "Show more skills"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Strengths & Weaknesses */}
                            <div className="flex space-x-4 mt-4">
                                <div className="flex-1">
                                    <h5 className="text-gray-800 dark:text-white font-semibold mb-2">Strengths</h5>
                                    <p className="text-m text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                        {aiData.strengths ?? 'N/A'}
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <h5 className="text-gray-800 dark:text-white font-semibold mb-2">Weaknesses</h5>
                                    <p className="text-m text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                        {aiData.weaknesses ?? 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Detailed AI Text */}
                            <div className="mt-4">
                                <h5 className="text-gray-800 dark:text-white font-semibold mb-2">Detailed Analysis</h5>
                                <p className="text-m text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                    {aiData.ai_text || 'No report available'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

        </Layout>
    )
}