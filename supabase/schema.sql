-- ==============================================================================
-- SELEKSI STAFF MUDA BEM RDM FHUB - SUPABASE POSTGRESQL SCHEMA
-- Single Source of Truth for participant selection results
-- ==============================================================================

-- 1. Enable pgcrypto / uuid extension for automatic UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the 'participants' table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nim TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  ministry TEXT,
  status TEXT NOT NULL CHECK (status IN ('PASSED', 'FAILED', 'PENDING')),
  announcement_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.update_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_participants_updated_at ON public.participants;
CREATE TRIGGER trigger_participants_updated_at
BEFORE UPDATE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.update_participants_updated_at();

-- 4. Create Indexes for High Performance Search
CREATE INDEX IF NOT EXISTS idx_participants_nim ON public.participants(nim);
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.participants(status);

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users (public and admin) to search by NIM and read participants
DROP POLICY IF EXISTS "Allow public read access to participants" ON public.participants;
CREATE POLICY "Allow public read access to participants"
ON public.participants
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Allow inserts (via application client)
DROP POLICY IF EXISTS "Allow insert to participants" ON public.participants;
CREATE POLICY "Allow insert to participants"
ON public.participants
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Allow updates (via application client)
DROP POLICY IF EXISTS "Allow update to participants" ON public.participants;
CREATE POLICY "Allow update to participants"
ON public.participants
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow deletes (via application client)
DROP POLICY IF EXISTS "Allow delete to participants" ON public.participants;
CREATE POLICY "Allow delete to participants"
ON public.participants
FOR DELETE
TO anon, authenticated
USING (true);

-- ==============================================================================
-- 6. INITIAL DATA MIGRATION (Idempotent: Only inserts if NIM does not yet exist)
-- ==============================================================================
INSERT INTO public.participants (nim, name, ministry, status, announcement_date)
VALUES
  ('225150100111001', 'Arya Danendra Prasetyo', 'Kajian dan Aksi Strategis', 'PASSED', '2026-09-24'),
  ('225150100111002', 'Clarissa Amanda Putri', 'Pengembangan Sumber Daya Mahasiswa', 'FAILED', '2026-09-24'),
  ('225150100111003', 'Dimas Raditya Taufik', 'Advokasi dan Kesejahteraan Mahasiswa', 'PASSED', '2026-09-24'),
  ('225150100111004', 'Nadine Althea Saraswati', 'Hubungan Eksternal & Diplomasi Kampus', 'PASSED', '2026-09-24'),
  ('225150100111005', 'Muhammad Fikri Pratama', 'Media, Komunikasi & Informasi', 'PASSED', '2026-09-24'),
  ('225150100111006', 'Salsabila Azzahra', 'Kewirausahaan & Ekonomi Kreatif', 'FAILED', '2026-09-24'),
  ('225150100111007', 'Bintang Rayhan Syahputra', 'Riset dan Keilmuan Hukum', 'PASSED', '2026-09-24'),
  ('225150100111008', 'Felicia Evelyn Wijaya', 'Seni, Olahraga & Apresiasi Mahasiswa', 'FAILED', '2026-09-24'),
  ('225150100111009', 'Zaky Anwar Hidayat', 'Kajian dan Aksi Strategis', 'PASSED', '2026-09-24'),
  ('225150100111010', 'Tiara Kusuma Wardani', 'Pengembangan Sumber Daya Mahasiswa', 'PASSED', '2026-09-24'),
  ('235010100111012', 'Arya Danendra Prasetyo', 'Kajian dan Aksi Strategis', 'PASSED', '2026-09-24'),
  ('245010100111034', 'Clarissa Amanda Putri', 'Advokasi dan Kesejahteraan Mahasiswa', 'FAILED', '2026-09-24'),
  ('245010101111065', 'Dimas Raditya Taufik', 'Pengembangan Sumber Daya Mahasiswa', 'PASSED', '2026-09-24')
ON CONFLICT (nim) DO NOTHING;
