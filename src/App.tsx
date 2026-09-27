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
import { LIGHT_BACKGROUND_URL } from './assets/background';

export function App() {
  const [result, setResult] = useState<ApplicantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from storage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('bem_portal_theme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('bem_portal_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    <div className={`min-h-screen flex flex-col relative transition-colors duration-500 overflow-x-hidden ${
      theme === 'dark' 
        ? 'text-slate-100 selection:bg-cyan-500 selection:text-slate-950' 
        : 'text-slate-900 selection:bg-slate-900 selection:text-white'
    }`}>
      
      {/* ====================================================================
          LIGHT MODE BACKGROUND
          Features the locally generated high-resolution 16:9 textured background:
          - 75-85% pure white / ivory
          - subtle cyan & turquoise accents on perimeter
          - restrained champagne gold curves framing the content
          - flowing silk-like translucent textures & fine grain
          - clean central 50% negative space
          - responsive viewport coverage with cover, center, no-repeat
          - subtle protective overlay for crystal-clear readability
          ==================================================================== */}
      {theme === 'light' && (
        <div 
          className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none" 
          aria-hidden="true"
        >
          {/* Main Generated Textured Background Asset */}
          <div 
            className="absolute inset-0 w-full h-full scale-[1.01]"
            style={{
              backgroundImage: `url(${LIGHT_BACKGROUND_URL}), url('/liquid-glass-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* High-Key Diffused Light Diffusion & Ambient Refraction Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-white/30 pointer-events-none" />

          {/* Central Radial Negative Space Booster (keeps center 45-50% ultra-clean & legible) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.25)_55%,transparent_85%)] pointer-events-none" />

          {/* Translucent Liquid Glass Ambient Refraction Layer */}
          <div className="absolute -top-[10%] left-[8%] w-[500px] sm:w-[740px] h-[500px] sm:h-[740px] rounded-full bg-gradient-to-br from-amber-200/18 via-amber-100/10 to-transparent blur-3xl opacity-60 animate-float-slow pointer-events-none" />
          <div className="absolute top-[20%] -right-[8%] w-[460px] sm:w-[680px] h-[460px] sm:h-[680px] rounded-full bg-gradient-to-bl from-cyan-200/20 via-sky-100/10 to-transparent blur-3xl opacity-65 animate-float-reverse pointer-events-none" />
          <div className="absolute bottom-[4%] -left-[6%] w-[520px] sm:w-[720px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-tr from-teal-100/20 via-sky-100/10 to-transparent blur-3xl opacity-50 animate-float-slow pointer-events-none" />
        </div>
      )}

      {/* ====================================================================
          DARK MODE BACKGROUND
          Preserved original dark atmospheric illumination background:
          - Deep obsidian/slate canvas
          - Luminous colored liquid orbs
          - Precision dot matrix grid
          ==================================================================== */}
      {theme === 'dark' && (
        <div 
          className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none bg-slate-950" 
          aria-hidden="true"
        >
          {/* Deep atmospheric backdrop gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-95" />
          
          {/* Preserved atmospheric liquid orbs */}
          <div className="absolute -top-[10%] left-[10%] w-[520px] sm:w-[760px] h-[520px] sm:h-[760px] rounded-full bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent blur-3xl opacity-75 animate-float-slow" />
          <div className="absolute top-[22%] -right-[10%] w-[480px] sm:w-[700px] h-[480px] sm:h-[700px] rounded-full bg-gradient-to-bl from-cyan-500/25 via-indigo-600/15 to-transparent blur-3xl opacity-70 animate-float-reverse" />
          <div className="absolute bottom-[5%] -left-[8%] w-[540px] sm:w-[760px] h-[420px] sm:h-[640px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-600/10 to-transparent blur-3xl opacity-60 animate-float-slow" />
          <div className="absolute top-[45%] left-[25%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-r from-blue-500/15 via-amber-500/10 to-transparent blur-3xl opacity-45 pointer-events-none" />
          
          {/* Subtle Apple-style precision dot mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
        </div>
      )}

      {/* Official Top Header */}
      <Header
        onOpenAdmin={handleOpenAdmin}
        onGoHome={result ? handleBackToSearch : undefined}
        showBackToHome={Boolean(result)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
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
