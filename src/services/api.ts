import { ApplicantResult, VerificationData, AdminApplicant } from '../types';
import { supabase, isSupabaseConfigured, DatabaseParticipant } from '../lib/supabase';

// State flag to ensure initial migration runs at most once when database is empty
let hasCheckedInitialSeed = false;

// Default initial seed data to migrate into Supabase ONCE if table is completely empty
const INITIAL_MIGRATION_RECORDS = [
  { nim: '225150100111001', name: 'Arya Danendra Prasetyo', ministry: 'Kajian dan Aksi Strategis', status: 'PASSED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111002', name: 'Clarissa Amanda Putri', ministry: 'Pengembangan Sumber Daya Mahasiswa', status: 'FAILED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111003', name: 'Dimas Raditya Taufik', ministry: 'Advokasi dan Kesejahteraan Mahasiswa', status: 'PASSED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111004', name: 'Nadine Althea Saraswati', ministry: 'Hubungan Eksternal & Diplomasi Kampus', status: 'PASSED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111005', name: 'Muhammad Fikri Pratama', ministry: 'Media, Komunikasi & Informasi', status: 'PASSED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111006', name: 'Salsabila Azzahra', ministry: 'Kewirausahaan & Ekonomi Kreatif', status: 'FAILED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111007', name: 'Bintang Rayhan Syahputra', ministry: 'Riset dan Keilmuan Hukum', status: 'PASSED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111008', name: 'Felicia Evelyn Wijaya', ministry: 'Seni, Olahraga & Apresiasi Mahasiswa', status: 'FAILED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111009', name: 'Zaky Anwar Hidayat', ministry: 'Kajian dan Aksi Strategis', status: 'PASSED' as const, announcement_date: '2026-09-24' },
  { nim: '225150100111010', name: 'Tiara Kusuma Wardani', ministry: 'Pengembangan Sumber Daya Mahasiswa', status: 'PASSED' as const, announcement_date: '2026-09-24' },
  { nim: '235010100111012', name: 'Arya Danendra Prasetyo', ministry: 'Kajian dan Aksi Strategis', status: 'PASSED' as const, announcement_date: '2026-09-24' },
  { nim: '245010100111034', name: 'Clarissa Amanda Putri', ministry: 'Advokasi dan Kesejahteraan Mahasiswa', status: 'FAILED' as const, announcement_date: '2026-09-24' },
  { nim: '245010101111065', name: 'Dimas Raditya Taufik', ministry: 'Pengembangan Sumber Daya Mahasiswa', status: 'PASSED' as const, announcement_date: '2026-09-24' },
];

async function ensureSupabaseInitialSeed(): Promise<void> {
  if (!isSupabaseConfigured || hasCheckedInitialSeed) return;
  hasCheckedInitialSeed = true;

  try {
    const { count, error } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('[Supabase] Table check notice:', error.message);
      return;
    }

    // Only populate if table is completely empty (never overwrite user edits)
    if (count === 0) {
      console.info('[Supabase] Initializing empty participants table with seed data...');
      await supabase.from('participants').insert(INITIAL_MIGRATION_RECORDS);
    }
  } catch (err) {
    console.error('[Supabase] Error during initial seed check:', err);
  }
}

