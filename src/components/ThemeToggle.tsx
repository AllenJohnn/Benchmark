import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      className="font-mono text-[10px] uppercase tracking-wider text-[var(--app-comment)] hover:text-[var(--app-text-correct)] transition-colors select-none bg-transparent border-none p-0"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      theme: {isDark ? 'dark' : 'light'}
    </button>
  );
}