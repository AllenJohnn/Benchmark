import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import { getRandomText } from '@/lib/typingTexts';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

const TEST_DURATION = 60;

type GameState = 'idle' | 'playing' | 'finished';

export default function TypingTest() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [text, setText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  
  const { scores, addTypingScore } = useScoreHistory();

  const calculateAccuracy = useCallback((typed: string, original: string) => {
    if (typed.length === 0) return 100;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === original[i]) {
        correct++;
      }
    }
    return (correct / typed.length) * 100;
  }, []);

  const startGame = useCallback(() => {
    setText(getRandomText());
    setTypedText('');
    setTimeLeft(TEST_DURATION);
    setStartTime(null);
    setGameState('playing');
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setGameState('finished');
    
    const elapsedMinutes = (TEST_DURATION - timeLeft) / 60 || 1 / 60;
    const wordsTyped = typedText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wpm = Math.round(wordsTyped / elapsedMinutes);
    const accuracy = calculateAccuracy(typedText, text);
    
    addTypingScore({
      wpm,
      accuracy,
      chars: typedText.length,
    });
  }, [timeLeft, typedText, text, addTypingScore, calculateAccuracy]);

  useEffect(() => {
    if (gameState === 'playing' && startTime !== null) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, startTime]);

  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState, endGame]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return;
    
    const value = e.target.value;
    
    if (startTime === null && value.length > 0) {
      setStartTime(performance.now());
    }
    
    setTypedText(value);
    
    if (value.length >= text.length) {
      endGame();
    }
  }, [gameState, startTime, text.length, endGame]);

  const elapsedMinutes = startTime ? (TEST_DURATION - timeLeft) / 60 : 0;
  const wordsTyped = typedText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
  const accuracy = calculateAccuracy(typedText, text);

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'transition-colors duration-50 ';
      
      if (index < typedText.length) {
        if (typedText[index] === char) {
          className += 'text-success';
        } else {
          className += 'text-destructive bg-destructive/10';
        }
      } else if (index === typedText.length) {
        className += 'bg-foreground/10 text-foreground';
      } else {
        className += 'text-muted-foreground';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

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
                  <span className={`font-mono text-3xl font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                    {timeLeft}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">sec</span>
                </div>
                
                <div>
                  <span className="font-mono text-2xl font-semibold">{wpm}</span>
                  <span className="text-muted-foreground text-sm ml-1">wpm</span>
                </div>
              </div>
              
              <div className="font-mono">
                <span className={`text-lg font-semibold ${accuracy >= 95 ? 'text-success' : accuracy >= 85 ? 'text-foreground' : 'text-destructive'}`}>
                  {accuracy.toFixed(0)}%
                </span>
                <span className="text-muted-foreground text-sm ml-1">accuracy</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-4">
            {/* Typing Area */}
            <div className="glass-card rounded-lg relative overflow-hidden p-6" style={{ minHeight: '400px' }}>
              {gameState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-bold font-mono mb-2">Typing Test</h2>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Type as fast and accurately as you can. {TEST_DURATION} seconds.
                  </p>
                  <Button onClick={startGame} size="lg" className="font-mono gap-2">
                    <Play className="w-5 h-5" />
                    Start
                  </Button>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="h-full flex flex-col">
                  <div 
                    className="font-mono text-lg md:text-xl leading-relaxed select-none"
                    onClick={() => inputRef.current?.focus()}
                  >
                    {renderText()}
                  </div>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedText}
                    onChange={handleInput}
                    className="sr-only"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  
                  <p className="text-sm text-muted-foreground text-center mt-auto pt-4">
                    Click anywhere to focus
                  </p>
                </div>
              )}

              {gameState === 'finished' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90">
                  <h2 className="text-2xl font-bold font-mono mb-6">Complete</h2>
                  
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold font-mono">
                        {wpm}
                      </div>
                      <div className="text-sm text-muted-foreground">WPM</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold font-mono ${accuracy >= 95 ? 'text-success' : accuracy >= 85 ? '' : 'text-destructive'}`}>
                        {accuracy.toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold font-mono">
                        {typedText.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Chars</div>
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
              <ScoreDisplay scores={scores.typingTest} type="typing" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
