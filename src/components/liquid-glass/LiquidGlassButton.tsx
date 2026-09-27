import React from 'react';
import { LiquidGlassSurface } from './LiquidGlassSurface';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  cornerRadius?: number;
  className?: string;
  children: React.ReactNode;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  cornerRadius,
  className = '',
  children,
  disabled,
  type = 'button',
  onClick,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-6 py-3.5 text-sm sm:text-base font-semibold',
  }[size];

  const defaultRadius = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
  const radius = cornerRadius ?? defaultRadius;

  if (variant === 'primary') {
    // Refined cyan/teal primary button with subtle upper glass specular highlight
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`liquid-glass-btn-primary relative inline-flex items-center justify-center font-semibold text-white tracking-wide transition-all duration-200 select-none overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
        style={{ borderRadius: `${radius}px` }}
        {...props}
      >
        {/* Subtle upper specular rim highlight */}
        <span
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 via-white/10 to-transparent pointer-events-none"
          style={{ borderTopLeftRadius: `${radius}px`, borderTopRightRadius: `${radius}px` }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }

  // Secondary or standard liquid glass button
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`liquid-glass-btn-secondary relative inline-flex items-center justify-center transition-all duration-200 select-none overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      style={{ borderRadius: `${radius}px` }}
      {...props}
    >
      <LiquidGlassSurface
        variant="button"
        cornerRadius={radius}
        className="w-full h-full"
      >
        <div className="flex items-center justify-center gap-2 w-full h-full">
          {children}
        </div>
      </LiquidGlassSurface>
    </button>
  );
};
