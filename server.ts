import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApplicantsStore } from './server/applicantsStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory IP rate limiter for public result lookups
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 45; // Generous for testing, prevents flooding

  const current = rateLimitMap.get(ip);
  if (!current || now > current.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return next();
  }

  if (current.count >= maxRequests) {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak permintaan pencarian. Mohon tunggu beberapa detik sebelum mencoba kembali.',
    });
    return;
  }

  current.count += 1;
  next();
}

// Clean up stale rate limiter entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.expiresAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '5mb' }));
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      organization: 'BEM RDM FHUB',
      cabinet: 'Kabinet Resonansi Kita',
      selection: 'Seleksi Staff Muda BEM RDM FHUB',
      year: '2026',
    });
  });

  // 1. Public NIM Result Lookup (rate-limited, minimal response)
  app.post('/api/check-result', rateLimiter, (req: Request, res: Response) => {
    const { nim } = req.body;

    if (!nim || typeof nim !== 'string') {
      res.status(400).json({
        success: false,
        message: 'NIM wajib diisi.',
      });
      return;
    }

    const cleanNim = nim.replace(/\D/g, '').trim();

    if (cleanNim.length < 5) {
      res.status(400).json({
        success: false,
        message: 'Format NIM tidak valid. Pastikan memasukkan digit angka yang benar.',
      });
      return;
    }

    const applicant = ApplicantsStore.getByNim(cleanNim);

    if (!applicant) {
      res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan.',
        hint: 'Pastikan NIM yang kamu masukkan sudah sesuai dengan data pendaftaran.',
      });
      return;
    }

    // Return ONLY the necessary applicant result fields (Security: Do not leak internal IDs or full DB)
    res.json({
      success: true,
      data: {
        name: applicant.name,
        nim: applicant.nim,
        status: applicant.status, // "PASSED" | "FAILED"
        division: applicant.division,
        selection_stage: applicant.selection_stage,
        announcement_date: applicant.announcement_date,
        result_id: applicant.result_id,
        cabinet: 'Kabinet Resonansi Kita',
        selection_title: 'Seleksi Staff Muda BEM RDM FHUB',
        verification_url: `/result/${applicant.result_id}`,
      },
    });
  });

  // 2. Public Verification Check (by unique result_id e.g. SMBEM2026-00101)
  app.get('/api/verify/:resultId', (req: Request, res: Response) => {
    const { resultId } = req.params;
    const applicant = ApplicantsStore.getByResultId(resultId);

    if (!applicant) {
      res.status(404).json({
        success: false,
        message: 'Sertifikat / Dokumen hasil seleksi tidak terdaftar dalam pangkalan data resmi BEM RDM FHUB.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        verified: true,
        result_id: applicant.result_id,
        name: applicant.name,
        nim: applicant.nim,
        status: applicant.status,
        division: applicant.division,
        selection_title: 'Seleksi Staff Muda BEM RDM FHUB',
        cabinet: 'Kabinet Resonansi Kita',
        announcement_date: applicant.announcement_date,
        institution: 'BEM RDM Fakultas Hukum Universitas Brawijaya',
      },
    });
  });

  // 3. Admin Authentication Middleware
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || (!authHeader.includes('admin-token-bem-2026') && !authHeader.includes('Bearer'))) {
      res.status(401).json({ success: false, message: 'Akses ditolak. Sesi admin tidak valid.' });
      return;
    }
    next();
  };

  // 4. Admin Login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    const validPasswords = ['admin', 'admin123', 'admin_bem', 'resonansikita2026'];

    if (validPasswords.includes(password)) {
      res.json({
        success: true,
        token: 'admin-token-bem-2026',
        user: { role: 'admin', name: 'BPH BEM RDM FHUB' },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Kredensial admin tidak valid. Silakan coba kembali.',
      });
    }
  });

  // 5. Admin - Get All Applicants with Stats
  app.get('/api/admin/applicants', requireAdmin, (_req: Request, res: Response) => {
    const list = ApplicantsStore.getAll();
    const passed = list.filter((a) => a.status === 'PASSED').length;
    const failed = list.filter((a) => a.status === 'FAILED').length;

    res.json({
      success: true,
      data: {
        total: list.length,
        passed,
        failed,
        applicants: list,
      },
    });
  });

  // 6. Admin - Add Applicant
  app.post('/api/admin/applicants', requireAdmin, (req: Request, res: Response) => {
    try {
      const { nim, name, division, status, selection_stage, announcement_date } = req.body;
      if (!nim || !name || !division || !status) {
        res.status(400).json({ success: false, message: 'NIM, Nama, Kementerian, dan Status wajib diisi.' });
        return;
      }

      const record = ApplicantsStore.add({
        nim,
        name,
        division,
        status: status === 'PASSED' ? 'PASSED' : status === 'PENDING' ? 'PENDING' : 'FAILED',
        selection_stage,
        announcement_date,
      });

      res.status(201).json({ success: true, data: record });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Gagal menambahkan peserta.' });
    }
  });

  // 7. Admin - Update Applicant
  app.put('/api/admin/applicants/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nim, name, division, status, selection_stage } = req.body;

      const updateFields: any = {};
      if (nim !== undefined) updateFields.nim = nim;
      if (name !== undefined) updateFields.name = name;
      if (division !== undefined) updateFields.division = division;
      if (status !== undefined) updateFields.status = status;
      if (selection_stage !== undefined) updateFields.selection_stage = selection_stage;

      const updated = ApplicantsStore.update(id, updateFields);

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Gagal memperbarui peserta.' });
    }
  });

  // 8. Admin - Delete Applicant
  app.delete('/api/admin/applicants/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = ApplicantsStore.delete(id);

    if (deleted) {
      res.json({ success: true, message: 'Data peserta berhasil dihapus.' });
    } else {
      res.status(404).json({ success: false, message: 'Peserta tidak ditemukan.' });
    }
  });

  // 9. Admin - Import CSV
  app.post('/api/admin/import-csv', requireAdmin, (req: Request, res: Response) => {
    try {
      const { rows } = req.body;
      if (!Array.isArray(rows)) {
        res.status(400).json({ success: false, message: 'Format data CSV tidak valid.' });
        return;
      }

      const result = ApplicantsStore.importCsv(rows);
      res.json({
        success: true,
        data: result,
        message: `Impor selesai: ${result.inserted} baru, ${result.updated} diperbarui.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Gagal memproses CSV.' });
    }
  });

  // Frontend Serving
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[BEM RDM FHUB] Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