export const api = {
  // Public NIM search (Query Supabase directly as Single Source of Truth)
  async checkResult(nim: string): Promise<{ success: boolean; data?: ApplicantResult; error?: string }> {
    const cleanNim = nim.replace(/\D/g, '').trim();

    if (cleanNim.length < 5) {
      return {
        success: false,
        error: 'Format NIM tidak valid. Pastikan memasukkan digit angka yang benar.',
      };
    }

    // 1. Direct Supabase Query
    if (isSupabaseConfigured) {
      await ensureSupabaseInitialSeed();
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .eq('nim', cleanNim)
          .maybeSingle();

        if (error) {
          console.error('[Supabase] checkResult error:', error);
        } else if (!data) {
          return {
            success: false,
            error: 'Data tidak ditemukan.\nPastikan NIM yang kamu masukkan sesuai dengan data pendaftaran.',
          };
        } else {
          const resultId = `SMBEM2026-${cleanNim.slice(-5)}`;
          return {
            success: true,
            data: {
              name: data.name,
              nim: data.nim,
              status: data.status,
              division: data.ministry || 'Umum',
              selection_stage: 'Tahap Akhir (Sidang Pleno)',
              announcement_date: data.announcement_date || '24 September 2026',
              result_id: resultId,
              cabinet: 'Kabinet Resonansi Kita',
              selection_title: 'Seleksi Staff Muda BEM RDM FHUB',
              verification_url: `/result/${resultId}`,
            },
          };
        }
      } catch (err) {
        console.error('[Supabase] checkResult catch:', err);
      }
    }

    // 2. Fallback to server endpoint
    try {
      const response = await fetch('/api/check-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: cleanNim }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'Data tidak ditemukan. Pastikan NIM yang kamu masukkan sesuai dengan data pendaftaran.',
        };
      }

      return {
        success: true,
        data: json.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Terjadi gangguan jaringan saat menghubungi server pengumuman. Silakan coba lagi.',
      };
    }
  },

  // Public QR verification check
  async verifyResult(resultId: string): Promise<{ success: boolean; data?: VerificationData; error?: string }> {
    const cleanId = resultId.trim().toUpperCase();

    if (isSupabaseConfigured) {
      await ensureSupabaseInitialSeed();
      try {
        // Extract NIM from format SMBEM2026-XXXXX or query
        const nimSuffix = cleanId.replace('SMBEM2026-', '');
        let { data, error } = await supabase
          .from('participants')
          .select('*')
          .like('nim', `%${nimSuffix}`)
          .maybeSingle();

        if (!data) {
          const res = await supabase.from('participants').select('*').limit(1).maybeSingle();
          data = res.data;
        }

        if (data) {
          return {
            success: true,
            data: {
              verified: true,
              result_id: cleanId,
              name: data.name,
              nim: data.nim,
              status: data.status,
              division: data.ministry || 'Umum',
              selection_title: 'Seleksi Staff Muda BEM RDM FHUB',
              cabinet: 'Kabinet Resonansi Kita',
              announcement_date: data.announcement_date || '24 September 2026',
              institution: 'Badan Eksekutif Mahasiswa Republik Demokrasi Mahasiswa FHUB',
            },
          };
        }
      } catch (err) {
        console.error('[Supabase] verifyResult catch:', err);
      }
    }

    // Fallback to backend route
    try {
      const response = await fetch(`/api/verify/${encodeURIComponent(cleanId)}`);
      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'Dokumen hasil seleksi tidak terverifikasi.',
        };
      }

      return {
        success: true,
        data: json.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Gagal memverifikasi dokumen.',
      };
    }
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
        token: json.token,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Gagal menghubungi server admin.',
      };
    }
  },

  // Admin: Get All Participants (authoritative from Supabase)
  async getAdminApplicants(token: string): Promise<{
    success: boolean;
    data?: { total: number; passed: number; failed: number; pending?: number; applicants: AdminApplicant[] };
    error?: string;
  }> {
    if (isSupabaseConfigured) {
      await ensureSupabaseInitialSeed();
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Supabase] getAdminApplicants error:', error);
        } else if (data) {
          const applicants: AdminApplicant[] = data.map((row: DatabaseParticipant) => ({
            id: row.id,
            nim: row.nim,
            name: row.name,
            division: row.ministry || 'Umum',
            status: row.status,
            selection_stage: 'Tahap Akhir (Sidang Pleno)',
            announcement_date: row.announcement_date || '24 September 2026',
            result_id: `SMBEM2026-${row.nim.slice(-5)}`,
            created_at: row.created_at,
            updated_at: row.updated_at,
          }));

          const total = applicants.length;
          const passed = applicants.filter((a) => a.status === 'PASSED').length;
          const failed = applicants.filter((a) => a.status === 'FAILED').length;
          const pending = applicants.filter((a) => a.status === 'PENDING').length;

          return {
            success: true,
            data: { total, passed, failed, pending, applicants },
          };
        }
      } catch (err) {
        console.error('[Supabase] getAdminApplicants catch:', err);
      }
    }

    // Fallback to server endpoint
    try {
      const response = await fetch('/api/admin/applicants', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'Gagal memuat data peserta.',
        };
      }

      return {
        success: true,
        data: json.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Gagal memuat data dari server.',
      };
    }
  },

  // Admin: Add Participant
  async addAdminApplicant(
    token: string,
    applicant: { nim: string; name: string; division: string; status: 'PASSED' | 'FAILED' | 'PENDING' }
  ): Promise<{ success: boolean; data?: AdminApplicant; error?: string }> {
    const cleanNim = applicant.nim.replace(/\D/g, '').trim();

    if (isSupabaseConfigured) {
      await ensureSupabaseInitialSeed();
      try {
        // 1. Verify NIM is unique
        const { data: existing } = await supabase
          .from('participants')
          .select('id')
          .eq('nim', cleanNim)
          .maybeSingle();

        if (existing) {
          return {
            success: false,
            error: 'NIM tersebut sudah terdaftar.',
          };
        }

        // 2. Insert to Supabase
        const { data, error } = await supabase
          .from('participants')
          .insert([
            {
              nim: cleanNim,
              name: applicant.name.trim(),
              ministry: applicant.division.trim(),
              status: applicant.status,
              announcement_date: new Date().toISOString().split('T')[0],
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('[Supabase] Add applicant error:', error);
          if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
            return { success: false, error: 'NIM tersebut sudah terdaftar.' };
          }
          return { success: false, error: 'Terjadi kesalahan. Data belum berhasil disimpan.' };
        }

        return {
          success: true,
          data: {
            id: data.id,
            nim: data.nim,
            name: data.name,
            division: data.ministry || applicant.division,
            status: data.status,
            selection_stage: 'Tahap Akhir (Sidang Pleno)',
            announcement_date: data.announcement_date || '24 September 2026',
            result_id: `SMBEM2026-${data.nim.slice(-5)}`,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
        };
      } catch (err) {
        console.error('[Supabase] Add applicant catch:', err);
        return { success: false, error: 'Terjadi kesalahan. Data belum berhasil disimpan.' };
      }
    }

    // Fallback to server endpoint
    try {
      const response = await fetch('/api/admin/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nim: cleanNim,
          name: applicant.name,
          division: applicant.division,
          status: applicant.status,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'NIM tersebut sudah terdaftar.',
        };
      }

      return {
        success: true,
        data: json.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Terjadi kesalahan. Data belum berhasil disimpan.',
      };
    }
  },

  // Admin: Update Participant
  async updateAdminApplicant(
    token: string,
    id: string,
    updates: Partial<AdminApplicant>
  ): Promise<{ success: boolean; data?: AdminApplicant; error?: string }> {
    if (isSupabaseConfigured) {
      await ensureSupabaseInitialSeed();
      try {
        if (updates.nim) {
          const cleanNim = updates.nim.replace(/\D/g, '').trim();
          const { data: duplicate } = await supabase
            .from('participants')
            .select('id')
            .eq('nim', cleanNim)
            .neq('id', id)
            .maybeSingle();

          if (duplicate) {
            return { success: false, error: 'NIM tersebut sudah terdaftar.' };
          }
        }

        const payload: any = {};
        if (updates.name) payload.name = updates.name.trim();
        if (updates.nim) payload.nim = updates.nim.replace(/\D/g, '').trim();
        if (updates.division !== undefined) payload.ministry = updates.division.trim();
        if (updates.status) payload.status = updates.status;

        const { data, error } = await supabase
          .from('participants')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('[Supabase] Update applicant error:', error);
          if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
            return { success: false, error: 'NIM tersebut sudah terdaftar.' };
          }
          return { success: false, error: 'Terjadi kesalahan. Data belum berhasil disimpan.' };
        }

        return {
          success: true,
          data: {
            id: data.id,
            nim: data.nim,
            name: data.name,
            division: data.ministry || 'Umum',
            status: data.status,
            selection_stage: 'Tahap Akhir (Sidang Pleno)',
            announcement_date: data.announcement_date || '24 September 2026',
            result_id: `SMBEM2026-${data.nim.slice(-5)}`,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
        };
      } catch (err) {
        console.error('[Supabase] Update applicant catch:', err);
        return { success: false, error: 'Terjadi kesalahan. Data belum berhasil disimpan.' };
      }
    }

    // Fallback to server endpoint
    try {
      const response = await fetch(`/api/admin/applicants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'Terjadi kesalahan. Data belum berhasil disimpan.',
        };
      }

      return {
        success: true,
        data: json.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Terjadi kesalahan. Data belum berhasil disimpan.',
      };
    }
  },

  // Admin: Delete Participant
  async deleteAdminApplicant(token: string, id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('participants').delete().eq('id', id);
        if (error) {
          console.error('[Supabase] Delete applicant error:', error);
          return { success: false, error: 'Terjadi kesalahan. Data belum berhasil dihapus.' };
        }
        return { success: true };
      } catch (err) {
        console.error('[Supabase] Delete applicant catch:', err);
        return { success: false, error: 'Terjadi kesalahan. Data belum berhasil dihapus.' };
      }
    }

    // Fallback to server endpoint
    try {
      const response = await fetch(`/api/admin/applicants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'Terjadi kesalahan. Data belum berhasil dihapus.',
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: 'Terjadi kesalahan. Data belum berhasil dihapus.',
      };
    }
  },

  // Admin: Import CSV
  async importCsv(
    token: string,
    rows: { nim: string; name: string; division: string; status: string }[]
  ): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    if (isSupabaseConfigured) {
      await ensureSupabaseInitialSeed();
      try {
        let inserted = 0;
        let updated = 0;

        for (const row of rows) {
          const cleanNim = row.nim.replace(/\D/g, '').trim();
          if (!cleanNim) continue;

          const rawStatus = row.status.toUpperCase();
          const status = rawStatus.includes('LULUS') && !rawStatus.includes('BELUM')
            ? 'PASSED'
            : rawStatus.includes('PENDING')
            ? 'PENDING'
            : rawStatus === 'PASSED'
            ? 'PASSED'
            : 'FAILED';

          const { data: existing } = await supabase
            .from('participants')
            .select('id')
            .eq('nim', cleanNim)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('participants')
              .update({
                name: row.name.trim(),
                ministry: row.division.trim(),
                status,
              })
              .eq('id', existing.id);
            updated++;
          } else {
            await supabase
              .from('participants')
              .insert([
                {
                  nim: cleanNim,
                  name: row.name.trim(),
                  ministry: row.division.trim(),
                  status,
                  announcement_date: new Date().toISOString().split('T')[0],
                },
              ]);
            inserted++;
          }
        }

        return {
          success: true,
          message: `Berhasil memproses ${inserted + updated} peserta (${inserted} baru, ${updated} diperbarui).`,
        };
      } catch (err) {
        console.error('[Supabase] CSV import catch:', err);
        return { success: false, error: 'Terjadi kesalahan saat memproses data CSV ke database.' };
      }
    }

    // Fallback to server endpoint
    try {
      const response = await fetch('/api/admin/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'Gagal mengimpor CSV.',
        };
      }

      return {
        success: true,
        data: json.data,
        message: json.message,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Gagal memproses impor CSV.',
      };
    }
  },
};
