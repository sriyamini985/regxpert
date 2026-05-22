import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'shimmer' | 'pulse' | 'wave';
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height,
    animation = 'shimmer'
}) => {
    const baseClasses = 'bg-muted relative overflow-hidden';

    const variantClasses = {
        text: 'rounded-md',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-xl'
    };

    const shimmerAnimation = (
        <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ translateX: ['−100%', '100%'] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
            }}
        />
    );

    const pulseAnimation = animation === 'pulse' && (
        <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
        />
    );

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
        >
            {animation === 'shimmer' && shimmerAnimation}
            {animation === 'pulse' && pulseAnimation}
        </div>
    );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <motion.div
        className={`bg-card border border-border rounded-xl p-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <Skeleton variant="text" className="h-4 w-24 mb-2" />
                <Skeleton variant="text" className="h-8 w-32" />
            </div>
            <Skeleton variant="rounded" className="w-12 h-12" />
        </div>
        <Skeleton variant="rounded" className="h-2 w-full mt-4" />
        <div className="flex items-center gap-2 mt-4">
            <Skeleton variant="text" className="h-4 w-16" />
            <Skeleton variant="text" className="h-4 w-20" />
        </div>
    </motion.div>
);

// Statistics Card Skeleton
export const StatCardSkeleton: React.FC<{ color?: string }> = ({ color = 'from-blue-500 to-blue-700' }) => (
    <motion.div
        className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white overflow-hidden relative`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: 'spring', damping: 20 }}
    >
        {/* Shimmer Effect */}
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-4 w-24 bg-white/20 rounded mb-2" />
                    <div className="h-8 w-20 bg-white/20 rounded" />
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl" />
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full mt-4" />
            <div className="flex items-center gap-2 mt-3">
                <div className="h-4 w-12 bg-white/20 rounded" />
                <div className="h-4 w-16 bg-white/20 rounded" />
            </div>
        </div>
    </motion.div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 6 }) => (
    <motion.tr
        className="border-b border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                {i === 0 && <Skeleton variant="rounded" className="w-4 h-4" />}
                {i === 1 && (
                    <div className="flex items-center gap-3">
                        <Skeleton variant="circular" className="w-10 h-10" />
                        <div>
                            <Skeleton variant="text" className="h-4 w-24 mb-1" />
                            <Skeleton variant="text" className="h-3 w-32" />
                        </div>
                    </div>
                )}
                {i === 2 && <Skeleton variant="text" className="h-4 w-28" />}
                {i === 3 && <Skeleton variant="rounded" className="h-6 w-20" />}
                {i === 4 && <Skeleton variant="text" className="h-4 w-24" />}
                {i === 5 && (
                    <div className="flex gap-1">
                        <Skeleton variant="rounded" className="w-8 h-8" />
                        <Skeleton variant="rounded" className="w-8 h-8" />
                    </div>
                )}
            </td>
        ))}
    </motion.tr>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <motion.div
        className="bg-card border border-border rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Skeleton variant="text" className="h-6 w-40" />
                <Skeleton variant="rounded" className="h-6 w-16" />
            </div>
            <Skeleton variant="rounded" className="h-9 w-24" />
        </div>

        {/* Table */}
        <table className="w-full">
            <thead className="bg-muted/50">
                <tr>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <th key={i} className="px-4 py-3 text-left">
                            <Skeleton variant="text" className="h-4 w-20" />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                ))}
            </tbody>
        </table>
    </motion.div>
);

// Activity Feed Skeleton
export const ActivityFeedSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
    <motion.div
        className="bg-card border border-border rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <Skeleton variant="text" className="h-6 w-32" />
            <Skeleton variant="rounded" className="h-6 w-14" />
        </div>

        {/* Items */}
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <motion.div
                    key={i}
                    className="flex items-start gap-3 p-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
                    <div className="flex-1">
                        <Skeleton variant="text" className="h-4 w-3/4 mb-2" />
                        <Skeleton variant="text" className="h-3 w-16" />
                    </div>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

// Page Skeleton (Dashboard)
export const DashboardSkeleton: React.FC = () => (
    <div className="space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
            <Skeleton variant="text" className="h-4 w-32 mb-2" />
            <Skeleton variant="text" className="h-8 w-48 mb-1" />
            <Skeleton variant="text" className="h-4 w-64" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['from-blue-500 to-blue-700', 'from-emerald-500 to-green-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-sky-600'].map((color, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <StatCardSkeleton color={color} />
                </motion.div>
            ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
                <TableSkeleton rows={5} />
            </div>
            <div className="lg:col-span-4 space-y-6">
                <CardSkeleton />
                <ActivityFeedSkeleton items={4} />
            </div>
        </div>
    </div>
);

export default Skeleton;
