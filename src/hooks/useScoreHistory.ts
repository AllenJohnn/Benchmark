import { useState, useEffect } from 'react';

export interface AimScore {
  time: number;
  accuracy: number;
  cps: number;
  date: string;
}

export interface TypingScore {
  wpm: number;
  accuracy: number;
  chars: number;
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
      return JSON.parse(stored);
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
