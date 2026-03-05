import { useState, useEffect } from 'react';

export interface AimScore {
  time: number;
  accuracy: number;
  cps: number;
  date: string;
}

export interface TypingScore {
  wpm: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  chars: number;
  errorCount: number;
  completionRatio: number;
  date: string;
}

export interface ScoreHistory {
  aimTrainer: AimScore[];
  typingTest: TypingScore[];
}

const STORAGE_KEY = 'quickbench-scores';
const MAX_SCORES = 5;

const getInitialScores = (): ScoreHistory => {
  if (typeof window === 'undefined') {
    return { aimTrainer: [], typingTest: [] };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ScoreHistory>;

      const typingTest = (parsed.typingTest ?? []).map((score) => {
        const grossWpm = score.grossWpm ?? score.wpm ?? 0;
        const netWpm = score.netWpm ?? score.wpm ?? 0;
        const chars = score.chars ?? 0;
        const errorCount = score.errorCount ?? 0;
        const completionRatio = score.completionRatio ?? 0;

        return {
          ...score,
          grossWpm,
          netWpm,
          chars,
          errorCount,
          completionRatio,
          wpm: score.wpm ?? netWpm,
          accuracy: score.accuracy ?? 100,
          date: score.date ?? new Date().toISOString(),
        };
      });

      return {
        aimTrainer: parsed.aimTrainer ?? [],
        typingTest,
      };
    }
  } catch (e) {
    console.error('Failed to load scores:', e);
  }
  
  return { aimTrainer: [], typingTest: [] };
};

export function useScoreHistory() {
  const [scores, setScores] = useState<ScoreHistory>(getInitialScores);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
      console.error('Failed to save scores:', e);
    }
  }, [scores]);

  const addAimScore = (score: Omit<AimScore, 'date'>) => {
    setScores(prev => ({
      ...prev,
      aimTrainer: [
        { ...score, date: new Date().toISOString() },
        ...prev.aimTrainer,
      ].slice(0, MAX_SCORES),
    }));
  };

  const addTypingScore = (score: Omit<TypingScore, 'date'>) => {
    setScores(prev => ({
      ...prev,
      typingTest: [
        { ...score, date: new Date().toISOString() },
        ...prev.typingTest,
      ].slice(0, MAX_SCORES),
    }));
  };

  const clearScores = () => {
    setScores({ aimTrainer: [], typingTest: [] });
  };

  return {
    scores,
    addAimScore,
    addTypingScore,
    clearScores,
  };
}
