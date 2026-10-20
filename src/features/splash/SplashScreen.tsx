import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      onClick={onComplete}
      className="fixed inset-0 z-50 bg-[#111111] flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer"
      title="Click anywhere to skip to Sign In"
    >
      <div className="flex flex-col items-center">
        {/* Animated Brand Emblem */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F28C45] via-[#f79d5e] to-[#ffb380] flex items-center justify-center shadow-2xl shadow-[#F28C45]/30 mb-6"
        >
          <span className="text-3xl font-black text-[#121212]">V</span>
        </motion.div>

        {/* Wordmark */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold tracking-widest text-white flex items-center gap-2"
        >
          VYBE
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="w-3 h-3 rounded-full bg-[#F28C45] inline-block shadow-lg shadow-[#F28C45]/50"
          />
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-3 text-sm md:text-base text-neutral-400 font-medium tracking-wide"
        >
          Your vibe. Your AI. Your moves.
        </motion.p>
      </div>

      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 140 }}
        transition={{ delay: 0.3, duration: 1.5, ease: "easeInOut" }}
        className="h-1 bg-[#F28C45] rounded-full mt-10 overflow-hidden"
      />

      <span className="mt-8 text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
        Click anywhere to continue →
      </span>
    </div>
  );
};
