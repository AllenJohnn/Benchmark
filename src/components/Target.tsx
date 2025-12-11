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
      className="absolute cursor-crosshair select-none transition-transform duration-75"
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
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-destructive border-4 border-white shadow-lg" />
      
      {/* Middle ring */}
      <div 
        className="absolute rounded-full bg-white"
        style={{ 
          top: '20%',
          left: '20%',
          width: '60%',
          height: '60%',
        }}
      />
      
      {/* Center dot */}
      <div 
        className="absolute rounded-full bg-destructive"
        style={{ 
          top: '40%',
          left: '40%',
          width: '20%',
          height: '20%',
        }}
      />
    </div>
  );
}
