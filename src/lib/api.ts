import { ApplicantResult, VerificationData, AdminApplicant, AdminStats } from '../types';
import { MINISTRIES, isValidMinistry } from '../constants/ministries';

// Environment variable for Google Apps Script Web App URL
const GAS_URL = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim();
const DEFAULT_ADMIN_TOKEN = (import.meta.env.VITE_ADMIN_TOKEN || 'admin-token-bem-2026').trim();

export interface AppsScriptParticipant {
  id?: string;
  nim: string;
  name: string;
  ministry: string;
  division?: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  announcement_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ImportSummary {
  imported: number;
  skipped: number;
  duplicate: number;
  invalid: number;
  failed: number;
  total_processed: number;
  errors: string[];
}

/**
 * Checks if the Google Apps Script Web App URL has been configured
 */
export function isGoogleAppsScriptConfigured(): boolean {
  return Boolean(
    GAS_URL &&
    GAS_URL.startsWith('https://script.google.com/macros/s/') &&
    !GAS_URL.includes('XXXXX') &&
    !GAS_URL.includes('your-apps-script')
  );
}

/**
 * Get active endpoint: Direct GAS URL or local server proxy fallback
 */
function getEndpointUrl(params?: Record<string, string>): string {
  const base = isGoogleAppsScriptConfigured() ? GAS_URL : '/api/apps-script';
  if (!params) return base;

  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

/**
 * Standard fetch wrapper for Google Apps Script Web App with CORS and redirect handling
 */
async function callAppsScript<T = any>(
  method: 'GET' | 'POST',
  action: string,
  payloadOrParams: Record<string, any> = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  try {
    let url: string;
    let options: RequestInit = {
      redirect: 'follow',
    };

    if (method === 'GET') {
      const queryParams: Record<string, string> = { action, ...payloadOrParams };
      url = getEndpointUrl(queryParams);
      options.method = 'GET';
    } else {
      // POST Request
      // Using 'text/plain;charset=utf-8' prevents CORS preflight OPTIONS check in browser
      // while allowing Google Apps Script doPost(e) to read e.postData.contents
      url = getEndpointUrl();
      const bodyData = { action, ...payloadOrParams };
      options.method = 'POST';
      options.headers = {
        'Content-Type': 'text/plain;charset=utf-8',
      };
      options.body = JSON.stringify(bodyData);
    }

    const response = await fetch(url, options);

    if (!response.ok && response.status !== 404 && response.status !== 400 && response.status !== 401) {
      // If direct call fails and proxy exists, try backend proxy once
      if (isGoogleAppsScriptConfigured() && !url.includes('/api/apps-script')) {
        return callViaProxy<T>(method, action, payloadOrParams);
      }
      return {
        success: false,
        error: `HTTP_ERROR_${response.status}`,
        message: `Terjadi gangguan koneksi ke server API (HTTP ${response.status}).`,
      };
    }

    const json = await response.json();
    return json;
  } catch (err: any) {
    console.warn('[AppsScript API] Direct request failed, attempting server proxy fallback...', err);
    // Attempt fallback via backend server proxy
    try {
      return await callViaProxy<T>(method, action, payloadOrParams);
    } catch (fallbackErr: any) {
      if (!isGoogleAppsScriptConfigured()) {
        return {
          success: false,
          error: 'CONFIG_MISSING',
          message: 'URL Google Apps Script belum dikonfigurasi. Silakan atur VITE_GOOGLE_APPS_SCRIPT_URL di file .env Anda.',
        };
      }
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Gagal terhubung ke Google Apps Script. Periksa koneksi internet atau izin deployment Web App.',
      };
    }
  }
}

/**
 * Proxy helper via Express backend
 */
async function callViaProxy<T>(
  method: 'GET' | 'POST',
  action: string,
  payloadOrParams: Record<string, any>
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const proxyUrl = '/api/apps-script';
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, action, ...payloadOrParams }),
  });
  return await response.json();
}

// ============================================================================
// CORE API FUNCTIONS (Specified in Architecture)
// ============================================================================

/**
 * 1. getParticipantByNim(nim) - Public lookup for single participant
 * Only returns minimal public fields: nim, name, ministry, status, announcement_date
 */
