import React, { useState, useEffect } from 'react';

import { usePage, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../Dashboard/Components/Layout';
import {
    EyeIcon, CheckIcon, TrashIcon, XMarkIcon,
    ArrowDownTrayIcon, MagnifyingGlassIcon,
    DocumentTextIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import Select from 'react-select';
import { downloadMatchReportPdf } from './reportPdf';

const formatMetricValue = (value) => `${Number(value ?? 0)}%`;
const formatMetricLabel = (key) => key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

/* ─────────────────────────────────────────────
   Styles  (ai- prefix = analytics index)
───────────────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.ai-root { font-family:'Inter',sans-serif; padding:28px 28px 48px; background:var(--ss-bg); min-height:100%; }

/* ── Header ── */
.ai-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
.ai-title    { font-size:22px; font-weight:800; color:var(--ss-text-strong); letter-spacing:-0.5px; }
.ai-subtitle { font-size:13px; color:var(--ss-text-muted); margin-top:3px; }

/* ── Cards / panels ── */
.ai-card {
    background:var(--ss-surface); border:1px solid var(--ss-alpha-07);
    border-radius:16px; padding:24px; margin-bottom:20px;
}

/* ── Section label ── */
.ai-label {
    display:block; font-size:12px; font-weight:600; color:var(--ss-text-muted);
    text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px;
}

/* ── react-select dark theme ── */
.ai-select .react-select__control {
    background:var(--ss-bg); border:1px solid var(--ss-alpha-10);
    border-radius:10px; box-shadow:none; min-height:40px;
    font-size:13px; font-family:'Inter',sans-serif;
}
.ai-select .react-select__control:hover { border-color:rgba(56,189,248,0.35); }
.ai-select .react-select__control--is-focused {
    border-color:rgba(56,189,248,0.35) !important;
    box-shadow:0 0 0 3px rgba(56,189,248,0.08) !important;
}
.ai-select .react-select__placeholder { color:var(--ss-text-muted); }
.ai-select .react-select__single-value { color:var(--ss-text); }
.ai-select .react-select__input-container { color:var(--ss-text); }
.ai-select .react-select__menu {
    background:var(--ss-surface); border:1px solid var(--ss-alpha-09);
    border-radius:10px; overflow:hidden; font-size:13px;
}
.ai-select .react-select__option { background:transparent; color:var(--ss-text-soft); padding:9px 14px; cursor:pointer; }
.ai-select .react-select__option:hover,
.ai-select .react-select__option--is-focused  { background:rgba(56,189,248,0.08); color:var(--ss-text); }
.ai-select .react-select__option--is-selected  { background:rgba(56,189,248,0.15); color:#38bdf8; }
.ai-select .react-select__indicator-separator  { background:var(--ss-alpha-08); }
.ai-select .react-select__dropdown-indicator,
.ai-select .react-select__clear-indicator { color:var(--ss-text-muted); }
.ai-select .react-select__dropdown-indicator:hover,
.ai-select .react-select__clear-indicator:hover { color:var(--ss-text-soft); }

/* ── Resume grid ── */
.ai-resume-grid-wrap {
    border:1px solid var(--ss-alpha-07);
    border-radius:12px; max-height:300px; overflow-y:auto;
    padding:12px; background:var(--ss-surface-muted);
}
.ai-resume-grid-wrap::-webkit-scrollbar { width:4px; }
.ai-resume-grid-wrap::-webkit-scrollbar-thumb { background:var(--ss-alpha-08); border-radius:10px; }

.ai-resume-grid {
    display:grid; grid-template-columns:repeat(3,1fr); gap:10px;
}
@media(max-width:900px){ .ai-resume-grid { grid-template-columns:repeat(2,1fr); } }
@media(max-width:540px){ .ai-resume-grid { grid-template-columns:1fr; } }

.ai-resume-card {
    background:var(--ss-surface); border:1px solid var(--ss-alpha-07);
    border-radius:12px; padding:14px;
    cursor:pointer; transition:all 0.18s;
    display:flex; flex-direction:column; gap:8px; position:relative;
}
.ai-resume-card:hover {
    border-color:var(--ss-alpha-14);
    background:var(--ss-surface-alt);
}
.ai-resume-card.selected {
    border-color:rgba(56,189,248,0.45) !important;
    background:rgba(56,189,248,0.09) !important;
    box-shadow:0 0 0 3px rgba(56,189,248,0.09);
}

.ai-resume-card-top {
    display:flex; align-items:center; justify-content:space-between;
}
.ai-resume-icon {
    width:28px; height:28px; border-radius:8px;
    background:rgba(129,140,248,0.12); border:1px solid rgba(129,140,248,0.20);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.ai-resume-check {
    width:20px; height:20px; border-radius:6px;
    background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.35);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.ai-resume-placeholder { width:20px; height:20px; }
.ai-resume-name {
    font-size:13px; font-weight:600; color:var(--ss-text); line-height:1.4;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.ai-resume-link {
    display:inline-flex; align-items:center; gap:4px;
    font-size:11px; color:#38bdf8; text-decoration:none; font-weight:500;
    transition:color 0.15s;
}
.ai-resume-link:hover { color:#7dd3fc; }
.ai-resume-empty {
    color:var(--ss-text-muted); font-size:13px; text-align:center;
    padding:32px 0; grid-column:1/-1;
}

/* ── Scan button ── */
.ai-btn-scan {
    display:inline-flex; align-items:center; gap:8px;
    padding:10px 22px; border-radius:10px;
    background:linear-gradient(135deg,#0ea5e9,#6366f1);
    color:#fff; font-size:13px; font-weight:700;
    border:none; cursor:pointer; transition:all 0.18s;
    box-shadow:0 4px 14px rgba(14,165,233,0.25);
}
.ai-btn-scan:hover { opacity:0.9; transform:translateY(-1px); }
.ai-btn-scan:disabled { opacity:0.55; cursor:not-allowed; transform:none; }

/* ── Scan History table ── */
.ai-table-wrap {
    background:var(--ss-surface); border:1px solid var(--ss-alpha-07);
    border-radius:14px; overflow:hidden; overflow-x:auto;
    box-shadow:0 8px 24px rgba(0,0,0,0.25);
}
.ai-table { width:100%; border-collapse:collapse; min-width:860px; }
.ai-table thead { background:var(--ss-alpha-02); }
.ai-table th {
    padding:12px 14px; text-align:left;
    font-size:11px; font-weight:600; color:var(--ss-text-muted);
    text-transform:uppercase; letter-spacing:0.8px;
    border-bottom:1px solid var(--ss-alpha-05); white-space:nowrap;
}
.ai-table td {
    padding:12px 14px; font-size:13px; color:var(--ss-text-soft);
    border-bottom:1px solid var(--ss-alpha-04); white-space:nowrap;
}
.ai-table tbody tr:last-child td { border-bottom:none; }
.ai-table tbody tr:hover td { background:var(--ss-alpha-02); }
.ai-table td.ai-td-name { color:var(--ss-text); font-weight:500; white-space:normal; }
.ai-table td.ai-td-link a {
    color:#38bdf8; text-decoration:none; font-size:13px; transition:color 0.15s;
}
.ai-table td.ai-td-link a:hover { color:#7dd3fc; }

/* ── Score badges ── */
.ai-score {
    display:inline-flex; align-items:center;
    padding:3px 9px; border-radius:20px; font-size:12px; font-weight:600;
}
.ai-score-blue   { background:rgba(56,189,248,0.10);  color:#38bdf8; }
.ai-score-green  { background:rgba(52,211,153,0.10);  color:#34d399; }
.ai-score-purple { background:rgba(139,92,246,0.10);  color:#a78bfa; }
.ai-score-orange { background:rgba(251,146,60,0.10);  color:#fb923c; }
.ai-score-red    { background:rgba(248,113,113,0.10); color:#f87171; }

/* ── Action buttons ── */
.ai-actions { display:flex; align-items:center; gap:6px; }
.ai-action-btn {
    width:30px; height:30px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    border:1px solid transparent; cursor:pointer;
    background:none; transition:all 0.16s; text-decoration:none; flex-shrink:0;
}
.ai-action-view     { color:#38bdf8; background:rgba(56,189,248,0.08);  border-color:rgba(56,189,248,0.15); }
.ai-action-del      { color:#f87171; background:rgba(248,113,113,0.08); border-color:rgba(248,113,113,0.15); }
.ai-action-download { color:#34d399; background:rgba(52,211,153,0.08);  border-color:rgba(52,211,153,0.15); }
.ai-action-view:hover     { background:rgba(56,189,248,0.18); }
.ai-action-del:hover      { background:rgba(248,113,113,0.18); }
.ai-action-download:hover { background:rgba(52,211,153,0.18); }
.ai-action-btn:disabled   { opacity:0.4; cursor:not-allowed; }

/* ── Pagination ── */
.ai-pagination-row {
    display:flex; align-items:center; justify-content:space-between;
    margin-top:18px; flex-wrap:wrap; gap:12px;
}
.ai-per-page { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--ss-text-muted); }
.ai-per-page-select {
    background:var(--ss-surface); border:1px solid var(--ss-alpha-08);
    color:var(--ss-text-soft); border-radius:8px; padding:5px 10px; font-size:13px;
    font-family:'Inter',sans-serif; outline:none; cursor:pointer;
}
.ai-per-page-select:focus { border-color:rgba(56,189,248,0.30); }
.ai-per-page-total { color:var(--ss-text-muted); }
.ai-links { display:flex; gap:4px; flex-wrap:wrap; }
.ai-page-btn {
    padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600;
    border:1px solid var(--ss-alpha-07);
    background:var(--ss-surface); color:var(--ss-text-muted);
    text-decoration:none; cursor:pointer; transition:all 0.16s;
    white-space:nowrap; display:inline-block;
}
.ai-page-btn:hover { background:var(--ss-alpha-05); color:var(--ss-text-soft); }
.ai-page-btn-active   { background:rgba(14,165,233,0.12) !important; color:#38bdf8 !important; border-color:rgba(14,165,233,0.25) !important; }
.ai-page-btn-disabled { opacity:0.35; pointer-events:none; }

/* ── Delete Modal ── */
.ai-modal-backdrop {
    position:fixed; inset:0; z-index:60;
    background:var(--ss-overlay); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
}
.ai-modal {
    position:relative; z-index:61;
    background:var(--ss-surface); border:1px solid var(--ss-alpha-09);
    border-radius:18px; padding:32px 28px;
    width:500px; max-width:90vw;
    box-shadow:0 24px 60px rgba(0,0,0,0.5);
    font-family:'Inter',sans-serif;
}
.ai-modal-close {
    position:absolute; top:14px; right:14px;
    width:28px; height:28px; border-radius:7px;
    background:var(--ss-alpha-05); border:1px solid var(--ss-alpha-08);
    color:var(--ss-text-muted); cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all 0.18s;
}
.ai-modal-close:hover { background:var(--ss-alpha-09); color:var(--ss-text-soft); }
.ai-modal-icon {
    width:48px; height:48px; border-radius:14px;
    background:rgba(248,113,113,0.12); border:1px solid rgba(248,113,113,0.22);
    display:flex; align-items:center; justify-content:center; margin-bottom:16px;
}
.ai-modal-title { font-size:17px; font-weight:700; color:var(--ss-text-strong); margin-bottom:8px; }
.ai-modal-desc  { font-size:14px; color:var(--ss-text-muted); line-height:1.6; margin-bottom:24px; }
.ai-modal-actions { display:flex; gap:10px; justify-content:flex-end; }
.ai-modal-cancel {
    padding:9px 20px; border-radius:9px;
    background:var(--ss-alpha-05); border:1px solid var(--ss-alpha-09);
    color:var(--ss-text-subtle); font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s;
    font-family:'Inter',sans-serif;
}
.ai-modal-cancel:hover { background:var(--ss-alpha-08); color:var(--ss-text-soft); }
.ai-modal-delete {
    padding:9px 20px; border-radius:9px;
    background:linear-gradient(135deg,#dc2626,#b91c1c); border:none;
    color:#fff; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s;
    box-shadow:0 4px 14px rgba(220,38,38,0.30); font-family:'Inter',sans-serif;
}
.ai-modal-delete:hover { opacity:0.9; transform:translateY(-1px); }

/* ── Full-screen loading overlay ── */
.ai-loading-overlay {
    position:fixed; inset:0; z-index:50;
    background:var(--ss-overlay); backdrop-filter:blur(3px);
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px;
}
.ai-spinner {
    width:52px; height:52px; border-radius:50%;
    border:4px solid var(--ss-alpha-10);
    border-top-color:#38bdf8;
    animation:ai-spin 0.9s linear infinite;
}
.ai-spinner-label { font-size:13px; color:var(--ss-text-soft); font-weight:500; }
@keyframes ai-spin { to { transform:rotate(360deg); } }

/* ── Section title inside history card ── */
.ai-section-title { font-size:15px; font-weight:700; color:var(--ss-text-strong); margin-bottom:16px; }

@media (max-width: 767px) {
    .ai-root { padding:20px 14px 36px; }
    .ai-card { padding:18px 14px; }
    .ai-btn-scan { justify-content:center; width:100%; }
    .ai-pagination-row { align-items:flex-start; }
}
`;

const TOAST_OPTS = {
    style: {
        background: 'var(--ss-surface)', color: 'var(--ss-text)',
        border: '1px solid var(--ss-alpha-08)',
        borderRadius: '10px', fontSize: '13px',
    },
    success: { iconTheme: { primary: '#22c55e', secondary: 'var(--ss-surface)' } },
    error:   { iconTheme: { primary: '#f87171', secondary: 'var(--ss-surface)' } },
};

/* helper: score → badge class */
const scoreBadge = (val, type = 'blue') => {
    const map = { blue:'ai-score-blue', green:'ai-score-green', purple:'ai-score-purple', orange:'ai-score-orange', red:'ai-score-red' };
    return `ai-score ${map[type] || 'ai-score-blue'}`;
};

export default function Analytics({ jobs, resumes, matchedHistory: initialHistory, pagination }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [selectedJob,     setSelectedJob]     = useState('');
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [matchedHistory,  setMatchedHistory]  = useState(initialHistory || []);
    const [loading,         setLoading]         = useState(false);
    const [isModalOpen,     setIsModalOpen]     = useState(false);
    const [matchToDelete,   setMatchToDelete]   = useState(null);
    const [downloading,     setDownloading]     = useState(null);
    const [perPage,         setPerPage]         = useState(pagination.per_page || 10);
    const [currentPage,     setCurrentPage]     = useState(pagination.current_page || 1);

    /* flash toasts */
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error)   toast.error(flash.error);
    }, [flash]);

    /* body scroll lock */
    useEffect(() => {
        document.body.style.overflow = isModalOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isModalOpen]);

    /* scroll to history table */
    const scrollToMatchedHistory = () => {
        const el = document.querySelector('.ai-history-anchor');
        if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    };

    /* per-page change */
    const handlePerPageChange = (e) => {
        const newPerPage = e.target.value;
        setPerPage(newPerPage);
        setCurrentPage(1);
        router.get(location.pathname, { per_page: newPerPage, page: 1 });
        setTimeout(scrollToMatchedHistory, 300);
    };

    /* job select options */
    const jobOptions = jobs.map(job => ({ value: job.id, label: job.title }));

    /* resume toggle */
    const handleResumeSelect = (id) => {
        setSelectedResumes(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    /* delete flow */
    const confirmDelete = (matchId) => { setMatchToDelete(matchId); setIsModalOpen(true); };
    const handleDelete  = () => {
        if (!matchToDelete) return;
        router.delete(route('analytics.destroy', matchToDelete), {
            preserveState: true,
            onSuccess: (page) => {
                toast.success(page.props.flash?.success || 'Record successfully deleted');
                setMatchedHistory(prev => prev.filter(m => m.id !== matchToDelete));
                setIsModalOpen(false);
                setMatchToDelete(null);
            },
            onError: () => {
                toast.error('Failed to delete match.');
                setIsModalOpen(false);
                setMatchToDelete(null);
            },
        });
    };

    /* scan */
    const handleScan = () => {
        if (!selectedJob)                { toast.error('Please select a job.');               return; }
        if (selectedResumes.length === 0){ toast.error('Please select at least one resume.'); return; }
        setLoading(true);
        const jobId = typeof selectedJob === 'object' ? selectedJob.value : selectedJob;
        router.post('/analytics/scan', { job_id: jobId, resume_ids: selectedResumes }, {
            preserveState: true,
            replace: true,
            onSuccess: (page) => {
                setLoading(false);
                toast.success(page.props.flash?.success || 'Scanned successfully');
                if (page.props.matchedHistory) setMatchedHistory(page.props.matchedHistory);
                setSelectedResumes([]);
                setSelectedJob([]);
            },
            onError: () => setLoading(false),
        });
    };

    const handleDownload = async (matchId) => {
        setDownloading(matchId);
        try {
            const match = matchedHistory.find(m => m.id === matchId);
            if (!match) throw new Error('Match not found');

            const aiData = parseAi(match);
            const job = jobs.find(item => item.id === match.job_description_id);
            downloadMatchReportPdf({
                match,
                aiData,
                jobTitle: job?.title,
                resumeName: match.resume_name,
            });
            toast.success('PDF downloaded successfully!');
        } catch (err) {
            console.error('[PDF] Error during download:', err);
            toast.error('Failed to download PDF.');
        } finally {
            setDownloading(null);
        }
    };

    /* parse ai_result safely */
    const parseAi = (match) =>
        typeof match.ai_result === 'string'
            ? (() => { try { return JSON.parse(match.ai_result); } catch { return { ai_text: match.ai_result }; } })()
            : match.ai_result || { ai_text: 'No report available' };

    return (
        <Layout>
            <style>{styles}</style>
            <Toaster position="top-right" toastOptions={TOAST_OPTS} />
            <Head title="Analytics" />

            {/* ── Loading overlay ── */}
            {loading && (
                <div className="ai-loading-overlay">
                    <div className="ai-spinner" />
                    <span className="ai-spinner-label">Scanning resumes…</span>
                </div>
            )}

            <div className="ai-root">

                {/* ── Page header ── */}
                <div className="ai-header">
                    <div>
                        <div className="ai-title">Analytics</div>
                        <div className="ai-subtitle">Scan resumes against job descriptions and review match history.</div>
                    </div>
                </div>

                {/* ── Scan panel ── */}
                <div className="ai-card">

                    {/* Job selector */}
                    <div style={{ marginBottom: 20 }}>
                        <span className="ai-label">Select Job</span>
                        <div className="ai-select">
                            <Select
                                value={selectedJob}
                                onChange={setSelectedJob}
                                options={jobOptions}
                                placeholder="Search and select a job…"
                                classNamePrefix="react-select"
                                isClearable
                                isSearchable
                            />
                        </div>
                    </div>

                    {/* Resume grid */}
                    <div style={{ marginBottom: 20 }}>
                        <span className="ai-label">Select Resumes</span>
                        <div className="ai-resume-grid-wrap">
                            {resumes.length > 0 ? (
                                <div className="ai-resume-grid">
                                    {resumes.map((resume) => {
                                        const isSelected = selectedResumes.includes(resume.id);
                                        return (
                                            <div
                                                key={resume.id}
                                                onClick={() => handleResumeSelect(resume.id)}
                                                className={`ai-resume-card${isSelected ? ' selected' : ''}`}
                                            >
                                                {/* Top row: icon + check */}
                                                <div className="ai-resume-card-top">
                                                    <div className="ai-resume-icon">
                                                        <DocumentTextIcon style={{ width: 15, height: 15, color: '#818cf8' }} />
                                                    </div>
                                                    {isSelected
                                                        ? <div className="ai-resume-check"><CheckIcon style={{ width: 12, height: 12, color: '#38bdf8' }} /></div>
                                                        : <div className="ai-resume-placeholder" />
                                                    }
                                                </div>
                                                {/* Name */}
                                                <div className="ai-resume-name" title={resume.name}>{resume.name}</div>
                                                {/* View link */}
                                                {resume.file_url && (
                                                    <a
                                                        href={resume.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ai-resume-link"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <ArrowTopRightOnSquareIcon style={{ width: 11, height: 11 }} />
                                                        View file
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="ai-resume-empty">
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                                    No resumes found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scan button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="ai-btn-scan" onClick={handleScan} disabled={loading}>
                            <MagnifyingGlassIcon style={{ width: 15, height: 15 }} />
                            {loading ? 'Scanning…' : 'Scan Selected'}
                        </button>
                    </div>
                </div>

                {/* ── Scan History ── */}
                {matchedHistory.length > 0 && (
                    <div className="ai-card ai-history-anchor">
                        <div className="ai-section-title">Scan History</div>

                        <div className="ai-table-wrap">
                            <table className="ai-table">
                                <thead>
                                    <tr>
                                        <th>Resume</th>
                                        <th>Job</th>
                                        <th>Match %</th>
                                        <th>ATS Score %</th>
                                        <th>Semantic %</th>
                                        <th>Keyword %</th>
                                        <th>Keyword Gap</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchedHistory.map((match) => {
                                        const aiData = parseAi(match);
                                        return (
                                            <React.Fragment key={match.id}>
                                                <tr>
                                                    <td className="ai-td-name">{match.resume_name || aiData.resume_name || 'N/A'}</td>
                                                    <td className="ai-td-link">
                                                        <a href={`/jobs/${match.job_description_id}`}>
                                                            {jobs.find(j => j.id === match.job_description_id)?.title || 'N/A'}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <span className={scoreBadge(aiData.overall_match_percentage, 'blue')}>
                                                            {aiData.overall_match_percentage ?? '-'}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={scoreBadge(aiData.ats_best_practice?.ats_score, 'green')}>
                                                            {aiData.ats_best_practice?.ats_score ?? 0}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={scoreBadge(aiData.scores?.semantic_score, 'purple')}>
                                                            {aiData.scores?.semantic_score ?? '-'}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={scoreBadge(aiData.scores?.keyword_score, 'orange')}>
                                                            {aiData.scores?.keyword_score ?? '-'}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={scoreBadge(aiData.scores?.keyword_gap, 'red')}>
                                                            {aiData.scores?.keyword_gap ?? '-'}%
                                                        </span>
                                                    </td>
                                                    <td>{new Date(match.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="ai-actions">
                                                            <button
                                                                className="ai-action-btn ai-action-view"
                                                                title="View"
                                                                onClick={() => Inertia.get(`/analytics/match-history/${match.id}`)}
                                                            >
                                                                <EyeIcon style={{ width: 14, height: 14 }} />
                                                            </button>
                                                            <button
                                                                className="ai-action-btn ai-action-del"
                                                                title="Delete"
                                                                onClick={() => confirmDelete(match.id)}
                                                            >
                                                                <TrashIcon style={{ width: 14, height: 14 }} />
                                                            </button>
                                                            <button
                                                                className="ai-action-btn ai-action-download"
                                                                title="Download PDF"
                                                                disabled={downloading === match.id}
                                                                onClick={() => handleDownload(match.id)}
                                                            >
                                                                {downloading === match.id
                                                                    ? <span style={{ fontSize: 10, color: '#34d399' }}>…</span>
                                                                    : <ArrowDownTrayIcon style={{ width: 14, height: 14 }} />
                                                                }
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        <div className="ai-pagination-row">
                            <div className="ai-per-page">
                                <span>Show</span>
                                <select
                                    className="ai-per-page-select"
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                >
                                    {[10, 25, 50, 100].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                                <span className="ai-per-page-total">of {pagination.total} entries</span>
                            </div>
                            <div className="ai-links">
                                {pagination.links
                                    .filter(l => l.url || l.label === '&laquo; Previous' || l.label === 'Next &raquo;')
                                    .map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            onClick={scrollToMatchedHistory}
                                            className={`ai-page-btn ${link.active ? 'ai-page-btn-active' : ''} ${!link.url ? 'ai-page-btn-disabled' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Hidden PDF report divs (unchanged — required for html2canvas) ── */}
            {matchedHistory.map((match) => {
                const aiData = parseAi(match);
                const job = jobs.find(item => item.id === match.job_description_id);
                return (
                    <div
                        key={`report-${match.id}`}
                        id={`report-content-${match.id}`}
                        className="hidden w-full bg-white p-8 text-slate-800"
                        style={{ background: 'white' }}
                    >
                        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 px-8 py-7 text-slate-900 shadow-sm">
                            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">SkillSync.ai</div>
                            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Match Report</h2>
                            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                                Analytics summary with ATS best-practice checks, skills coverage, and recommendation details.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                                <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                                    Resume: {match.resume_name || 'N/A'}
                                </div>
                                <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                                    Job: {job?.title || 'N/A'}
                                </div>
                                <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                                    Generated: {new Date(match.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            {[
                                { label: 'Overall Match', value: formatMetricValue(aiData.overall_match_percentage), color: 'bg-sky-500' },
                                { label: 'ATS Score', value: formatMetricValue(aiData.ats_best_practice?.ats_score), color: 'bg-emerald-500' },
                                { label: 'Semantic Score', value: formatMetricValue(aiData.scores?.semantic_score), color: 'bg-violet-500' },
                                { label: 'Keyword Score', value: formatMetricValue(aiData.scores?.keyword_score), color: 'bg-orange-500' },
                                { label: 'Keyword Gap', value: formatMetricValue(aiData.scores?.keyword_gap), color: 'bg-rose-500' },
                            ].map((metric) => (
                                <div
                                    key={metric.label}
                                    className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm ${metric.label === 'Keyword Gap' ? 'col-span-2' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`h-10 w-2 rounded-full ${metric.color}`} />
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</div>
                                            <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{metric.value}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm break-inside-avoid">
                            <h3 className="text-xl font-semibold text-slate-900">ATS Best Practices</h3>
                            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200 text-left">
                                    <thead className="bg-sky-50 text-sm uppercase tracking-[0.18em] text-sky-700">
                                        <tr>
                                            <th className="px-4 py-3">Check</th>
                                            <th className="px-4 py-3">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white text-sm leading-6 text-slate-600">
                                        {Object.entries(aiData.ats_best_practice || {})
                                            .filter(([key]) => key !== 'ats_score')
                                            .map(([key, value]) => (
                                                <tr key={key}>
                                                    <td className="px-4 py-3 font-semibold text-slate-900">{formatMetricLabel(key)}</td>
                                                    <td className="px-4 py-3">{value}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm break-inside-avoid">
                            <h3 className="text-xl font-semibold text-slate-900">Skills Analysis</h3>
                            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200 text-left">
                                    <thead className="bg-sky-50 text-sm uppercase tracking-[0.18em] text-sky-700">
                                        <tr>
                                            <th className="px-4 py-3">Skill</th>
                                            <th className="px-4 py-3">Resume</th>
                                            <th className="px-4 py-3">Job</th>
                                            <th className="px-4 py-3">Gap</th>
                                            <th className="px-4 py-3">Matched</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-600">
                                        {aiData.skills_analysis?.map((skill) => (
                                            <tr key={skill.skill}>
                                                <td className="px-4 py-3 font-semibold text-slate-900">{skill.skill}</td>
                                                <td className="px-4 py-3">{skill.resume_count}</td>
                                                <td className="px-4 py-3">{skill.job_count}</td>
                                                <td className="px-4 py-3">{skill.gap}</td>
                                                <td className="px-4 py-3">
                                                    {skill.matched ? (
                                                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                                            Yes
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                                                            No
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 break-inside-avoid strength-weakness">
                            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
                                <h3 className="text-xl font-semibold text-emerald-900">Strengths</h3>
                                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-emerald-950">
                                    {aiData.strengths ?? 'N/A'}
                                </p>
                            </div>
                            <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">
                                <h3 className="text-xl font-semibold text-rose-900">Weaknesses</h3>
                                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-rose-950">
                                    {aiData.weaknesses ?? 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm break-inside-avoid">
                            <h3 className="text-xl font-semibold text-slate-900">Detailed Analysis</h3>
                            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                {aiData.ai_text || 'No report available'}
                            </p>
                        </div>
                    </div>
                );
            })}

            {/* ── Delete Modal ── */}
            {isModalOpen && (
                <div className="ai-modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="ai-modal" onClick={e => e.stopPropagation()}>
                        <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}>
                            <XMarkIcon style={{ width: 14, height: 14 }} />
                        </button>
                        <div className="ai-modal-icon">
                            <TrashIcon style={{ width: 22, height: 22, color: '#f87171' }} />
                        </div>
                        <div className="ai-modal-title">Delete Match?</div>
                        <div className="ai-modal-desc">
                            Are you sure you want to delete this match record? This action cannot be undone.
                        </div>
                        <div className="ai-modal-actions">
                            <button className="ai-modal-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="ai-modal-delete" onClick={handleDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
