import Layout from "@/Pages/Dashboard/Components/Layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.aui-root { font-family: 'Inter', sans-serif; }

.aui-modal-backdrop {
    position: fixed; inset: 0; z-index: 60;
    background: var(--ss-overlay); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
}
.aui-modal {
    position: relative; z-index: 61;
    background: var(--ss-surface); border: 1px solid var(--ss-alpha-09);
    border-radius: 18px; padding: 32px 28px;
    width: 500px; max-width: 90vw;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    font-family: 'Inter', sans-serif;
}
.aui-modal-close {
    position: absolute; top: 14px; right: 14px;
    width: 28px; height: 28px; border-radius: 7px;
    background: var(--ss-alpha-05); border: 1px solid var(--ss-alpha-08);
    color: var(--ss-text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.18s;
}
.aui-modal-close:hover { background: var(--ss-alpha-09); color: var(--ss-text-soft); }
.aui-modal-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.22);
    display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
}
.aui-modal-title { font-size: 17px; font-weight: 700; color: var(--ss-text-strong); margin-bottom: 8px; }
.aui-modal-desc  { font-size: 14px; color: var(--ss-text-muted); line-height: 1.6; margin-bottom: 24px; }
.aui-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.aui-modal-cancel {
    padding: 9px 20px; border-radius: 9px;
    background: var(--ss-alpha-05); border: 1px solid var(--ss-alpha-09);
    color: var(--ss-text-subtle); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.18s;
    font-family: 'Inter', sans-serif;
}
.aui-modal-cancel:hover { background: var(--ss-alpha-08); color: var(--ss-text-soft); }
.aui-modal-delete {
    padding: 9px 20px; border-radius: 9px;
    background: linear-gradient(135deg, #dc2626, #b91c1c); border: none;
    color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.18s;
    box-shadow: 0 4px 14px rgba(220,38,38,0.30); font-family: 'Inter', sans-serif;
}
.aui-modal-delete:hover { opacity: 0.9; transform: translateY(-1px); }
`;

export default function Index({ users, filters }) {
    const { flash, auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? "");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    const submitSearch = (event) => {
        event.preventDefault();

        router.get(
            route("admin.users.index"),
            { search },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const confirmDelete = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedUser(null);
    };

    const destroyUser = () => {
        if (! selectedUser) {
            return;
        }

        router.delete(route("admin.users.destroy", selectedUser.id, false), {
            preserveScroll: true,
            onFinish: closeModal,
        });
    };

    return (
        <Layout>
            <style>{styles}</style>
            <Head title="Admin Users" />

            <div className="aui-root mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[var(--ss-text-strong)]">
                            Admin Users
                        </h1>
                        <p className="mt-2 text-sm text-[var(--ss-text-muted)]">
                            Administrators can create, update, delete, and review billing ownership for every account.
                        </p>
                    </div>

                    <Link
                        href={route("admin.users.create")}
                        className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
                    >
                        Create user
                    </Link>
                </div>

                {flash.message && (
                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                            flash.type === "error"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        }`}
                    >
                        {flash.message}
                    </div>
                )}

                <form
                    onSubmit={submitSearch}
                    className="flex flex-wrap gap-3 rounded-3xl border border-[var(--ss-alpha-08)] bg-[var(--ss-surface)] p-4"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search users by name or email"
                        className="min-w-[260px] flex-1 rounded-2xl border border-[var(--ss-alpha-10)] bg-[var(--ss-bg)] px-4 py-3 text-sm text-[var(--ss-text)] outline-none transition focus:border-sky-400"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                    >
                        Search
                    </button>
                </form>

                <div className="overflow-hidden rounded-3xl border border-[var(--ss-alpha-08)] bg-[var(--ss-surface)]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[var(--ss-alpha-03)] text-[var(--ss-text-muted)]">
                                <tr>
                                    <th className="px-4 py-4 font-semibold">User</th>
                                    <th className="px-4 py-4 font-semibold">Role</th>
                                    <th className="px-4 py-4 font-semibold">Billing</th>
                                    <th className="px-4 py-4 font-semibold">Subscription</th>
                                    <th className="px-4 py-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-t border-[var(--ss-alpha-06)] text-[var(--ss-text-soft)]"
                                    >
                                        <td className="px-4 py-4 align-top">
                                            <div className="font-semibold text-[var(--ss-text)]">{user.name}</div>
                                            <div className="text-xs text-[var(--ss-text-muted)]">{user.email}</div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    user.is_admin
                                                        ? "bg-sky-500/15 text-sky-300"
                                                        : "bg-slate-700/50 text-slate-300"
                                                }`}
                                            >
                                                {user.is_admin ? "Admin" : "User"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div>{user.stripe_id ?? "No Stripe customer"}</div>
                                            <div className="text-xs text-[var(--ss-text-muted)]">
                                                {user.pm_type && user.pm_last_four
                                                    ? `${user.pm_type} ending ${user.pm_last_four}`
                                                    : "No saved payment method"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            {user.subscription ? (
                                                <>
                                                    <div>{user.subscription.stripe_status}</div>
                                                    <div className="break-all text-xs text-[var(--ss-text-muted)]">
                                                        {user.subscription.stripe_price}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-[var(--ss-text-muted)]">No subscription</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    href={route("admin.users.edit", user.id)}
                                                    className="rounded-xl border border-[var(--ss-alpha-10)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--ss-alpha-03)]"
                                                >
                                                    Edit
                                                </Link>
                                                {auth.user.id !== user.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(user)}
                                                        className="rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {users.data.length === 0 && (
                    <div className="rounded-3xl border border-[var(--ss-alpha-08)] bg-[var(--ss-surface)] p-6 text-sm text-[var(--ss-text-muted)]">
                        No users matched the current filter.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="aui-modal-backdrop" onClick={closeModal}>
                    <div className="aui-modal" onClick={(event) => event.stopPropagation()}>
                        <button className="aui-modal-close" onClick={closeModal}>
                            <XMarkIcon style={{ width: 14, height: 14 }} />
                        </button>

                        <div className="aui-modal-icon">
                            <TrashIcon
                                style={{
                                    width: 22,
                                    height: 22,
                                    color: "#f87171",
                                }}
                            />
                        </div>

                        <div className="aui-modal-title">Delete User?</div>
                        <div className="aui-modal-desc">
                            {selectedUser
                                ? `This will permanently delete ${selectedUser.name}'s account and related records. This action cannot be undone.`
                                : "This user account will be permanently deleted. This action cannot be undone."}
                        </div>

                        <div className="aui-modal-actions">
                            <button className="aui-modal-cancel" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="aui-modal-delete" onClick={destroyUser}>
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
