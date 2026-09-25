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
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Container Card - Apple Liquid Glass */}
      <div className="w-full max-w-2xl apple-liquid-glass-card rounded-3xl overflow-hidden shadow-[0_30px_70px_-15px_rgba(15,23,42,0.12)] border border-white/95">
        
        {/* Official Header Banner */}
        <div className="apple-liquid-glass-dark text-white p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Subtle gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 opacity-90" />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-14 h-14 flex items-center justify-center">
              <img
                src={BEM_EMBLEM_URL}
                alt="Logo BEM RDM FHUB"
                className="w-full h-full object-contain drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">
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
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* PASSED STATE */}
          {isPassed ? (
            <div className="space-y-6 text-center">
              {/* Applicant Name & Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-emerald-800 apple-liquid-glass-subtle px-3.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500">
                  NIM {result.nim}
                </div>
              </div>

              {/* Status Section - Apple Liquid Glass */}
              <div className="py-7 px-6 rounded-3xl apple-liquid-glass-status-passed space-y-2">
                <div className="text-xs text-slate-600 font-normal">
                  Berdasarkan hasil seleksi, kamu dinyatakan:
                </div>
                
                <div className="py-2.5">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-wider text-emerald-600 status-lulus inline-block drop-shadow-2xs">
                    LULUS
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700">
                  Staff Muda BEM RDM FHUB
                </div>
                <div className="text-[11px] font-normal text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl apple-liquid-glass-subtle">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {result.division}
                  </div>
                </div>

                <div className="p-4 rounded-2xl apple-liquid-glass-subtle">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>LULUS</span>
                  </div>
                </div>
              </div>

              {/* Official Greeting Note */}
              <div className="pt-2 text-xs sm:text-sm font-normal text-slate-600 leading-relaxed max-w-lg mx-auto">
                Selamat atas pencapaianmu. Sampai bertemu di perjalanan berikutnya bersama BEM RDM FHUB.
              </div>

            </div>
          ) : isPending ? (
            /* PENDING STATE */
            <div className="space-y-6 text-center">
              {/* Applicant Name & Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-800 apple-liquid-glass-subtle px-3.5 py-1 rounded-full border border-amber-200/80 shadow-2xs mb-2">
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500">
                  NIM {result.nim}
                </div>
              </div>

              {/* Status Section - Apple Liquid Glass */}
              <div className="py-7 px-6 rounded-3xl apple-liquid-glass-status-pending space-y-2">
                <div className="text-xs text-slate-600 font-normal">
                  Hasil seleksi belum tersedia.
                </div>
                
                <div className="py-2.5">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-wider text-amber-700 inline-block drop-shadow-2xs">
                    MENUNGGU PENGUMUMAN
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700">
                  Staff Muda BEM RDM FHUB
                </div>
                <div className="text-[11px] font-normal text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl apple-liquid-glass-subtle">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {result.division}
                  </div>
                </div>

                <div className="p-4 rounded-2xl apple-liquid-glass-subtle">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-sm font-semibold text-amber-700 mt-0.5 flex items-center gap-1.5">
                    <span>MENUNGGU PENGUMUMAN</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs sm:text-sm font-normal text-slate-600 leading-relaxed max-w-lg mx-auto">
                Silakan kembali setelah pengumuman resmi diterbitkan.
              </div>
            </div>
          ) : (
            /* NOT PASSED STATE - Dignified, respectful, neutral */
            <div className="space-y-6 text-center">
              {/* Applicant Name & Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-700 apple-liquid-glass-subtle px-3.5 py-1 rounded-full border border-slate-200/80 shadow-2xs mb-2">
                  <span>HASIL SELEKSI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {result.name}
                </h2>
                <div className="text-xs font-normal text-slate-500">
                  NIM {result.nim}
                </div>
              </div>

              {/* Status Section - Apple Liquid Glass */}
              <div className="py-7 px-6 rounded-3xl apple-liquid-glass-status-neutral space-y-2">
                <div className="text-xs text-slate-500 font-normal leading-relaxed">
                  Terima kasih telah mengikuti seluruh rangkaian seleksi.
                </div>
                
                <div className="py-2.5">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-700 status-belum-lulus inline-block drop-shadow-2xs">
                    BELUM LULUS
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700">
                  Staff Muda BEM RDM FHUB
                </div>
                <div className="text-[11px] font-normal text-slate-400">
                  Kabinet Resonansi Kita
                </div>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl apple-liquid-glass-subtle">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Kementerian
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {result.division}
                  </div>
                </div>

                <div className="p-4 rounded-2xl apple-liquid-glass-subtle">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5 flex items-center gap-1.5">
                    <span>BELUM LULUS</span>
                  </div>
                </div>
              </div>

              {/* Official Polite Note */}
              <div className="pt-2 text-xs sm:text-sm font-normal text-slate-600 leading-relaxed max-w-lg mx-auto">
                Terima kasih atas antusiasme dan kontribusimu. Tetap semangat dan sampai bertemu di kesempatan berikutnya.
              </div>
            </div>
          )}

          {/* Verification & Metadata Section */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 apple-liquid-glass-subtle p-4 rounded-2xl">
            <div className="flex items-center gap-3.5">
              {qrDataUrl ? (
                <button
                  type="button"
                  onClick={onOpenVerification}
                  className="w-14 h-14 rounded-xl apple-liquid-glass p-1 border border-white/95 shadow-xs hover:scale-105 transition-transform cursor-pointer shrink-0"
                  title="Klik untuk melihat verifikasi"
                >
                  <img
                    src={qrDataUrl}
                    alt="QR Verifikasi"
                    className="w-full h-full object-contain"
                  />
                </button>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-200/60 animate-pulse shrink-0" />
              )}
              
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Sertifikat Digital Terverifikasi</span>
                </div>
                <div className="text-[11px] font-normal text-slate-500">
                  ID: {result.result_id}
                </div>
                <div className="text-[11px] font-normal text-slate-400">
                  Diumumkan: {result.announcement_date}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenVerification}
              className="text-xs font-semibold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer"
            >
              <span>Periksa Keaslian</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="w-full h-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 active:from-slate-950 active:to-slate-950 text-white font-semibold text-xs tracking-wider uppercase rounded-2xl transition-all shadow-sm hover:shadow-md border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>KEMBALI</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
