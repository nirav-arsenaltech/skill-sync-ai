import Layout from '../Dashboard/Components/Layout';
import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Edit({ coverLetter }) {
    const aiData = typeof coverLetter.ai_result === 'string'
        ? JSON.parse(coverLetter.ai_result)
        : coverLetter.ai_result || {};

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company_name: coverLetter.company_name || '',
        ai_result: { ...aiData },
        html: coverLetter.html || '',
        template_id: coverLetter.template_id || 0,
    });

    // Update preview only on cover letter field changes
    const updatePreview = async (updatedAi) => {
        setFormData(prev => ({ ...prev, ai_result: updatedAi }));

        try {
            const res = await axios.post(`/cover-letters/${coverLetter.id}/preview`, {
                company_name: formData.company_name,
                ai_result: updatedAi,
                template_id: formData.template_id,
            });
            setFormData(prev => ({ ...prev, html: res.data.html }));
        } catch (err) {
            console.error('Failed to update preview', err);
        }
    };


    // Editable fields
    const handleValueChange = (field, value) => {
        const updatedAi = { ...formData.ai_result, [field]: value };
        updatePreview(updatedAi);
    };

    const handleCompanyChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, company_name: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.company_name || formData.company_name === '') {
            toast.error('Please add company name.');
            return;
        }
        setLoading(true);
        Inertia.post(`/cover-letters/${coverLetter.id}/update`, {
            company_name: formData.company_name,
            ai_result: formData.ai_result,
            template_id: formData.template_id,
        }, {
            onSuccess: () => {
                setLoading(false);
                toast.success('Cover letter updated successfully');
            },
            onError: () => setLoading(false)
        });
    };

    return (
        <Layout>
            <Toaster position="top-right" />
            <Head title="Edit Cover Letter" />
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
                </div>
            )}
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                    Edit Cover Letter
                </h2>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-10">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Company Name
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleCompanyChange}
                                className="mt-1 p-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            />
                        </div>

                        {/* Cover Letter */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Cover Letter Text</label>
                            <div className="font-mono border border-gray-300 dark:border-gray-600 rounded-md p-2 space-y-2">
                                {/* Name line */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value="Name:"
                                        disabled
                                        className="w-24 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                                    />
                                    <input
                                        type="text"
                                        value={formData.ai_result.applicant_name || ''}
                                        onChange={e => handleValueChange('applicant_name', e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200"
                                    />
                                </div>

                                {/* Email line */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value="Email:"
                                        disabled
                                        className="w-24 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                                    />
                                    <input
                                        type="text"
                                        value={formData.ai_result.email || ''}
                                        onChange={e => handleValueChange('email', e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200"
                                    />
                                </div>

                                {/* Phone line */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value="Phone:"
                                        disabled
                                        className="w-24 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                                    />
                                    <input
                                        type="text"
                                        value={formData.ai_result.phone || ''}
                                        onChange={e => handleValueChange('phone', e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200"
                                    />
                                </div>

                                {/* LinkedIn line */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value="LinkedIn:"
                                        disabled
                                        className="w-24 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                                    />
                                    <input
                                        type="text"
                                        value={formData.ai_result.linkedin || ''}
                                        onChange={e => handleValueChange('linkedin', e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200"
                                    />
                                </div>

                                {/* Divider */}
                                <div>
                                    <input
                                        type="text"
                                        value="----------------------------------------"
                                        disabled
                                        className="hidden w-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                                    />
                                </div>

                                {/* Editable Cover Letter HTML */}
                                <textarea
                                    value={formData.ai_result.cover_letter_html || ''}
                                    onChange={e => handleValueChange('cover_letter_html', e.target.value)}
                                    rows={12}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200 resize-vertical"
                                />
                            </div>
                        </div>
                        {/* templates  */}
                        <div className="w-full">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Choose Template
                            </label>

                            {(!coverLetter.templates || coverLetter.templates.length === 0) ? (
                                <p className="text-gray-500 text-sm">No templates available.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {coverLetter.templates.map((tpl) => (
                                        <div
                                            key={tpl.id}
                                            onClick={async () => {
                                                // Update template_id in formData
                                                setFormData(prev => ({ ...prev, template_id: tpl.id }));

                                                // Call preview API with current AI result + new template
                                                try {
                                                    const res = await axios.post(`/cover-letters/${coverLetter.id}/preview`, {
                                                        company_name: formData.company_name,
                                                        ai_result: formData.ai_result,
                                                        template_id: tpl.id,
                                                    });
                                                    setFormData(prev => ({ ...prev, html: res.data.html }));
                                                } catch (err) {
                                                    console.error('Failed to update preview', err);
                                                }
                                            }}
                                            className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:shadow-lg ${formData.template_id === tpl.id ? 'border-blue-600 shadow-lg ring-2 ring-blue-400/40' : 'border-gray-200 dark:border-gray-700'}`}
                                        >
                                            {/* Image container */}
                                            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-3">
                                                <div
                                                    className="relative w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[260px] shadow-sm rounded-md overflow-hidden flex items-center justify-center"
                                                    style={{ aspectRatio: '3 / 4' }}
                                                >
                                                    <img
                                                        src={tpl.preview}
                                                        alt={tpl.name}
                                                        className="w-full h-full object-contain"
                                                    />

                                                    {/*  transparent overlay when selected */}
                                                    {formData.template_id === tpl.id && (
                                                        <div className="absolute inset-0 bg-blue-500/50 pointer-events-none flex items-center justify-center transition-all duration-300">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="w-10 h-10 text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Template info */}
                                            <div className="p-3 text-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                    {tpl.name}
                                                </h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                                Update
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


                {/* Blade-style Preview */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                        Preview
                    </h3>
                    <div
                        className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-200"
                        dangerouslySetInnerHTML={{ __html: formData.html }}
                    />
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
