import { useState, useEffect } from "react";
import { router, Link, usePage, Head } from "@inertiajs/react";
import toast, { Toaster } from "react-hot-toast";
import Layout from "../Dashboard/Components/Layout";
import {
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";

const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .ri-root { font-family: 'Inter', sans-serif; padding: 28px 28px 48px; background: var(--ss-bg); min-height: 100%; }

    /* Header */
    .ri-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .ri-title    { font-size: 22px; font-weight: 800; color: var(--ss-text-strong); letter-spacing: -0.5px; }
    .ri-subtitle { font-size: 13px; color: var(--ss-text-muted); margin-top: 3px; }

    .ri-btn-create {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 9px 18px; border-radius: 10px;
        background: linear-gradient(135deg, #0ea5e9, #6366f1);
        color: #fff; font-size: 13px; font-weight: 700;
        text-decoration: none; transition: all 0.18s;
        box-shadow: 0 4px 14px rgba(14,165,233,0.25); border: none; cursor: pointer;
    }
    .ri-btn-create:hover { opacity: 0.9; transform: translateY(-1px); }

    /* Search bar */
    .ri-search-row { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
    .ri-search-wrap { position: relative; flex: 1; }
    .ri-search-icon {
        position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
        color: var(--ss-text-muted); pointer-events: none;
    }
    .ri-search-input {
        width: 100%; padding: 10px 40px 10px 38px;
        background: var(--ss-surface); border: 1px solid var(--ss-alpha-08);
        border-radius: 10px; color: var(--ss-text); font-size: 13px;
        font-family: 'Inter', sans-serif; outline: none; transition: all 0.18s;
    }
    .ri-search-input::placeholder { color: var(--ss-text-muted); }
    .ri-search-input:focus { border-color: rgba(56,189,248,0.35); box-shadow: 0 0 0 3px rgba(56,189,248,0.08); }
    .ri-search-clear {
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: var(--ss-text-muted); cursor: pointer;
        display: flex; align-items: center; padding: 2px; border-radius: 5px;
        transition: color 0.15s;
    }
    .ri-search-clear:hover { color: var(--ss-text-soft); }

    .ri-btn-search {
        padding: 10px 18px; border-radius: 10px;
        background: rgba(56,189,248,0.10); border: 1px solid rgba(56,189,248,0.20);
        color: #38bdf8; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all 0.18s; white-space: nowrap;
        font-family: 'Inter', sans-serif;
    }
    .ri-btn-search:hover { background: rgba(56,189,248,0.18); }

    /* Table */
    .ri-table-wrap {
        background: var(--ss-surface);
        border: 1px solid var(--ss-alpha-07);
        border-radius: 14px; overflow: hidden;
    }
    .ri-table { width: 100%; border-collapse: collapse; }
    .ri-table thead { background: var(--ss-alpha-02); }
    .ri-table th {
        padding: 12px 18px; text-align: left;
        font-size: 11px; font-weight: 600; color: var(--ss-text-muted);
        text-transform: uppercase; letter-spacing: 0.8px;
        border-bottom: 1px solid var(--ss-alpha-05);
    }
    .ri-table td {
        padding: 13px 18px; font-size: 13px; color: var(--ss-text-soft);
        border-bottom: 1px solid var(--ss-alpha-04);
        word-break: break-word;
    }
    .ri-table tbody tr:last-child td { border-bottom: none; }
    .ri-table tbody tr:hover td { background: var(--ss-alpha-02); }
    .ri-table td.ri-td-id    { color: var(--ss-text-muted); font-size: 12px; text-align: center; width: 56px; }
    .ri-table td.ri-td-name  { color: var(--ss-text); font-weight: 500; }
    .ri-table td.ri-td-file a {
        color: #38bdf8; text-decoration: none; font-size: 13px;
        display: inline-flex; align-items: center; gap: 5px;
        transition: color 0.15s;
    }
    .ri-table td.ri-td-file a:hover { color: #7dd3fc; }

    /* Action buttons */
    .ri-actions { display: flex; align-items: center; gap: 6px; }
    .ri-action-btn {
        width: 30px; height: 30px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid transparent; cursor: pointer;
        background: none; transition: all 0.16s; text-decoration: none;
        flex-shrink: 0;
    }
    .ri-action-edit { color: #34d399; background: rgba(52,211,153,0.08);  border-color: rgba(52,211,153,0.15); }
    .ri-action-del  { color: #f87171; background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.15); }
    .ri-action-edit:hover { background: rgba(52,211,153,0.18); }
    .ri-action-del:hover  { background: rgba(248,113,113,0.18); }

    /* Empty state */
    .ri-empty {
        padding: 52px 20px; text-align: center;
        background: var(--ss-surface); border: 1px solid var(--ss-alpha-07); border-radius: 14px;
    }
    .ri-empty-icon { font-size: 36px; margin-bottom: 10px; }
    .ri-empty-text { font-size: 14px; color: var(--ss-text-muted); font-weight: 500; margin-bottom: 16px; }

    /* Pagination */
    .ri-pagination-row {
        display: flex; align-items: center; justify-content: space-between;
        margin-top: 18px; flex-wrap: wrap; gap: 12px;
    }
    .ri-per-page { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ss-text-muted); }
    .ri-per-page-select {
        background: var(--ss-surface); border: 1px solid var(--ss-alpha-08);
        color: var(--ss-text-soft); border-radius: 8px; padding: 5px 10px; font-size: 13px;
        font-family: 'Inter', sans-serif; outline: none; cursor: pointer;
    }
    .ri-per-page-select:focus { border-color: rgba(56,189,248,0.30); }
    .ri-per-page-total { color: var(--ss-text-muted); }

    .ri-links { display: flex; gap: 4px; flex-wrap: wrap; }
    .ri-page-btn {
        padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
        border: 1px solid var(--ss-alpha-07);
        background: var(--ss-surface); color: var(--ss-text-muted);
        text-decoration: none; cursor: pointer;
        transition: all 0.16s; white-space: nowrap; display: inline-block;
    }
    .ri-page-btn:hover { background: var(--ss-alpha-05); color: var(--ss-text-soft); }
    .ri-page-btn-active   { background: rgba(14,165,233,0.12) !important; color: #38bdf8 !important; border-color: rgba(14,165,233,0.25) !important; }
    .ri-page-btn-disabled { opacity: 0.35; pointer-events: none; }

    /* Modal */
    .ri-modal-backdrop {
        position: fixed; inset: 0; z-index: 60;
        background: var(--ss-overlay); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
    }
    .ri-modal {
        position: relative; z-index: 61;
        background: var(--ss-surface); border: 1px solid var(--ss-alpha-09);
        border-radius: 18px; padding: 32px 28px;
        width: 500px; max-width: 90vw;
        box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        font-family: 'Inter', sans-serif;
    }
    .ri-modal-close {
        position: absolute; top: 14px; right: 14px;
        width: 28px; height: 28px; border-radius: 7px;
        background: var(--ss-alpha-05); border: 1px solid var(--ss-alpha-08);
        color: var(--ss-text-muted); cursor: pointer;
        display: flex; align-items: center; justify-content: center; transition: all 0.18s;
    }
    .ri-modal-close:hover { background: var(--ss-alpha-09); color: var(--ss-text-soft); }
    .ri-modal-icon {
        width: 48px; height: 48px; border-radius: 14px;
        background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.22);
        display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
    }
    .ri-modal-title { font-size: 17px; font-weight: 700; color: var(--ss-text-strong); margin-bottom: 8px; }
    .ri-modal-desc  { font-size: 14px; color: var(--ss-text-muted); line-height: 1.6; margin-bottom: 24px; }
    .ri-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .ri-modal-cancel {
        padding: 9px 20px; border-radius: 9px;
        background: var(--ss-alpha-05); border: 1px solid var(--ss-alpha-09);
        color: var(--ss-text-subtle); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.18s;
        font-family: 'Inter', sans-serif;
    }
    .ri-modal-cancel:hover { background: var(--ss-alpha-08); color: var(--ss-text-soft); }
    .ri-modal-delete {
        padding: 9px 20px; border-radius: 9px;
        background: linear-gradient(135deg, #dc2626, #b91c1c); border: none;
        color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.18s;
        box-shadow: 0 4px 14px rgba(220,38,38,0.30); font-family: 'Inter', sans-serif;
    }
    .ri-modal-delete:hover { opacity: 0.9; transform: translateY(-1px); }
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

export default function Index({ resumes, filters }) {
    const [search, setSearch] = useState(filters.search || "");
    const [deleteId, setDeleteId] = useState(null);
    const [isModalOpen, setModal] = useState(false);
    const { props } = usePage();
    const flash = props.flash || {};

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
        setModal(true);
    };
    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/resumes/${deleteId}`);
        setModal(false);
        setDeleteId(null);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            location.pathname,
            { search, per_page: resumes.per_page },
            { preserveState: true, replace: true },
        );
    };
    const clearSearch = () => {
        setSearch("");
        router.get(
            location.pathname,
            { per_page: resumes.per_page },
            { preserveState: true, replace: true },
        );
    };

    return (
        <Layout>
            <style>{styles}</style>
            <Toaster position="top-right" toastOptions={TOAST_OPTS} />
            <Head title="Resumes" />

            <div className="ri-root">
                {/* Header */}
                <div className="ri-header">
                    <div>
                        <div className="ri-title">Resumes</div>
                        <div className="ri-subtitle">
                            Manage and track all your uploaded resumes.
                        </div>
                    </div>
                    <Link href="/resumes/create" className="ri-btn-create">
                        <PlusIcon style={{ width: 15, height: 15 }} />
                        Upload Resume
                    </Link>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="ri-search-row">
                    <div className="ri-search-wrap">
                        <MagnifyingGlassIcon
                            className="ri-search-icon"
                            style={{ width: 15, height: 15 }}
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search resumes by name…"
                            className="ri-search-input"
                        />
                        {search && (
                            <button
                                type="button"
                                className="ri-search-clear"
                                onClick={clearSearch}
                            >
                                <XMarkIcon style={{ width: 14, height: 14 }} />
                            </button>
                        )}
                    </div>
                    <button type="submit" className="ri-btn-search">
                        Search
                    </button>
                </form>

                {/* Table */}
                {resumes.data.length > 0 ? (
                    <div className="ri-table-wrap">
                        <table className="ri-table">
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "center" }}>#</th>
                                    <th>Name</th>
                                    <th>File</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumes.data.map((resume) => (
                                    <tr key={resume.id}>
                                        <td className="ri-td-id">
                                            {resume.id}
                                        </td>
                                        <td className="ri-td-name">
                                            {resume.name}
                                        </td>
                                        <td className="ri-td-file">
                                            <a
                                                href={resume.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <DocumentTextIcon
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                    }}
                                                />
                                                View File
                                            </a>
                                        </td>
                                        <td>
                                            <div className="ri-actions">
                                                <Link
                                                    href={`/resumes/${resume.id}/edit`}
                                                    className="ri-action-btn ri-action-edit"
                                                    title="Edit"
                                                >
                                                    <PencilIcon
                                                        style={{
                                                            width: 14,
                                                            height: 14,
                                                        }}
                                                    />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        confirmDelete(resume.id)
                                                    }
                                                    className="ri-action-btn ri-action-del"
                                                    title="Delete"
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
                    <div className="ri-empty">
                        <div className="ri-empty-icon">📄</div>
                        <div className="ri-empty-text">
                            No resumes found. Try adjusting your search.
                        </div>
                        <Link href="/resumes/create" className="ri-btn-create">
                            <PlusIcon style={{ width: 14, height: 14 }} />{" "}
                            Upload your first resume
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {resumes.total > 10 && (
                    <div className="ri-pagination-row">
                        <div className="ri-per-page">
                            <span>Show</span>
                            <select
                                className="ri-per-page-select"
                                value={resumes.per_page}
                                onChange={(e) =>
                                    router.get(
                                        location.pathname,
                                        { per_page: e.target.value, search },
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
                            <span className="ri-per-page-total">
                                of {resumes.total} resumes
                            </span>
                        </div>

                        <div className="ri-links">
                            {resumes.links
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
                                        className={`ri-page-btn ${link.active ? "ri-page-btn-active" : ""} ${!link.url ? "ri-page-btn-disabled" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {isModalOpen && (
                <div
                    className="ri-modal-backdrop"
                    onClick={() => setModal(false)}
                >
                    <div
                        className="ri-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="ri-modal-close"
                            onClick={() => setModal(false)}
                        >
                            <XMarkIcon style={{ width: 14, height: 14 }} />
                        </button>
                        <div className="ri-modal-icon">
                            <TrashIcon
                                style={{
                                    width: 22,
                                    height: 22,
                                    color: "#f87171",
                                }}
                            />
                        </div>
                        <div className="ri-modal-title">Delete Resume?</div>
                        <div className="ri-modal-desc">
                            This resume will be permanently deleted. This action
                            cannot be undone.
                        </div>
                        <div className="ri-modal-actions">
                            <button
                                className="ri-modal-cancel"
                                onClick={() => setModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="ri-modal-delete"
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
