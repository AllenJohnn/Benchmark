import { AimScore, TypingScore } from '@/hooks/useScoreHistory';
import { Trophy } from 'lucide-react';

interface AimScoreDisplayProps {
  scores: AimScore[];
  type: 'aim';
}

interface TypingScoreDisplayProps {
  scores: TypingScore[];
  type: 'typing';
}

type ScoreDisplayProps = AimScoreDisplayProps | TypingScoreDisplayProps;

export function ScoreDisplay(props: ScoreDisplayProps) {
  if (props.scores.length === 0) {
    return (
      <div className="glass-card rounded-lg p-6 text-center">
        <Trophy className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground font-mono text-sm">No scores yet</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (props.type === 'aim') {
    return (
      <div className="glass-card rounded-lg p-4">
        <h3 className="font-mono font-semibold mb-3 text-sm">History</h3>
        <div className="space-y-2">
          {(props.scores as AimScore[]).map((score, index) => (
            <div 
              key={score.date}
              className={`p-3 rounded bg-secondary/50 ${index === 0 ? 'ring-1 ring-foreground/10' : ''}`}
            >
              <div className="flex items-center justify-between text-sm font-mono mb-1">
                <span>{score.time.toFixed(2)}s</span>
                <span className={score.accuracy >= 90 ? 'text-success' : score.accuracy >= 70 ? '' : 'text-destructive'}>
                  {score.accuracy.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{score.cps.toFixed(2)} cps</span>
                <span>{formatDate(score.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-4">
      <h3 className="font-mono font-semibold mb-3 text-sm">History</h3>
      <div className="space-y-2">
        {(props.scores as TypingScore[]).map((score, index) => (
          <div 
            key={score.date}
            className={`p-3 rounded bg-secondary/50 ${index === 0 ? 'ring-1 ring-foreground/10' : ''}`}
          >
            <div className="flex items-center justify-between text-sm font-mono mb-1">
              <span>{score.wpm} wpm</span>
              <span className={score.accuracy >= 95 ? 'text-success' : score.accuracy >= 85 ? '' : 'text-destructive'}>
                {score.accuracy.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{score.chars} chars</span>
              <span>{formatDate(score.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
