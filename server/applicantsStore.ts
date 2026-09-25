import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'applicants.json');

export interface ApplicantRecord {
  id: string;
  nim: string;
  name: string;
  division: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  selection_stage: string;
  announcement_date: string;
  result_id: string;
  created_at: string;
  updated_at: string;
}

const SEED_APPLICANTS: ApplicantRecord[] = [
  {
    id: 'app-001',
    nim: '225150100111001',
    name: 'Arya Danendra Prasetyo',
    division: 'Kajian dan Aksi Strategis',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00101',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-002',
    nim: '225150100111002',
    name: 'Clarissa Amanda Putri',
    division: 'Pengembangan Sumber Daya Mahasiswa',
    status: 'FAILED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00102',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-003',
    nim: '225150100111003',
    name: 'Dimas Raditya Taufik',
    division: 'Advokasi dan Kesejahteraan Mahasiswa',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00103',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-004',
    nim: '225150100111004',
    name: 'Nadine Althea Saraswati',
    division: 'Hubungan Eksternal & Diplomasi Kampus',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00104',
    created_at: '2026-09-02T09:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-005',
    nim: '225150100111005',
    name: 'Muhammad Fikri Pratama',
    division: 'Media, Komunikasi & Informasi',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00105',
    created_at: '2026-09-02T10:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-006',
    nim: '225150100111006',
    name: 'Salsabila Azzahra',
    division: 'Kewirausahaan & Ekonomi Kreatif',
    status: 'FAILED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00106',
    created_at: '2026-09-03T11:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-007',
    nim: '225150100111007',
    name: 'Bintang Rayhan Syahputra',
    division: 'Riset dan Keilmuan Hukum',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00107',
    created_at: '2026-09-03T13:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-008',
    nim: '225150100111008',
    name: 'Felicia Evelyn Wijaya',
    division: 'Seni, Olahraga & Apresiasi Mahasiswa',
    status: 'FAILED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00108',
    created_at: '2026-09-04T14:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-009',
    nim: '225150100111009',
    name: 'Zaky Anwar Hidayat',
    division: 'Kajian dan Aksi Strategis',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00109',
    created_at: '2026-09-04T15:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-010',
    nim: '225150100111010',
    name: 'Tiara Kusuma Wardani',
    division: 'Pengembangan Sumber Daya Mahasiswa',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00110',
    created_at: '2026-09-05T09:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  // Backward compatible NIMs
  {
    id: 'app-011',
    nim: '235010100111012',
    name: 'Arya Danendra Prasetyo',
    division: 'Kajian dan Aksi Strategis',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00111',
    created_at: '2026-09-05T10:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-012',
    nim: '245010100111034',
    name: 'Clarissa Amanda Putri',
    division: 'Advokasi dan Kesejahteraan Mahasiswa',
    status: 'FAILED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00112',
    created_at: '2026-09-05T11:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'app-013',
    nim: '245010101111065',
    name: 'Dimas Raditya Taufik',
    division: 'Pengembangan Sumber Daya Mahasiswa',
    status: 'PASSED',
    selection_stage: 'Tahap Akhir (Sidang Pleno)',
    announcement_date: '24 September 2026',
    result_id: 'SMBEM2026-00113',
    created_at: '2026-09-05T12:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
  }
];

export class ApplicantsStore {
  private static applicants: ApplicantRecord[] = [];
  private static isInitialized = false;

  private static ensureData(): void {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.applicants = JSON.parse(raw);
      } else {
        this.applicants = [...SEED_APPLICANTS];
        this.saveToFile();
      }
    } catch (e) {
      console.error('[ApplicantsStore] Fallback to memory seed data:', e);
      this.applicants = [...SEED_APPLICANTS];
    }

    this.isInitialized = true;
  }

  private static saveToFile(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.applicants, null, 2), 'utf-8');
    } catch (e) {
      console.error('[ApplicantsStore] Error saving to file:', e);
    }
  }

  public static getByNim(nim: string): ApplicantRecord | undefined {
    this.ensureData();
    const cleanNim = (nim || '').replace(/\D/g, '').trim();
    return this.applicants.find((a) => a && a.nim && String(a.nim).replace(/\D/g, '').trim() === cleanNim);
  }

  public static getByResultId(resultId: string): ApplicantRecord | undefined {
    this.ensureData();
    const cleanId = (resultId || '').trim().toUpperCase();
    return this.applicants.find((a) => a && a.result_id && a.result_id.toUpperCase() === cleanId);
  }

  public static getAll(): ApplicantRecord[] {
    this.ensureData();
    return [...this.applicants];
  }

  public static add(data: {
    nim: string;
    name: string;
    division: string;
    status: 'PASSED' | 'FAILED' | 'PENDING';
    selection_stage?: string;
    announcement_date?: string;
  }): ApplicantRecord {
    this.ensureData();
    const cleanNim = (data.nim || '').replace(/\D/g, '').trim();

    // Check if NIM already exists
    const existing = this.applicants.find((a) => a && a.nim && String(a.nim).replace(/\D/g, '').trim() === cleanNim);
    if (existing) {
      throw new Error(`NIM ${cleanNim} sudah terdaftar.`);
    }

    const counter = this.applicants.length + 101;
    const resultId = `SMBEM2026-${String(counter).padStart(5, '0')}`;
    const now = new Date().toISOString();

    const record: ApplicantRecord = {
      id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nim: cleanNim,
      name: (data.name || '').trim(),
      division: (data.division || '').trim(),
      status: data.status,
      selection_stage: data.selection_stage || 'Tahap Akhir (Sidang Pleno)',
      announcement_date: data.announcement_date || '24 September 2026',
      result_id: resultId,
      created_at: now,
      updated_at: now,
    };

    this.applicants.unshift(record);
    this.saveToFile();
    return record;
  }

  public static update(
    id: string,
    updates: Partial<Pick<ApplicantRecord, 'nim' | 'name' | 'division' | 'status' | 'selection_stage'>>
  ): ApplicantRecord {
    this.ensureData();
    const idx = this.applicants.findIndex((a) => a && a.id === id);
    if (idx === -1) {
      throw new Error('Peserta tidak ditemukan.');
    }

    if (updates.nim) {
      const cleanNim = updates.nim.replace(/\D/g, '').trim();
      const duplicate = this.applicants.find(
        (a) => a && a.id !== id && a.nim && String(a.nim).replace(/\D/g, '').trim() === cleanNim
      );
      if (duplicate) {
        throw new Error(`NIM ${cleanNim} sudah digunakan oleh peserta lain.`);
      }
      updates.nim = cleanNim;
    }

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    this.applicants[idx] = {
      ...this.applicants[idx],
      ...cleanUpdates,
      updated_at: new Date().toISOString(),
    };

    this.saveToFile();
    return this.applicants[idx];
  }

  public static delete(id: string): boolean {
    this.ensureData();
    const initialLen = this.applicants.length;
    this.applicants = this.applicants.filter((a) => a.id !== id);
    if (this.applicants.length !== initialLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  public static importCsv(rows: { nim: string; name: string; division: string; status: string }[]): {
    inserted: number;
    updated: number;
    errors: string[];
  } {
    this.ensureData();
    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      const lineNum = index + 1;
      const cleanNim = (row.nim || '').replace(/\D/g, '').trim();
      const cleanName = (row.name || '').trim();
      const cleanDivision = (row.division || '').trim();
      const rawStatus = (row.status || '').trim().toUpperCase();

      if (!cleanNim) {
        errors.push(`Baris ${lineNum}: NIM tidak boleh kosong.`);
        continue;
      }
      if (!cleanName) {
        errors.push(`Baris ${lineNum}: Nama tidak boleh kosong.`);
        continue;
      }

      const status: 'PASSED' | 'FAILED' =
        rawStatus === 'PASSED' || rawStatus === 'LULUS' ? 'PASSED' : 'FAILED';

      const existingIndex = this.applicants.findIndex(
        (a) => a.nim.replace(/\D/g, '').trim() === cleanNim
      );

      if (existingIndex >= 0) {
        this.applicants[existingIndex] = {
          ...this.applicants[existingIndex],
          name: cleanName,
          division: cleanDivision || this.applicants[existingIndex].division,
          status,
          updated_at: new Date().toISOString(),
        };
        updated++;
      } else {
        const counter = this.applicants.length + 101;
        const resultId = `SMBEM2026-${String(counter).padStart(5, '0')}`;
        const now = new Date().toISOString();

        this.applicants.unshift({
          id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nim: cleanNim,
          name: cleanName,
          division: cleanDivision || 'Umum',
          status,
          selection_stage: 'Tahap Akhir (Sidang Pleno)',
          announcement_date: '24 September 2026',
          result_id: resultId,
          created_at: now,
          updated_at: now,
        });
        inserted++;
      }
    }

    this.saveToFile();
    return { inserted, updated, errors };
  }
}
