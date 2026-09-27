import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AtmosphericBackground: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {isDark ? (
        /* Dark Mode: Deep Navy / Blue-Black Atmospheric Environment */
        <div className="absolute inset-0 bg-[#060b13] text-white">
          {/* Base deep atmospheric radial gradient with calm dark negative space in the center */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,16,28,0.4)_0%,#050910_80%)]" />

          {/* Subtle cyan and turquoise ambient lighting at top-left edge */}
          <div className="absolute -top-[12%] -left-[6%] w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] rounded-full bg-gradient-to-br from-cyan-500/14 via-teal-500/08 to-transparent blur-[120px] pointer-events-none animate-float-slow" />

          {/* Restrained indigo / violet undertone at upper-right edge */}
          <div className="absolute top-[18%] -right-[8%] w-[550px] sm:w-[780px] h-[550px] sm:h-[780px] rounded-full bg-gradient-to-bl from-indigo-600/12 via-violet-700/08 to-transparent blur-[130px] pointer-events-none animate-float-reverse" />

          {/* Very subtle champagne-gold accent at bottom edge (BEM Resonansi Kita signature) */}
          <div className="absolute -bottom-[10%] left-[15%] w-[500px] sm:w-[720px] h-[450px] sm:h-[650px] rounded-full bg-gradient-to-tr from-amber-500/10 via-amber-600/05 to-transparent blur-[140px] pointer-events-none" />

          {/* Deep calm negative space vignette - ensures center remains dark & serene */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_20%,rgba(5,9,16,0.65)_85%)] pointer-events-none" />

          {/* Elegant curved subtle cyan/gold ambient light trails along the perimeter */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.16] pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cyanTrail" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="goldTrail" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M -100,180 C 300,100 600,320 1200,80 C 1600,-80 2000,240 2200,150"
              fill="none"
              stroke="url(#cyanTrail)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
            />
            <path
              d="M -80,680 C 350,750 800,580 1300,820 C 1700,980 2100,740 2300,850"
              fill="none"
              stroke="url(#goldTrail)"
              strokeWidth="1.2"
              strokeDasharray="6 12"
            />
          </svg>

          {/* Subtle dotted digital pattern concentrated around the outer edges with calm center */}
          <div
            className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,transparent_35%,black_80%)]"
          />
        </div>
      ) : (
        /* Light Mode: Retains luminous atmospheric visual identity with refined translucency */
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/95 to-slate-100">
          {/* Soft amber-gold liquid orb (BEM Resonansi Kita signature) */}
          <div className="absolute -top-[10%] left-[10%] w-[520px] sm:w-[760px] h-[520px] sm:h-[760px] rounded-full bg-gradient-to-br from-amber-300/28 via-amber-200/18 to-transparent blur-3xl opacity-80 animate-float-slow" />
          {/* Soft azure-sky liquid orb */}
          <div className="absolute top-[22%] -right-[10%] w-[480px] sm:w-[700px] h-[480px] sm:h-[700px] rounded-full bg-gradient-to-bl from-sky-300/26 via-indigo-200/16 to-transparent blur-3xl opacity-75 animate-float-reverse" />
          {/* Soft emerald-mint ambient orb */}
          <div className="absolute bottom-[5%] -left-[8%] w-[540px] sm:w-[760px] h-[420px] sm:h-[640px] rounded-full bg-gradient-to-tr from-emerald-200/25 via-teal-100/16 to-transparent blur-3xl opacity-65 animate-float-slow" />
          {/* Center luminous specular wash */}
          <div className="absolute top-[45%] left-[25%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-r from-blue-100/20 via-amber-100/15 to-transparent blur-3xl opacity-50" />
          {/* Apple-style precision dot mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.10]" />
        </div>
      )}
    </div>
  );
};
