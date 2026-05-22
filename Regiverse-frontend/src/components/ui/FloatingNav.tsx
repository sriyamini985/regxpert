import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface NavItem {
    path: string;
    label: string;
    icon: string;
}

const navItems: NavItem[] = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/participant-management', label: 'Add Delegate', icon: 'Users' },
    { path: '/registered-list', label: 'Registered List', icon: 'QrCode' },
    { path: '/event-registration', label: 'Food Scan', icon: 'ClipboardList' },
    { path: '/Kitbag-Scan', label: 'Kitbag Scan', icon: 'ClipboardCheck' },
    { path: '/Mono-Scan', label: 'Mono Scan', icon: 'ClipboardCheck' },
    { path: '/Workshop-Scan', label: 'Workshop Scan', icon: 'ClipboardCheck' },
    { path: '/hall-entry-exit-scan', label: 'Hall Scan', icon: 'ClipboardCheck' },

    

];

const FloatingNav: React.FC = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on login page
    if (location.pathname === '/login' || location.pathname === '/') {
        return null;
    }

    const handleNavigation = useCallback((path: string) => {
        navigate(path);
        setIsOpen(false);
    }, [navigate]);

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Navigation Items */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/20 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Nav Items */}
                        <div className="absolute bottom-20 right-0 flex flex-col-reverse gap-4 items-end z-50">
                            {navItems.map((item, index) => {
                                const isActive = location.pathname === item.path;
                                const isHovered = hoveredItem === item.path;

                                return (
                                    <motion.div
                                        key={item.path}
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0, y: 15, scale: 0.8 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            transition: {
                                                delay: index * 0.04,
                                                type: 'spring',
                                                damping: 20,
                                                stiffness: 300
                                            }
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.8,
                                            transition: {
                                                delay: index * 0.02,
                                                duration: 0.12
                                            }
                                        }}
                                    >
                                        {/* Label Tooltip — CSS transition */}
                                        <div
                                            className={`bg-white text-slate-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-black/10 pointer-events-none whitespace-nowrap border border-slate-100 transition-all duration-150 ${(isHovered || isActive) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                                }`}
                                        >
                                            {item.label}
                                        </div>

                                        {/* Icon Button */}
                                        <button
                                            className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 active:scale-90 hover:scale-110 ${isActive
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-purple-500/30'
                                                : 'bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 hover:shadow-indigo-500/10'
                                                }`}
                                            onClick={() => handleNavigation(item.path)}
                                            onMouseEnter={() => setHoveredItem(item.path)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                        >
                                            <Icon name={item.icon} size={20} />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Toggle Button — Purple circle with white grid icon */}
            <div className="relative">
                {/* Outer white ring */}
                <div
                    className="absolute -inset-1.5 rounded-full bg-white transition-shadow duration-300"
                    style={{
                        boxShadow: isOpen
                            ? '0 10px 40px -5px rgba(139, 92, 246, 0.4)'
                            : '0 10px 30px -5px rgba(139, 92, 246, 0.25)',
                    }}
                />
                <motion.button
                    className="relative w-14 h-14 rounded-full flex items-center justify-center z-10"
                    style={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                >
                    {/* Animated icon transition: Grid ↔ X */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isOpen ? 'close' : 'grid'}
                            initial={{ scale: 0, rotate: -90, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: 90, opacity: 0 }}
                            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
                        >
                            {isOpen ? (
                                <Icon name="X" size={24} color="white" strokeWidth={2.5} />
                            ) : (
                                /* 2x2 Grid of rounded squares */
                                <div className="grid grid-cols-2 gap-[5px]">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="w-[9px] h-[9px] bg-white rounded-[3px]"
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Subtle shine overlay */}
                    <div
                        className="absolute inset-0 rounded-full opacity-30"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                        }}
                    />
                </motion.button>

                {/* Pulse ring when closed — CSS animation instead of framer-motion */}
                {!isOpen && (
                    <div
                        className="absolute -inset-1.5 rounded-full border-2 border-purple-400/30 animate-pulse"
                        style={{ animationDuration: '2.5s' }}
                    />
                )}
            </div>
        </div>
    );
});

FloatingNav.displayName = 'FloatingNav';

export default FloatingNav;
