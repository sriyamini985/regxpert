import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface EventCardProps {
  title: string;
  date: string;
  imageUrl: string;
  participantCount: number;
}

const EventCard: React.FC<EventCardProps> = ({ title, date, imageUrl, participantCount }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 8;
    const rotateY = ((centerX - x) / centerX) * 8;

    setTransform(`perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer group"
      style={{
        transform,
        transition: 'transform 0.2s ease-out, box-shadow 0.3s ease-out',
        transformStyle: 'preserve-3d',
        boxShadow: isHovered
          ? '0 25px 50px -12px rgba(0, 102, 204, 0.25), 0 0 30px rgba(6, 182, 212, 0.1)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', damping: 25 }}
    >
      {/* Image Container with Zoom Effect */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          style={{
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ transform: 'translateZ(10px)' }}
        />

        {/* Floating Badge */}
        <motion.div
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary shadow-lg"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', damping: 15 }}
        >
          {participantCount} participants
        </motion.div>
      </div>

      {/* Content */}
      <div
        className="p-5 relative"
        style={{ transform: 'translateZ(20px)' }}
      >
        <motion.h3
          className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300"
        >
          {title}
        </motion.h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{date}</span>
        </div>

        {/* Hover Action Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </div>

      {/* Shimmer Effect on Hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
};

export default EventCard;
