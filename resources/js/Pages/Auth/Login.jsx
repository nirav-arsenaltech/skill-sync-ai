import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 w-full rounded-md border-gray-300 focus:border-indigo-400 focus:ring-indigo-300 text-gray-700"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 w-full rounded-md border-gray-300 focus:border-indigo-400 focus:ring-indigo-300 text-gray-700"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Remember + Forgot password */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ml-2">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-indigo-500 hover:text-indigo-600 font-medium"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full mt-4 rounded-md bg-indigo-500 text-white font-medium py-2.5 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                    >
                        {processing ? 'Logging in...' : 'Log in'}
                    </button>
                </div>

                {/* Divider OR */}
                <div className="flex items-center my-4">
                    <hr className="flex-grow border-gray-300" />
                    <span className="mx-2 text-gray-400 text-sm">OR</span>
                    <hr className="flex-grow border-gray-300" />
                </div>

                {/* Register link */}
                <div className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="text-rose-500 hover:text-rose-600 font-medium"
                    >
                        Register here
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
