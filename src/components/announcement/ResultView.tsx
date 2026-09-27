import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ApplicantResult } from '../../types';
import { BEM_EMBLEM_URL } from '../../assets/emblem';
import { CheckCircle2, ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';

interface ResultViewProps {
  result: ApplicantResult;
  onBack: () => void;
  onPrint?: () => void;
  onOpenVerification: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onBack,
  onOpenVerification,
}) => {
  const isPassed = result.status === 'PASSED';
  const isPending = result.status === 'PENDING';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR Code pointing to verification URL
    const verificationUrl = `${window.location.origin}/result/${result.result_id}`;
    QRCode.toDataURL(verificationUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [result.result_id]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-4 sm:py-6 md:py-8 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Container Card - Apple Liquid Glass - Balanced Width */}
      <div className="w-full max-w-2xl lg:max-w-3xl apple-liquid-glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(15,23,42,0.10)] border border-white/95">
        
        {/* Official Header Banner - Compact & Dignified */}
        <div className="apple-liquid-glass-dark text-white px-4 py-3.5 sm:px-6 sm:py-4 text-center relative overflow-hidden">
          {/* Subtle gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 opacity-90" />

          <div className="flex items-center justify-center gap-3 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
              <img
                src={BEM_EMBLEM_URL}
                alt="Logo BEM RDM FHUB"
                className="w-full h-full object-contain drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="text-left space-y-0.5">
              <div className="text-[10px] font-semibold tracking-widest text-slate-300 uppercase">
                PENGUMUMAN HASIL SELEKSI
              </div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                SELEKSI STAF MUDA BEM RDM FHUB
              </h1>
              <div className="text-[10px] sm:text-[11px] font-semibold text-amber-300 tracking-wider uppercase">
                KABINET RESONANSI KITA
              </div>
            </div>
          </div>
        </div>

        {/* Content Body - Compact Vertical Rhythm (16-20px gaps) */}
        <div className="p-4 sm:p-6 md:p-7 space-y-3.5 sm:space-y-4">
          
          {/* PASSED STATE */}
          {isPassed ? (
            <div className="space-y-3 sm:space-y-3.5 text-center">
              {/* Participant Identity */}
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-emerald-800 apple-liquid-glass-subtle px-3 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs mb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500">
                  NIM {result.nim}
                </div>
              </div>

              {/* Main Result Card - Prominent but Viewport-Efficient */}
              <div className="py-3 px-4 sm:py-3.5 sm:px-6 rounded-2xl apple-liquid-glass-status-passed space-y-1">
                <div className="text-[11px] sm:text-xs text-slate-600 font-normal">
                  Berdasarkan hasil seleksi, kamu dinyatakan:
                </div>
                
                <div className="py-0.5 sm:py-1">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-wider text-emerald-600 status-lulus inline-block drop-shadow-2xs">
                    LULUS
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 leading-tight">
                  Staf Muda BEM RDM FHUB
                </div>
                <div className="text-[10px] sm:text-[11px] font-normal text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Compact Participant Information - Balanced Horizontal Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                <div className="px-3.5 py-2.5 rounded-xl sm:rounded-2xl apple-liquid-glass-subtle flex flex-col justify-center">
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {result.division}
                  </div>
                </div>

                <div className="px-3.5 py-2.5 rounded-xl sm:rounded-2xl apple-liquid-glass-subtle flex flex-col justify-center">
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>LULUS</span>
                  </div>
                </div>
              </div>

              {/* Official Greeting Note - Compact */}
              <div className="text-xs font-normal text-slate-600 leading-relaxed max-w-lg mx-auto">
                Selamat atas pencapaianmu. Sampai bertemu di perjalanan berikutnya bersama BEM RDM FHUB.
              </div>

            </div>
          ) : isPending ? (
            /* PENDING STATE */
            <div className="space-y-3 sm:space-y-3.5 text-center">
              {/* Participant Identity */}
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-amber-800 apple-liquid-glass-subtle px-3 py-0.5 rounded-full border border-amber-200/80 shadow-2xs mb-1">
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500">
                  NIM {result.nim}
                </div>
              </div>

              {/* Main Result Card - Pending */}
              <div className="py-3 px-4 sm:py-3.5 sm:px-6 rounded-2xl apple-liquid-glass-status-pending space-y-1">
                <div className="text-[11px] sm:text-xs text-slate-600 font-normal">
                  Hasil seleksi belum tersedia.
                </div>
                
                <div className="py-0.5 sm:py-1">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider text-amber-700 inline-block drop-shadow-2xs">
                    MENUNGGU PENGUMUMAN
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 leading-tight">
                  Staf Muda BEM RDM FHUB
                </div>
                <div className="text-[10px] sm:text-[11px] font-normal text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                <div className="px-3.5 py-2.5 rounded-xl sm:rounded-2xl apple-liquid-glass-subtle flex flex-col justify-center">
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {result.division}
                  </div>
                </div>

                <div className="px-3.5 py-2.5 rounded-xl sm:rounded-2xl apple-liquid-glass-subtle flex flex-col justify-center">
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-amber-700 mt-0.5 flex items-center gap-1.5">
                    <span>MENUNGGU PENGUMUMAN</span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-normal text-slate-600 leading-relaxed max-w-lg mx-auto">
                Silakan kembali setelah pengumuman resmi diterbitkan.
              </div>
            </div>
          ) : (
            /* NOT PASSED STATE - Dignified, respectful, neutral */
            <div className="space-y-3 sm:space-y-3.5 text-center">
              {/* Participant Identity */}
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-700 apple-liquid-glass-subtle px-3 py-0.5 rounded-full border border-slate-200/80 shadow-2xs mb-1">
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500">
                  NIM {result.nim}
                </div>
              </div>

              {/* Main Result Card - Not Passed */}
              <div className="py-3 px-4 sm:py-3.5 sm:px-6 rounded-2xl apple-liquid-glass-status-neutral space-y-1">
                <div className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed">
                  Terima kasih telah mengikuti seluruh rangkaian seleksi.
                </div>
                
                <div className="py-0.5 sm:py-1">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider text-slate-700 status-belum-lulus inline-block drop-shadow-2xs">
                    BELUM LULUS
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 leading-tight">
                  Staf Muda BEM RDM FHUB
                </div>
                <div className="text-[10px] sm:text-[11px] font-normal text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                <div className="px-3.5 py-2.5 rounded-xl sm:rounded-2xl apple-liquid-glass-subtle flex flex-col justify-center">
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {result.division}
                  </div>
                </div>

                <div className="px-3.5 py-2.5 rounded-xl sm:rounded-2xl apple-liquid-glass-subtle flex flex-col justify-center">
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5 flex items-center gap-1.5">
                    <span>BELUM LULUS</span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-normal text-slate-600 leading-relaxed max-w-lg mx-auto">
                Terima kasih atas antusiasme dan kontribusimu. Tetap semangat dan sampai bertemu di kesempatan berikutnya.
              </div>
            </div>
          )}

          {/* Certificate & Verification Card - Compact Horizontal Layout */}
          <div className="flex items-center justify-between gap-3 apple-liquid-glass-subtle px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-3">
              {qrDataUrl ? (
                <button
                  type="button"
                  onClick={onOpenVerification}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl apple-liquid-glass p-0.5 border border-white/95 shadow-2xs hover:scale-105 transition-transform cursor-pointer shrink-0"
                  title="Klik untuk melihat verifikasi"
                >
                  <img
                    src={qrDataUrl}
                    alt="QR Verifikasi"
                    className="w-full h-full object-contain"
                  />
                </button>
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-200/60 animate-pulse shrink-0" />
              )}
              
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span className="truncate">Sertifikat Digital Terverifikasi</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-[11px] text-slate-500 font-normal">
                  <span>ID: <strong className="font-medium text-slate-700">{result.result_id}</strong></span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="text-slate-400">Diumumkan: {result.announcement_date}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenVerification}
              className="text-xs font-semibold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer shrink-0 px-1 py-1"
            >
              <span className="hidden sm:inline">Periksa Keaslian</span>
              <span className="sm:hidden">Periksa</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* CTA Action Button - Compact Height & Visible */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={onBack}
              className="w-full h-10 sm:h-11 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 active:from-slate-950 active:to-slate-950 text-white font-semibold text-xs tracking-wider uppercase rounded-xl sm:rounded-2xl transition-all shadow-xs hover:shadow-sm border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>KEMBALI KE PENCARIAN</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
