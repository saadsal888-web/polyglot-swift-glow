import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate particles
      const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.3,
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);

      // Clear after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 1,
                y: -20,
                x: `${particle.x}vw`,
                rotate: 0,
                scale: 1,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: '100vh',
                rotate: particle.rotation + 720,
                scale: [1, 1.2, 0.8],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                width: Math.random() * 8 + 6,
                height: Math.random() * 8 + 6,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
          
          {/* Central star burst */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="text-6xl">🎉</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
