# 🏆 Sistem Penilaian Demo Day LAN Datathon 2026

Aplikasi web sistem penilaian terintegrasi untuk **"Demo Day LAN Datathon 2026"** yang siap langsung di-deploy ke **Vercel** menggunakan **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Jose JWT**, dan **Supabase PostgreSQL** (dengan Prisma ORM & konfigurasi Serverless Connection Pooler).

---

## 📋 Fitur Utama

### 1. Peran & Akses Pengguna (Role-Based Access)
- **DEWAN JURI (`/judge`)**:
  - Pilihan cepat akun (Juri 1, Juri 2, Juri 3, Juri 4).
  - Tampilan responsif optimal untuk Tablet / Layar Mobile & Laptop.
  - Pemilih tim dengan badge visual indikator (*Sudah Dinilai* / *Belum*).
  - Input penilaian ganda tersinkronisasi: **Slider Interaktif** & **Input Angka (0-100)**.
  - **Live Preview Nilai Terbobot**: Total nilai langsung terkalkulasi seketika saat slider digeser.
  - Kolom **Komentar / Catatan Kualitatif** juri untuk setiap tim.
  - Penyimpanan instan via Server Action dengan Toast Notification (`sonner`). Juri tetap dapat mengedit nilai sebelum sesi dikunci.
- **ADMINISTRATOR PANITIA (`/admin`)**:
  - **Live Leaderboard Matrix**: Tabel matriks nilai terbobot ke-4 dewan juri, nilai rata-rata akhir, dan ranking otomatis.
  - **Auto-Polling Real-time**: Didukung oleh SWR (auto-refresh tiap 3-5 detik) tanpa perlu reload halaman manual.
  - **Modal Rincian & Komentar**: Klik baris tim untuk melihat breakdown detail nilai 5 kriteria dan saran tertulis dari setiap juri.
  - **Ekspor Excel (.xlsx)**: Unduh lembar rekapitulasi nilai dengan format dan struktur tabel resmi persis sesuai instrumen Excel LAN Datathon 2026 (termasuk multi-sheet: *Rekap Penilaian* & *Rincian Aspek & Komentar*).

---

## 📊 Spesifikasi Data Master & Formula Penilaian

### 1. 5 Aspek Penilaian & Bobot Resmi
| No | Aspek Penilaian | Bobot | Deskripsi Singkat |
|:--:|:---|:---:|:---|
| 1 | **Relevansi** | **10%** (0.10) | Kesesuaian solusi dengan kebutuhan strategis LAN RI |
| 2 | **Inovasi dan Orisinalitas** | **25%** (0.25) | Kebaruan konsep, ide kreatif, dan diferensiasi solusi |
| 3 | **Penerapan Teknologi & Fungsionalitas** | **25%** (0.25) | Kualitas teknis arsitektur dan keandalan demo prototype |
| 4 | **Dampak, Keberlanjutan & Replikasi** | **30%** (0.30) | Nilai guna nyata, kemudahan adopsi, dan skalabilitas |
| 5 | **Presentasi dan Keterpaduan Tim** | **10%** (0.10) | Artikulasi penyampaian, penguasaan materi, dan kekompakan tim |

$$\text{Nilai Terbobot Juri} = (\text{Skor}_1 \times 0.10) + (\text{Skor}_2 \times 0.25) + (\text{Skor}_3 \times 0.25) + (\text{Skor}_4 \times 0.30) + (\text{Skor}_5 \times 0.10)$$

$$\text{Nilai Akhir Peserta} = \frac{\text{Total Nilai Terbobot Juri 1} + \dots + \text{Juri 4}}{4}$$

### 2. Tim Peserta Default
1. **Simpul Desa** (Adek Muhammad Zulkham)
2. **Brantas**
3. **Sparta**
4. **Tim Cendekia**
5. **Tim Tangga**

---

## 🛠️ Panduan Menjalankan Secara Lokal

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Salin template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi variabel pada `.env`:
```env
# Supabase Transaction Pooler (Port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase Session / Direct Connection (Port 5432)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# JWT Secret untuk sesi stateless
JWT_SECRET="lan-datathon-2026-secret-session-key-secure-jwt-lan-ri"
```

> **Catatan:** Aplikasi telah dilengkapi dengan mekanisme *memory store fallback*. Anda dapat langsung menguji dan mendemokan aplikasi secara lokal bahkan sebelum database Supabase dihubungkan!

### 3. Migrasi Database & Seeding (Opsional jika menggunakan Supabase)
```bash
# Push skema ke database PostgreSQL Supabase
npm run db:push

# Injeksi data master kriteria, tim, dan akun juri default
npm run db:seed
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🚀 Panduan Deployment ke Vercel

1. **Push Repository ke GitHub / GitLab**:
   ```bash
   git add .
   git commit -m "feat: complete LAN Datathon 2026 scoring platform"
   git push origin main
   ```

2. **Import Project di Vercel**:
   - Buka dashboard [Vercel](https://vercel.com) & pilih **Add New Project**.
   - Pilih repository project ini.

3. **Konfigurasi Environment Variables di Vercel**:
   Masukkan variabel environment berikut pada menu **Settings > Environment Variables**:
   - `DATABASE_URL`: Connection string Supabase Pooler (Port 6543 dengan pgbouncer=true).
   - `DIRECT_URL`: Connection string Supabase Direct (Port 5432).
   - `JWT_SECRET`: Random string minimal 32 karakter untuk pengamanan cookie.

4. **Deploy**:
   - Vercel akan otomatis menjalankan skrip `"postinstall": "prisma generate"` dan mem-build project Next.js.
   - Selesai! Web application siap digunakan saat sesi penjurian live.

---

## 👥 Akun Akses Default (Quick Login)

Pada halaman `/login`, panitia dan juri dapat mengklik tombol instan:
- **Juri 1**: `juri1` (Role: `judge`)
- **Juri 2**: `juri2` (Role: `judge`)
- **Juri 3**: `juri3` (Role: `judge`)
- **Juri 4**: `juri4` (Role: `judge`)
- **Admin**: `admin` (Role: `admin`)
