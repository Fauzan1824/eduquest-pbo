'use server';

import { requireAdmin } from '@/lib/admin-guard';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface PilihanInput {
  label: string;
  teks_pilihan: string;
  is_benar: boolean;
}

interface SoalInput {
  teks_soal: string;
  poin: number;
  pilihan: PilihanInput[];
}

function parseSoalJson(raw: string): SoalInput[] {
  let soalList: SoalInput[] = [];
  try {
    soalList = JSON.parse(raw);
  } catch {
    throw new Error('Data soal tidak valid.');
  }
  if (!Array.isArray(soalList) || soalList.length === 0) {
    throw new Error('Tambahkan minimal 1 soal.');
  }
  for (const s of soalList) {
    if (!s.teks_soal?.trim()) throw new Error('Setiap soal harus memiliki teks pertanyaan.');
    const isi = (s.pilihan ?? []).filter(p => p.teks_pilihan?.trim());
    if (isi.length < 2) throw new Error(`Soal "${s.teks_soal}" minimal harus punya 2 pilihan jawaban.`);
    if (!isi.some(p => p.is_benar)) throw new Error(`Soal "${s.teks_soal}" belum memiliki jawaban yang benar.`);
  }
  return soalList;
}

export async function createQuiz(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const judul_quiz = String(formData.get('judul_quiz') ?? '').trim();
  const id_materi_raw = String(formData.get('id_materi') ?? '');
  const id_materi = id_materi_raw ? Number(id_materi_raw) : null;
  const xp = Number(formData.get('xp') ?? 0) || 0;
  const soalList = parseSoalJson(String(formData.get('soal_json') ?? '[]'));

  if (!judul_quiz) throw new Error('Judul quiz wajib diisi.');

  const { data: quiz, error: quizErr } = await supabase
    .from('quizzes')
    .insert({ judul_quiz, id_materi, xp, dibuat_oleh: user.id })
    .select()
    .single();
  if (quizErr || !quiz) throw new Error(quizErr?.message ?? 'Gagal membuat quiz.');

  await insertSoalForQuiz(supabase, quiz.id_quiz, soalList, 1);

  revalidatePath('/admin');
  revalidatePath('/admin/quiz');
  revalidatePath('/materi');
  redirect('/admin/quiz');
}

async function insertSoalForQuiz(supabase: any, idQuiz: number, soalList: SoalInput[], startUrutan: number) {
  for (let i = 0; i < soalList.length; i++) {
    const s = soalList[i];
    const { data: soal, error: soalErr } = await supabase
      .from('soal')
      .insert({ id_quiz: idQuiz, teks_soal: s.teks_soal.trim(), urutan: startUrutan + i, poin: s.poin || 10 })
      .select()
      .single();
    if (soalErr || !soal) throw new Error(soalErr?.message ?? 'Gagal menyimpan soal.');

    const pilihanRows = s.pilihan
      .filter(p => p.teks_pilihan?.trim())
      .map(p => ({
        id_soal: soal.id_soal,
        label: p.label,
        teks_pilihan: p.teks_pilihan.trim(),
        is_benar: p.is_benar,
      }));

    const { error: pilihanErr } = await supabase.from('pilihan_jawaban').insert(pilihanRows);
    if (pilihanErr) throw new Error(pilihanErr.message);
  }
}

export async function updateQuizInfo(idQuiz: number, formData: FormData) {
  const { supabase } = await requireAdmin();

  const judul_quiz = String(formData.get('judul_quiz') ?? '').trim();
  const id_materi_raw = String(formData.get('id_materi') ?? '');
  const id_materi = id_materi_raw ? Number(id_materi_raw) : null;
  const xp = Number(formData.get('xp') ?? 0) || 0;

  if (!judul_quiz) throw new Error('Judul quiz wajib diisi.');

  const { error } = await supabase
    .from('quizzes')
    .update({ judul_quiz, id_materi, xp })
    .eq('id_quiz', idQuiz);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/admin/quiz');
  revalidatePath(`/admin/quiz/${idQuiz}`);
  revalidatePath('/materi');
}

