import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
    children: React.ReactNode;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ children }) => {
    const [showSplash, setShowSplash] = useState(true);
    const [showBrand, setShowBrand] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // After 2s, reveal brand name
        const brandTimer = setTimeout(() => setShowBrand(true), 2000);

        // After 3.5s, start fade-out
        const fadeTimer = setTimeout(() => setIsFadingOut(true), 3500);

        // After fade-out completes (~0.6s), remove splash entirely
        const removeTimer = setTimeout(() => setShowSplash(false), 4200);

        return () => {
            clearTimeout(brandTimer);
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!showSplash) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Pre-render children behind splash for instant reveal */}
            <div style={{ position: 'fixed', inset: 0, opacity: 0, pointerEvents: 'none' }}>
                {children}
            </div>

            {/* Splash Overlay */}
            <motion.div
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0F9FF 100%)' }}
                animate={{ opacity: isFadingOut ? 0 : 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
                {/* Subtle ambient glow behind logo */}
                <div
                    className="absolute w-[300px] h-[300px] rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10"
                >
                    <img
                        src="/assets/images/regiverse-logo-new.png"
                        alt="RegXperts"
                        className="w-24 h-24 object-contain"
                        style={{ filter: 'drop-shadow(0 4px 20px rgba(99,102,241,0.15))' }}
                    />
                </motion.div>

                {/* Brand Name */}
                <motion.div
                    className="relative z-10 mt-6 flex flex-col items-center"
                    initial={{ opacity: 0, y: 12 }}
                    animate={showBrand ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{
                            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        RegXperts
                    </h1>
                    <p
                        className="text-sm mt-1.5 font-medium tracking-wide"
                        style={{ color: '#94A3B8' }}
                    >
                        Where Events Meet People
                    </p>
                </motion.div>

                {/* Minimal loading indicator */}
                <motion.div
                    className="absolute bottom-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-300"
                                style={{
                                    animation: `splashPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Inline keyframes for the loading dots */}
            <style>{`
                @keyframes splashPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
            `}</style>
        </>
    );
};

export default SplashScreen;
