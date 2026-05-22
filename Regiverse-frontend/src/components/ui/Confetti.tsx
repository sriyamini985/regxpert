import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
    id: number;
    x: number;
    delay: number;
    rotation: number;
    scale: number;
    color: string;
    type: 'circle' | 'square' | 'triangle' | 'star';
}

interface ConfettiProps {
    isActive: boolean;
    duration?: number;
    pieceCount?: number;
    colors?: string[];
    onComplete?: () => void;
}

const COLORS = [
    '#0066CC', // Primary blue
    '#06B6D4', // Cyan
    '#3B82F6', // Blue-500
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
];

const Confetti: React.FC<ConfettiProps> = ({
    isActive,
    duration = 3000,
    pieceCount = 50,
    colors = COLORS,
    onComplete
}) => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    const generatePieces = useCallback(() => {
        const types: ConfettiPiece['type'][] = ['circle', 'square', 'triangle', 'star'];
        return Array.from({ length: pieceCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 0.5,
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: types[Math.floor(Math.random() * types.length)]
        }));
    }, [pieceCount, colors]);

    useEffect(() => {
        if (isActive) {
            setPieces(generatePieces());
            setIsVisible(true);

            const timer = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isActive, duration, generatePieces, onComplete]);

    const renderPiece = (piece: ConfettiPiece) => {
        switch (piece.type) {
            case 'circle':
                return (
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: piece.color }}
                    />
                );
            case 'square':
                return (
                    <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: piece.color }}
                    />
                );
            case 'triangle':
                return (
                    <div
                        className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent"
                        style={{ borderBottomColor: piece.color }}
                    />
                );
            case 'star':
                return (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={piece.color}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                );
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
                    {pieces.map((piece) => (
                        <motion.div
                            key={piece.id}
                            className="absolute"
                            style={{ left: `${piece.x}%` }}
                            initial={{
                                y: -20,
                                opacity: 1,
                                rotate: piece.rotation,
                                scale: 0
                            }}
                            animate={{
                                y: '100vh',
                                opacity: [1, 1, 0],
                                rotate: piece.rotation + 720,
                                scale: piece.scale,
                                x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200]
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 2 + Math.random(),
                                delay: piece.delay,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                        >
                            {renderPiece(piece)}
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
};

// Celebration component with confetti + message
interface CelebrationProps {
    isActive: boolean;
    title?: string;
    message?: string;
    onComplete?: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({
    isActive,
    title = "🎉 Congratulations!",
    message,
    onComplete
}) => {
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        if (isActive) {
            setShowMessage(true);
            const timer = setTimeout(() => {
                setShowMessage(false);
                onComplete?.();
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [isActive, onComplete]);

    return (
        <>
            <Confetti isActive={isActive} pieceCount={60} />

            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-[150] pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center"
                            initial={{ scale: 0.5, y: 20 }}
                            animate={{
                                scale: 1,
                                y: 0,
                                transition: { type: 'spring', damping: 15, stiffness: 200 }
                            }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <motion.div
                                className="text-5xl mb-4"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, -10, 10, 0]
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: 2,
                                    repeatDelay: 0.5
                                }}
                            >
                                🎉
                            </motion.div>

                            <motion.h2
                                className="text-2xl font-bold text-foreground mb-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {title.replace('🎉 ', '')}
                            </motion.h2>

                            {message && (
                                <motion.p
                                    className="text-muted-foreground"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {message}
                                </motion.p>
                            )}

                            {/* Decorative circles */}
                            <motion.div
                                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full opacity-50"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-40"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Success Check Animation
export const SuccessCheck: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center z-[150] bg-black/20 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', damping: 12 }}
                    >
                        <motion.svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <motion.path
                                d="M20 6L9 17L4 12"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            />
                        </motion.svg>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Confetti;
