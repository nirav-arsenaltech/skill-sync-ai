import { useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "skillsync-theme";
export const DEFAULT_THEME = "dark";

export function getPreferredTheme() {
    if (typeof window === "undefined") {
        return DEFAULT_THEME;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    return storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : DEFAULT_THEME;
}

export function applyTheme(theme) {
    if (typeof document === "undefined") {
        return;
    }

    const resolvedTheme = theme === "light" ? "light" : "dark";
    const root = document.documentElement;

    root.classList.toggle("dark", resolvedTheme === "dark");
    root.dataset.theme = resolvedTheme;

    if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
        window.dispatchEvent(
            new CustomEvent("skillsync-theme-change", {
                detail: resolvedTheme,
            }),
        );
    }
}

export function initializeTheme() {
    if (typeof document === "undefined") {
        return DEFAULT_THEME;
    }

    const theme = getPreferredTheme();
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;

    return theme;
}

export function useTheme() {
    const [theme, setThemeState] = useState(() => getPreferredTheme());

    useEffect(() => {
        setThemeState(initializeTheme());

        const handleThemeChange = (event) => {
            setThemeState(event.detail ?? getPreferredTheme());
        };

        const handleStorage = (event) => {
            if (event.key === THEME_STORAGE_KEY) {
                setThemeState(getPreferredTheme());
                initializeTheme();
            }
        };

        window.addEventListener("skillsync-theme-change", handleThemeChange);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener(
                "skillsync-theme-change",
                handleThemeChange,
            );
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const setTheme = (nextTheme) => {
        const resolvedTheme =
            typeof nextTheme === "function" ? nextTheme(getPreferredTheme()) : nextTheme;

        applyTheme(resolvedTheme);
        setThemeState(resolvedTheme === "light" ? "light" : "dark");
    };

    return {
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme: () =>
            setTheme((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark",
            ),
    };
}
