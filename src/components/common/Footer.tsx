import React from 'react';
import { Shield } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="w-full apple-liquid-glass-footer py-8 px-4 text-center text-xs text-slate-500 transition-all no-print">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="font-semibold text-slate-700 tracking-tight">
          BEM RDM FHUB — Kabinet Resonansi Kita
        </div>
        <p className="text-slate-500 text-[11px] font-normal">
          Seleksi Staff Muda BEM RDM FHUB
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[11px] text-slate-400 font-normal">
          <span>&copy; 2026 BEM RDM FHUB</span>
          <span className="hidden sm:inline">•</span>
          <span>Fakultas Hukum Universitas Brawijaya</span>
          <span className="hidden sm:inline">•</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-slate-600 hover:text-slate-900 apple-liquid-glass-button transition-all cursor-pointer"
          >
            <Shield className="w-3 h-3 text-slate-500" />
            <span>Akses Panitia</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
