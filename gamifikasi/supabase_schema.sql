-- ============================================================
-- SCHEMA SUPABASE (PostgreSQL)
-- EduQuest - Aplikasi Pembelajaran Berbasis Gamifikasi
-- Tugas Besar PBO - Kelompok WartegDepanMSU
--
-- CARA PAKAI:
-- 1. Buka Supabase → SQL Editor → New Query
-- 2. Paste SEMUA isi file ini
-- 3. Klik Run
-- ============================================================

-- ============================================================
-- 1. PROFILES (extend tabel auth.users dari Supabase)
--    Menggabungkan User + Player + Admin menjadi satu tabel
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  email        TEXT,
  role         TEXT NOT NULL DEFAULT 'PLAYER' CHECK (role IN ('PLAYER', 'ADMIN')),
  xp           INT  NOT NULL DEFAULT 0,
  level        INT  NOT NULL DEFAULT 1,
  streak       INT  NOT NULL DEFAULT 0,
  last_active  DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: otomatis buat profil saat user baru login via Google
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'PLAYER'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. MATERI
-- ============================================================
CREATE TABLE IF NOT EXISTS materi (
  id_materi          SERIAL PRIMARY KEY,
  judul              VARCHAR(150) NOT NULL,
  deskripsi          TEXT         NOT NULL,
  tingkat_kesulitan  TEXT         NOT NULL DEFAULT 'MUDAH' CHECK (tingkat_kesulitan IN ('MUDAH', 'SEDANG', 'SULIT')),
  ringkasan          TEXT,
  dibuat_oleh        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. QUIZ & SOAL
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id_quiz     SERIAL PRIMARY KEY,
  id_materi   INT REFERENCES materi(id_materi) ON DELETE SET NULL,
  judul_quiz  VARCHAR(150) NOT NULL,
  xp          INT NOT NULL DEFAULT 0,
  dibuat_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS soal (
  id_soal    SERIAL PRIMARY KEY,
  id_quiz    INT  NOT NULL REFERENCES quizzes(id_quiz) ON DELETE CASCADE,
  teks_soal  TEXT NOT NULL,
  urutan     INT  NOT NULL DEFAULT 1,
  poin       INT  NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS pilihan_jawaban (
  id_pilihan   SERIAL PRIMARY KEY,
  id_soal      INT     NOT NULL REFERENCES soal(id_soal) ON DELETE CASCADE,
  label        VARCHAR(5) NOT NULL,
  teks_pilihan TEXT    NOT NULL,
  is_benar     BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (id_soal, label)
);

-- ============================================================
-- 4. GAME SESSION & SCORE
-- ============================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id_session       SERIAL PRIMARY KEY,
  player_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id          INT  NOT NULL REFERENCES quizzes(id_quiz) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'BERJALAN' CHECK (status IN ('BERJALAN', 'SELESAI')),
  waktu_mulai      TIMESTAMPTZ DEFAULT NOW(),
  waktu_selesai    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS jawaban_player (
  id_jawaban      SERIAL PRIMARY KEY,
  session_id      INT     NOT NULL REFERENCES game_sessions(id_session) ON DELETE CASCADE,
  soal_id         INT     NOT NULL REFERENCES soal(id_soal) ON DELETE CASCADE,
  pilihan_id      INT     NOT NULL REFERENCES pilihan_jawaban(id_pilihan) ON DELETE CASCADE,
  jawaban_user    VARCHAR(5) NOT NULL,
  is_benar        BOOLEAN NOT NULL DEFAULT FALSE,
  poin_diperoleh  INT     NOT NULL DEFAULT 0,
  answered_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, soal_id)
);

CREATE TABLE IF NOT EXISTS scores (
  id_score    SERIAL PRIMARY KEY,
  session_id  INT  NOT NULL UNIQUE REFERENCES game_sessions(id_session) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nilai_score INT  NOT NULL DEFAULT 0,
  total_xp    INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. BADGE & REWARD
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
  id_badge     SERIAL PRIMARY KEY,
  nama_badge   VARCHAR(100) NOT NULL UNIQUE,
  deskripsi    TEXT         NOT NULL,
  syarat_xp    INT          NOT NULL DEFAULT 0,
  syarat_level INT          NOT NULL DEFAULT 1,
  icon         TEXT         DEFAULT '🏅'
);

CREATE TABLE IF NOT EXISTS player_badges (
  id              SERIAL PRIMARY KEY,
  player_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id        INT  NOT NULL REFERENCES badges(id_badge) ON DELETE CASCADE,
  tanggal_diperoleh TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (player_id, badge_id)
);

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS) - wajib di Supabase
-- ============================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE soal           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilihan_jawaban ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE jawaban_player ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_badges  ENABLE ROW LEVEL SECURITY;

