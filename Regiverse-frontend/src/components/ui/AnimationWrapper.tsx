import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface AnimationWrapperProps {
    children: React.ReactNode;
    variant?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight' | 'flip3D';
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
    staggerChildren?: number;
    hover3D?: boolean;
}

const variants: Record<string, Variants> = {
    fadeUp: {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 120
            }
        }
    },
    fadeIn: {
        hidden: {
            opacity: 0,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    },
    scaleIn: {
        hidden: {
            opacity: 0,
            scale: 0.8,
            rotateX: 15
        },
        visible: {
            opacity: 1,
            scale: 1,
            rotateX: 0,
            transition: {
                type: 'spring',
                damping: 20,
                stiffness: 100
            }
        }
    },
    slideLeft: {
        hidden: {
            opacity: 0,
            x: 50,
            rotateY: -10
        },
        visible: {
            opacity: 1,
            x: 0,
            rotateY: 0,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 120
            }
        }
    },
    slideRight: {
        hidden: {
            opacity: 0,
            x: -50,
            rotateY: 10
        },
        visible: {
            opacity: 1,
            x: 0,
            rotateY: 0,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 120
            }
        }
    },
    flip3D: {
        hidden: {
            opacity: 0,
            rotateY: 90,
            scale: 0.8
        },
        visible: {
            opacity: 1,
            rotateY: 0,
            scale: 1,
            transition: {
                type: 'spring',
                damping: 20,
                stiffness: 80
            }
        }
    }
};

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
    children,
    variant = 'fadeUp',
    delay = 0,
    duration,
    className = '',
    once = true,
    staggerChildren,
    hover3D = false
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, margin: '-50px' });
    const [hoverStyle, setHoverStyle] = useState({ rotateX: 0, rotateY: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hover3D || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        setHoverStyle({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        if (hover3D) {
            setHoverStyle({ rotateX: 0, rotateY: 0 });
        }
    };

    const containerVariants: Variants = staggerChildren
        ? {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren,
                    delayChildren: delay
                }
            }
        }
        : variants[variant];

    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            transition={{ delay, duration }}
            style={{
                perspective: hover3D ? 1000 : undefined,
                transformStyle: hover3D ? 'preserve-3d' : undefined,
                transform: hover3D
                    ? `rotateX(${hoverStyle.rotateX}deg) rotateY(${hoverStyle.rotateY}deg)`
                    : undefined,
                transition: 'transform 0.15s ease-out'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </motion.div>
    );
};

// Stagger Item for use with staggerChildren
export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        type: 'spring',
                        damping: 25,
                        stiffness: 120
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
};

// Hover Card with 3D tilt effect
export const HoverCard3D: React.FC<{
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}> = ({
    children,
    className = '',
    intensity = 10
}) => {
        const ref = useRef<HTMLDivElement>(null);
        const [transform, setTransform] = useState('');

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * intensity;
            const rotateY = ((centerX - x) / centerX) * intensity;

            setTransform(`perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        };

        const handleMouseLeave = () => {
            setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        };

        return (
            <div
                ref={ref}
                className={className}
                style={{
                    transform,
                    transition: 'transform 0.2s ease-out',
                    transformStyle: 'preserve-3d'
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
        );
    };

export default AnimationWrapper;
