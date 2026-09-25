import React from 'react';
import { BEM_EMBLEM_URL } from '../../assets/emblem';
import { Shield, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  onGoHome?: () => void;
  showBackToHome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  onGoHome,
  showBackToHome = false,
}) => {
  return (
    <header className="w-full apple-liquid-glass-header sticky top-0 z-30 transition-all no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Identity */}
        <div className="flex items-center gap-3">
          {showBackToHome && onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-xl apple-liquid-glass-button transition-all mr-1 cursor-pointer"
              title="Kembali ke Pencarian"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={onGoHome}
            className={`flex items-center gap-3 ${onGoHome ? 'cursor-pointer group' : ''}`}
          >
            <div className="w-9 h-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={BEM_EMBLEM_URL}
                alt="Logo BEM RDM FHUB"
                className="w-full h-full object-contain drop-shadow-2xs"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                BEM RDM FHUB
              </div>
              <div className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                Kabinet Resonansi Kita
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selection Label & Admin Shortcut */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium apple-liquid-glass-subtle text-slate-700">
            Seleksi Staff Muda
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 apple-liquid-glass-button rounded-xl cursor-pointer"
            title="Akses Administrasi Panitia"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