export async function getParticipantByNim(nim: string): Promise<{
  success: boolean;
  data?: AppsScriptParticipant;
  error?: string;
  message?: string;
}> {
  const cleanNim = nim.replace(/\D/g, '').trim();
  if (!cleanNim || cleanNim.length < 5) {
    return {
      success: false,
      error: 'INVALID_NIM',
      message: 'Format NIM tidak valid. Pastikan memasukkan digit angka yang benar.',
    };
  }

  return await callAppsScript<AppsScriptParticipant>('GET', 'getParticipant', { nim: cleanNim });
}

/**
 * 2. getParticipants(token) - Admin lookup for all participants + stats
 */
export async function getParticipants(token = DEFAULT_ADMIN_TOKEN): Promise<{
  success: boolean;
  data?: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    percentage: number;
    participants: AppsScriptParticipant[];
  };
  error?: string;
  message?: string;
}> {
  return await callAppsScript('GET', 'listParticipants', { token });
}

/**
 * 3. createParticipant(data, token) - Admin participant creation
 */
export async function createParticipant(
  data: {
    nim: string;
    name: string;
    ministry: string;
    status: 'PASSED' | 'FAILED' | 'PENDING';
    announcement_date?: string;
  },
  token = DEFAULT_ADMIN_TOKEN
): Promise<{ success: boolean; data?: AppsScriptParticipant; error?: string; message?: string }> {
  const cleanNim = data.nim.replace(/\D/g, '').trim();

  return await callAppsScript<AppsScriptParticipant>('POST', 'createParticipant', {
    token,
    nim: cleanNim,
    name: data.name.trim(),
    ministry: data.ministry.trim(),
    status: data.status,
    announcement_date: data.announcement_date,
  });
}

/**
 * 4. updateParticipant(nim, data, token) - Admin participant update
 */
export async function updateParticipant(
  nim: string,
  data: Partial<{
    newNim?: string;
    name: string;
    ministry: string;
    status: 'PASSED' | 'FAILED' | 'PENDING';
    announcement_date?: string;
  }>,
  token = DEFAULT_ADMIN_TOKEN
): Promise<{ success: boolean; data?: AppsScriptParticipant; error?: string; message?: string }> {
  const targetNim = nim.replace(/\D/g, '').trim();

  return await callAppsScript<AppsScriptParticipant>('POST', 'updateParticipant', {
    token,
    nim: targetNim,
    ...data,
  });
}

/**
 * 5. deleteParticipant(nim, token) - Admin participant deletion
 */
export async function deleteParticipant(
  nim: string,
  token = DEFAULT_ADMIN_TOKEN
): Promise<{ success: boolean; error?: string; message?: string }> {
  const targetNim = nim.replace(/\D/g, '').trim();
  return await callAppsScript('POST', 'deleteParticipant', { token, nim: targetNim });
}

/**
 * 6. importParticipants(rows, token) - Admin CSV / bulk import
 */
export async function importParticipants(
  rows: { nim: string; name: string; ministry: string; status: string }[],
  token = DEFAULT_ADMIN_TOKEN
): Promise<{ success: boolean; data?: ImportSummary; error?: string; message?: string }> {
  return await callAppsScript<ImportSummary>('POST', 'importParticipants', { token, rows });
}

// ============================================================================
// ADAPTER SERVICE FOR EXISTING APPLICATION COMPONENTS
// ============================================================================

