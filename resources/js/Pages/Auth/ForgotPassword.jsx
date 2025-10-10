import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            {/* Back to login link */}
            <div className="mb-6">
                <Link
                    href={route('login')}
                    className="text-gray-600 hover:text-gray-800 flex items-center text-sm font-medium"
                >
                    <span className="mr-2">&larr;</span> Back to login
                </Link>
            </div>

            <div className="mb-4 text-sm text-gray-600">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-400 focus:ring-indigo-300 text-gray-700"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex justify-center mt-6">
                    <PrimaryButton
                        type="submit"
                        className="rounded-md bg-indigo-500 text-white font-medium py-2.5 px-6 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                        disabled={processing}
                    >
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
