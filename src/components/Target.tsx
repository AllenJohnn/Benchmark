import { useState, useCallback } from 'react';

interface TargetProps {
  x: number;
  y: number;
  size: number;
  onHit: () => void;
}

export function Target({ x, y, size, onHit }: TargetProps) {
  const [isHit, setIsHit] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isHit) return;
    
    setIsHit(true);
    onHit();
  }, [isHit, onHit]);

  return (
    <div
      className="absolute cursor-crosshair select-none animate-in zoom-in-75 duration-100"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${isHit ? 0.8 : 1})`,
        opacity: isHit ? 0 : 1,
        transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
      }}
      onClick={handleClick}
    >
      {/* Target Reticle circle */}
      <div className="absolute inset-0 rounded-full border border-[var(--app-caret)] transition-colors duration-150" />
      
      {/* Target Crosshair lines */}
      {/* Horizontal line */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[var(--app-caret)] opacity-35" />
      {/* Vertical line */}
      <div className="absolute left-1/2 top-0 w-[1px] h-full bg-[var(--app-caret)] opacity-35" />
      
      {/* Small center dot */}
      <div 
        className="absolute rounded-full bg-[var(--app-caret)]"
        style={{ 
          top: '46%',
          left: '46%',
          width: '8%',
          height: '8%',
        }}
      />
    </div>
  );
}
