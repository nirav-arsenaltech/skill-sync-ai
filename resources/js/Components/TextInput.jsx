import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    const { url } = usePage();
    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const isProfilePage = url.startsWith('/profile')

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                (isProfilePage ? 'dark:bg-gray-700 dark:border-gray-500 ' : '') +
                className
            }
            ref={localRef}
        />
    );
});
