import { describe, expect, it } from 'vitest';
import {
  calculateAccuracy,
  calculateCompletionRatio,
  calculateErrorCount,
  calculateGrossWpm,
  calculateRecordedWpm,
} from '@/lib/typingMetrics';

describe('typing metrics', () => {
  it('calculates accuracy from character matches over typed length', () => {
    expect(calculateAccuracy('quick brown fox', 'quick brown fox')).toBe(100);
    expect(calculateAccuracy('quick br0wn fox', 'quick brown fox')).toBeCloseTo(93.3333, 3);
    expect(calculateAccuracy('', 'quick brown fox')).toBe(100);
  });

  it('calculates gross WPM using (chars / 5) / minutes', () => {
    const chars = 'quick brown fox'.length;
    const grossWpm = calculateGrossWpm(chars, 60);

    expect(grossWpm).toBe(3);
  });

  it('calculates recorded WPM as gross WPM multiplied by accuracy', () => {
    const grossWpm = calculateGrossWpm(300, 60);
    const recorded = calculateRecordedWpm(grossWpm, 80);

    expect(grossWpm).toBe(60);
    expect(recorded).toBe(48);
  });

  it('guards invalid inputs', () => {
    expect(calculateGrossWpm(120, 0)).toBe(0);
    expect(calculateRecordedWpm(50, -10)).toBe(0);
    expect(calculateRecordedWpm(50, 120)).toBe(50);
  });

  it('calculates error count and completion ratio', () => {
    expect(calculateErrorCount('quick br0wn', 'quick brown')).toBe(1);
    expect(calculateCompletionRatio(50, 200)).toBe(25);
    expect(calculateCompletionRatio(220, 200)).toBe(100);
    expect(calculateCompletionRatio(10, 0)).toBe(0);
  });
});