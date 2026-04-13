import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import ThemeToggle from "@/Components/ThemeToggle";

function buttonForPlan(plan, billing) {
    if (! billing.isAuthenticated) {
        return {
            href: route("register"),
            label: "Create account",
            className:
                "inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400",
        };
    }

    if (plan.is_free) {
        return {
            href: route("dashboard"),
            label: "Go to dashboard",
            className:
                "inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900",
        };
    }

    return {
        href: route("billing.checkout", plan.key),
        label: "Buy PRO",
        className:
            "inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400",
    };
}

export default function Pricing({ plans, billing }) {
    const { flash, auth } = usePage().props;
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isCancelModalOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isCancelModalOpen]);

    const purchasePlan = (plan) => {
        window.location.href = route("billing.checkout", plan.key, false);
    };

    const openBillingPortal = () => {
        window.location.href = route("billing.portal", undefined, false);
    };

    const syncBilling = () => {
        router.post(route("billing.sync", undefined, false));
    };

    const cancelSubscription = () => {
        router.post(
            route("billing.subscription.cancel", undefined, false),
            {},
            {
                onSuccess: () => {
                    setIsCancelModalOpen(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Pricing" />

            <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:auto,44px_44px,44px_44px] dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)]" />

                <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
                    <nav className="mb-10 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/85 px-5 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
                        <Link href={route("home")} className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            Skill<span className="text-sky-400">Sync</span>.ai
                        </Link>

                        <div className="flex items-center gap-3">
                            <ThemeToggle showLabel labelClassName="hidden sm:inline" />
                            <Link
                                href={route("home")}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                            >
                                Home
                            </Link>
                            {auth.user ? (
                                <Link
                                    href={route("dashboard")}
                                    className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route("login")}
                                    className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </nav>

                    <section className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-2xl dark:shadow-slate-950/50">
                            <div className="mb-4 inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
                                Pricing and subscriptions
                            </div>
                            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                                Stripe-managed billing, clean subscription flow.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                                Users start on Free by default. Upgrading to PRO sends them through Stripe Checkout,
                                and billing management stays inside the Stripe billing portal instead of exposing Cashier internals.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                {! auth.user && (
                                    <Link
                                        href={route("register")}
                                        className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
                                    >
                                        Start now
                                    </Link>
                                )}
                                {auth.user && billing.hasBillingProfile && ! billing.isPro && (
                                    <button
                                        type="button"
                                        onClick={openBillingPortal}
                                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                                    >
                                        Manage billing
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-2xl dark:shadow-slate-950/50">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                {billing.isPro ? "PRO account" : "Free account"}
                            </div>

                            {! billing.isPro ? (
                                <>
                                    <div className="mt-4 space-y-4">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                            <div className="text-sm text-slate-500 dark:text-slate-400">Current plan</div>
                                            <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                                FREE
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Subscription status</div>
                                        <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                            {billing.statusLabel ?? "No active Stripe subscription"}
                                        </div>
                                    </div>
                                    </div>

                                    {billing.canSync && (
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={syncBilling}
                                                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                                            >
                                                Sync latest Stripe payment
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="mt-4 space-y-4">
                                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                        <div className="text-sm text-emerald-700 dark:text-emerald-200">Current plan</div>
                                        <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                            PRO
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Subscription status</div>
                                        <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                            {billing.statusLabel ?? "Active"}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Access ends at</div>
                                        <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {billing.accessEndsAt ?? "Renews monthly"}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Payment method</div>
                                        <div className="mt-1 text-sm font-medium text-sky-600 dark:text-sky-300">
                                            {billing.paymentMethod ?? "No saved payment method found yet"}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Stripe customer</div>
                                        <div className="mt-1 break-all text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {billing.stripeCustomerId ?? "Not available"}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Trial ends at</div>
                                        <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {billing.trialEndsAt ?? "No active trial"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {flash.message && (
                        <div
                            className={`mb-8 rounded-2xl border px-4 py-3 text-sm ${
                                flash.type === "error"
                                    ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200"
                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                            }`}
                        >
                            {flash.message}
                        </div>
                    )}

                    {! billing.isPro ? (
                        <section className="grid gap-6 lg:grid-cols-2">
                            {plans.map((plan) => {
                                const button = buttonForPlan(plan, billing);

                                return (
                                    <article
                                        key={plan.key}
                                        className={`rounded-3xl border p-6 ${
                                            plan.highlighted
                                                ? "border-sky-500/40 bg-white shadow-xl shadow-sky-100/70 dark:bg-slate-900 dark:shadow-slate-950/40"
                                                : "border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/40"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                                    {plan.name}
                                                </div>
                                                <div className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                                    {plan.price}
                                                    <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">
                                                        {plan.price_suffix}
                                                    </span>
                                                </div>
                                            </div>

                                            {plan.highlighted && (
                                                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-300">
                                                    Recommended
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-4 text-sm font-medium text-slate-800 dark:text-slate-200">{plan.headline}</p>
                                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{plan.description}</p>

                                        <ul className="mt-6 grid gap-3">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300"
                                                >
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            {plan.is_free || ! auth.user ? (
                                                <Link href={button.href} className={button.className}>
                                                    {button.label}
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => purchasePlan(plan)}
                                                    className={button.className}
                                                >
                                                    Purchase PRO via Stripe
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </section>
                    ) : (
                        <section className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-2xl dark:shadow-slate-950/40">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                                        Active Subscription
                                    </div>
                                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                        PRO
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                                        {billing.cancelScheduled
                                            ? "Your PRO subscription is scheduled to stop at the end of the current billing period. Access stays active until the end date below."
                                            : "Your account is already on the paid plan. Billing changes, invoices, payment methods, and cancellation are managed here and in Stripe billing."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={openBillingPortal}
                                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                                    >
                                        Manage billing
                                    </button>

                                    {billing.canCancel && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCancelModalOpen(true)}
                                            className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/70"
                                        >
                                            Cancel subscription
                                        </button>
                                    )}
                                </div>
                            </div>

                            {billing.cancelScheduled && (
                                <div className="mt-6 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                    Cancellation is already scheduled. Your account stays on PRO until{" "}
                                    <span className="font-semibold">{billing.accessEndsAt ?? "the current billing period ends"}</span>.
                                    Stripe does not issue an automatic refund from this action.
                                </div>
                            )}

                            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Plan</div>
                                    <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">PRO</div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Status</div>
                                    <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                        {billing.statusLabel ?? "Active"}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Payment method</div>
                                    <div className="mt-1 text-sm font-medium text-sky-600 dark:text-sky-300">
                                        {billing.paymentMethod ?? "No saved payment method found yet"}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Access ends at</div>
                                    <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {billing.accessEndsAt ?? "Renews monthly"}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                                Cancelling the subscription stops future renewals. It does not automatically refund the current paid month, and PRO access stays active until the current billing period ends.
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {isCancelModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
                    onClick={() => setIsCancelModalOpen(false)}
                >
                    <div
                        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/70"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                            !
                        </div>

                        <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            Cancel PRO subscription?
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            This stops future Stripe renewals. Your current paid period stays active until{" "}
                            <span className="font-semibold">{billing.accessEndsAt ?? "the billing cycle ends"}</span>, and no
                            automatic refund is issued from this action.
                        </p>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(false)}
                                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                            >
                                Keep PRO
                            </button>
                            <button
                                type="button"
                                onClick={cancelSubscription}
                                className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/70"
                            >
                                Confirm cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
