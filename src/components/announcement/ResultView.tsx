import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ApplicantResult } from '../../types';
import { BEM_EMBLEM_URL } from '../../assets/emblem';
import { CheckCircle2, ArrowLeft, ShieldCheck, ExternalLink, Clock, XCircle } from 'lucide-react';
import { LiquidGlassCard } from '../liquid-glass/LiquidGlassCard';

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
    <div className="min-h-[calc(100vh-9rem)] flex flex-col items-center justify-center px-4 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Container Card - Liquid Glass floating panel */}
      <LiquidGlassCard
        variant="result-card"
        cornerRadius={32}
        displacementScale={38}
        blurAmount={0.09}
        className="w-full max-w-2xl overflow-hidden shadow-2xl relative"
      >
        {/* Official Header Banner in Smoked Translucent Glass */}
        <div className="bg-slate-900/80 dark:bg-slate-950/70 backdrop-blur-xl text-white p-6 sm:p-8 text-center relative overflow-hidden border-b border-white/10">
          {/* Subtle champagne gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 opacity-90" />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-14 h-14 flex items-center justify-center">
              <img
                src={BEM_EMBLEM_URL}
                alt="Logo BEM RDM FHUB"
                className="w-full h-full object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold tracking-widest text-slate-300 dark:text-cyan-200 uppercase">
                PENGUMUMAN HASIL SELEKSI
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                SELEKSI STAFF MUDA BEM RDM FHUB
              </h1>
              <div className="text-xs font-semibold text-amber-300 tracking-wider uppercase">
                KABINET RESONANSI KITA
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-7">
          
          {/* PASSED STATE */}
          {isPassed ? (
            <div className="space-y-6 text-center">
              {/* Applicant Name & Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 px-3.5 py-1 rounded-full border border-emerald-300/30 dark:border-emerald-400/25 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  NIM {result.nim}
                </div>
              </div>

              {/* Status Section - Subtle Cyan/Teal Liquid Glass Accent */}
              <div className="py-7 px-6 rounded-3xl liquid-glass-status-passed space-y-2">
                <div className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                  Berdasarkan hasil seleksi, kamu dinyatakan:
                </div>
                
                <div className="py-2.5">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 status-lulus inline-block drop-shadow-sm">
                    LULUS
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Staff Muda BEM RDM FHUB
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/06 border border-black/5 dark:border-white/10 backdrop-blur-md">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {result.division}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/06 border border-black/5 dark:border-white/10 backdrop-blur-md">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>LULUS</span>
                  </div>
                </div>
              </div>

              {/* Official Greeting Note */}
              <div className="pt-2 text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                Selamat atas pencapaianmu. Sampai bertemu di perjalanan berikutnya bersama BEM RDM FHUB.
              </div>

            </div>
          ) : isPending ? (
            /* PENDING STATE */
            <div className="space-y-6 text-center">
              {/* Applicant Name & Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 px-3.5 py-1 rounded-full border border-amber-300/30 dark:border-amber-400/25 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  NIM {result.nim}
                </div>
              </div>

              {/* Status Section - Muted Amber/Cyan Accent */}
              <div className="py-7 px-6 rounded-3xl liquid-glass-status-pending space-y-2">
                <div className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                  Hasil seleksi belum tersedia.
                </div>
                
                <div className="py-2.5">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-wider text-amber-700 dark:text-amber-400 inline-block drop-shadow-sm">
                    MENUNGGU PENGUMUMAN
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Staff Muda BEM RDM FHUB
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/06 border border-black/5 dark:border-white/10 backdrop-blur-md">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {result.division}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/06 border border-black/5 dark:border-white/10 backdrop-blur-md">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-sm font-semibold text-amber-700 dark:text-amber-400 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>MENUNGGU PENGUMUMAN</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                Silakan kembali setelah pengumuman resmi diterbitkan.
              </div>
            </div>
          ) : (
            /* NOT PASSED STATE - Dignified, respectful, neutral/warm accent */
            <div className="space-y-6 text-center">
              {/* Applicant Name & Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/10 px-3.5 py-1 rounded-full border border-black/5 dark:border-white/10 mb-2">
                  <XCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  NIM {result.nim}
                </div>
              </div>

              {/* Status Section - Dignified Neutral Glass */}
              <div className="py-7 px-6 rounded-3xl liquid-glass-status-neutral space-y-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                  Terima kasih telah mengikuti seluruh rangkaian seleksi.
                </div>
                
                <div className="py-2.5">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-700 dark:text-slate-200 status-belum-lulus inline-block drop-shadow-sm">
                    BELUM LULUS
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Staff Muda BEM RDM FHUB
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/06 border border-black/5 dark:border-white/10 backdrop-blur-md">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {result.division}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/06 border border-black/5 dark:border-white/10 backdrop-blur-md">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                    <span>BELUM LULUS</span>
                  </div>
                </div>
              </div>

              {/* Official Polite Note */}
              <div className="pt-2 text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                Terima kasih atas antusiasme dan kontribusimu. Tetap semangat dan sampai bertemu di kesempatan berikutnya.
              </div>
            </div>
          )}

          {/* Verification & Metadata Section in Liquid Glass */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-white/05 border border-black/5 dark:border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              {qrDataUrl ? (
                <button
                  type="button"
                  onClick={onOpenVerification}
                  className="w-14 h-14 rounded-xl bg-white p-1 border border-black/10 dark:border-white/20 shadow-sm hover:scale-105 transition-transform cursor-pointer shrink-0"
                  title="Klik untuk melihat verifikasi"
                >
                  <img
                    src={qrDataUrl}
                    alt="QR Verifikasi"
                    className="w-full h-full object-contain"
                  />
                </button>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-200/60 dark:bg-slate-800 animate-pulse shrink-0" />
              )}
              
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Sertifikat Digital Terverifikasi</span>
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  ID: {result.result_id}
                </div>
                <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                  Diumumkan: {result.announcement_date}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenVerification}
              className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer"
            >
              <span>Periksa Keaslian</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Action Button: Return */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="w-full h-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-800 dark:to-slate-900 hover:from-slate-850 hover:to-slate-900 text-white font-semibold text-xs tracking-wider uppercase rounded-2xl transition-all shadow-sm hover:shadow border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>KEMBALI KE PENCARIAN</span>
            </button>
          </div>

        </div>
      </LiquidGlassCard>
    </div>
  );
};
