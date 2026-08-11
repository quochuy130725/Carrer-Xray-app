import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const Hero3DObject = () => {
  // Motion values for tracking mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid motion
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Map mouse position to 3D rotation degrees
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse position between -0.5 and 0.5
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-90 hidden lg:block w-[400px] h-[400px] z-10" style={{ perspective: '1000px' }}>
      <motion.div
        className="w-full h-full relative flex items-center justify-center transform-style-3d"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Core Glowing Orb */}
        <div className="absolute w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl animate-pulse" style={{ transform: 'translateZ(-50px)' }} />
        <div className="absolute w-32 h-32 bg-rose-400/20 rounded-full blur-xl animate-pulse" style={{ transform: 'translateZ(50px)' }} />

        {/* Outer Orbital Ring 1 */}
        <div className="absolute w-72 h-72 rounded-full border border-indigo-300/30 border-t-indigo-400/60 animate-[spin_10s_linear_infinite]" style={{ transform: 'translateZ(20px) rotateX(70deg)' }} />
        
        {/* Outer Orbital Ring 2 */}
        <div className="absolute w-64 h-64 rounded-full border border-sky-300/30 border-b-rose-400/60 animate-[spin_15s_linear_infinite_reverse]" style={{ transform: 'translateZ(-20px) rotateY(60deg)' }} />

        {/* Inner Glassmorphism Gem / Shield */}
        <div 
          className="relative w-48 h-56 rounded-3xl border border-white/40 glass-3d-shine shadow-2xl overflow-hidden flex items-center justify-center"
          style={{ 
            transform: 'translateZ(40px)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Inner details for glass */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/30" />
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
          
          <div className="w-16 h-16 rounded-2xl border-2 border-indigo-400/50 rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.8)]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero3DObject;
