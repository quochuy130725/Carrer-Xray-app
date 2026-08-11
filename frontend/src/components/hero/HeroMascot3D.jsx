import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

const HeroMascot3D = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-150, 150], [12, -12]));
  const rotateY = useSpring(useTransform(x, [-150, 150], [-12, 12]));

  const [isHovered, setIsHovered] = useState(false);
  const [clickPulses, setClickPulses] = useState([]);
  const [particles, setParticles] = useState([]);

  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      // Cleanup all active timeouts on unmount
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }, [x, y]);

  const handleRobotClick = useCallback(() => {
    const newPulseId = Date.now();
    setClickPulses((prev) => [...prev, newPulseId]);
    const pulseTimer = setTimeout(() => {
      setClickPulses((prev) => prev.filter(id => id !== newPulseId));
    }, 1500);
    timeoutsRef.current.push(pulseTimer);

    const icons = ["⚡ Scanned", "🛡️ Safe", "🔍 0ms", "✨ Verified", "🎯 Precision"];
    const newParticles = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      text: icons[i % icons.length],
      angle: (i * (360 / 5)) * (Math.PI / 180),
      distance: 120 + Math.random() * 50
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    const particleTimer = setTimeout(() => {
      setParticles((prev) => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 2000);
    timeoutsRef.current.push(particleTimer);
  }, []);

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-auto hidden lg:block w-[450px] h-[450px] overflow-visible p-6 sm:p-8">
      <motion.div
        onMouseMove={handleMouse}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { x.set(0); y.set(0); setIsHovered(false); }}
        style={{ rotateX, rotateY, perspective: 1000 }}
        className="w-full h-full relative flex items-center justify-center transform-style-3d cursor-pointer will-change-transform transform-gpu"
        onClick={handleRobotClick}
      >
        {/* Ambient Glowing Aura */}
        <div className={`absolute w-64 h-64 rounded-full blur-[80px] transition-colors duration-500 ${isHovered ? 'bg-rose-500/30' : 'bg-indigo-500/20 animate-pulse'}`} style={{ transform: 'translateZ(-50px)' }} />
        <div className="absolute w-48 h-48 bg-rose-400/20 rounded-full blur-[60px]" style={{ transform: 'translateZ(-30px)' }} />

        {/* Expanding Radar Wave Rings on Click */}
        <AnimatePresence>
          {clickPulses.map((pulseId) => (
            <motion.div
              key={pulseId}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-56 h-64 rounded-[40px] border-4 border-indigo-500/50 will-change-transform transform-gpu"
              style={{ transform: 'translateZ(10px)' }}
            />
          ))}
        </AnimatePresence>

        {/* Burst Particles on Click */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 1.2,
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance - 40
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-full shadow-lg text-[10px] font-bold text-slate-700 pointer-events-none will-change-transform transform-gpu"
              style={{ transform: 'translateZ(90px)' }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating Badges / Emitters */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-2 left-2 bg-white/90 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 will-change-transform transform-gpu"
          style={{ transform: 'translateZ(60px)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span className="text-xs font-bold text-slate-800">Real-Time X-Ray</span>
        </motion.div>

        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-2 right-2 bg-indigo-600/90 backdrop-blur-md border border-indigo-400 px-4 py-2 rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] flex items-center gap-2 will-change-transform transform-gpu"
          style={{ transform: 'translateZ(80px)' }}
        >
          <span className="text-sm">🛡️</span>
          <span className="text-xs font-extrabold text-white">MIL STANDARD</span>
        </motion.div>

        <motion.div
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-2 bg-white/90 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 will-change-transform transform-gpu"
          style={{ transform: 'translateZ(40px)' }}
        >
          <span className="text-sm">🔍</span>
          <span className="text-xs font-bold text-slate-800">100% Scan</span>
        </motion.div>

        {/* Core Mascot Avatar */}
        <motion.div
          animate={isHovered ? { scale: 1.05, rotate: [-3, 3, -3] } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, rotate: { repeat: isHovered ? Infinity : 0, duration: 2, ease: "easeInOut" } }}
          className="w-56 h-64 rounded-[40px] glass-3d-shine border border-white/60 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center animate-float-3d will-change-transform transform-gpu"
          style={{ transform: 'translateZ(40px)' }}
        >
          {/* Periodic Scanning Radar Sweep inside Mascot */}
          <div className="absolute inset-0 overflow-hidden rounded-[40px]">
            <div className="w-full h-1 bg-indigo-400/80 shadow-[0_0_15px_#818CF8] animate-[scanBeam_5s_ease-in-out_infinite]" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Mascot Head / Core */}
            <div className={`w-20 h-20 rounded-3xl mb-4 border flex items-center justify-center transition-colors duration-300 ${isHovered ? 'bg-rose-500 border-rose-400 shadow-[inset_0_4px_10px_rgba(255,255,255,0.4),0_10px_30px_rgba(244,63,94,0.6)]' : 'bg-indigo-600 border-indigo-400 shadow-[inset_0_4px_10px_rgba(255,255,255,0.4),0_10px_30px_rgba(79,70,229,0.6)]'}`}>
              <div className="w-10 h-4 bg-white/20 rounded-full flex justify-between items-center px-1">
                <div className={`w-2 h-2 rounded-full animate-pulse transition-colors ${isHovered ? 'bg-white' : 'bg-cyan-300'}`} />
                <div className={`w-2 h-2 rounded-full animate-pulse transition-colors ${isHovered ? 'bg-white' : 'bg-cyan-300'}`} />
              </div>
            </div>

            {/* Mascot Body Details */}
            <div className="w-32 h-6 bg-slate-100/50 rounded-full backdrop-blur-sm border border-white/50 flex items-center justify-around px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(HeroMascot3D);
