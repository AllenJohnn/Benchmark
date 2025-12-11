import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Target, Type } from 'lucide-react';

const tests = [
  {
    id: 'aim',
    title: 'Aim Trainer',
    description: 'Test your reflexes by clicking 30 targets as fast as possible',
    icon: Target,
    path: '/aim',
    color: 'text-destructive',
    stats: ['Time', 'Accuracy', 'CPS'],
  },
  {
    id: 'typing',
    title: 'Typing Test',
    description: 'Measure your typing speed and accuracy in 60 seconds',
    icon: Type,
    path: '/typing',
    color: 'text-success',
    stats: ['WPM', 'Accuracy', 'Characters'],
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 tracking-tight">
              QuickBench
            </h1>
            
            <p className="text-muted-foreground max-w-lg mx-auto">
              Test your reflexes and typing speed
            </p>
          </div>

          {/* Test Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {tests.map((test) => (
              <Link
                key={test.id}
                to={test.path}
                className="group glass-card rounded-lg p-8 transition-all duration-200 hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-6`}>
                  <test.icon className={`w-6 h-6 ${test.color}`} />
                </div>
                
                <h2 className="text-xl font-bold font-mono mb-2">
                  {test.title}
                </h2>
                
                <p className="text-muted-foreground text-sm mb-6">
                  {test.description}
                </p>
                
                <div className="flex gap-2">
                  {test.stats.map((stat) => (
                    <span
                      key={stat}
                      className="px-2 py-1 rounded bg-secondary text-xs font-mono text-muted-foreground"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
