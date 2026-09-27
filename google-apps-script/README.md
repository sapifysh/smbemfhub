# Panduan Integrasi Google Sheets & Google Apps Script API
## Seleksi Staff Muda BEM RDM FHUB — Kabinet Resonansi Kita

Dokumen ini menjelaskan arsitektur dan langkah-langkah implementasi Google Sheets sebagai **Single Source of Truth** untuk pangkalan data peserta Seleksi Staff Muda BEM RDM FHUB, dihubungkan melalui Google Apps Script Web App API ke aplikasi web.

---

## 1. Arsitektur Sistem

```
Google Sheets (Database: Tab "Participants")
      ↓
Google Apps Script (Web App Endpoint: doGet & doPost)
      ↓
REST-like JSON API (CORS-ready, Minimal Public Leakage, Secure Admin Token)
      ↓
Website Seleksi Staff Muda BEM RDM FHUB (Frontend React & Node.js Proxy)
```

- **Keamanan Data**: Google Sheet **tidak dibuka untuk publik**. Frontend tidak pernah mengakses Google Sheet secara langsung ataupun menyimpan Spreadsheet ID di dalam bundle client.
- **Pencarian Publik**: Publik hanya dapat melakukan pencarian berdasarkan **NIM eksak** (`?action=getParticipant&nim=...`). Publik tidak dapat melihat daftar peserta keseluruhan maupun memodifikasi data.
- **Operasi Admin**: Pengambilan daftar peserta, penambahan, pengubahan, penghapusan, dan impor CSV dilindungi dengan otentikasi token admin (`ADMIN_TOKEN`).

---

## 2. Struktur Kolom Google Sheets

Spreadsheet wajib memiliki sheet (lembar kerja) bernama:
`Participants`

Gunakan kolom-kolom berikut dengan urutan **persis dari kolom A hingga G**:

| Kolom | Nama Kolom | Tipe | Contoh Nilai | Keterangan |
|---|---|---|---|---|
| **A** | `nim` | Teks / Angka | `225150100111001` | Nomor Induk Mahasiswa (Unik) |
| **B** | `name` | Teks | `Arya Danendra Prasetyo` | Nama Lengkap Peserta |
| **C** | `ministry` | Teks | `Kajian dan Aksi Strategis` | Salah satu dari 12 Kementerian Resmi |
| **D** | `status` | Teks | `PASSED` | `PASSED`, `FAILED`, atau `PENDING` |
| **E** | `announcement_date` | Teks / Tanggal | `2026-09-24` | Tanggal Pengumuman |
| **F** | `created_at` | Teks / ISO Date | `2026-09-24T00:00:00.000Z` | Waktu Pendaftaran Dibuat |
| **G** | `updated_at` | Teks / ISO Date | `2026-09-24T12:00:00.000Z` | Waktu Terakhir Diperbarui |

### Nilai Status yang Diizinkan:
- `PASSED` : Dinyatakan Lulus
- `FAILED` : Belum Lulus
- `PENDING` : Menunggu Pengumuman

### Daftar 12 Kementerian Resmi:
1. `Satuan Pengendali Internal`
2. `Deputi Hukum Kepresidenan`
3. `Kajian dan Aksi Strategis`
4. `Pemberdayaan dan Perlindungan Perempuan`
5. `Pengembangan dan Sumber Daya Manusia`
6. `Kebudayaan Pemuda dan Olahraga`
7. `Ekonomi Kreatif`
8. `Sosial dan Linkungan` *(wajib ejaan ini)*
9. `Pendidikan`
10. `Advokasi dan Kesejahteraan Mahasiswa`
11. `Dalam dan Luar Negeri`
12. `Komunikasi, Media dan Informasi`

---

## 3. Langkah-Langkah Setup Google Apps Script

### Langkah 1: Buat Google Spreadsheet
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet, misalnya: `BEM RDM FHUB - Database Staff Muda 2026`.
3. Ganti nama tab sheet pertama menjadi: `Participants`.
4. Isi baris 1 (header) kolom A–G sesuai tabel di atas.
5. Anda dapat mengisikan beberapa baris data peserta contoh untuk uji coba.

### Langkah 2: Buat Proyek Apps Script
1. Di Google Sheets tersebut, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2. Beri judul proyek di pojok kiri atas, misalnya: `BEM-RDM-FHUB-API`.
3. Hapus seluruh isi default pada editor file `Code.gs`.
4. Buka file `google-apps-script/Code.gs` dari repositori ini, salin seluruh kodenya, lalu tempelkan ke editor Apps Script.

### Langkah 3: Konfigurasi Properti Skrip (Opsional tetapi Dianjurkan)
1. Di menu sebelah kiri editor Apps Script, klik **Project Settings** (ikon roda gigi ⚙️).
2. Gulir ke bawah ke bagian **Script Properties (Properti Skrip)**.
3. Klik **Add script property**:
   - `SPREADSHEET_ID`: Masukkan ID spreadsheet Anda (didapat dari URL spreadsheet di antara `/d/` dan `/edit`). *Catatan: Jika skrip dibuat langsung melalui Extensions > Apps Script pada sheet terkait, skrip otomatis mengenali sheet aktif tanpa perlu mengisi properti ini.*
   - `ADMIN_TOKEN`: Masukkan token admin Anda (default: `admin-token-bem-2026`).

### Langkah 4: Deploy sebagai Web App
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy** > **New deployment**.
2. Klik ikon gerigi di samping *Select type*, lalu pilih **Web app**.
3. Atur konfigurasi berikut:
   - **Description**: `BEM RDM FHUB Seleksi API v1`
   - **Execute as**: `Me (email-anda@gmail.com)`
   - **Who has access**: `Anyone` *(PENTING: Pilih "Anyone" agar web app seleksi dapat memanggil API pencarian NIM tanpa mewajibkan pengunjung publik login ke akun Google).*
