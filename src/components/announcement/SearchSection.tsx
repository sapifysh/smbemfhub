import React, { useState } from 'react';
import { BEM_EMBLEM_URL } from '../../assets/emblem';
import { Search, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (nim: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [nim, setNim] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim.trim() || isLoading) return;
    onSearch(nim.trim());
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-xl mx-auto text-center space-y-8">
        
        {/* Emblem & Institutional Typography */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mx-auto transition-transform hover:scale-105 duration-300">
            <img
              src={BEM_EMBLEM_URL}
              alt="Logo BEM RDM FHUB"
              className="w-full h-full object-contain drop-shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
              BEM RDM FHUB
            </div>
            <div className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase apple-liquid-glass-subtle text-amber-900 border border-amber-200/70 shadow-2xs">
              Kabinet Resonansi Kita
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Seleksi Staff Muda BEM RDM FHUB
            </h1>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700">
              Pengumuman Hasil Seleksi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-normal">
              Masukkan NIM untuk mengetahui hasil seleksi Staff Muda BEM RDM FHUB Kabinet Resonansi Kita.
            </p>
          </div>
        </div>

        {/* Search Card - Apple Liquid Glass */}
        <div className="apple-liquid-glass-card rounded-3xl p-6 sm:p-9 text-left transition-all">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nim-input"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Nomor Induk Mahasiswa (NIM)
              </label>
              
              <div className="relative">
                <input
                  id="nim-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={nim}
                  onChange={(e) => {
                    setNim(e.target.value);
                    if (errorMessage) onClearError();
                  }}
                  placeholder="Masukkan NIM"
                  className="w-full h-13 px-4 text-base sm:text-lg font-normal tracking-wider text-slate-900 apple-liquid-glass-input rounded-2xl focus:outline-none transition-all placeholder:text-slate-400 placeholder:text-base placeholder:tracking-normal"
                  disabled={isLoading}
                  autoFocus
                />
                {nim.length > 0 && !isLoading && (
                  <button
                    type="button"
                    onClick={() => setNim('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-xl apple-liquid-glass-button transition-all cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading || !nim.trim()}
              className="w-full h-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 active:from-slate-950 active:to-slate-950 text-white font-semibold text-sm tracking-wide rounded-2xl shadow-sm hover:shadow-md border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mencari data hasil seleksi...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>LIHAT HASIL</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center pt-1 font-normal">
              Pastikan NIM yang dimasukkan sesuai dengan data pendaftaran.
            </p>
          </form>

          {/* Inline Error State if NIM is not found */}
          {errorMessage && (
            <div className="mt-5 p-4 rounded-2xl apple-liquid-glass-subtle border border-rose-200/80 bg-rose-50/60 text-left space-y-2 animate-in fade-in duration-200 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    Data tidak ditemukan.
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed font-normal">
                    {errorMessage}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClearError();
                    const el = document.getElementById('nim-input');
                    el?.focus();
                  }}
                  className="text-xs font-semibold text-slate-800 hover:text-slate-950 px-3.5 py-1.5 rounded-xl apple-liquid-glass-button transition-colors cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
