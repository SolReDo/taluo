'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MysticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
}

export default function MysticButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}: MysticButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#d4a853] via-[#f0c674] to-[#d4a853] bg-[length:200%_100%] animate-shimmer text-[#0a0a12]',
    secondary: 'bg-[#12121f] border border-[#6b4c9a]/50 text-[#e8e6f0] hover:border-[#9d7cd8]/50',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        relative font-cinzel font-medium rounded-full
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {variant === 'primary' && (
        <>
          {/* Glow effect */}
          <div className="absolute -inset-1 rounded-full bg-[#d4a853]/30 blur-md opacity-50" />
          {/* Shimmer border */}
          <div className="absolute inset-0 rounded-full border border-[#f0c674]/50" />
        </>
      )}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
