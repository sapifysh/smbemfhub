import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ApplicantResult } from '../../types';
import { BEM_EMBLEM_URL } from '../../assets/emblem';

interface PrintableResultProps {
  result: ApplicantResult;
}

export const PrintableResult: React.FC<PrintableResultProps> = ({ result }) => {
  const isPassed = result.status === 'PASSED';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const verificationUrl = `${window.location.origin}/result/${result.result_id}`;
    QRCode.toDataURL(verificationUrl, {
      width: 120,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [result.result_id]);

  return (
    <div className="print-only w-full bg-white text-slate-900 p-8">
      
      {/* Official Kop Surat */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <img
              src={BEM_EMBLEM_URL}
              alt="Logo BEM"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 text-center">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-700">
              KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
            </div>
            <div className="text-sm uppercase font-bold tracking-wide text-slate-900">
              UNIVERSITAS BRAWIJAYA • FAKULTAS HUKUM
            </div>
            <div className="text-base uppercase font-bold tracking-tight text-slate-900 mt-0.5">
              BADAN EKSEKUTIF MAHASISWA REPUBLIK DAERAH MAHASISWA
            </div>
            <div className="text-xs font-semibold tracking-widest uppercase text-slate-800">
              KABINET RESONANSI KITA 2026/2027
            </div>
            <div className="text-[10px] font-normal text-slate-600 mt-1">
              Gedung Student Center Lt. 2 FH UB, Jl. MT Haryono No. 169 Malang 65145 • bem.fh.ub.ac.id
            </div>
          </div>

          <div className="w-20 shrink-0 text-right">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Verifikasi"
                className="w-18 h-18 object-contain ml-auto"
              />
            )}
            <div className="text-[9px] font-normal text-slate-600 text-center mt-0.5">
              {result.result_id}
            </div>
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center space-y-1 mb-8">
        <div className="text-xs font-semibold tracking-widest uppercase text-slate-600">
          SURAT KETERANGAN RESMI HASIL SELEKSI
        </div>
        <div className="text-base font-bold uppercase tracking-tight text-slate-900">
          SELEKSI STAFF MUDA BEM RDM FHUB PERIODE 2026/2027
        </div>
        <div className="text-xs text-slate-500 font-normal">
          Nomor Dokumen: {result.result_id}/SK-SM/BEM-FHUB/IX/2026
        </div>
      </div>

      {/* Narrative Intro */}
      <div className="text-xs leading-relaxed space-y-4 mb-6 font-normal">
        <p className="leading-relaxed text-slate-700">
          Berdasarkan hasil rangkaian proses evaluasi, verifikasi berkas, dan sidang pleno penetapan kelulusan calon fungsionaris Staff Muda Badan Eksekutif Mahasiswa Republik Daerah Mahasiswa Fakultas Hukum Universitas Brawijaya (BEM RDM FHUB) Kabinet Resonansi Kita, bersama ini menerangkan bahwa mahasiswa:
        </p>

        {/* Applicant Identity Table */}
        <div className="border border-slate-300 rounded-lg overflow-hidden my-4">
          <table className="w-full text-xs text-left">
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="py-2.5 px-4 font-medium text-slate-600 w-48">Nama Lengkap</td>
                <td className="py-2.5 px-4 font-bold text-slate-900">{result.name}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2.5 px-4 font-medium text-slate-600">Nomor Induk Mahasiswa (NIM)</td>
                <td className="py-2.5 px-4 font-semibold text-slate-800">{result.nim}</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="py-2.5 px-4 font-medium text-slate-600">Fakultas / Program Studi</td>
                <td className="py-2.5 px-4 font-normal text-slate-800">Fakultas Hukum / Ilmu Hukum</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2.5 px-4 font-medium text-slate-600">Kementerian Penempatan</td>
                <td className="py-2.5 px-4 font-bold text-slate-900">{result.division}</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="py-2.5 px-4 font-medium text-slate-600">Status Kelulusan</td>
                <td className="py-2.5 px-4">
                  <span className={`font-bold text-base uppercase tracking-wide status-lulus ${isPassed ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {isPassed ? 'LULUS' : 'BELUM LULUS'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-600">Tanggal Pengumuman</td>
                <td className="py-2.5 px-4 font-normal text-slate-800">{result.announcement_date}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Verdict Details */}
        {isPassed ? (
          <p className="leading-relaxed text-slate-700 font-normal">
            Dinyatakan <strong className="font-bold text-slate-900">LULUS SELEKSI</strong> dan ditetapkan secara sah sebagai <strong className="font-bold text-slate-900">Staff Muda BEM RDM FHUB Kabinet Resonansi Kita Periode 2026/2027</strong>. Yang bersangkutan berhak dan berkewajiban untuk mengikuti tahapan First Gathering serta pembekalan fungsionaris sesuai ketetapan organisasi.
          </p>
        ) : (
          <p className="leading-relaxed text-slate-700 font-normal">
            Dinyatakan telah mengikuti seluruh rangkaian seleksi Staff Muda BEM RDM FHUB Kabinet Resonansi Kita. Panitia Seleksi dan BPH BEM RDM FHUB menyampaikan apresiasi setinggi-tingginya atas partisipasi dan dedikasi yang ditunjukkan.
          </p>
        )}

        <p className="leading-relaxed text-slate-700 font-normal">
          Demikian surat keterangan ini diterbitkan sebagai bukti otentik pengumuman resmi hasil seleksi untuk dipergunakan sebagaimana mestinya.
        </p>
      </div>

      {/* Signature & Legal Seal Block */}
      <div className="pt-10 flex items-start justify-between text-xs break-inside-avoid">
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-slate-500">Catatan Keabsahan:</div>
          <div className="text-[9px] font-normal text-slate-600 max-w-xs leading-normal">
            Surat keterangan ini digenerasi secara elektronik melalui portal resmi BEM RDM FHUB. Keabsahan dokumen dapat diverifikasi dengan memindai kode QR yang tertera pada bagian atas.
          </div>
        </div>

        <div className="text-center w-64 space-y-16">
          <div>
            <div className="text-xs font-normal text-slate-600">Malang, {result.announcement_date}</div>
            <div className="font-semibold text-xs mt-0.5 text-slate-900">
              Presiden BEM RDM FHUB 2026/2027
            </div>
          </div>

          <div className="border-t border-slate-900 pt-1">
            <div className="font-bold text-xs uppercase text-slate-900">
              MUHAMMAD ILHAM FAHREZI
            </div>
            <div className="text-[10px] font-normal text-slate-600">
              NIM 225010100111001
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
