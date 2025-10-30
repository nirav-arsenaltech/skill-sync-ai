import Layout from "../Dashboard/Components/Layout";
import React, { useEffect, useState } from "react";
import { Link, Head } from "@inertiajs/react";
import {
    QuestionMarkCircleIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function Show({ interviewPrep }) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showFullSummary, setShowFullSummary] = useState(false);
    const [showAllQueAns, setShowAllQueAns] = useState(false);

    useEffect(() => { }, [interviewPrep]);

    const qaList = Array.isArray(interviewPrep.questions_answers)
        ? interviewPrep.questions_answers
        : [];

    const truncateText = (text, limit) => {
        if (!text) return "";
        if (text.length <= limit) return text;

        const truncated = text.substring(0, limit);
        const lastSpace = truncated.lastIndexOf(" ");
        return truncated.substring(0, lastSpace > 0 ? lastSpace : limit) + "...";
    };

    const description = interviewPrep.job?.description || "N/A";
    const summary = interviewPrep.summary || "No summary available.";

    const visibleQA = showAllQueAns ? qaList : qaList.slice(0, 10);

    return (
        <Layout>
            <Head title="Interview Prep Details" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white tracking-tight">
                    Interview Prep #{interviewPrep.id}
                </h3>
                <Link
                    href="/interview-preps"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                    ← Back to History
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8 border border-gray-100 dark:border-gray-700 transition-all">
                {/* Job Info */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Job Information
                    </h4>
                    <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <p>
                            <strong>Title:</strong>{" "}
                            {interviewPrep.job?.title || "N/A"}
                        </p>
                        <p>
                            <strong>Description:</strong>{" "}
                            {showFullDescription
                                ? description
                                : truncateText(description, 450)}
                            {description.length > 450 && (
                                <button
                                    onClick={() =>
                                        setShowFullDescription(!showFullDescription)
                                    }
                                    className="text-blue-600 dark:text-blue-400 ml-2 hover:underline focus:outline-none"
                                >
                                    {showFullDescription
                                        ? "Show less"
                                        : "Show more"}
                                </button>
                            )}
                        </p>
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Summary
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {showFullSummary ? summary : truncateText(summary, 500)}
                        {summary.length > 500 && (
                            <button
                                onClick={() =>
                                    setShowFullSummary(!showFullSummary)
                                }
                                className="text-blue-600 dark:text-blue-400 ml-2 hover:underline focus:outline-none"
                            >
                                {showFullSummary ? "Show less" : "Show more"}
                            </button>
                        )}
                    </p>
                </div>

                {/* Questions & Answers */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Interview Questions & Answers
                    </h4>

                    {qaList.length > 0 ? (
                        <>
                            <div className="space-y-6">
                                {visibleQA.map((qa, index) => (
                                    <div
                                        key={index}
                                        className="group bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-5 hover:shadow-md transition-all"
                                    >
                                        {/* Question */}
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-base">
                                                    Q{index + 1}.{" "}
                                                    {qa.question ||
                                                        "No question found"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Answer */}
                                        <div className="flex items-start gap-3 mt-3 pl-2 md:pl-9">

                                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-300" />
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {qa.answer || "No answer provided"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Show/Hide Button */}
                            {qaList.length > 10 && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={() =>
                                            setShowAllQueAns(!showAllQueAns)
                                        }
                                        className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-500 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        {showAllQueAns
                                            ? "Hide more Que. Ans"
                                            : "Show more Que. Ans"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-600 dark:text-gray-300 text-center py-8">
                            No questions and answers available.
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}
