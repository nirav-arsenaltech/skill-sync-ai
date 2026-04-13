import UserForm from "./Partials/UserForm";

export default function Create() {
    return (
        <UserForm
            title="Create User"
            submitLabel="Create user"
            action={route("admin.users.store")}
            method="post"
        />
    );
}
