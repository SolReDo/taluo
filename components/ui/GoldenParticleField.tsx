'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface GoldenParticleFieldProps {
  active: boolean;
  particleCount?: number;
}

export default function GoldenParticleField({
  active,
  particleCount = 20,
}: GoldenParticleFieldProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles when active changes
  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 120 - 60, // -60 to 60
        y: Math.random() * -100 - 20, // -20 to -120 (upward)
        size: 2 + Math.random() * 4,
        duration: 1.2 + Math.random() * 0.6,
        delay: Math.random() * 0.4,
      }));
      setParticles(newParticles);

      // Clear particles after animation completes
      const timeout = setTimeout(() => {
        setParticles([]);
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      setParticles([]);
    }
  }, [active, particleCount]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 0.8, 0],
            scale: [1, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            boxShadow: '0 0 6px #d4a853, 0 0 12px #f0c674, 0 0 18px rgba(212, 168, 83, 0.5)',
            backgroundColor: '#d4a853',
          }}
        />
      ))}
    </div>
  );
}
