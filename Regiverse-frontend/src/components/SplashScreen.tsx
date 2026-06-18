import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
    children: React.ReactNode;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ children }) => {
    const [showSplash, setShowSplash] = useState(() => {
        if (window.location.pathname === "/print-qr") return false;
        return sessionStorage.getItem("splashShown") !== "true";
    });
    const [showBrand, setShowBrand] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        if (!showSplash) return;

        // After 0.8s, reveal brand name
        const brandTimer = setTimeout(() => setShowBrand(true), 800);

        // After 3.5s, start fade-out
        const fadeTimer = setTimeout(() => setIsFadingOut(true), 3500);

        // After fade-out completes (~0.6s), remove splash entirely
        const removeTimer = setTimeout(() => {
            setShowSplash(false);
            sessionStorage.setItem("splashShown", "true");
        }, 4200);

        return () => {
            clearTimeout(brandTimer);
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, [showSplash]);

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
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
                style={{ background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)' }}
                animate={{ opacity: isFadingOut ? 0 : 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
                {/* Dual glowing backgrounds */}
                <motion.div
                    className="absolute w-[280px] h-[280px] rounded-full opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
                        filter: 'blur(50px)',
                    }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute w-[240px] h-[240px] rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        x: -30,
                        y: 20
                    }}
                    animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />

                {/* Logo with entrance + floating animations */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.3, rotate: -25 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 80, damping: 13, delay: 0.2 }}
                    className="relative z-10"
                >
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <img
                            src="/assets/images/regiverse-logo-new.png"
                            alt="RegXpert"
                            className="w-28 h-28 object-contain"
                            style={{ filter: 'drop-shadow(0 8px 30px rgba(59,130,246,0.25))' }}
                        />
                    </motion.div>
                </motion.div>

                {/* Brand Name Details */}
                <motion.div
                    className="relative z-10 mt-8 flex flex-col items-center"
                    initial={{ opacity: 0, y: 15 }}
                    animate={showBrand ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h1
                        className="text-4xl font-black tracking-tight"
                        style={{
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: "'Outfit', 'Inter', sans-serif",
                            letterSpacing: "-0.02em"
                        }}
                    >
                        RegXpert
                    </h1>
                    
                    <motion.p
                        className="text-[10px] mt-2 font-black tracking-widest text-sky-400 uppercase font-sans"
                        initial={{ opacity: 0, letterSpacing: "0.1em" }}
                        animate={showBrand ? { opacity: 1, letterSpacing: "0.25em" } : { opacity: 0, letterSpacing: "0.1em" }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    >
                        Conference Management Software
                    </motion.p>
                    
                    <motion.p
                        className="text-[9px] mt-1.5 font-bold tracking-wider text-slate-500 uppercase font-sans"
                        initial={{ opacity: 0 }}
                        animate={showBrand ? { opacity: 0.6 } : { opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        Powered by CMC
                    </motion.p>
                </motion.div>

                {/* Premium Progress Loading Bar */}
                <motion.div
                    className="absolute bottom-20 w-44 h-[3px] bg-slate-800/80 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.1, ease: "easeInOut", delay: 0.2 }}
                    />
                </motion.div>
            </motion.div>
        </>
    );
};

export default SplashScreen;