export const api = {
  // Public NIM search (Transforms Apps Script response to UI ApplicantResult)
  async checkResult(nim: string): Promise<{ success: boolean; data?: ApplicantResult; error?: string }> {
    const res = await getParticipantByNim(nim);

    if (!res.success || !res.data) {
      if (res.error === 'PARTICIPANT_NOT_FOUND' || res.message?.includes('tidak ditemukan')) {
        return {
          success: false,
          error: 'Data tidak ditemukan.\nPastikan NIM yang kamu masukkan sesuai dengan data pendaftaran.',
        };
      }
      return {
        success: false,
        error: res.message || 'Data peserta tidak ditemukan. Pastikan NIM yang dimasukkan sudah benar.',
      };
    }

    const item = res.data;
    const cleanNim = item.nim;
    const resultId = `SMBEM2026-${cleanNim.slice(-5)}`;

    return {
      success: true,
      data: {
        name: item.name,
        nim: item.nim,
        status: item.status,
        division: item.ministry || item.division || 'Umum',
        ministry: item.ministry || item.division || 'Umum',
        selection_stage: 'Tahap Akhir (Sidang Pleno)',
        announcement_date: item.announcement_date || '24 September 2026',
        result_id: resultId,
        cabinet: 'Kabinet Resonansi Kita',
        selection_title: 'Seleksi Staff Muda BEM RDM FHUB',
        verification_url: `/result/${resultId}`,
      },
    };
  },

  // Public QR verification check (Finds by NIM extracted from resultId)
  async verifyResult(resultId: string): Promise<{ success: boolean; data?: VerificationData; error?: string }> {
    const cleanId = resultId.trim().toUpperCase();
    const nimSuffix = cleanId.replace('SMBEM2026-', '');

    // First attempt to search by nimSuffix directly
    let res = await getParticipantByNim(nimSuffix);

    // If not found by suffix, call backend verify or list if available
    if (!res.success || !res.data) {
      try {
        const fallback = await fetch(`/api/verify/${encodeURIComponent(cleanId)}`);
        const json = await fallback.json();
        if (json.success && json.data) {
          return { success: true, data: json.data };
        }
      } catch (err) {
        // Continue
      }
    }

    if (res.success && res.data) {
      const item = res.data;
      return {
        success: true,
        data: {
          verified: true,
          result_id: cleanId,
          name: item.name,
          nim: item.nim,
          status: item.status,
          division: item.ministry || item.division || 'Umum',
          ministry: item.ministry || item.division || 'Umum',
          selection_title: 'Seleksi Staff Muda BEM RDM FHUB',
          cabinet: 'Kabinet Resonansi Kita',
          announcement_date: item.announcement_date || '24 September 2026',
          institution: 'BEM RDM Fakultas Hukum Universitas Brawijaya',
        },
      };
    }

    return {
      success: false,
      error: 'Dokumen hasil seleksi tidak terverifikasi.',
    };
  },

  // Admin Login
  async adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'Kata sandi admin tidak valid.',
        };
      }

      return {
        success: true,
        token: json.token || DEFAULT_ADMIN_TOKEN,
      };
    } catch (err: any) {
      // Local fallback for offline testing
      const validPasswords = ['admin', 'admin123', 'admin_bem', 'resonansikita2026'];
      if (validPasswords.includes(password.trim())) {
        return {
          success: true,
          token: DEFAULT_ADMIN_TOKEN,
        };
      }
      return {
        success: false,
        error: 'Gagal menghubungi server admin.',
      };
    }
  },

  // Admin: Get All Participants from Google Sheets
  async getAdminApplicants(token: string): Promise<{
    success: boolean;
    data?: {
      total: number;
      passed: number;
      failed: number;
      pending?: number;
      percentage?: number;
      applicants: AdminApplicant[];
    };
    error?: string;
  }> {
    const res = await getParticipants(token || DEFAULT_ADMIN_TOKEN);

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.message || 'Gagal memuat data peserta dari Google Sheets.',
      };
    }

    const rawList = res.data.participants || [];
    const applicants: AdminApplicant[] = rawList.map((row) => ({
      id: row.id || `p-${row.nim}`,
      nim: row.nim,
      name: row.name,
      division: row.ministry || row.division || 'Umum',
      ministry: row.ministry || row.division || 'Umum',
      status: row.status,
      selection_stage: 'Tahap Akhir (Sidang Pleno)',
      announcement_date: row.announcement_date || '24 September 2026',
      result_id: `SMBEM2026-${row.nim.slice(-5)}`,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    }));

    const total = res.data.total ?? applicants.length;
    const passed = res.data.passed ?? applicants.filter((a) => a.status === 'PASSED').length;
    const failed = res.data.failed ?? applicants.filter((a) => a.status === 'FAILED').length;
    const pending = res.data.pending ?? applicants.filter((a) => a.status === 'PENDING').length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      success: true,
      data: {
        total,
        passed,
        failed,
        pending,
        percentage,
        applicants,
      },
    };
  },

  // Admin: Add Participant
  async addAdminApplicant(
    token: string,
    applicant: { nim: string; name: string; division: string; status: 'PASSED' | 'FAILED' | 'PENDING' }
  ): Promise<{ success: boolean; data?: AdminApplicant; error?: string }> {
    const res = await createParticipant(
      {
        nim: applicant.nim,
        name: applicant.name,
        ministry: applicant.division,
        status: applicant.status,
      },
      token || DEFAULT_ADMIN_TOKEN
    );

    if (!res.success || !res.data) {
      if (res.error === 'DUPLICATE_NIM' || res.message?.includes('sudah terdaftar') || res.message?.includes('already exists')) {
        return { success: false, error: 'NIM tersebut sudah terdaftar di Google Sheets.' };
      }
      return { success: false, error: res.message || 'Terjadi kesalahan saat menambahkan data ke Google Sheets.' };
    }

    const d = res.data;
    return {
      success: true,
      data: {
        id: d.id || `p-${d.nim}`,
        nim: d.nim,
        name: d.name,
        division: d.ministry || applicant.division,
        ministry: d.ministry || applicant.division,
        status: d.status,
        selection_stage: 'Tahap Akhir (Sidang Pleno)',
        announcement_date: d.announcement_date || '24 September 2026',
        result_id: `SMBEM2026-${d.nim.slice(-5)}`,
        created_at: d.created_at || new Date().toISOString(),
        updated_at: d.updated_at || new Date().toISOString(),
      },
    };
  },

  // Admin: Update Participant
  async updateAdminApplicant(
    token: string,
    id: string,
    updates: Partial<AdminApplicant>
  ): Promise<{ success: boolean; data?: AdminApplicant; error?: string }> {
    const targetNim = updates.nim || id.replace('p-', '');

    const res = await updateParticipant(
      targetNim,
      {
        newNim: updates.nim,
        name: updates.name,
        ministry: updates.division || updates.ministry,
        status: updates.status,
      },
      token || DEFAULT_ADMIN_TOKEN
    );

    if (!res.success || !res.data) {
      if (res.error === 'DUPLICATE_NIM') {
        return { success: false, error: 'NIM baru sudah digunakan oleh peserta lain.' };
      }
      return { success: false, error: res.message || 'Terjadi kesalahan saat memperbarui data di Google Sheets.' };
    }

    const d = res.data;
    return {
      success: true,
      data: {
        id: d.id || `p-${d.nim}`,
        nim: d.nim,
        name: d.name,
        division: d.ministry || 'Umum',
        ministry: d.ministry || 'Umum',
        status: d.status,
        selection_stage: 'Tahap Akhir (Sidang Pleno)',
        announcement_date: d.announcement_date || '24 September 2026',
        result_id: `SMBEM2026-${d.nim.slice(-5)}`,
        created_at: d.created_at || new Date().toISOString(),
        updated_at: d.updated_at || new Date().toISOString(),
      },
    };
  },

  // Admin: Delete Participant
  async deleteAdminApplicant(token: string, idOrNim: string): Promise<{ success: boolean; error?: string }> {
    const nim = idOrNim.replace('p-', '').trim();
    const res = await deleteParticipant(nim, token || DEFAULT_ADMIN_TOKEN);

    if (!res.success) {
      return {
        success: false,
        error: res.message || 'Terjadi kesalahan saat menghapus data dari Google Sheets.',
      };
    }
    return { success: true };
  },

  // Admin: Import CSV
  async importCsv(
    token: string,
    rows: { nim: string; name: string; division: string; status: string }[]
  ): Promise<{ success: boolean; data?: ImportSummary; error?: string; message?: string }> {
    // Map division to ministry for Apps Script
    const mappedRows = rows.map((r) => ({
      nim: r.nim,
      name: r.name,
      ministry: r.division,
      status: r.status,
    }));

    const res = await importParticipants(mappedRows, token || DEFAULT_ADMIN_TOKEN);

    if (!res.success) {
      return {
        success: false,
        error: res.message || 'Gagal memproses data CSV ke Google Sheets.',
      };
    }

    return {
      success: true,
      data: res.data,
      message: res.message || `Berhasil mengimpor data ke Google Sheets.`,
    };
  },
};