4. Klik tombol **Deploy**.
5. Google akan meminta izin otorisasi (*Authorization Required*):
   - Klik **Authorize access**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik **Advanced (Lanjutan)** > **Go to BEM-RDM-FHUB-API (unsafe)**.
   - Klik **Allow (Izinkan)**.

### Langkah 5: Salin URL Deployment Web App
1. Setelah deployment berhasil, salin nilai **Web app URL** yang muncul.
   Contoh format URL:
   `https://script.google.com/macros/s/AKfycbwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec`
2. Simpan URL ini untuk dimasukkan ke variabel lingkungan website.

---

## 4. Konfigurasi Variabel Lingkungan Website

Buka file `.env` di direktori utama website Anda (atau duplikasi dari `.env.example`), lalu masukkan URL Web App:

```env
# URL Google Apps Script Web App Endpoint
VITE_GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec"

# Token Admin untuk Operasi CRUD
VITE_ADMIN_TOKEN="admin-token-bem-2026"
```

Simpan file, lalu mulai ulang server development jika sedang berjalan:
```bash
npm run dev
```

---

## 5. Dokumentasi Endpoint API

Semua respons menggunakan format standar JSON:

### 1. Pencarian Peserta Publik (Single NIM)
- **Metode**: `GET` atau `POST`
- **URL**: `https://script.google.com/macros/s/.../exec?action=getParticipant&nim=225150100111001`
- **Respons Berhasil (200 OK)**:
```json
{
  "success": true,
  "data": {
    "nim": "225150100111001",
    "name": "Arya Danendra Prasetyo",
    "ministry": "Kajian dan Aksi Strategis",
    "status": "PASSED",
    "announcement_date": "2026-09-24"
  }
}
```
- **Respons Jika Tidak Ditemukan**:
```json
{
  "success": false,
  "error": "PARTICIPANT_NOT_FOUND",
  "message": "Data peserta tidak ditemukan. Pastikan NIM yang dimasukkan sudah benar."
}
```

### 2. Pengambilan Semua Peserta (Admin Only)
- **Metode**: `GET` atau `POST`
- **URL**: `https://script.google.com/macros/s/.../exec?action=listParticipants&token=admin-token-bem-2026`
- **Respons Berhasil**:
```json
{
  "success": true,
  "data": {
    "total": 45,
    "passed": 28,
    "failed": 15,
    "pending": 2,
    "percentage": 62,
    "participants": [
      {
        "id": "p-225150100111001",
        "nim": "225150100111001",
        "name": "Arya Danendra Prasetyo",
        "division": "Kajian dan Aksi Strategis",
        "ministry": "Kajian dan Aksi Strategis",
        "status": "PASSED",
        "announcement_date": "2026-09-24",
        "created_at": "2026-09-24T00:00:00.000Z",
        "updated_at": "2026-09-24T12:00:00.000Z"
      }
    ]
  }
}
```

### 3. Tambah Peserta (Admin Only)
- **Metode**: `POST`
- **Payload**:
```json
{
  "action": "createParticipant",
  "token": "admin-token-bem-2026",
  "nim": "225150100111099",
  "name": "Siti Nurhaliza",
  "ministry": "Ekonomi Kreatif",
  "status": "PASSED",
  "announcement_date": "2026-09-24"
}
```

### 4. Ubah Peserta (Admin Only)
- **Metode**: `POST`
- **Payload**:
```json
{
  "action": "updateParticipant",
  "token": "admin-token-bem-2026",
  "nim": "225150100111099",
  "name": "Siti Nurhaliza Putri",
  "ministry": "Ekonomi Kreatif",
  "status": "PASSED"
}
```

### 5. Hapus Peserta (Admin Only)
- **Metode**: `POST`
- **Payload**:
```json
{
  "action": "deleteParticipant",
  "token": "admin-token-bem-2026",
  "nim": "225150100111099"
}
```

### 6. Impor Massal / CSV (Admin Only)
- **Metode**: `POST`
- **Payload**:
```json
{
  "action": "importParticipants",
  "token": "admin-token-bem-2026",
  "rows": [
    { "nim": "225150100111011", "name": "Budi Santoso", "ministry": "Pendidikan", "status": "PASSED" },
    { "nim": "225150100111012", "name": "Citra Lestari", "ministry": "Sosial dan Linkungan", "status": "FAILED" }
  ]
}
```

---

## 6. Uji Coba Alur Verifikasi

1. **Uji 1 (Tambah Peserta di Sheet)**: Tambahkan baris langsung di tab Google Sheet `Participants`. Buka website dan cari NIM tersebut. Hasil seleksi langsung muncul.
2. **Uji 2 (Perubahan Status Real-Time)**: Ubah status dari `FAILED` ke `PASSED` di Google Sheet. Cari kembali di website. Tampilan langsung berubah menjadi LULUS tanpa delay build/cache.
3. **Uji 3 (Pencarian NIM Salah)**: Masukkan NIM sembarang. Sistem menampilkan status tidak ditemukan yang sopan.
4. **Uji 4 (Admin Panel)**: Buka `/admin` di website, login dengan kata sandi admin. Coba tambahkan peserta, ubah data kementerian, dan hapus peserta. Perubahan langsung terrefleksi di baris Google Sheet.
5. **Uji 5 (Duplikasi NIM)**: Coba tambahkan peserta dengan NIM yang sudah ada. Apps Script menolak pembuatan dengan kode error `DUPLICATE_NIM`.
