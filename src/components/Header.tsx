import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'index' },
    { path: '/typing', label: 'typing' },
    { path: '/aim', label: 'aim' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--app-bg)] select-none">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between max-w-4xl border-b border-[var(--app-border)] transition-colors duration-150">
        {/* Logo and links combined */}
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-bold font-mono tracking-tight text-[var(--app-text-correct)] hover:opacity-80 transition-opacity"
          >
            quickbench
          </Link>
          
          <nav className="flex items-center gap-3 text-xs font-mono text-[var(--app-comment)]">
            <span>/</span>
            {navItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <span key={item.path} className="flex items-center gap-3">
                  <Link
                    to={item.path}
                    className={`hover:text-[var(--app-text-correct)] transition-colors ${
                      isActive 
                        ? 'text-[var(--app-text-correct)] font-bold underline underline-offset-4' 
                        : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                  {idx < navItems.length - 1 && <span>/</span>}
                </span>
              );
            })}
          </nav>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
