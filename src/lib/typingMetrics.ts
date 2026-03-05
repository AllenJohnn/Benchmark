export const calculateAccuracy = (typed: string, original: string): number => {
  if (typed.length === 0) {
    return 100;
  }

  let correctChars = 0;

  for (let index = 0; index < typed.length; index++) {
    if (typed[index] === original[index]) {
      correctChars++;
    }
  }

  return (correctChars / typed.length) * 100;
};

export const calculateGrossWpm = (characterCount: number, elapsedSeconds: number): number => {
  if (characterCount <= 0 || elapsedSeconds <= 0) {
    return 0;
  }

  return (characterCount / 5) / (elapsedSeconds / 60);
};

export const calculateRecordedWpm = (grossWpm: number, accuracy: number): number => {
  if (grossWpm <= 0) {
    return 0;
  }

  const boundedAccuracy = Math.min(Math.max(accuracy, 0), 100);

  return grossWpm * (boundedAccuracy / 100);
};

export const calculateErrorCount = (typed: string, original: string): number => {
  let errors = 0;

  for (let index = 0; index < typed.length; index++) {
    if (typed[index] !== original[index]) {
      errors++;
    }
  }

  return errors;
};

export const calculateCompletionRatio = (typedLength: number, originalLength: number): number => {
  if (originalLength <= 0) {
    return 0;
  }

  return Math.min((typedLength / originalLength) * 100, 100);
};