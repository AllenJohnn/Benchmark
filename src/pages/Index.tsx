import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Index() {
  return (
    <div className="min-h-screen text-[var(--app-text-correct)] bg-[var(--app-bg)] select-none transition-colors duration-150">
      <div className="fixed top-4 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <main className="pt-24 pb-16 px-6 animate-slide-up-fade min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-md font-mono select-none">
          {/* Logo Title */}
          <h1 className="text-3xl font-bold tracking-tighter uppercase mb-3 text-[var(--app-text-correct)]">
            Quickbench
          </h1>
          
          {/* Minimalist Subtitle */}
          <p className="text-[var(--app-comment)] text-[10px] uppercase tracking-widest leading-relaxed mb-10">
            minimalist typing and precision reflex benchmark
          </p>

          {/* Pure Typographic Execution Links */}
          <div className="flex justify-center gap-8 text-xs uppercase tracking-wider">
            <Link
              to="/typing"
              className="text-[var(--app-comment)] hover:text-[var(--app-text-correct)] transition-colors border-b border-transparent hover:border-[var(--app-text-correct)] pb-1"
              aria-label="typing_test"
            >
              [ typing_test ]
            </Link>
            <Link
              to="/aim"
              className="text-[var(--app-comment)] hover:text-[var(--app-text-correct)] transition-colors border-b border-transparent hover:border-[var(--app-text-correct)] pb-1"
              aria-label="aim_trainer"
            >
              [ aim_trainer ]
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
