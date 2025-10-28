import Layout from '../Dashboard/Components/Layout';
import React, { useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';

export default function Show({ interviewPrep }) {

    useEffect(() => {
    }, [interviewPrep]);

    const qaList = Array.isArray(interviewPrep.questions_answers)
        ? interviewPrep.questions_answers
        : [];

    return (
        <Layout>
            <Head title="Interview Prep Details" />

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Interview Prep Details #{interviewPrep.id}
                </h3>
                <Link
                    href="/interview-preps"
                    className="text-blue-500 hover:underline"
                >
                    ← Back to History
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 mt-4">
                
                {/* Job Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 dark:text-white mb-2">Job Info</h4>
                    <p><strong>Title:</strong> {interviewPrep.job?.title}</p>
                    <p><strong>Description:</strong> {interviewPrep.job?.description}</p>
                </div>


                {/* Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 dark:text-white mb-2">Summary</h4>
                    <p>{interviewPrep.summary || 'No summary available.'}</p>
                </div>

                {/* Questions & Answers */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 dark:text-white mb-2">Interview Questions & Answers</h4>

                    {qaList.length > 0 ? (
                        <ul className="space-y-4">
                            {qaList.map((qa, index) => (
                                <li key={index} className="p-4 border rounded-lg border-gray-200 dark:border-gray-600">
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        <strong>Q{index + 1}:</strong> {qa.question || 'No question found'}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                                        <strong>A:</strong> {qa.answer || 'No answer provided'}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-600 dark:text-gray-300">
                            No questions and answers available.
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}
