import React, { useEffect, useState, useMemo } from 'react';
import LiquidGlass from 'liquid-glass-react';

export interface LiquidGlassSurfaceProps {
  children?: React.ReactNode;
  variant?: 'hero-card' | 'result-card' | 'navbar' | 'button' | 'input' | 'table' | 'modal' | 'badge';
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  cornerRadius?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
}

export const LiquidGlassSurface: React.FC<LiquidGlassSurfaceProps> = ({
  children,
  variant = 'hero-card',
  displacementScale,
  blurAmount,
  saturation,
  aberrationIntensity,
  elasticity,
  cornerRadius,
  className = '',
  style = {},
  onClick,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Hierarchical tuning according to specification
  const config = useMemo(() => {
    switch (variant) {
      case 'hero-card':
        return {
          displacementScale: displacementScale ?? 45,
          blurAmount: blurAmount ?? 0.10,
          saturation: saturation ?? 130,
          aberrationIntensity: aberrationIntensity ?? 1.2,
          elasticity: isTouchDevice || prefersReducedMotion ? 0 : (elasticity ?? 0.16),
          cornerRadius: cornerRadius ?? 32,
        };
      case 'result-card':
        return {
          displacementScale: displacementScale ?? 38,
          blurAmount: blurAmount ?? 0.09,
          saturation: saturation ?? 125,
          aberrationIntensity: aberrationIntensity ?? 1.0,
          elasticity: isTouchDevice || prefersReducedMotion ? 0 : (elasticity ?? 0.12),
          cornerRadius: cornerRadius ?? 28,
        };
      case 'navbar':
        return {
          displacementScale: displacementScale ?? 24,
          blurAmount: blurAmount ?? 0.07,
          saturation: saturation ?? 120,
          aberrationIntensity: aberrationIntensity ?? 0.7,
          elasticity: isTouchDevice || prefersReducedMotion ? 0 : (elasticity ?? 0.06),
          cornerRadius: cornerRadius ?? 18,
        };
      case 'button':
        return {
          displacementScale: displacementScale ?? 24,
          blurAmount: blurAmount ?? 0.08,
          saturation: saturation ?? 125,
          aberrationIntensity: aberrationIntensity ?? 0.8,
          elasticity: isTouchDevice || prefersReducedMotion ? 0 : (elasticity ?? 0.18),
          cornerRadius: cornerRadius ?? 14,
        };
      case 'input':
        return {
          displacementScale: displacementScale ?? 20,
          blurAmount: blurAmount ?? 0.06,
          saturation: saturation ?? 115,
          aberrationIntensity: aberrationIntensity ?? 0.5,
          elasticity: 0,
          cornerRadius: cornerRadius ?? 16,
        };
      case 'modal':
        return {
          displacementScale: displacementScale ?? 36,
          blurAmount: blurAmount ?? 0.10,
          saturation: saturation ?? 130,
          aberrationIntensity: aberrationIntensity ?? 1.0,
          elasticity: 0,
          cornerRadius: cornerRadius ?? 28,
        };
      case 'table':
        return {
          displacementScale: displacementScale ?? 15,
          blurAmount: blurAmount ?? 0.05,
          saturation: saturation ?? 110,
          aberrationIntensity: aberrationIntensity ?? 0.4,
          elasticity: 0,
          cornerRadius: cornerRadius ?? 20,
        };
      case 'badge':
      default:
        return {
          displacementScale: displacementScale ?? 18,
          blurAmount: blurAmount ?? 0.06,
          saturation: saturation ?? 118,
          aberrationIntensity: aberrationIntensity ?? 0.5,
          elasticity: 0,
          cornerRadius: cornerRadius ?? 999,
        };
    }
  }, [variant, displacementScale, blurAmount, saturation, aberrationIntensity, elasticity, cornerRadius, isTouchDevice, prefersReducedMotion]);

  return (
    <div
      className={`liquid-glass-container group relative overflow-hidden transition-all duration-300 ${
        Boolean(onClick) ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
      style={{
        borderRadius: `${config.cornerRadius}px`,
        ...style,
      }}
      onClick={onClick}
    >
      {/* 
        Official liquid-glass-react component integrated as authentic optical refraction background layer.
        Operates in standard mode with dynamic SVG displacement map and edge aberration.
      */}
      <div
        className="liquid-glass-underlay pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ borderRadius: `${config.cornerRadius}px` }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <LiquidGlass
            mode="standard"
            displacementScale={config.displacementScale}
            blurAmount={config.blurAmount}
            saturation={config.saturation}
            aberrationIntensity={config.aberrationIntensity}
            elasticity={config.elasticity}
            cornerRadius={config.cornerRadius}
            padding="0px"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="opacity-0 select-none block w-full h-full" />
          </LiquidGlass>
        </div>

        {/* 
          Refined optical edge highlight system:
          - Low-opacity white highlight
          - Subtle cyan reflection near upper-left
          - Extremely subtle gold reflection
        */}
        <div
          className="liquid-glass-edge-reflection absolute inset-0 pointer-events-none"
          style={{ borderRadius: `${config.cornerRadius}px` }}
        />
        {/* Soft specular ambient inner highlight */}
        <div
          className="liquid-glass-specular-highlight absolute inset-0 pointer-events-none"
          style={{ borderRadius: `${config.cornerRadius}px` }}
        />
      </div>

      {/* Content wrapper: high legibility, unhindered Inter typography, natural DOM flow */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
