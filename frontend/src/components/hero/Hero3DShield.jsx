import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export const Hero3DShield = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]));
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]));
  
  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  
  return (
    <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20 pointer-events-auto hidden md:block">
      <motion.div 
        onMouseMove={handleMouse}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        style={{ rotateX, rotateY, perspective: 1000 }}
        className="relative w-48 h-48 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-sky-400/30 to-rose-400/20 backdrop-blur-xl border border-white/60 shadow-2xl flex items-center justify-center cursor-pointer transform-style-3d"
      >
        <div className="w-24 h-24 rounded-2xl bg-indigo-600/30 border border-indigo-300/50 backdrop-blur-md flex items-center justify-center shadow-inner" style={{ transform: 'translateZ(30px)' }}>
          <span className="text-5xl animate-bounce">🛡️</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero3DShield;
