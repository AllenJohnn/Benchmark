import { Link, useLocation } from 'react-router-dom';
import { Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold font-mono tracking-tight hover:text-destructive transition-colors"
        >
          <Crosshair className="w-6 h-6 text-destructive" />
          <span>QuickBench</span>
        </Link>

        <nav className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <Link to="/">
              <Button variant="ghost" size="sm" className="font-mono">
                Home
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
