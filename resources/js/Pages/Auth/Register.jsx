import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 mt-3">
                    Create an Account
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                    Fill in the details to register
                </p>
            </div>

            <div className="w-full max-w-md bg-white/80 border border-rose-100 shadow-md rounded-2xl p-8 backdrop-blur-sm transition-all duration-500 ease-in-out hover:shadow-lg hover:scale-[1.01]">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-indigo-400 focus:ring-indigo-300 text-gray-700"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Your full name"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-indigo-400 focus:ring-indigo-300 text-gray-700"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            required
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
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm Password"
                        />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-indigo-400 focus:ring-indigo-300 text-gray-700"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder="••••••••"
                            required
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <Link
                            href={route('login')}
                            className="text-indigo-500 hover:text-indigo-600 font-medium"
                        >
                            Already registered?
                        </Link>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Registering...' : 'Register'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
