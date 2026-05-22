import React from 'react';

const BackgroundLayer: React.FC = React.memo(() => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50">
            {/* Side Glows - Framing the content */}
            <div
                className="absolute top-1/2 -translate-y-1/2 left-[-10%] w-[35%] h-[80%] bg-purple-200/30 rounded-[100%] blur-[120px] mix-blend-multiply opacity-60"
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 right-[-10%] w-[35%] h-[80%] bg-blue-200/30 rounded-[100%] blur-[120px] mix-blend-multiply opacity-60"
            />

            {/* Corner Depth - Subtle ambient light */}
            <div
                className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/50 rounded-full blur-[140px] mix-blend-multiply animate-float-slow"
                style={{ animationDuration: '25s', willChange: 'transform' }}
            />
            <div
                className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-100/40 rounded-full blur-[140px] mix-blend-multiply animate-float-slow"
                style={{ animationDuration: '30s', animationDelay: '2s', willChange: 'transform' }}
            />

            {/* Top-Mid Ambient - Very subtle */}
            <div
                className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[130px] mix-blend-multiply"
            />
        </div>
    );
});

BackgroundLayer.displayName = 'BackgroundLayer';

export default BackgroundLayer;

