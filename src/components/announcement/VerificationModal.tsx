import React from 'react';
import { ApplicantResult } from '../../types';
import { BEM_EMBLEM_URL } from '../../assets/emblem';
import { CheckCircle2, ShieldCheck, X, FileCheck, Building2, Calendar, Hash } from 'lucide-react';

interface VerificationModalProps {
  result: ApplicantResult;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ result, onClose }) => {
  const isPassed = result.status === 'PASSED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xl no-print animate-in fade-in duration-200">
      <div className="w-full max-w-lg apple-liquid-glass-modal rounded-3xl shadow-[0_35px_80px_-15px_rgba(15,23,42,0.22)] border border-white/95 overflow-hidden">
        
        {/* Header */}
        <div className="apple-liquid-glass-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={BEM_EMBLEM_URL}
                alt="Emblem"
                className="w-full h-full object-contain drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Verifikasi Sistem Otentikasi
              </div>
              <h3 className="text-sm font-bold text-white">
                Hasil Seleksi Terverifikasi
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Body */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl apple-liquid-glass-status-passed">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Pangkalan Data Resmi BEM RDM FHUB
              </div>
              <div className="text-[11px] text-emerald-700">
                Data sah dan tercatat dalam Berita Acara Rapat Pleno BPH.
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">ID Sertifikat</span>
              <span className="font-semibold text-slate-800">{result.result_id}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Nama Peserta</span>
              <span className="font-semibold text-slate-900 text-right">{result.name}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">NIM</span>
              <span className="font-normal text-slate-800">{result.nim}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Seleksi</span>
              <span className="font-normal text-slate-800 text-right">
                Seleksi Staff Muda BEM RDM FHUB
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Kabinet</span>
              <span className="font-normal text-slate-800">Kabinet Resonansi Kita</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Kementerian</span>
              <span className="font-semibold text-slate-800 text-right">{result.division}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Status Kelulusan</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] tracking-wide status-lulus ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {isPassed ? 'LULUS' : 'BELUM LULUS'}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Tanggal Diterbitkan</span>
              <span className="text-slate-700 font-normal">{result.announcement_date}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 apple-liquid-glass-subtle p-3.5 rounded-2xl text-center leading-relaxed">
            Dokumen elektronik ini merupakan hasil keluaran resmi sistem informasi seleksi BEM RDM Fakultas Hukum Universitas Brawijaya.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 text-white rounded-2xl text-xs font-semibold transition-all shadow-sm hover:shadow border border-white/15 cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
