import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../AppIcon';

// Toast Types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Item Component
const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
    const config = {
        success: {
            icon: 'CheckCircle2',
            bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
            iconBg: 'bg-white/20',
            border: 'border-emerald-400/30'
        },
        error: {
            icon: 'XCircle',
            bg: 'bg-gradient-to-r from-red-500 to-rose-600',
            iconBg: 'bg-white/20',
            border: 'border-red-400/30'
        },
        warning: {
            icon: 'AlertTriangle',
            bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
            iconBg: 'bg-white/20',
            border: 'border-amber-400/30'
        },
        info: {
            icon: 'Info',
            bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
            iconBg: 'bg-white/20',
            border: 'border-blue-400/30'
        }
    };

    const { icon, bg, iconBg, border } = config[toast.type];

    React.useEffect(() => {
        const timer = setTimeout(onRemove, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [onRemove, toast.duration]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className={`${bg} ${border} border rounded-xl p-4 text-white shadow-2xl min-w-[300px] max-w-[400px] overflow-hidden relative`}
        >
            {/* Shimmer Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
            />

            <div className="flex items-start gap-3 relative z-10">
                {/* Icon */}
                <motion.div
                    className={`${iconBg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                >
                    <Icon name={icon} size={20} />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <motion.h4
                        className="font-semibold text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        {toast.title}
                    </motion.h4>
                    {toast.message && (
                        <motion.p
                            className="text-xs text-white/80 mt-0.5"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {toast.message}
                        </motion.p>
                    )}
                </div>

                {/* Close Button */}
                <motion.button
                    onClick={onRemove}
                    className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Icon name="X" size={14} />
                </motion.button>
            </div>

            {/* Progress Bar */}
            <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
            />
        </motion.div>
    );
};

// Toast Container
const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({
    toasts,
    removeToast
}) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((title: string, message?: string) => {
        addToast({ type: 'success', title, message });
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        addToast({ type: 'error', title, message });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        addToast({ type: 'warning', title, message });
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        addToast({ type: 'info', title, message });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export default ToastProvider;
