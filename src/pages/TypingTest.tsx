import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import SoundEffects from '../lib/soundEffects';
import { getRandomText, getWordCountText } from '@/lib/typingTexts';
import {
  calculateAccuracy,
  calculateCompletionRatio,
  calculateErrorCount,
  calculateGrossWpm,
  calculateRecordedWpm,
} from '@/lib/typingMetrics';

const TEST_DURATION = 30;
const TEST_DURATION_OPTIONS = [30, 60] as const;
const CARET_IDLE_DELAY = 500;

type GameState = 'idle' | 'playing' | 'finished';
type TestMode = 'time' | 'words';
type CaretStyleType = 'line' | 'block' | 'underline';

const TypoStat = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="text-left font-mono">
    <div className="text-[10px] uppercase tracking-widest text-[var(--app-comment)]">{label}</div>
    <div className="text-3xl font-bold text-[var(--app-text-correct)] mt-1">{value}</div>
  </div>
);

const WpmChart = ({ history }: { history: number[] }) => {
  if (history.length < 2) return null;
  
  const width = 600;
  const height = 120;
  const padding = 15;
  
  const maxWpm = Math.max(...history, 100);
  const minWpm = Math.max(0, Math.min(...history) - 10);
  const range = maxWpm - minWpm || 1;
  
  const points = history.map((val, idx) => {
    const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minWpm) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full mt-6 border-t border-b border-[var(--app-border)] py-4 animate-slide-up-fade">
      <div className="text-[9px] uppercase tracking-widest text-[var(--app-comment)] mb-2 font-mono">// wpm timeline diagnostic</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible font-mono">
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = padding + ratio * (height - padding * 2);
          const val = Math.round(maxWpm - ratio * range);
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--app-border)" strokeDasharray="3,3" strokeWidth={0.5} />
              <text x={padding} y={y - 2} fill="var(--app-comment)" className="text-[8px]">{val}</text>
            </g>
          );
        })}
        {/* Main trend path */}
        <polyline
          fill="none"
          stroke="var(--app-text-correct)"
          strokeWidth="1.5"
          points={points}
        />
        {/* Plot circles */}
        {history.map((val, idx) => {
          const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
          const y = height - padding - ((val - minWpm) / range) * (height - padding * 2);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="2"
              fill="var(--app-bg)"
              stroke="var(--app-text-correct)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default function TypingTest() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [testMode] = useState<TestMode>('time');
  const [caretType] = useState<CaretStyleType>('line');
  const [soundEnabled] = useState(false);
  const [includePunctuation] = useState(false);
  const [includeNumbers] = useState(false);
  const [text, setText] = useState(() => getRandomText());
  const [typedText, setTypedText] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(TEST_DURATION);
  const [selectedWordCount, setSelectedWordCount] = useState(25);
  const [activeDuration, setActiveDuration] = useState(TEST_DURATION);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [secondsPassed, setSecondsPassed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [caretIndex, setCaretIndex] = useState(0);
  const [wrongChars, setWrongChars] = useState<Set<number>>(new Set());
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [caretBlinking, setCaretBlinking] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [caretStyle, setCaretStyle] = useState({ left: 0, top: 0, height: 0, visible: false });
  const [finalResults, setFinalResults] = useState<{
    wpm: number;
    accuracy: number;
    chars: number;
    grossWpm: number;
    netWpm: number;
    errorCount: number;
    completionRatio: number;
  } | null>(null);

  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const caretIdleTimerRef = useRef<number | null>(null);
  const latestTextRef = useRef('');
  const latestTypedTextRef = useRef('');

  const { scores, addTypingScore } = useScoreHistory();

  useEffect(() => {
    latestTextRef.current = text;
  }, [text]);

  useEffect(() => {
    latestTypedTextRef.current = typedText;
  }, [typedText]);

  const touchCaret = useCallback(() => {
    setCaretBlinking(false);

    if (caretIdleTimerRef.current !== null) {
      window.clearTimeout(caretIdleTimerRef.current);
    }

    caretIdleTimerRef.current = window.setTimeout(() => {
      setCaretBlinking(true);
      caretIdleTimerRef.current = null;
    }, CARET_IDLE_DELAY);
  }, []);

  const buildPromptText = useCallback(
    (mode: TestMode, wordCount: number) => {
      const baseText = mode === 'time' ? getRandomText() : getWordCountText(wordCount);
      const tokens = baseText.split(' ');

      if (includeNumbers || includePunctuation) {
        return tokens
          .map((token, index) => {
            let nextToken = token;

            if (includeNumbers && index % 9 === 8) {
              nextToken = `${Math.floor(Math.random() * 900 + 100)}`;
            }

            if (includePunctuation && index % 7 === 6) {
              nextToken = `${nextToken}${['.', ',', ';', '?'][index % 4]}`;
            }

            return nextToken;
          })
          .join(' ');
      }

      return baseText;
    },
    [includeNumbers, includePunctuation],
  );

  const updateCaretPosition = useCallback(() => {
    if (!wordsContainerRef.current) return;
    const spans = wordsContainerRef.current.getElementsByTagName('span');
    if (spans.length === 0) return;

    const H = 60.8; // 3.8rem * 16px

    if (caretIndex < spans.length) {
      const activeSpan = spans[caretIndex] as HTMLSpanElement;
      if (activeSpan) {
        setCaretStyle({
          left: activeSpan.offsetLeft,
          top: activeSpan.offsetTop,
          height: activeSpan.offsetHeight || 38,
          visible: true,
        });
        setScrollY(Math.max(0, activeSpan.offsetTop - H));
      }
    } else {
      const lastSpan = spans[spans.length - 1] as HTMLSpanElement;
      if (lastSpan) {
        const targetTop = lastSpan.offsetTop;
        setCaretStyle({
          left: lastSpan.offsetLeft + lastSpan.offsetWidth,
          top: targetTop,
          height: lastSpan.offsetHeight || 38,
          visible: true,
        });
        setScrollY(Math.max(0, targetTop - H));
      }
    }
  }, [caretIndex]);

  useLayoutEffect(() => {
    updateCaretPosition();
    window.addEventListener('resize', updateCaretPosition);
    return () => {
      window.removeEventListener('resize', updateCaretPosition);
    };
  }, [caretIndex, text, gameState, updateCaretPosition]);

  const handleModeSelect = useCallback(
    (mode: TestMode) => {
      setTestMode(mode);
      const nextText = buildPromptText(mode, selectedWordCount);
      setText(nextText);
      latestTextRef.current = nextText;
      
      if (gameState !== 'playing') {
        setTimeLeft(selectedDuration);
        setSecondsPassed(0);
        setTypedText('');
        setCaretIndex(0);
        setWrongChars(new Set());
        setStartTime(null);
        setFinalResults(null);
      }
    },
    [buildPromptText, gameState, selectedDuration, selectedWordCount],
  );

  const handleWordCountSelect = useCallback(
    (wordCount: number) => {
      setSelectedWordCount(wordCount);

      if (testMode === 'words') {
        const nextText = buildPromptText(testMode, wordCount);
        setText(nextText);
        latestTextRef.current = nextText;

        if (gameState !== 'playing') {
          setTypedText('');
          setCaretIndex(0);
          setWrongChars(new Set());
          setStartTime(null);
          setTimeLeft(selectedDuration);
          setSecondsPassed(0);
          setFinalResults(null);
        }
      }
    },
    [buildPromptText, gameState, selectedDuration, testMode],
  );

  const startGame = useCallback((nextText: string = text, nextDuration: number = selectedDuration) => {
    latestTextRef.current = nextText;
    setText(nextText);
    setTypedText('');
    setCaretIndex(0);
    setWrongChars(new Set());
    setWpmHistory([]);
    setActiveDuration(nextDuration);
    setTimeLeft(nextDuration);
    setSecondsPassed(0);
    setStartTime(null);
    setFinalResults(null);
    setGameState('playing');
    setCaretBlinking(true);
    setScrollY(0);

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    window.setTimeout(() => {
      inputRef.current?.focus();
      setIsFocused(true);
    }, 50);
  }, [selectedDuration, text]);

  const restartWithCurrentMode = useCallback(() => {
    const nextText = buildPromptText(testMode, selectedWordCount);
    startGame(nextText, selectedDuration);
  }, [buildPromptText, selectedDuration, selectedWordCount, startGame, testMode]);

  const togglePunctuation = useCallback(() => {
    setIncludePunctuation(prev => !prev);
    if (gameState !== 'playing') {
      const nextText = buildPromptText(testMode, selectedWordCount);
      setText(nextText);
      latestTextRef.current = nextText;
    }
  }, [buildPromptText, gameState, selectedWordCount, testMode]);

  const toggleNumbers = useCallback(() => {
    setIncludeNumbers(prev => !prev);
    if (gameState !== 'playing') {
      const nextText = buildPromptText(testMode, selectedWordCount);
      setText(nextText);
      latestTextRef.current = nextText;
    }
  }, [buildPromptText, gameState, selectedWordCount, testMode]);

  const handleDurationSelect = useCallback(
    (duration: number) => {
      setSelectedDuration(duration);

      if (gameState !== 'playing') {
        setActiveDuration(duration);
        setTimeLeft(duration);
        setSecondsPassed(0);
      }
    },
    [gameState],
  );

  const endGame = useCallback((finalTyped: string, finalTarget: string) => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState('finished');

    const elapsedSeconds = startTime !== null ? Math.max((performance.now() - startTime) / 1000, 1) : 1;
    const accuracy = calculateAccuracy(finalTyped, finalTarget);
    const grossWpm = calculateGrossWpm(finalTyped.length, elapsedSeconds);
    const netWpm = calculateRecordedWpm(grossWpm, accuracy);
    const errorCount = calculateErrorCount(finalTyped, finalTarget);
    const completionRatio = calculateCompletionRatio(finalTyped.length, finalTarget.length);
    const wpm = Math.round(netWpm);

    const results = {
      wpm,
      grossWpm: Math.round(grossWpm),
      netWpm: Math.round(netWpm),
      accuracy,
      chars: finalTyped.length,
      errorCount,
      completionRatio,
    };

    setFinalResults(results);
    addTypingScore(results);
  }, [startTime, addTypingScore]);

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (gameState !== 'playing') return;

      let value = e.target.value;
      const currentText = latestTextRef.current || text;

      if (startTime === null && value.length > 0) {
        setStartTime(performance.now());
      }

      touchCaret();

      // Skip current word on space press if space is pressed early
      const lastChar = value[value.length - 1];
      if (lastChar === ' ' && value.length > typedText.length) {
        const currentPos = typedText.length;
        const nextSpaceIndex = currentText.indexOf(' ', currentPos);
        if (nextSpaceIndex !== -1 && nextSpaceIndex > currentPos) {
          const skippedSnippet = currentText.slice(currentPos, nextSpaceIndex);
          
          setWrongChars(prev => {
            const next = new Set(prev);
            for (let i = currentPos; i < nextSpaceIndex; i++) {
              next.add(i);
            }
            return next;
          });

          const newValue = typedText + skippedSnippet + ' ';
          setTypedText(newValue);
          setCaretIndex(newValue.length);
          e.target.value = newValue;

          if (testMode === 'time' && newValue.length > currentText.length - 300) {
            const moreWords = buildPromptText('words', 200);
            setText(prev => prev + ' ' + moreWords);
          }
          return;
        }
      }

      setWrongChars(prev => {
        const next = new Set(prev);
        let errorPlayed = false;

        // Clear deleted indices
        for (const idx of next) {
          if (idx >= value.length) {
            next.delete(idx);
          }
        }

        // Add or remove incorrect characters
        for (let index = 0; index < value.length; index += 1) {
          if (value[index] !== currentText[index]) {
            if (!next.has(index) && index === value.length - 1 && value.length > typedText.length) {
              if (soundEnabled) SoundEffects.playError();
              errorPlayed = true;
            }
            next.add(index);
          } else {
            next.delete(index);
          }
        }

        if (value.length > typedText.length && !errorPlayed) {
          if (soundEnabled) SoundEffects.playClick();
        }

        return next;
      });

      setTypedText(value);
      setCaretIndex(value.length);

      // Time Mode: append words infinitely if near the end
      if (testMode === 'time' && value.length > currentText.length - 300) {
        const moreWords = buildPromptText('words', 200);
        setText(prev => prev + ' ' + moreWords);
      }

      // Words Mode: end game when typing matches length
      if (testMode === 'words' && value.length >= currentText.length) {
        endGame(value, currentText);
      }
    },
    [endGame, gameState, startTime, text, touchCaret, testMode, buildPromptText, typedText.length, soundEnabled],
  );

  const seedInitialCharacter = useCallback(
    (character: string) => {
      const currentText = latestTextRef.current;

      setTypedText(character);
      setCaretIndex(1);
      setStartTime(performance.now());
      touchCaret();

      const isCorrect = currentText[0] === character;
      if (soundEnabled) {
        if (isCorrect) {
          SoundEffects.playClick();
        } else {
          SoundEffects.playError();
        }
      }

      setWrongChars(prev => {
        const next = new Set(prev);

        if (currentText[0] !== character) {
          next.add(0);
        }

        return next;
      });
    },
    [touchCaret, soundEnabled],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab Quick Restart
      if (event.key === 'Tab') {
        event.preventDefault();
        restartWithCurrentMode();
        return;
      }

      // Automatically focus hidden input on any printable character
      if (gameState === 'playing' && document.activeElement !== inputRef.current && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        inputRef.current?.focus();
        setIsFocused(true);
      }

      if (gameState === 'idle' && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        startGame(text);
        seedInitialCharacter(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, restartWithCurrentMode, seedInitialCharacter, startGame, text]);

  useEffect(() => {
    if (gameState === 'playing' && startTime !== null) {
      timerRef.current = window.setInterval(() => {
        let elapsed = 0;
        setSecondsPassed(prev => {
          const next = prev + 1;
          elapsed = next;
          return next;
        });

        if (testMode === 'time') {
          setTimeLeft(prev => {
            if (prev <= 1) {
              return 0;
            }
            return prev - 1;
          });
        }

        const curTyped = latestTypedTextRef.current;
        const curText = latestTextRef.current;
        const curAccuracy = calculateAccuracy(curTyped, curText);
        const curGross = elapsed > 0 ? calculateGrossWpm(curTyped.length, elapsed) : 0;
        const curNet = calculateRecordedWpm(curGross, curAccuracy);
        setWpmHistory(prev => [...prev, Math.round(curNet)]);
      }, 1000);
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, startTime, testMode]);

  // Handle countdown ending in time mode
  useEffect(() => {
    if (testMode === 'time' && timeLeft === 0 && gameState === 'playing') {
      endGame(typedText, text);
    }
  }, [timeLeft, gameState, endGame, typedText, text, testMode]);

  useEffect(() => {
    if (gameState !== 'playing') {
      setCaretBlinking(true);
      if (caretIdleTimerRef.current !== null) {
        window.clearTimeout(caretIdleTimerRef.current);
        caretIdleTimerRef.current = null;
      }
    }
  }, [gameState]);

  const elapsedSeconds = startTime !== null
    ? (testMode === 'time'
        ? Math.max(activeDuration - timeLeft, 1)
        : Math.max(secondsPassed, 1))
    : 0;
  const accuracy = calculateAccuracy(typedText, text);
  const grossWpm = elapsedSeconds > 0 ? calculateGrossWpm(typedText.length, elapsedSeconds) : 0;
  const netWpm = calculateRecordedWpm(grossWpm, accuracy);
  const wpm = Math.round(netWpm);
  const isTimeMode = testMode === 'time';

  const getWordsProgress = () => {
    const typedWords = typedText.trim().split(/\s+/).filter(Boolean).length;
    const totalWords = text.split(/\s+/).length;
    return `${typedWords}/${totalWords}`;
  };

  const progressPercent = useMemo(() => {
    if (gameState !== 'playing') return 0;
    if (testMode === 'time') {
      return ((activeDuration - timeLeft) / activeDuration) * 100;
    }
    return (typedText.length / text.length) * 100;
  }, [gameState, testMode, activeDuration, timeLeft, typedText.length, text.length]);



  const activeCaretWidth = caretType === 'block' ? 'w-[9px]' : caretType === 'underline' ? 'w-[10px]' : 'w-[1.5px]';

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

      <main className="px-6 pb-10 pt-20 animate-slide-up-fade app-center min-h-[calc(100vh-4.5rem)]">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
          
          {/* Centered Minimalist Option Row */}
          <div className={`w-full font-mono text-xs uppercase tracking-wider text-[var(--app-comment)] flex justify-center items-center gap-x-4 mb-8 select-none transition-opacity duration-150 ${gameState === 'playing' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {TEST_DURATION_OPTIONS.map(duration => (
              <button
                key={duration}
                type="button"
                className={`hover:text-[var(--app-text-correct)] transition-colors ${selectedDuration === duration ? 'text-[var(--app-text-correct)] font-bold' : ''}`}
                onClick={() => handleDurationSelect(duration)}
              >
                {duration}s
              </button>
            ))}

            <span className="text-[var(--app-border)] select-none">|</span>

            <button
              type="button"
              className="hover:text-[var(--app-text-correct)] transition-colors font-bold"
              onClick={restartWithCurrentMode}
              aria-label="Restart test"
            >
              restart
            </button>
          </div>

          {/* Progress Indicator Line */}
          <div className="w-full h-[1px] bg-[var(--app-border)] relative overflow-hidden mb-8">
            <div 
              className="absolute left-0 top-0 h-full bg-[var(--app-text-correct)] transition-all duration-200" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Typing Area Container */}
          <div className="relative mx-auto w-full max-w-2xl py-4">
            
            {/* Swiss Borderless Typing Box */}
            <div 
              className="relative overflow-hidden font-mono outline-none"
              style={{ maxHeight: 'calc(3.8rem * 3)' }} // exactly 3 lines high
              onClick={() => {
                inputRef.current?.focus();
                setIsFocused(true);
              }}
            >
              {/* Scrolling Spans Container */}
              <div
                className="will-change-transform transition-transform duration-150 ease-out relative"
                style={{
                  transform: `translateY(${-scrollY}px)`,
                  fontFamily: "'Roboto Mono', 'JetBrains Mono', monospace",
                  lineHeight: '3.8rem',
                }}
              >
                {/* Elastic glided caret (spring movement feel similar to Monkeytype) */}
                <div
                  className={`absolute bg-[var(--app-caret)] pointer-events-none ${
                    caretBlinking && isFocused ? 'animate-blink-caret' : ''
                  } ${activeCaretWidth}`}
                  style={{
                    left: `${caretStyle.left}px`,
                    top: caretType === 'underline' 
                      ? `${caretStyle.top + caretStyle.height - 4}px` 
                      : `${caretStyle.top + 4}px`,
                    height: caretType === 'underline' 
                      ? '2px' 
                      : `${caretStyle.height - 8}px`,
                    opacity: isFocused && caretStyle.visible ? (caretType === 'block' ? 0.35 : 1) : 0,
                    zIndex: 2,
                    transition: 'left 0.08s cubic-bezier(0.175, 0.885, 0.32, 1.1), top 0.12s ease-out, opacity 0.1s ease',
                  }}
                />

                <div 
                  ref={wordsContainerRef}
                  className="relative whitespace-pre-wrap select-none pointer-events-none text-3xl leading-[3.8rem]"
                >
                  {text.split('').map((char, index) => {
                    const isTyped = index < typedText.length;
                    const isWrong = isTyped && wrongChars.has(index);
                    const isCorrect = isTyped && !isWrong && typedText[index] === char;

                    let className = 'text-[var(--app-text-pending)] font-mono';
                    if (isCorrect) {
                      className = 'text-[var(--app-text-correct)] font-mono';
                    } else if (isWrong) {
                      className = 'text-red-500 line-through decoration-1 decoration-red-500 font-mono';
                    }

                    return (
                      <span key={index} className={className}>
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Simple Typographic Live Stats */}
            <div className="flex justify-between items-center h-8 text-[var(--app-comment)] font-mono text-xs uppercase tracking-wider mt-6 border-t border-[var(--app-border)] pt-4 select-none">
              <div>
                {gameState === 'playing' && (
                  <span className="font-bold text-[var(--app-text-correct)]">
                    {testMode === 'time' ? `${timeLeft}s remaining` : `progress: ${getWordsProgress()}`}
                  </span>
                )}
              </div>
              <div>
                {gameState === 'playing' && startTime !== null && (
                  <div className="flex gap-4 animate-pulse">
                    <span>wpm: <strong className="text-[var(--app-text-correct)]">{Math.round(wpm)}</strong></span>
                    <span>acc: <strong className="text-[var(--app-text-correct)]">{Math.round(accuracy)}%</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden Native Input */}
            <input
              ref={inputRef}
              type="text"
              value={typedText}
              onChange={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="absolute -z-50 opacity-0 pointer-events-none"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-label="Typing input"
            />
          </div>

          {/* History Accordion */}
          <div className={`w-full max-w-2xl mx-auto mt-12 flex flex-col gap-6 transition-opacity duration-150 ${gameState === 'playing' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <details className="group border-t border-[var(--app-border)] pt-4">
              <summary className="cursor-pointer list-none select-none font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--app-comment)] hover:text-[var(--app-text-correct)] transition-colors">
                [ view history ]
              </summary>
              <div className="mt-4">
                <ScoreDisplay scores={scores.typingTest} type="typing" />
              </div>
            </details>

            <div className="app-footer select-none text-[var(--app-comment)] text-[9px] uppercase tracking-wider">
              press <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-[var(--app-border)] text-[8px] font-mono mx-0.5 text-[var(--app-text-correct)]">tab</kbd> to restart test at any time
            </div>
          </div>
        </div>
      </main>

      {/* Finished Results Typographic Overlay */}
      {gameState === 'finished' && finalResults && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--app-bg)] animate-in fade-in duration-100">
          <div className="w-full max-w-2xl px-6 py-8">
            <div className="border-b border-[var(--app-border)] pb-8 mb-8">
              <h2 className="font-mono text-3xl font-bold uppercase tracking-tighter text-[var(--app-text-correct)]">
                test completed.
              </h2>
              <p className="font-mono text-xs text-[var(--app-comment)] uppercase tracking-wider mt-1">
                monochrome typist performance stats
              </p>
            </div>

            <div className="grid gap-12">
              <div className="grid gap-8 grid-cols-3">
                <TypoStat label="wpm" value={finalResults.wpm} />
                <TypoStat label="accuracy" value={`${finalResults.accuracy.toFixed(0)}%`} />
                <TypoStat label="chars typed" value={finalResults.chars} />
              </div>

              <div className="grid gap-x-8 gap-y-4 grid-cols-2 md:grid-cols-4 border-t border-[var(--app-border)] pt-8">
                <TypoStat label="gross speed" value={`${finalResults.grossWpm} wpm`} />
                <TypoStat label="net speed" value={`${finalResults.netWpm} wpm`} />
                <TypoStat label="error count" value={finalResults.errorCount} />
                <TypoStat label="done ratio" value={`${finalResults.completionRatio.toFixed(0)}%`} />
              </div>

              <WpmChart history={wpmHistory} />

              <div className="mt-8 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--app-comment)]">
                press <button onClick={() => startGame(buildPromptText(testMode, selectedWordCount))} className="text-[var(--app-text-correct)] font-bold underline underline-offset-2">tab</button> or click here to start a new test
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
