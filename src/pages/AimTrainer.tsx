import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Target } from '@/components/Target';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import SoundEffects from '../lib/soundEffects';

const TOTAL_TARGETS = 30;
const TARGET_SIZE_DESKTOP = 50;
const TARGET_SIZE_MOBILE = 44;

type GameState = 'idle' | 'playing' | 'finished';

interface TargetData {
  id: number;
  x: number;
  y: number;
}

const TypoStat = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="text-left font-mono">
    <div className="text-[10px] uppercase tracking-widest text-[var(--app-comment)]">{label}</div>
    <div className="text-3xl font-bold text-[var(--app-text-correct)] mt-1">{value}</div>
  </div>
);

export default function AimTrainer() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [targetsHit, setTargetsHit] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  
  const { scores, addAimScore } = useScoreHistory();

  const getTargetSize = () => {
    return window.innerWidth < 768 ? TARGET_SIZE_MOBILE : TARGET_SIZE_DESKTOP;
  };

  const generateTarget = useCallback((): TargetData => {
    if (!gameAreaRef.current) {
      return { id: Date.now(), x: 200, y: 200 };
    }
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const size = getTargetSize();
    const padding = size / 2 + 30; // buffer distance from container walls
    
    const x = Math.random() * (rect.width - padding * 2) + padding;
    const y = Math.random() * (rect.height - padding * 2) + padding;
    
    return { id: Date.now() + Math.random(), x, y };
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setTargetsHit(0);
    setTotalClicks(0);
    setStartTime(null);
    setEndTime(null);
    setCurrentTime(0);
    setTargets([generateTarget()]);
  }, [generateTarget]);

  const handleTargetHit = useCallback(() => {
    const now = performance.now();
    
    if (startTime === null) {
      setStartTime(now);
      timerRef.current = window.setInterval(() => {
        setCurrentTime(performance.now());
      }, 10);
    }
    
    if (soundEnabled) SoundEffects.playHit();
    
    setTotalClicks(prev => prev + 1);
    const newHitCount = targetsHit + 1;
    setTargetsHit(newHitCount);
    
    if (newHitCount >= TOTAL_TARGETS) {
      setEndTime(now);
      setGameState('finished');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const finalTime = (now - (startTime || now)) / 1000;
      const finalAccuracy = (newHitCount / (totalClicks + 1)) * 100;
      const cps = newHitCount / finalTime;
      
      addAimScore({
        time: finalTime,
        accuracy: Math.min(finalAccuracy, 100),
        cps,
      });
    } else {
      setTargets([generateTarget()]);
    }
  }, [targetsHit, startTime, totalClicks, generateTarget, addAimScore, soundEnabled]);

  const handleMiss = useCallback(() => {
    if (gameState === 'playing' && startTime !== null) {
      if (soundEnabled) SoundEffects.playMiss();
      setTotalClicks(prev => prev + 1);
    }
  }, [gameState, startTime, soundEnabled]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const elapsedTime = startTime 
    ? ((gameState === 'finished' && endTime ? endTime : currentTime) - startTime) / 1000 
    : 0;
  
  const accuracy = totalClicks > 0 ? (targetsHit / totalClicks) * 100 : 100;
  const cps = elapsedTime > 0 ? targetsHit / elapsedTime : 0;

  return (
    <div className="min-h-screen text-[var(--app-text-correct)] bg-[var(--app-bg)] select-none transition-colors duration-150">
      <div className={`transition-opacity duration-150 ${gameState === 'playing' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="fixed top-4 left-6 z-50">
          <Link 
            to="/" 
            className="text-xs font-mono text-[var(--app-comment)] hover:text-[var(--app-text-correct)] transition-colors"
          >
            quickbench
          </Link>
        </div>
        <div className="fixed top-4 right-6 z-50">
          <ThemeToggle />
        </div>
      </div>
      
      <main className="pt-24 pb-8 px-6 animate-slide-up-fade min-h-[calc(100vh-4.5rem)] flex items-center justify-center">
        <div className="w-full max-w-2xl">
          
          <div className="flex flex-col">
            {/* Swiss Borderless Click Area */}
            <div 
              ref={gameAreaRef}
              className="relative w-full overflow-hidden cursor-crosshair rounded-sm bg-black/[0.01] dark:bg-white/[0.01] border border-[var(--app-border)]"
              style={{ height: 'calc(100vh - 280px)', minHeight: '420px' }}
              onClick={handleMiss}
            >
              {/* Idle screen */}
              {gameState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--app-bg)]/90 z-10">
                  <h2 className="text-2xl font-bold font-mono uppercase mb-2 tracking-tight text-[var(--app-text-correct)]">Aim Trainer</h2>
                  <p className="text-[var(--app-comment)] font-mono text-xs mb-8 text-center max-w-xs uppercase tracking-widest leading-relaxed">
                    Click {TOTAL_TARGETS} targets as fast as you can. Timer starts on your first click.
                  </p>
                  <button 
                    onClick={startGame} 
                    className="font-mono text-xs uppercase tracking-wider text-[var(--app-text-correct)] border border-[var(--app-text-correct)] px-4 py-2 hover:bg-[var(--app-text-correct)] hover:text-[var(--app-bg)] transition-colors rounded-sm"
                  >
                    [ start benchmark ]
                  </button>
                </div>
              )}

              {/* Targets Container */}
              {gameState === 'playing' && targets.map(target => (
                <Target
                  key={target.id}
                  x={target.x}
                  y={target.y}
                  size={getTargetSize()}
                  onHit={handleTargetHit}
                />
              ))}
            </div>

            {/* Quiet stats line below canvas */}
            <div className="flex justify-between items-center h-8 text-[var(--app-comment)] font-mono text-[10px] uppercase tracking-wider mt-6 border-t border-[var(--app-border)] pt-4 select-none">
              <div className="flex items-center gap-6">
                <div>
                  {gameState === 'playing' ? (
                    <span className="font-bold text-[var(--app-text-correct)]">
                      targets: {targetsHit} / {TOTAL_TARGETS}
                    </span>
                  ) : (
                    <span>aim benchmark ready</span>
                  )}
                </div>
                {gameState !== 'playing' && (
                  <div className="flex gap-2">
                    <span className="font-bold text-[var(--app-text-correct)]">sound:</span>
                    {(['on', 'off'] as const).map(option => {
                      const isSelected = (option === 'on' && soundEnabled) || (option === 'off' && !soundEnabled);
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`hover:text-[var(--app-text-correct)] ${isSelected ? 'text-[var(--app-text-correct)] font-bold underline underline-offset-2' : ''}`}
                          onClick={() => setSoundEnabled(option === 'on')}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                {gameState === 'playing' && startTime !== null && (
                  <>
                    <span>cps: <strong className="text-[var(--app-text-correct)]">{cps.toFixed(2)}</strong></span>
                    <span>accuracy: <strong className="text-[var(--app-text-correct)]">{accuracy.toFixed(0)}%</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results screen */}
          {gameState === 'finished' && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--app-bg)] animate-in fade-in duration-100">
              <div className="w-full max-w-2xl px-6 py-8">
                <div className="border-b border-[var(--app-border)] pb-8 mb-8">
                  <h2 className="font-mono text-3xl font-bold uppercase tracking-tighter text-[var(--app-text-correct)]">
                    test completed.
                  </h2>
                  <p className="font-mono text-xs text-[var(--app-comment)] uppercase tracking-wider mt-1">
                    monochrome precision click stats
                  </p>
                </div>

                <div className="grid gap-12">
                  <div className="grid gap-8 grid-cols-3">
                    <TypoStat label="time" value={`${elapsedTime.toFixed(2)}s`} />
                    <TypoStat label="accuracy" value={`${accuracy.toFixed(0)}%`} />
                    <TypoStat label="cps" value={cps.toFixed(2)} />
                  </div>

                  <div className="grid gap-x-8 gap-y-4 grid-cols-2 border-t border-[var(--app-border)] pt-8">
                    <TypoStat label="total targets" value={TOTAL_TARGETS} />
                    <TypoStat label="total clicks" value={totalClicks} />
                  </div>

                  <div className="mt-8 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--app-comment)]">
                    press <button onClick={startGame} className="text-[var(--app-text-correct)] font-bold underline underline-offset-2">tab</button> or click here to try again
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score History Sidebar Collapsible */}
          <div className={`w-full max-w-2xl mx-auto mt-8 flex flex-col gap-6 transition-opacity duration-150 ${gameState === 'playing' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <details className="group border-t border-[var(--app-border)] pt-4">
              <summary className="cursor-pointer list-none select-none font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--app-comment)] hover:text-[var(--app-text-correct)] transition-colors">
                [ view history ]
              </summary>
              <div className="mt-4">
                <ScoreDisplay scores={scores.aimTrainer} type="aim" />
              </div>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
