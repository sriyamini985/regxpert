import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';

import { motion } from 'framer-motion';

const DashboardLayout: React.FC = React.memo(() => {
    const location = useLocation();

    return (
        <div className="min-h-screen relative">
            {/* Persistent Navigation — stays mounted across all route changes */}
            <Navbar />

            {/* Page Content — simple non-blocking fade-in on route change.
                No AnimatePresence / exit animation = no blocking gap.
                React unmounts old page and mounts new one instantly,
                then the new page fades in smoothly. */}
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.25,
                    ease: 'easeOut',
                }}
                className="w-full"
            >
                <Outlet />
            </motion.div>

        </div>
    );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