-- Profiles: semua bisa baca, hanya diri sendiri yang bisa update
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Materi & Quiz: semua user yang login bisa baca
CREATE POLICY "materi_select"     ON materi     FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "quizzes_select"    ON quizzes    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "soal_select"       ON soal       FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "pilihan_select"    ON pilihan_jawaban FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "badges_select"     ON badges     FOR SELECT USING (auth.role() = 'authenticated');

-- Materi & Quiz: hanya admin yang bisa insert/update
CREATE POLICY "materi_admin_write" ON materi FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "quizzes_admin_write" ON quizzes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "soal_admin_write" ON soal FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "pilihan_admin_write" ON pilihan_jawaban FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Game session: player hanya bisa akses milik sendiri
CREATE POLICY "session_own"   ON game_sessions  FOR ALL USING (auth.uid() = player_id);
CREATE POLICY "jawaban_own"   ON jawaban_player FOR ALL USING (
  EXISTS (SELECT 1 FROM game_sessions gs WHERE gs.id_session = session_id AND gs.player_id = auth.uid())
);
CREATE POLICY "scores_select" ON scores FOR SELECT USING (true);
CREATE POLICY "scores_insert" ON scores FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "player_badges_select" ON player_badges FOR SELECT USING (true);
CREATE POLICY "player_badges_insert" ON player_badges FOR INSERT WITH CHECK (auth.uid() = player_id);

-- ============================================================
-- 7. SEED DATA - Konten awal
-- ============================================================
INSERT INTO materi (judul, deskripsi, tingkat_kesulitan, ringkasan) VALUES
('Dasar Pemrograman Java', 
 'Materi ini membahas konsep dasar Java: variabel, tipe data, class, object, dan method. Cocok untuk pemula yang ingin memulai belajar pemrograman berbasis objek.', 
 'MUDAH', 
 'Pengenalan dasar bahasa pemrograman Java dan konsep OOP.'),
('Object-Oriented Programming', 
 'Materi ini membahas inheritance, abstract class, interface, polymorphism, dan encapsulation — pilar utama OOP yang digunakan dalam pengembangan perangkat lunak modern.', 
 'SEDANG', 
 'Konsep utama OOP untuk membangun aplikasi berbasis object.'),
('Design Patterns & OOP Lanjut', 
 'Membahas pola desain umum seperti Singleton, Factory, Observer, dan Strategy yang memanfaatkan konsep OOP secara mendalam.', 
 'SULIT', 
 'Pattern desain untuk arsitektur software yang scalable.')
ON CONFLICT DO NOTHING;

INSERT INTO quizzes (id_materi, judul_quiz, xp) VALUES
(1, 'Quiz Dasar Java', 100),
(2, 'Quiz Konsep OOP', 100)
ON CONFLICT DO NOTHING;

