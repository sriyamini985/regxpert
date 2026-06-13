import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HeroBanner: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  // Parallax effect for background
  const backgroundY = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      className="relative bg-gradient-to-br from-primary via-blue-600 to-secondary text-white text-center py-24 overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ opacity }}
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y: backgroundY }}
      >
        {/* Floating Orbs */}
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: '10%', right: '5%' }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full bg-blue-300/10 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '40%', right: '30%' }}
        />

        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
      </motion.div>

      {/* Content with 3D Parallax */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Title with 3D depth */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6 text-glow-primary"
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, type: 'spring', damping: 20 }}
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
            textShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          Welcome to RegXpert
        </motion.h1>

        {/* Subtitle with offset parallax */}
        <motion.p
          className="text-xl md:text-2xl mt-4 text-white/90"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', damping: 25 }}
          style={{
            transform: `translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 5}px)`
          }}
        >
          Your all-in-one event management platform.
        </motion.p>

        {/* CTA Button with 3D glow effect */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, type: 'spring', damping: 15 }}
        >
          <motion.button
            className="relative bg-white text-primary font-bold py-4 px-8 rounded-full shadow-2xl overflow-hidden group"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 40px rgba(6, 182, 212, 0.3)'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
              animate={{ translateX: ['−100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create an Event
            </span>
          </motion.button>
        </motion.div>

        {/* Floating Badge */}
        <motion.div
          className="absolute -right-4 top-0 md:right-10 md:top-10"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-sm font-medium">
            ✨ Trusted by 10K+ organizers
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16">
          <motion.path
            d="M0,60 C360,100 720,20 1080,60 C1260,80 1380,70 1440,60 L1440,120 L0,120 Z"
            fill="var(--color-background)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default HeroBanner;
