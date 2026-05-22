import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface TabItem {
    path: string;
    label: string;
    icon: string;
}

const tabs: TabItem[] = [
    { path: '/admin-dashboard', label: 'Home', icon: 'Home' },
    { path: '/add-delegate', label: 'Add delegate ', icon: 'Users' },
    { path: '/registered-list', label: 'Registered List', icon: 'QrCode' },
    { path: '/food-scan', label: 'food-scan', icon: 'Plus' },
];

const MobileBottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const getActiveIndex = () => {
        return tabs.findIndex(tab => location.pathname === tab.path);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    {/* Glass Background */}
                    <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border shadow-lg" />

                    {/* Safe Area Padding */}
                    <div className="relative px-2 pt-2 pb-safe">
                        <div className="flex items-center justify-around">
                            {tabs.map((tab, index) => {
                                const isActive = location.pathname === tab.path;

                                return (
                                    <motion.button
                                        key={tab.path}
                                        onClick={() => navigate(tab.path)}
                                        className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[64px]"
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {/* Active Indicator Pill */}
                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                                                    layoutId="activeTabIndicator"
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: 1 }}
                                                    exit={{ scaleX: 0 }}
                                                    transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                                                />
                                            )}
                                        </AnimatePresence>

                                        {/* Icon Container */}
                                        <motion.div
                                            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'
                                                }`}
                                            animate={{
                                                scale: isActive ? 1.1 : 1,
                                                y: isActive ? -2 : 0
                                            }}
                                            transition={{ type: 'spring', damping: 15 }}
                                        >
                                            <motion.div
                                                animate={{
                                                    color: isActive ? '#0066CC' : '#64748B'
                                                }}
                                            >
                                                <Icon name={tab.icon} size={22} />
                                            </motion.div>

                                            {/* Active Glow */}
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-xl bg-primary/10 blur-md"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                />
                                            )}
                                        </motion.div>

                                        {/* Label */}
                                        <motion.span
                                            className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                            animate={{
                                                fontWeight: isActive ? 600 : 500
                                            }}
                                        >
                                            {tab.label}
                                        </motion.span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};

export default MobileBottomNav;
