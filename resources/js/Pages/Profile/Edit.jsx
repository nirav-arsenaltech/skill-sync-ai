// resources/js/Pages/Profile/Edit.jsx
import Layout from '../Dashboard/Components/Layout';
import UpdateProfileInformation from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import { Head, usePage } from '@inertiajs/react';

export default function Edit() {
    const { mustVerifyEmail, status } = usePage().props;

    return (
        <Layout>
            <Head title="Profile" />
            <div className='p-6'>

                <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-800 dark:text-white">Profile</h2></div>
                <div className="max-w-8xl mx-auto mt-10 space-y-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <UpdateProfileInformation
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <UpdatePasswordForm />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
