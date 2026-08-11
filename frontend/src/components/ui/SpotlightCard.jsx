import React, { useState, useCallback } from 'react';

export const SpotlightCard = React.memo(({ children, className = "" }) => {
  const [pos, setPos] = useState({ x: 0, y: 0, opacity: 0 });
  
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 });
  }, []);
  
  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos(p => ({ ...p, opacity: 0 }))}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
    >
      <div 
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0 will-change-transform transform-gpu"
        style={{
          opacity: pos.opacity,
          background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(99, 102, 241, 0.12), transparent 40%)`
        }}
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
});
