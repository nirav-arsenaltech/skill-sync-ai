import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle({
    className = "",
    showLabel = false,
    labelClassName = "",
}) {
    const { isDark, toggleTheme } = useTheme();
    const label = isDark ? "Dark" : "Light";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-2 py-2 text-sm font-semibold transition duration-200 ${className}`.trim()}
            style={{
                background: "var(--ss-alpha-04)",
                border: "1px solid var(--ss-alpha-08)",
                color: "var(--ss-text)",
                boxShadow: "0 8px 24px rgba(14, 165, 233, 0.08)",
            }}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {isDark ? (
                <SunIcon className="h-4 w-4" />
            ) : (
                <MoonIcon className="h-4 w-4" />
            )}
            
        </button>
    );
}
