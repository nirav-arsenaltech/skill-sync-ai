import Layout from "../Dashboard/Components/Layout";
import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import toast, { Toaster } from "react-hot-toast";
import { Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import {
    TrashIcon,
    XMarkIcon,
    EyeIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.ip-root { font-family:'Inter',sans-serif; padding:28px 28px 48px; background:var(--ss-bg); min-height:100%; }

/* ── Header ── */
.ip-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
.ip-title    { font-size:22px; font-weight:800; color:var(--ss-text-strong); letter-spacing:-0.5px; }
.ip-subtitle { font-size:13px; color:var(--ss-text-muted); margin-top:3px; }

.ip-btn-create {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; border-radius:10px;
    background:linear-gradient(135deg,#0ea5e9,#6366f1);
    color:#fff; font-size:13px; font-weight:700;
    text-decoration:none; transition:all 0.18s;
    box-shadow:0 4px 14px rgba(14,165,233,0.25); border:none; cursor:pointer;
}
.ip-btn-create:hover { opacity:0.9; transform:translateY(-1px); }

/* ── Table ── */
.ip-table-wrap {
    background:var(--ss-surface); border:1px solid var(--ss-alpha-07);
    border-radius:14px; overflow:hidden;
}
.ip-table { width:100%; border-collapse:collapse; }
.ip-table thead { background:var(--ss-alpha-02); }
.ip-table th {
    padding:12px 18px; text-align:left;
    font-size:11px; font-weight:600; color:var(--ss-text-muted);
    text-transform:uppercase; letter-spacing:0.8px;
    border-bottom:1px solid var(--ss-alpha-05); white-space:nowrap;
}
.ip-table td {
    padding:13px 18px; font-size:13px; color:var(--ss-text-soft);
    border-bottom:1px solid var(--ss-alpha-04); word-break:break-word;
}
.ip-table tbody tr:last-child td { border-bottom:none; }
.ip-table tbody tr:hover td { background:var(--ss-alpha-02); }
.ip-table td.ip-td-id   { color:var(--ss-text-muted); font-size:12px; text-align:center; width:56px; }
.ip-table td.ip-td-link a {
    color:#38bdf8; text-decoration:none; font-size:13px; transition:color 0.15s;
}
.ip-table td.ip-td-link a:hover { color:#7dd3fc; }

/* ── Action buttons ── */
.ip-actions { display:flex; align-items:center; gap:6px; }
.ip-action-btn {
    width:30px; height:30px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    border:1px solid transparent; cursor:pointer;
    background:none; transition:all 0.16s; text-decoration:none; flex-shrink:0;
}
.ip-action-view { color:#38bdf8; background:rgba(56,189,248,0.08);  border-color:rgba(56,189,248,0.15); }
.ip-action-del  { color:#f87171; background:rgba(248,113,113,0.08); border-color:rgba(248,113,113,0.15); }
.ip-action-view:hover { background:rgba(56,189,248,0.18); }
.ip-action-del:hover  { background:rgba(248,113,113,0.18); }

/* ── Empty state ── */
.ip-empty {
    padding:52px 20px; text-align:center;
    background:var(--ss-surface); border:1px solid var(--ss-alpha-07); border-radius:14px;
}
.ip-empty-icon { font-size:36px; margin-bottom:10px; }
.ip-empty-text { font-size:14px; color:var(--ss-text-muted); font-weight:500; margin-bottom:16px; }

/* ── Pagination ── */
.ip-pagination-row {
    display:flex; align-items:center; justify-content:space-between;
    margin-top:18px; flex-wrap:wrap; gap:12px;
}
.ip-per-page { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--ss-text-muted); }
.ip-per-page-select {
    background:var(--ss-surface); border:1px solid var(--ss-alpha-08);
    color:var(--ss-text-soft); border-radius:8px; padding:5px 10px; font-size:13px;
    font-family:'Inter',sans-serif; outline:none; cursor:pointer;
}
.ip-per-page-select:focus { border-color:rgba(56,189,248,0.30); }
.ip-per-page-total { color:var(--ss-text-muted); }
.ip-links { display:flex; gap:4px; flex-wrap:wrap; }
.ip-page-btn {
    padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600;
    border:1px solid var(--ss-alpha-07);
    background:var(--ss-surface); color:var(--ss-text-muted);
    text-decoration:none; cursor:pointer;
    transition:all 0.16s; white-space:nowrap; display:inline-block;
}
.ip-page-btn:hover { background:var(--ss-alpha-05); color:var(--ss-text-soft); }
.ip-page-btn-active   { background:rgba(14,165,233,0.12) !important; color:#38bdf8 !important; border-color:rgba(14,165,233,0.25) !important; }
.ip-page-btn-disabled { opacity:0.35; pointer-events:none; }

/* ── Delete Modal ── */
.ip-modal-backdrop {
    position:fixed; inset:0; z-index:60;
    background:var(--ss-overlay); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
}
.ip-modal {
    position:relative; z-index:61;
    background:var(--ss-surface); border:1px solid var(--ss-alpha-09);
    border-radius:18px; padding:32px 28px;
    width:500px; max-width:90vw;
    box-shadow:0 24px 60px rgba(0,0,0,0.5);
    font-family:'Inter',sans-serif;
}
.ip-modal-close {
    position:absolute; top:14px; right:14px;
    width:28px; height:28px; border-radius:7px;
    background:var(--ss-alpha-05); border:1px solid var(--ss-alpha-08);
    color:var(--ss-text-muted); cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all 0.18s;
}
.ip-modal-close:hover { background:var(--ss-alpha-09); color:var(--ss-text-soft); }
.ip-modal-icon {
    width:48px; height:48px; border-radius:14px;
    background:rgba(248,113,113,0.12); border:1px solid rgba(248,113,113,0.22);
    display:flex; align-items:center; justify-content:center; margin-bottom:16px;
}
.ip-modal-title { font-size:17px; font-weight:700; color:var(--ss-text-strong); margin-bottom:8px; }
.ip-modal-desc  { font-size:14px; color:var(--ss-text-muted); line-height:1.6; margin-bottom:24px; }
.ip-modal-actions { display:flex; gap:10px; justify-content:flex-end; }
.ip-modal-cancel {
    padding:9px 20px; border-radius:9px;
    background:var(--ss-alpha-05); border:1px solid var(--ss-alpha-09);
    color:var(--ss-text-subtle); font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s;
    font-family:'Inter',sans-serif;
}
.ip-modal-cancel:hover { background:var(--ss-alpha-08); color:var(--ss-text-soft); }
.ip-modal-delete {
    padding:9px 20px; border-radius:9px;
    background:linear-gradient(135deg,#dc2626,#b91c1c); border:none;
    color:#fff; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s;
    box-shadow:0 4px 14px rgba(220,38,38,0.30); font-family:'Inter',sans-serif;
}
.ip-modal-delete:hover { opacity:0.9; transform:translateY(-1px); }
`;

const TOAST_OPTS = {
    style: {
        background: "var(--ss-surface)",
        color: "var(--ss-text)",
        border: "1px solid var(--ss-alpha-08)",
        borderRadius: "10px",
        fontSize: "13px",
    },
    success: { iconTheme: { primary: "#22c55e", secondary: "var(--ss-surface)" } },
    error: { iconTheme: { primary: "#f87171", secondary: "var(--ss-surface)" } },
};

export default function InterviewPrepIndex() {
    const { props } = usePage();
    const { InterviewPreps, flash } = props;

    const [deleteId, setDeleteId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/interview-preps/${deleteId}`, {
            onSuccess: () => {
                setIsModalOpen(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <Layout>
            <style>{styles}</style>
            <Toaster position="top-right" toastOptions={TOAST_OPTS} />
            <Head title="Interview Preps" />

            <div className="ip-root">
                {/* ── Header ── */}
                <div className="ip-header">
                    <div>
                        <div className="ip-title">Interview Preparations</div>
                        <div className="ip-subtitle">
                            Manage and review all your interview prep sessions.
                        </div>
                    </div>
                    <Link
                        href="/interview-preps/create"
                        className="ip-btn-create"
                    >
                        <PlusIcon style={{ width: 15, height: 15 }} />
                        Create Interview Prep
                    </Link>
                </div>

                {/* ── Table ── */}
                {InterviewPreps?.data?.length > 0 ? (
                    <div className="ip-table-wrap">
                        <table className="ip-table">
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "center" }}>#</th>
                                    <th>Job</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {InterviewPreps.data.map((ip) => (
                                    <tr key={ip.id}>
                                        <td className="ip-td-id">{ip.id}</td>
                                        <td className="ip-td-link">
                                            <a
                                                href={`/jobs/${ip.job_description_id}`}
                                            >
                                                {ip.job?.title || "—"}
                                            </a>
                                        </td>
                                        <td>
                                            {new Date(
                                                ip.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="ip-actions">
                                                <button
                                                    className="ip-action-btn ip-action-view"
                                                    title="View"
                                                    onClick={() =>
                                                        Inertia.get(
                                                            `/interview-preps/${ip.id}`,
                                                        )
                                                    }
                                                >
                                                    <EyeIcon
                                                        style={{
                                                            width: 14,
                                                            height: 14,
                                                        }}
                                                    />
                                                </button>
                                                <button
                                                    className="ip-action-btn ip-action-del"
                                                    title="Delete"
                                                    onClick={() =>
                                                        confirmDelete(ip.id)
                                                    }
                                                >
                                                    <TrashIcon
                                                        style={{
                                                            width: 14,
                                                            height: 14,
                                                        }}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="ip-empty">
                        <div className="ip-empty-icon">🎯</div>
                        <div className="ip-empty-text">
                            No interview preps found. Create your first one!
                        </div>
                        <Link
                            href="/interview-preps/create"
                            className="ip-btn-create"
                        >
                            <PlusIcon style={{ width: 14, height: 14 }} />{" "}
                            Create Interview Prep
                        </Link>
                    </div>
                )}

                {/* ── Pagination ── */}
                {InterviewPreps.total > 10 && (
                    <div className="ip-pagination-row">
                        <div className="ip-per-page">
                            <span>Show</span>
                            <select
                                className="ip-per-page-select"
                                value={InterviewPreps.per_page}
                                onChange={(e) =>
                                    router.get(
                                        location.pathname,
                                        { per_page: e.target.value },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            >
                                {[10, 25, 50, 100].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span className="ip-per-page-total">
                                of {InterviewPreps.total} entries
                            </span>
                        </div>

                        <div className="ip-links">
                            {InterviewPreps.links
                                .filter(
                                    (l) =>
                                        l.url ||
                                        l.label === "&laquo; Previous" ||
                                        l.label === "Next &raquo;",
                                )
                                .map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        className={`ip-page-btn ${link.active ? "ip-page-btn-active" : ""} ${!link.url ? "ip-page-btn-disabled" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Delete Modal ── */}
            {isModalOpen && (
                <div
                    className="ip-modal-backdrop"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="ip-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="ip-modal-close"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <XMarkIcon style={{ width: 14, height: 14 }} />
                        </button>
                        <div className="ip-modal-icon">
                            <TrashIcon
                                style={{
                                    width: 22,
                                    height: 22,
                                    color: "#f87171",
                                }}
                            />
                        </div>
                        <div className="ip-modal-title">
                            Delete Interview Prep?
                        </div>
                        <div className="ip-modal-desc">
                            Are you sure you want to delete this interview prep?
                            This action cannot be undone.
                        </div>
                        <div className="ip-modal-actions">
                            <button
                                className="ip-modal-cancel"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="ip-modal-delete"
                                onClick={handleDelete}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
