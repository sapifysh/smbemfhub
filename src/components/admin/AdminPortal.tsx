import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { AdminApplicant } from '../../types';
import { BEM_EMBLEM_URL } from '../../assets/emblem';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  UploadCloud,
  Edit2,
  Trash2,
  X,
  Lock,
  LogOut,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Loader2,
  Clock,
  Database,
} from 'lucide-react';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIVISIONS = [
  'Kajian dan Aksi Strategis',
  'Pengembangan Sumber Daya Mahasiswa',
  'Advokasi dan Kesejahteraan Mahasiswa',
  'Riset dan Keilmuan Hukum',
  'Media, Komunikasi & Informasi',
  'Hubungan Eksternal & Diplomasi Kampus',
  'Seni, Olahraga & Apresiasi Mahasiswa',
  'Kewirausahaan & Ekonomi Kreatif',
];

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('bem_admin_token') || '');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Applicants State
  const [applicants, setApplicants] = useState<AdminApplicant[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'PENDING'>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');

  // Modals inside Admin
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<AdminApplicant | null>(null);
  const [deletingApplicant, setDeletingApplicant] = useState<AdminApplicant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for Add/Edit
  const [formNim, setFormNim] = useState('');
  const [formName, setFormName] = useState('');
  const [formDivision, setFormDivision] = useState(DIVISIONS[0]);
  const [formStatus, setFormStatus] = useState<'PASSED' | 'FAILED' | 'PENDING'>('PASSED');
  const [formError, setFormError] = useState('');

  // Load applicants if authenticated
  const loadApplicants = async (currentToken = token) => {
    if (!currentToken) return;
    setIsLoadingData(true);
    const res = await api.getAdminApplicants(currentToken);
    setIsLoadingData(false);

    if (res.success && res.data) {
      setApplicants(res.data.applicants);
    } else if (res.error?.includes('sesi') || res.error?.includes('ditolak')) {
      handleLogout();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (token) {
        if (window.location.pathname !== '/admin/dashboard') {
          window.history.pushState(null, '', '/admin/dashboard');
        }
        loadApplicants(token);
      } else {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      }
    }
  }, [isOpen, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    const res = await api.adminLogin(password);
    setIsLoggingIn(false);

    if (res.success && res.token) {
      setToken(res.token);
      localStorage.setItem('bem_admin_token', res.token);
      setPassword('');
      window.history.pushState(null, '', '/admin/dashboard');
      loadApplicants(res.token);
    } else {
      setAuthError(res.error || 'Kata sandi salah.');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('bem_admin_token');
    setApplicants([]);
    window.history.pushState(null, '', '/admin');
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = applicants.length;
    const passed = applicants.filter((a) => a.status === 'PASSED').length;
    const failed = applicants.filter((a) => a.status === 'FAILED').length;
    const pending = applicants.filter((a) => a.status === 'PENDING').length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, passed, failed, pending, percentage };
  }, [applicants]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchSearch =
        a.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.division.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const matchDivision = divisionFilter === 'ALL' || a.division === divisionFilter;
      return matchSearch && matchStatus && matchDivision;
    });
  }, [applicants, searchQuery, statusFilter, divisionFilter]);

  // Handle Add
  const handleOpenAdd = () => {
    setFormNim('');
    setFormName('');
    setFormDivision(DIVISIONS[0]);
    setFormStatus('PASSED');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formNim.trim() || !formName.trim()) {
      setFormError('NIM dan Nama wajib diisi.');
      return;
    }

    setIsSaving(true);
    const res = await api.addAdminApplicant(token, {
      nim: formNim.trim(),
      name: formName.trim(),
      division: formDivision,
      status: formStatus,
    });
    setIsSaving(false);

    if (res.success && res.data) {
      setApplicants((prev) => [res.data!, ...prev]);
      setIsAddModalOpen(false);
      setToastMessage({ type: 'success', text: 'Data peserta berhasil ditambahkan.' });
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setFormError(res.error || 'Terjadi kesalahan. Data belum berhasil disimpan.');
    }
  };

  // Handle Edit
  const handleOpenEdit = (app: AdminApplicant) => {
    setEditingApplicant(app);
    setFormNim(app.nim);
    setFormName(app.name);
    setFormDivision(app.division);
    setFormStatus(app.status);
    setFormError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApplicant) return;
    setFormError('');

    setIsSaving(true);
    const res = await api.updateAdminApplicant(token, editingApplicant.id, {
      nim: formNim.trim(),
      name: formName.trim(),
      division: formDivision,
      status: formStatus,
    });
    setIsSaving(false);

    if (res.success && res.data) {
      setApplicants((prev) =>
        prev.map((a) => (a.id === editingApplicant.id ? res.data! : a))
      );
      setEditingApplicant(null);
      setToastMessage({ type: 'success', text: 'Data peserta berhasil diperbarui.' });
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setFormError(res.error || 'Terjadi kesalahan. Data belum berhasil disimpan.');
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingApplicant) return;
    setIsDeleting(true);
    setDeleteError('');

    const res = await api.deleteAdminApplicant(token, deletingApplicant.id);
    setIsDeleting(false);

    if (res.success) {
      setApplicants((prev) => prev.filter((a) => a.id !== deletingApplicant.id));
      setDeletingApplicant(null);
      setToastMessage({ type: 'success', text: 'Peserta berhasil dihapus.' });
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setDeleteError(res.error || 'Terjadi kesalahan. Data belum berhasil disimpan.');
    }
  };

  // Handle CSV Import
  const handleImportCsv = async () => {
    if (!csvContent.trim()) return;
    setImportMessage(null);

    // Parse CSV lines
    const lines = csvContent.trim().split('\n');
    const rows: { nim: string; name: string; division: string; status: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header if contains 'NIM'
      if (i === 0 && line.toLowerCase().includes('nim')) {
        continue;
      }

      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        rows.push({
          nim: parts[0] || '',
          name: parts[1] || '',
          division: parts[2] || 'Umum',
          status: parts[3] || 'PASSED',
        });
      }
    }

    if (rows.length === 0) {
      setImportMessage({ type: 'error', text: 'Format CSV tidak valid. Pastikan kolom: NIM, Nama, Kementerian, Status.' });
      return;
    }

    const res = await api.importCsv(token, rows);
    if (res.success) {
      setImportMessage({ type: 'success', text: res.message || 'Impor CSV berhasil diproses.' });
      setCsvContent('');
      loadApplicants();
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportMessage(null);
      }, 1500);
    } else {
      setImportMessage({ type: 'error', text: res.error || 'Gagal memproses data CSV.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 no-print animate-in fade-in duration-200">
      <div className="w-full max-w-5xl apple-liquid-glass-modal rounded-3xl shadow-[0_35px_80px_-15px_rgba(15,23,42,0.22)] border border-white/95 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="apple-liquid-glass-dark text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src={BEM_EMBLEM_URL}
                alt="Emblem"
                className="w-full h-full object-contain drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Admin — Hasil Seleksi
              </h2>
              <div className="text-[11px] text-amber-300 font-semibold uppercase">
                Seleksi Staff Muda BEM RDM FHUB • Kabinet Resonansi Kita
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                title="Keluar dari sesi admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Logged In View */}
        {!token ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-6 my-auto">
            <div className="w-14 h-14 rounded-2xl apple-liquid-glass flex items-center justify-center mx-auto text-slate-700 shadow-xs border border-white/90">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Otentikasi Panitia Seleksi
              </h3>
              <p className="text-xs text-slate-500">
                Masukkan kata sandi administrator untuk mengelola pangkalan data kelulusan.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi Admin
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi (contoh: admin123)"
                  className="w-full px-3.5 py-2.5 text-sm apple-liquid-glass-input rounded-2xl focus:outline-none"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="text-xs text-rose-600 apple-liquid-glass-subtle bg-rose-50/60 p-2.5 rounded-xl border border-rose-200">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn || !password}
                className="w-full py-2.5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 text-white font-semibold text-xs rounded-2xl shadow-sm hover:shadow border border-white/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'Memverifikasi...' : 'Masuk Panel Admin'}
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-slate-400 font-normal">
                  Akses demo default: <code className="text-slate-700 font-semibold apple-liquid-glass-subtle px-1.5 py-0.5 rounded-md border border-white/90">admin123</code>
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {toastMessage && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs ${
                  toastMessage.type === 'success'
                    ? 'apple-liquid-glass-status-passed text-emerald-900'
                    : 'apple-liquid-glass-subtle bg-rose-50/70 text-rose-900 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {toastMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-medium">{toastMessage.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {/* Statistics Row - Liquid Glass Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl apple-liquid-glass-subtle">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Peserta
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.total}
                </div>
              </div>

              <div className="p-4 rounded-2xl apple-liquid-glass-status-passed">
                <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  Lulus
                </div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  {stats.passed}
                </div>
              </div>

              <div className="p-4 rounded-2xl apple-liquid-glass-status-neutral">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Belum Lulus
                </div>
                <div className="text-2xl font-bold text-slate-700 mt-1">
                  {stats.failed}
                </div>
              </div>

              <div className="p-4 rounded-2xl apple-liquid-glass-status-pending">
                <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                  Tingkat Kelulusan
                </div>
                <div className="text-2xl font-bold text-amber-900 mt-1">
                  {stats.percentage}%
                </div>
              </div>
            </div>

            {/* Actions & Filters Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari NIM, Nama, atau Kementerian..."
                    className="w-full pl-9 pr-3 py-2 text-xs apple-liquid-glass-input rounded-xl focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs apple-liquid-glass-input rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PASSED">Lulus</option>
                  <option value="FAILED">Belum Lulus</option>
                  <option value="PENDING">Pending</option>
                </select>

                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="px-3 py-2 text-xs apple-liquid-glass-input rounded-xl focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="ALL">Semua Kementerian</option>
                  {DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3.5 py-2 apple-liquid-glass-button text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Impor CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-3.5 py-2 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all shadow-xs hover:shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Peserta</span>
                </button>

                <button
                  type="button"
                  onClick={() => loadApplicants()}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-xl apple-liquid-glass-button transition-colors cursor-pointer"
                  title="Muat ulang data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Applicant Table - Apple Liquid Glass */}
            <div className="apple-liquid-glass-subtle rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="apple-liquid-glass-header text-slate-700 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">NIM</th>
                      <th className="py-3 px-4">Nama Peserta</th>
                      <th className="py-3 px-4">Kementerian</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {isLoadingData ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 text-slate-700 animate-spin" />
                            <span>Memuat data peserta...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredApplicants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-normal">
                          Tidak ada data peserta yang cocok dengan kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredApplicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-white/60 transition-colors font-normal">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {applicant.nim}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {applicant.name}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-normal">
                            {applicant.division}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                                applicant.status === 'PASSED'
                                  ? 'apple-liquid-glass-status-passed text-emerald-900 status-lulus shadow-2xs'
                                  : applicant.status === 'PENDING'
                                  ? 'apple-liquid-glass-status-pending text-amber-900 shadow-2xs'
                                  : 'apple-liquid-glass-status-neutral text-slate-800 shadow-2xs'
                              }`}
                            >
                              {applicant.status === 'PASSED' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>LULUS</span>
                                </>
                              ) : applicant.status === 'PENDING' ? (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>PENDING</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-slate-500" />
                                  <span>BELUM LULUS</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(applicant)}
                              className="p-1.5 text-slate-600 hover:text-slate-950 apple-liquid-glass-button rounded-xl transition-all cursor-pointer"
                              title="Edit Data Peserta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError('');
                                setDeletingApplicant(applicant);
                              }}
                              className="p-1.5 text-rose-600 hover:text-rose-800 apple-liquid-glass-button rounded-xl transition-all cursor-pointer"
                              title="Hapus Peserta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Add Applicant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/45 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md apple-liquid-glass-modal rounded-3xl shadow-[0_35px_80px_-15px_rgba(15,23,42,0.22)] border border-white/95 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <h3 className="text-sm font-bold text-slate-900">Tambah Peserta Seleksi</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">NIM</label>
                <input
                  type="text"
                  value={formNim}
                  onChange={(e) => setFormNim(e.target.value)}
                  placeholder="225150100111099"
                  className="w-full px-3 py-2 apple-liquid-glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nama Peserta"
                  className="w-full px-3 py-2 apple-liquid-glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Kementerian Penempatan</label>
                <select
                  value={formDivision}
                  onChange={(e) => setFormDivision(e.target.value)}
                  className="w-full px-3 py-2 apple-liquid-glass-input rounded-xl focus:outline-none cursor-pointer"
                >
                  {DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status Kelulusan</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormStatus('PASSED')}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                      formStatus === 'PASSED'
                        ? 'apple-liquid-glass-status-passed text-emerald-900 border border-emerald-300'
                        : 'apple-liquid-glass-button text-slate-700'
                    }`}
                  >
                    LULUS
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('FAILED')}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                      formStatus === 'FAILED'
                        ? 'apple-liquid-glass-status-neutral text-slate-900 border border-slate-300'
                        : 'apple-liquid-glass-button text-slate-700'
                    }`}
                  >
                    BELUM LULUS
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('PENDING')}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                      formStatus === 'PENDING'
                        ? 'apple-liquid-glass-status-pending text-amber-900 border border-amber-300'
                        : 'apple-liquid-glass-button text-slate-700'
                    }`}
                  >
                    PENDING
                  </button>
                </div>
              </div>

              {formError && (
                <div className="text-rose-600 apple-liquid-glass-subtle bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 apple-liquid-glass-button text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer border border-white/15"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Applicant Modal */}
      {editingApplicant && (
        <div className="fixed inset-0 z-60 bg-slate-950/45 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md apple-liquid-glass-modal rounded-3xl shadow-[0_35px_80px_-15px_rgba(15,23,42,0.22)] border border-white/95 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <h3 className="text-sm font-bold text-slate-900">Ubah Data Peserta</h3>
              <button
                type="button"
                onClick={() => setEditingApplicant(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">NIM</label>
                <input
                  type="text"
                  value={formNim}
                  onChange={(e) => setFormNim(e.target.value)}
                  className="w-full px-3 py-2 apple-liquid-glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 apple-liquid-glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Kementerian Penempatan</label>
                <select
                  value={formDivision}
                  onChange={(e) => setFormDivision(e.target.value)}
                  className="w-full px-3 py-2 apple-liquid-glass-input rounded-xl focus:outline-none cursor-pointer"
                >
                  {DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status Kelulusan</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormStatus('PASSED')}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                      formStatus === 'PASSED'
                        ? 'apple-liquid-glass-status-passed text-emerald-900 border border-emerald-300'
                        : 'apple-liquid-glass-button text-slate-700'
                    }`}
                  >
                    LULUS
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('FAILED')}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                      formStatus === 'FAILED'
                        ? 'apple-liquid-glass-status-neutral text-slate-900 border border-slate-300'
                        : 'apple-liquid-glass-button text-slate-700'
                    }`}
                  >
                    BELUM LULUS
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('PENDING')}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                      formStatus === 'PENDING'
                        ? 'apple-liquid-glass-status-pending text-amber-900 border border-amber-300'
                        : 'apple-liquid-glass-button text-slate-700'
                    }`}
                  >
                    PENDING
                  </button>
                </div>
              </div>

              {formError && (
                <div className="text-rose-600 apple-liquid-glass-subtle bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingApplicant(null)}
                  className="px-4 py-2 apple-liquid-glass-button text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer border border-white/15"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/45 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg apple-liquid-glass-modal rounded-3xl shadow-[0_35px_80px_-15px_rgba(15,23,42,0.22)] border border-white/95 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Impor Spreadsheet / CSV</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportMessage(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed font-normal">
              <p>
                Salin & tempel data CSV atau upload berkas dengan format baris:
              </p>
              <div className="apple-liquid-glass-subtle p-3 rounded-xl text-[11px] text-slate-800 overflow-x-auto">
                NIM, Nama, Kementerian, Status<br />
                225150100111001, Arya Danendra, Kajian dan Aksi Strategis, PASSED<br />
                225150100111002, Clarissa Amanda, Pengembangan Sumber Daya Mahasiswa, FAILED
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Data CSV
              </label>
              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="Tempel baris data CSV di sini..."
                rows={6}
                className="w-full p-3 text-xs apple-liquid-glass-input rounded-xl focus:outline-none"
              />
            </div>

            {importMessage && (
              <div
                className={`text-xs p-2.5 rounded-xl border ${
                  importMessage.type === 'success'
                    ? 'apple-liquid-glass-status-passed text-emerald-900 border-emerald-300'
                    : 'apple-liquid-glass-subtle bg-rose-50/70 text-rose-900 border-rose-200'
                }`}
              >
                {importMessage.text}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCsvContent(
                    `NIM, Nama, Kementerian, Status\n225150100111088, Dimas Satria, Advokasi dan Kesejahteraan Mahasiswa, PASSED\n225150100111089, Alifah Zahra, Kajian dan Aksi Strategis, FAILED`
                  );
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Contoh Template
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3.5 py-2 apple-liquid-glass-button text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  disabled={!csvContent.trim()}
                  className="px-4 py-2 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer border border-white/15"
                >
                  Proses Impor
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingApplicant && (
        <div className="fixed inset-0 z-70 bg-slate-950/45 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm apple-liquid-glass-modal rounded-3xl shadow-[0_35px_80px_-15px_rgba(15,23,42,0.22)] border border-white/95 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100/80 backdrop-blur-md flex items-center justify-center shrink-0 text-rose-600 border border-rose-200/80">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Apakah kamu yakin ingin menghapus peserta ini?</h3>
                <p className="text-xs text-slate-500 font-normal">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-3.5 apple-liquid-glass-subtle rounded-2xl space-y-1 text-xs">
              <div className="font-semibold text-slate-900">{deletingApplicant.name}</div>
              <div className="text-slate-500">NIM: <span className="font-medium text-slate-700">{deletingApplicant.nim}</span></div>
              <div className="text-slate-500">Kementerian: <span className="font-medium text-slate-700">{deletingApplicant.division}</span></div>
            </div>

            {deleteError && (
              <div className="text-xs text-rose-600 apple-liquid-glass-subtle bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeletingApplicant(null);
                  setDeleteError('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 apple-liquid-glass-button rounded-xl cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-rose-500/40 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
