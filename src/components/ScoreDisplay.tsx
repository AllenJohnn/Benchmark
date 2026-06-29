import { AimScore, TypingScore } from '@/hooks/useScoreHistory';

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
      <div className="text-left py-4 select-none">
        <p className="text-[var(--app-comment)] font-mono text-[9px] uppercase tracking-wider">// no history records found.</p>
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
    }).toLowerCase();
  };

  if (props.type === 'aim') {
    return (
      <div className="font-mono text-xs select-none">
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {(props.scores as AimScore[]).map((score, index) => (
            <div 
              key={score.date}
              className={`flex justify-between items-center py-2 border-b border-[var(--app-border)] ${
                index === 0 ? 'font-bold text-[var(--app-text-correct)]' : 'text-[var(--app-comment)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{index === 0 ? '→' : ' '}</span>
                <span>{score.cps.toFixed(2)} cps</span>
                <span>/</span>
                <span>{score.accuracy.toFixed(0)}% acc</span>
                <span>/</span>
                <span>{score.time.toFixed(2)}s</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider">{formatDate(score.date)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs select-none">
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {(props.scores as TypingScore[]).map((score, index) => (
          <div 
            key={score.date}
            className={`border-b border-[var(--app-border)] pb-2.5 ${
              index === 0 ? 'text-[var(--app-text-correct)]' : 'text-[var(--app-comment)]'
            }`}
          >
            <div className="flex justify-between items-center font-bold mb-1">
              <div className="flex items-center gap-3">
                <span>{index === 0 ? '→' : ' '}</span>
                <span>{score.netWpm ?? score.wpm} wpm</span>
                <span>/</span>
                <span>{score.accuracy.toFixed(0)}% acc</span>
              </div>
              <span className="text-[9px] font-normal uppercase tracking-wider">{formatDate(score.date)}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-[9px] uppercase tracking-wider mt-1 text-[var(--app-comment)] pl-6">
              <span>gross: {score.grossWpm ?? score.wpm}</span>
              <span>errors: {score.errorCount ?? 0}</span>
              <span>chars: {score.chars}</span>
              <span>done: {(score.completionRatio ?? 0).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
