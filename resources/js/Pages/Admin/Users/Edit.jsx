import UserForm from "./Partials/UserForm";

export default function Edit({ userRecord }) {
    return (
        <UserForm
            title="Edit User"
            submitLabel="Update user"
            action={route("admin.users.update", userRecord.id)}
            method="put"
            userRecord={userRecord}
        />
    );
}
