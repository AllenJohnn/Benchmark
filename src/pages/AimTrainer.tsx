import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Target } from '@/components/Target';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

const TOTAL_TARGETS = 30;
const TARGET_SIZE_DESKTOP = 60;
const TARGET_SIZE_MOBILE = 50;

type GameState = 'idle' | 'playing' | 'finished';

interface TargetData {
  id: number;
  x: number;
  y: number;
}

export default function AimTrainer() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [targetsHit, setTargetsHit] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  
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
    const padding = size / 2 + 20;
    
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
  }, [targetsHit, startTime, totalClicks, generateTarget, addAimScore]);

  const handleMiss = useCallback(() => {
    if (gameState === 'playing' && startTime !== null) {
      setTotalClicks(prev => prev + 1);
    }
  }, [gameState, startTime]);

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Stats Bar */}
          <div className="glass-card rounded-lg p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <div>
                  <span className="font-mono text-2xl font-bold">{targetsHit}</span>
                  <span className="text-muted-foreground">/{TOTAL_TARGETS}</span>
                </div>
                
                <div>
                  <span className="font-mono text-xl">{elapsedTime.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm ml-1">sec</span>
                </div>
                
                <div>
                  <span className="font-mono text-xl">{cps.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm ml-1">cps</span>
                </div>
              </div>
              
              <div className="font-mono">
                <span className={`text-lg font-semibold ${accuracy >= 90 ? 'text-success' : accuracy >= 70 ? 'text-foreground' : 'text-destructive'}`}>
                  {accuracy.toFixed(0)}%
                </span>
                <span className="text-muted-foreground text-sm ml-1">accuracy</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-4">
            {/* Game Area */}
            <div 
              ref={gameAreaRef}
              className="glass-card rounded-lg relative overflow-hidden"
              style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}
              onClick={handleMiss}
            >
              {gameState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-bold font-mono mb-2">Aim Trainer</h2>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Click {TOTAL_TARGETS} targets as fast as you can. Timer starts on first click.
                  </p>
                  <Button onClick={startGame} size="lg" className="font-mono gap-2">
                    <Play className="w-5 h-5" />
                    Start
                  </Button>
                </div>
              )}

              {gameState === 'playing' && targets.map(target => (
                <Target
                  key={target.id}
                  x={target.x}
                  y={target.y}
                  size={getTargetSize()}
                  onHit={handleTargetHit}
                />
              ))}

              {gameState === 'finished' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90">
                  <h2 className="text-2xl font-bold font-mono mb-6">Complete</h2>
                  
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold font-mono">
                        {elapsedTime.toFixed(2)}s
                      </div>
                      <div className="text-sm text-muted-foreground">Time</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold font-mono ${accuracy >= 90 ? 'text-success' : accuracy >= 70 ? '' : 'text-destructive'}`}>
                        {accuracy.toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold font-mono">
                        {cps.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">CPS</div>
                    </div>
                  </div>
                  
                  <Button onClick={startGame} size="lg" className="font-mono gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Again
                  </Button>
                </div>
              )}
            </div>

            {/* Score History */}
            <div className="lg:block">
              <ScoreDisplay scores={scores.aimTrainer} type="aim" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
