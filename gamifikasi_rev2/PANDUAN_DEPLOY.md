# 🚀 PANDUAN DEPLOY EDUQUEST KE INTERNET (GLOBAL)
## Tugas Besar PBO – Kelompok WartegDepanMSU

Estimasi waktu: **15–20 menit**  
Biaya: **GRATIS** (Supabase Free + Vercel Free)

---

## GAMBARAN BESAR

```
[Browser HP/Laptop mana saja]
       ↓
   [Vercel] ← hosting web gratis, domain otomatis
       ↓
 [Next.js App] ← kode web ini
       ↓
  [Supabase] ← database PostgreSQL + login Google gratis
```

---

## LANGKAH 1: Setup Supabase (Database + Auth)

### 1.1 Buat Akun Supabase
1. Buka **https://supabase.com**
2. Klik **Start your project** → Sign up dengan GitHub atau Email
3. Klik **New Project**
4. Isi:
   - **Name**: `eduquest-pbo` (bebas)
   - **Database Password**: buat password kuat, **SIMPAN** di tempat aman
   - **Region**: pilih `Southeast Asia (Singapore)` ← biar cepat dari Indonesia
5. Klik **Create new project** → tunggu ~2 menit

### 1.2 Jalankan SQL Schema
1. Di sidebar kiri Supabase → klik **SQL Editor**
2. Klik **New Query**
3. Buka file `supabase_schema.sql` dari folder ini
4. **Copy semua isinya** → Paste ke SQL Editor
5. Klik **Run** (tombol hijau) → tunggu selesai
6. Kamu akan melihat pesan sukses ✅

### 1.3 Aktifkan Login Google
1. Di sidebar → **Authentication** → **Providers**
2. Cari **Google** → klik untuk expand → aktifkan toggle
3. Kamu butuh **Google Client ID** dan **Client Secret** dari Google Console:

**Cara dapat Client ID Google:**
1. Buka https://console.cloud.google.com
2. Buat project baru (atau pakai yang ada)
3. Cari **"APIs & Services"** → **Credentials**
4. Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Pilih **Web application**
6. Di **Authorized redirect URIs**, tambahkan:
   ```
   https://XXXXXXXX.supabase.co/auth/v1/callback
   ```
   *(ganti XXXXXXXX dengan Project ID Supabase kamu — ada di Settings → API)*
7. Klik **Create** → copy **Client ID** dan **Client Secret**
8. Paste ke form Google di Supabase → **Save**

### 1.4 Ambil API Keys Supabase
1. Di sidebar Supabase → **Settings** → **API**
2. Catat dua nilai ini (kita butuh nanti):
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (panjang)

---

## LANGKAH 2: Upload Kode ke GitHub

### 2.1 Buat Akun GitHub (jika belum punya)
- Buka **https://github.com** → Sign up

### 2.2 Buat Repository Baru
1. Klik **+** (pojok kanan atas) → **New repository**
2. Nama: `eduquest-pbo`
3. Pilih **Private** (biar kode tidak publik)
4. Klik **Create repository**

### 2.3 Upload Kode
**Cara termudah — via GitHub web:**
1. Di halaman repository baru, klik **uploading an existing file**
2. Drag & drop semua file dari folder `gamifikasi` ini
3. Klik **Commit changes**

**Atau via terminal (jika punya Git):**
```bash
cd gamifikasi
git init
git add .
git commit -m "Initial EduQuest"
git remote add origin https://github.com/USERNAME/eduquest-pbo.git
git push -u origin main
```

---

## LANGKAH 3: Deploy ke Vercel (Hosting Gratis Global)

### 3.1 Buat Akun Vercel
1. Buka **https://vercel.com**
2. Klik **Sign Up** → pilih **Continue with GitHub**
3. Authorize Vercel

### 3.2 Deploy Project
1. Di dashboard Vercel → klik **Add New** → **Project**
2. Pilih repository `eduquest-pbo` → klik **Import**
3. Di **Environment Variables**, tambahkan:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key) |
4. Klik **Deploy** → tunggu ~2-3 menit

### 3.3 Dapatkan URL Kamu
Setelah deploy selesai, Vercel akan memberi URL seperti:
```
https://eduquest-pbo-username.vercel.app
```
**URL ini bisa diakses dari HP, laptop, atau perangkat apa pun di seluruh dunia! 🌍**

---

## LANGKAH 4: Update Google OAuth Redirect URL

Karena sekarang kamu punya URL Vercel, perlu update di Google Console:

1. Buka https://console.cloud.google.com → APIs & Services → Credentials
2. Klik OAuth client ID yang tadi dibuat
3. Di **Authorized redirect URIs**, tambahkan:
   ```
   https://xxxxxxxx.supabase.co/auth/v1/callback
   ```
   *(sudah ada dari tadi — pastikan masih ada)*
4. Juga tambahkan URL Vercel kamu (opsional untuk production custom domain)
5. **Save**

---

## LANGKAH 5: Set Admin (Opsional)

Untuk menjadi admin (bisa tambah materi & quiz):

1. Login ke web kamu dengan Google
2. Buka Supabase → **Table Editor** → tabel `profiles`
3. Cari baris dengan email kamu
4. Klik edit → ubah kolom `role` dari `PLAYER` menjadi `ADMIN`
5. Save

---

## ✅ SELESAI!

Web kamu sekarang aktif dan bisa diakses siapa saja di dunia.

**Fitur yang tersedia:**
- ✅ Login Google (bisa pilih akun mana saja)
- ✅ Dashboard dengan XP, Level, Streak
- ✅ Materi pembelajaran (3 materi sudah ada)
- ✅ Quiz interaktif dengan poin langsung
- ✅ Leaderboard global
- ✅ Profil dengan badge
- ✅ Responsive — bisa di HP dan laptop
- ✅ Admin panel untuk tambah materi/quiz

---

## TROUBLESHOOTING

**Problem: "Invalid redirect URL" saat login Google**
→ Pastikan URL callback Supabase sudah ditambahkan di Google Console (Langkah 1.3)

**Problem: Data tidak muncul**
→ Pastikan SQL schema sudah dijalankan di Supabase (Langkah 1.2)

**Problem: Environment variables tidak terbaca**
→ Di Vercel → Settings → Environment Variables → pastikan kedua key ada → redeploy

**Problem: Build error di Vercel**
→ Cek Vercel build logs, biasanya karena file yang kurang ter-upload

---

## INFORMASI TEKNIS (untuk laporan)

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Frontend | Next.js 14 (React) | Framework web modern |
| Styling | Tailwind CSS | CSS utility-first |
| Backend/DB | Supabase (PostgreSQL) | Database + Auth + API otomatis |
| Auth | Supabase + Google OAuth 2.0 | Login Google |
| Hosting | Vercel | CDN global, HTTPS otomatis |
| Bahasa | TypeScript | JavaScript yang type-safe |

**Stack ini digunakan oleh perusahaan seperti:**
Vercel (Next.js dibuat oleh Vercel), Supabase digunakan oleh ribuan startup global.

---

*Dibuat untuk Tugas Besar PBO – Kelompok WartegDepanMSU*  
*Anggota: Fauzan, Rizaqi, Dava, Gigih, Nurhanrafif, Alfiko*
