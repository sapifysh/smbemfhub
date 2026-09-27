import React from 'react';
import { LiquidGlassSurface } from './LiquidGlassSurface';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  variant?: 'hero-card' | 'result-card' | 'table' | 'modal';
  className?: string;
  cornerRadius?: number;
  displacementScale?: number;
  blurAmount?: number;
  style?: React.CSSProperties;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  variant = 'hero-card',
  className = '',
  cornerRadius = 32,
  displacementScale,
  blurAmount,
  style,
}) => {
  return (
    <LiquidGlassSurface
      variant={variant}
      cornerRadius={cornerRadius}
      displacementScale={displacementScale}
      blurAmount={blurAmount}
      className={`liquid-glass-card-surface ${className}`}
      style={style}
    >
      {children}
    </LiquidGlassSurface>
  );
};