-- Soal Quiz 1: Dasar Java
INSERT INTO soal (id_quiz, teks_soal, urutan, poin) VALUES
(1, 'Apa fungsi utama method main() pada Java?', 1, 20),
(1, 'Tipe data apa yang digunakan untuk menyimpan bilangan bulat di Java?', 2, 20),
(1, 'Keyword apa yang digunakan untuk membuat object baru di Java?', 3, 20),
(1, 'Apa output dari: System.out.println(10 / 3) di Java?', 4, 20),
(1, 'Manakah yang merupakan contoh class di Java?', 5, 20)
ON CONFLICT DO NOTHING;

-- Pilihan untuk soal 1
INSERT INTO pilihan_jawaban (id_soal, label, teks_pilihan, is_benar) VALUES
(1, 'A', 'Sebagai titik awal eksekusi program', TRUE),
(1, 'B', 'Untuk menghapus class dari memori', FALSE),
(1, 'C', 'Untuk membuat koneksi database', FALSE),
(1, 'D', 'Untuk mengubah file gambar menjadi teks', FALSE),

(2, 'A', 'String', FALSE),
(2, 'B', 'int', TRUE),
(2, 'C', 'boolean', FALSE),
(2, 'D', 'char', FALSE),

(3, 'A', 'class', FALSE),
(3, 'B', 'void', FALSE),
(3, 'C', 'new', TRUE),
(3, 'D', 'return', FALSE),

(4, 'A', '3.33', FALSE),
(4, 'B', '3', TRUE),
(4, 'C', '3.0', FALSE),
(4, 'D', 'Error', FALSE),

(5, 'A', 'int x = 5;', FALSE),
(5, 'B', 'public class Mahasiswa {}', TRUE),
(5, 'C', 'void main()', FALSE),
(5, 'D', 'import java.util.*;', FALSE)
ON CONFLICT DO NOTHING;

-- Soal Quiz 2: OOP
INSERT INTO soal (id_quiz, teks_soal, urutan, poin) VALUES
(2, 'Konsep OOP yang memungkinkan class mewarisi atribut dan method disebut?', 1, 25),
(2, 'Class yang tidak dapat diinstansiasi secara langsung disebut?', 2, 25),
(2, 'Interface digunakan untuk mendefinisikan apa?', 3, 25),
(2, 'Keyword apa yang digunakan untuk mewarisi class di Java?', 4, 25)
ON CONFLICT DO NOTHING;

INSERT INTO pilihan_jawaban (id_soal, label, teks_pilihan, is_benar) VALUES
(6, 'A', 'Encapsulation', FALSE),
(6, 'B', 'Inheritance', TRUE),
(6, 'C', 'Abstraction', FALSE),
(6, 'D', 'Overloading', FALSE),

(7, 'A', 'Final class', FALSE),
(7, 'B', 'Abstract class', TRUE),
(7, 'C', 'Static class', FALSE),
(7, 'D', 'Public class', FALSE),

(8, 'A', 'Kontrak method yang harus diimplementasikan class', TRUE),
(8, 'B', 'Tempat menyimpan password user', FALSE),
(8, 'C', 'Tabel database utama', FALSE),
(8, 'D', 'File konfigurasi server', FALSE),

(9, 'A', 'implements', FALSE),
(9, 'B', 'interface', FALSE),
(9, 'C', 'extends', TRUE),
(9, 'D', 'inherits', FALSE)
ON CONFLICT DO NOTHING;

-- Badge
INSERT INTO badges (nama_badge, deskripsi, syarat_xp, syarat_level, icon) VALUES
('Pemula Java',  'Badge untuk pemain yang mulai mempelajari Java.',         20,  1, '🌱'),
('Pejuang OOP',  'Badge untuk pemain yang memahami konsep dasar OOP.',     100,  2, '⚔️'),
('Master Quiz',  'Badge untuk pemain dengan XP tinggi.',                   300,  4, '🏆'),
('Streak 7 Hari','Badge untuk pemain yang belajar 7 hari berturut-turut.', 0,    1, '🔥')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SELESAI ✅
-- Jalankan di Supabase SQL Editor, lalu lanjut ke langkah deploy.
-- ============================================================