export async function deleteQuiz(formData: FormData) {
  const { supabase } = await requireAdmin();
  const idQuiz = Number(formData.get('id_quiz'));

  const { error } = await supabase.from('quizzes').delete().eq('id_quiz', idQuiz);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/admin/quiz');
  revalidatePath('/materi');
}

export async function addSoal(idQuiz: number, formData: FormData) {
  const { supabase } = await requireAdmin();

  const teks_soal = String(formData.get('teks_soal') ?? '').trim();
  const poin = Number(formData.get('poin') ?? 10) || 10;
  const pilihanRaw = String(formData.get('pilihan_json') ?? '[]');

  if (!teks_soal) throw new Error('Teks soal wajib diisi.');

  let pilihan: PilihanInput[] = [];
  try {
    pilihan = JSON.parse(pilihanRaw);
  } catch {
    throw new Error('Data pilihan jawaban tidak valid.');
  }
  const isi = pilihan.filter(p => p.teks_pilihan?.trim());
  if (isi.length < 2) throw new Error('Soal minimal harus punya 2 pilihan jawaban.');
  if (!isi.some(p => p.is_benar)) throw new Error('Tandai salah satu pilihan sebagai jawaban benar.');

  const { count } = await supabase
    .from('soal')
    .select('*', { count: 'exact', head: true })
    .eq('id_quiz', idQuiz);

  await insertSoalForQuiz(supabase, idQuiz, [{ teks_soal, poin, pilihan: isi }], (count ?? 0) + 1);

  revalidatePath(`/admin/quiz/${idQuiz}`);
}

export async function updateSoal(idSoal: number, idQuiz: number, formData: FormData) {
  const { supabase } = await requireAdmin();

  const teks_soal = String(formData.get('teks_soal') ?? '').trim();
  const poin = Number(formData.get('poin') ?? 10) || 10;
  const pilihanRaw = String(formData.get('pilihan_json') ?? '[]');

  if (!teks_soal) throw new Error('Teks soal wajib diisi.');

  let pilihan: PilihanInput[] = [];
  try {
    pilihan = JSON.parse(pilihanRaw);
  } catch {
    throw new Error('Data pilihan jawaban tidak valid.');
  }
  const isi = pilihan.filter(p => p.teks_pilihan?.trim());
  if (isi.length < 2) throw new Error('Soal minimal harus punya 2 pilihan jawaban.');
  if (!isi.some(p => p.is_benar)) throw new Error('Tandai salah satu pilihan sebagai jawaban benar.');

  const { error: soalErr } = await supabase
    .from('soal')
    .update({ teks_soal, poin })
    .eq('id_soal', idSoal);
  if (soalErr) throw new Error(soalErr.message);

  // Cara paling sederhana & aman: hapus semua pilihan lama, lalu insert ulang.
  const { error: delErr } = await supabase.from('pilihan_jawaban').delete().eq('id_soal', idSoal);
  if (delErr) throw new Error(delErr.message);

  const { error: insErr } = await supabase.from('pilihan_jawaban').insert(
    isi.map(p => ({
      id_soal: idSoal,
      label: p.label,
      teks_pilihan: p.teks_pilihan.trim(),
      is_benar: p.is_benar,
    }))
  );
  if (insErr) throw new Error(insErr.message);

  revalidatePath(`/admin/quiz/${idQuiz}`);
}

export async function deleteSoal(formData: FormData) {
  const { supabase } = await requireAdmin();
  const idSoal = Number(formData.get('id_soal'));
  const idQuiz = Number(formData.get('id_quiz'));

  const { error } = await supabase.from('soal').delete().eq('id_soal', idSoal);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/quiz/${idQuiz}`);
}
