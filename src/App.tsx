import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { ApplicantResult, VerificationData } from './types';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchSection } from './components/announcement/SearchSection';
import { ResultView } from './components/announcement/ResultView';
import { VerificationModal } from './components/announcement/VerificationModal';
import { PrintableResult } from './components/announcement/PrintableResult';
import { AdminPortal } from './components/admin/AdminPortal';

export function App() {
  const [result, setResult] = useState<ApplicantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  // Check if URL directly visits /result/:resultId, /admin, or /admin/dashboard
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;

      if (path === '/admin' || path === '/admin/dashboard') {
        setIsAdminOpen(true);
      } else if (path === '/') {
        setIsAdminOpen(false);
      }

      const match = path.match(/\/result\/([^/]+)/);
      if (match && match[1]) {
        const resultId = match[1];
        api.verifyResult(resultId).then((res) => {
          if (res.success && res.data) {
            setResult({
              name: res.data.name,
              nim: res.data.nim,
              status: res.data.status,
              division: res.data.division,
              selection_stage: 'Tahap Akhir (Sidang Pleno)',
              announcement_date: res.data.announcement_date,
              result_id: res.data.result_id,
              cabinet: res.data.cabinet,
              selection_title: res.data.selection_title,
              verification_url: `/result/${res.data.result_id}`,
            });
          }
        });
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleOpenAdmin = () => {
    const token = localStorage.getItem('bem_admin_token');
    const targetUrl = token ? '/admin/dashboard' : '/admin';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    setIsAdminOpen(false);
  };

  const handleSearch = async (nim: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await api.checkResult(nim);
    setIsLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
      setErrorMessage(null);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMessage(res.error || 'Data tidak ditemukan.');
    }
  };

  const handleBackToSearch = () => {
    setResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-slate-50 via-slate-50/95 to-slate-100 text-slate-900 selection:bg-slate-900 selection:text-white overflow-x-hidden">
      
      {/* Liquid Glass Ambient Background Illumination - Entire Size */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none" aria-hidden="true">
        {/* Soft amber-gold liquid orb (BEM Resonansi Kita signature) */}
        <div className="absolute -top-[10%] left-[10%] w-[520px] sm:w-[760px] h-[520px] sm:h-[760px] rounded-full bg-gradient-to-br from-amber-300/30 via-amber-200/20 to-transparent blur-3xl opacity-80 animate-float-slow" />
        {/* Soft azure-sky liquid orb */}
        <div className="absolute top-[22%] -right-[10%] w-[480px] sm:w-[700px] h-[480px] sm:h-[700px] rounded-full bg-gradient-to-bl from-sky-300/30 via-indigo-200/20 to-transparent blur-3xl opacity-75 animate-float-reverse" />
        {/* Soft emerald-mint ambient orb */}
        <div className="absolute bottom-[5%] -left-[8%] w-[540px] sm:w-[760px] h-[420px] sm:h-[640px] rounded-full bg-gradient-to-tr from-emerald-200/30 via-teal-100/20 to-transparent blur-3xl opacity-65 animate-float-slow" />
        {/* Center luminous liquid specular wash */}
        <div className="absolute top-[45%] left-[25%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-r from-blue-100/25 via-amber-100/20 to-transparent blur-3xl opacity-50 pointer-events-none" />
        {/* Subtle Apple-style precision dot mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.12]" />
      </div>

      {/* Official Top Header */}
      <Header
        onOpenAdmin={handleOpenAdmin}
        onGoHome={result ? handleBackToSearch : undefined}
        showBackToHome={Boolean(result)}
      />

      {/* Main Announcement Interface */}
      <main className="flex-1 flex flex-col no-print">
        {!result ? (
          <SearchSection
            onSearch={handleSearch}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        ) : (
          <ResultView
            result={result}
            onBack={handleBackToSearch}
            onPrint={handlePrint}
            onOpenVerification={() => setIsVerificationOpen(true)}
          />
        )}
      </main>

      {/* Dedicated Clean A4 Printable Template */}
      {result && <PrintableResult result={result} />}

      {/* Verification Details Modal */}
      {isVerificationOpen && result && (
        <VerificationModal
          result={result}
          onClose={() => setIsVerificationOpen(false)}
        />
      )}

      {/* Admin Management Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
      />

      {/* Official Bottom Footer */}
      <Footer onOpenAdmin={handleOpenAdmin} />

    </div>
  );
}

export default App;
