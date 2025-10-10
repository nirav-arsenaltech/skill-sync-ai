import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-violet-200 to-violet-100">
            <div className="text-center mb-6">
                <Link href="/">
                    <ApplicationLogo className="h-16 w-16 mx-auto" />
                </Link>
            </div>

            <div className="w-full max-w-md bg-white/80 border border-rose-100 shadow-md rounded-2xl p-8 backdrop-blur-sm transition-all duration-500 ease-in-out hover:shadow-lg hover:scale-[1.01]">
                {children}
            </div>
        </div>
    );
}
