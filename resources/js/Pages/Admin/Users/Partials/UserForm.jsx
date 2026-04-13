import Layout from "@/Pages/Dashboard/Components/Layout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function UserForm({ title, submitLabel, action, method, userRecord = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: userRecord?.name ?? "",
        email: userRecord?.email ?? "",
        password: "",
        password_confirmation: "",
        is_admin: Boolean(userRecord?.is_admin ?? false),
    });

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
        };

        if (method === "put") {
            put(action, options);

            return;
        }

        post(action, options);
    };

    return (
        <Layout>
            <Head title={title} />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[var(--ss-text-strong)]">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm text-[var(--ss-text-muted)]">
                            Admin-only user management for roles, access, and account updates.
                        </p>
                    </div>

                    <Link
                        href={route("admin.users.index")}
                        className="rounded-xl border border-[var(--ss-alpha-10)] px-4 py-2 text-sm font-semibold text-[var(--ss-text-soft)] transition hover:bg-[var(--ss-alpha-03)]"
                    >
                        Back to users
                    </Link>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-3xl border border-[var(--ss-alpha-08)] bg-[var(--ss-surface)] p-6 shadow-xl"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="space-y-2">
                            <span className="text-sm font-semibold text-[var(--ss-text-soft)]">Name</span>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(event) => setData("name", event.target.value)}
                                className="w-full rounded-2xl border border-[var(--ss-alpha-10)] bg-[var(--ss-bg)] px-4 py-3 text-sm text-[var(--ss-text)] outline-none transition focus:border-sky-400"
                            />
                            {errors.name && <div className="text-sm text-rose-400">{errors.name}</div>}
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-semibold text-[var(--ss-text-soft)]">Email</span>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(event) => setData("email", event.target.value)}
                                className="w-full rounded-2xl border border-[var(--ss-alpha-10)] bg-[var(--ss-bg)] px-4 py-3 text-sm text-[var(--ss-text)] outline-none transition focus:border-sky-400"
                            />
                            {errors.email && <div className="text-sm text-rose-400">{errors.email}</div>}
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-semibold text-[var(--ss-text-soft)]">
                                {userRecord ? "New password" : "Password"}
                            </span>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(event) => setData("password", event.target.value)}
                                className="w-full rounded-2xl border border-[var(--ss-alpha-10)] bg-[var(--ss-bg)] px-4 py-3 text-sm text-[var(--ss-text)] outline-none transition focus:border-sky-400"
                            />
                            {errors.password && <div className="text-sm text-rose-400">{errors.password}</div>}
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-semibold text-[var(--ss-text-soft)]">Confirm password</span>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) => setData("password_confirmation", event.target.value)}
                                className="w-full rounded-2xl border border-[var(--ss-alpha-10)] bg-[var(--ss-bg)] px-4 py-3 text-sm text-[var(--ss-text)] outline-none transition focus:border-sky-400"
                            />
                        </label>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-[var(--ss-alpha-08)] bg-[var(--ss-bg)] px-4 py-4">
                        <input
                            type="checkbox"
                            checked={data.is_admin}
                            onChange={(event) => setData("is_admin", event.target.checked)}
                            className="h-4 w-4 rounded border-slate-500 bg-slate-950 text-sky-500"
                        />
                        <div>
                            <div className="text-sm font-semibold text-[var(--ss-text)]">Administrator access</div>
                            <div className="text-sm text-[var(--ss-text-muted)]">
                                Allows this user to access the admin users resource.
                            </div>
                        </div>
                    </label>

                    {userRecord && (
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-[var(--ss-alpha-08)] bg-[var(--ss-bg)] p-4">
                                <div className="text-xs uppercase tracking-[0.18em] text-[var(--ss-text-muted)]">
                                    Stripe customer
                                </div>
                                <div className="mt-2 break-all text-sm text-[var(--ss-text)]">
                                    {userRecord.stripe_id ?? "Not created"}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-[var(--ss-alpha-08)] bg-[var(--ss-bg)] p-4">
                                <div className="text-xs uppercase tracking-[0.18em] text-[var(--ss-text-muted)]">
                                    Payment method
                                </div>
                                <div className="mt-2 text-sm text-[var(--ss-text)]">
                                    {userRecord.pm_type ?? "Not saved"}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-[var(--ss-alpha-08)] bg-[var(--ss-bg)] p-4">
                                <div className="text-xs uppercase tracking-[0.18em] text-[var(--ss-text-muted)]">
                                    Last four
                                </div>
                                <div className="mt-2 text-sm text-[var(--ss-text)]">
                                    {userRecord.pm_last_four ?? "Not saved"}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? "Saving..." : submitLabel}
                        </button>
                        <Link
                            href={route("admin.users.index")}
                            className="rounded-xl border border-[var(--ss-alpha-10)] px-5 py-3 text-sm font-semibold text-[var(--ss-text-soft)] transition hover:bg-[var(--ss-alpha-03)]"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
