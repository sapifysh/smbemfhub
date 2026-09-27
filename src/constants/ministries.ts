// Official list of Ministries / Divisions for BEM RDM FHUB - Kabinet Resonansi Kita
export const MINISTRIES = [
  'Satuan Pengendali Internal',
  'Deputi Hukum Kepresidenan',
  'Kajian dan Aksi Strategis',
  'Pemberdayaan dan Perlindungan Perempuan',
  'Pengembangan dan Sumber Daya Manusia',
  'Kebudayaan Pemuda dan Olahraga',
  'Ekonomi Kreatif',
  'Sosial dan Linkungan',
  'Pendidikan',
  'Advokasi dan Kesejahteraan Mahasiswa',
  'Dalam dan Luar Negeri',
  'Komunikasi, Media dan Informasi',
] as const;

export type Ministry = (typeof MINISTRIES)[number];

// Alias for components or functions referencing DIVISIONS
export const DIVISIONS = MINISTRIES;

export const isValidMinistry = (ministry: string): boolean => {
  return (MINISTRIES as readonly string[]).includes(ministry);
};
