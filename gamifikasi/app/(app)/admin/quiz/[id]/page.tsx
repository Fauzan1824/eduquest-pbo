import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuizInfoForm from '@/components/admin/QuizInfoForm';
import SoalCard from '@/components/admin/SoalCard';
import SoalBlock from '@/components/admin/SoalBlock';
import { updateQuizInfo, addSoal, updateSoal, deleteSoal } from '../actions';

export default async function EditQuizPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/dashboard');

  const idQuiz = Number(params.id);

  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id_quiz', idQuiz).single();
  if (!quiz) notFound();

  const { data: materiList } = await supabase.from('materi').select('id_materi, judul').order('judul');

  const { data: soalList } = await supabase
    .from('soal')
    .select('*, pilihan_jawaban(*)')
    .eq('id_quiz', idQuiz)
    .order('urutan');

  const updateQuizInfoBound = updateQuizInfo.bind(null, idQuiz);
  const addSoalBound = addSoal.bind(null, idQuiz);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/quiz" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Kelola Quiz
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">✏️ Edit Quiz</h1>
        <p className="text-slate-400 mt-1">Perbarui info quiz, ubah soal, atau tambah soal baru.</p>
      </div>

      <div className="space-y-6">
        <QuizInfoForm
          action={updateQuizInfoBound}
          materiList={materiList ?? []}
          initial={{ judul_quiz: quiz.judul_quiz, id_materi: quiz.id_materi, xp: quiz.xp }}
        />

        <div className="space-y-4">
          <h2 className="font-bold text-white">📝 Daftar Soal ({soalList?.length ?? 0})</h2>

          {soalList?.map((s: any, idx: number) => {
            const updateSoalBound = updateSoal.bind(null, s.id_soal, idQuiz);
            const sortedPilihan = [...(s.pilihan_jawaban ?? [])].sort((a: any, b: any) => a.label.localeCompare(b.label));
            return (
              <SoalCard
                key={s.id_soal}
                nomor={idx + 1}
                updateAction={updateSoalBound}
                deleteAction={deleteSoal}
                deleteHiddenFields={{ id_soal: s.id_soal, id_quiz: idQuiz }}
                initial={{
                  teks_soal: s.teks_soal,
                  poin: s.poin,
                  pilihan: sortedPilihan.map((p: any) => ({
                    label: p.label,
                    teks_pilihan: p.teks_pilihan,
                    is_benar: p.is_benar,
                  })),
                }}
              />
            );
          })}

          {(!soalList || soalList.length === 0) && (
            <div className="card text-center text-slate-400 py-8">
              Belum ada soal untuk quiz ini. Tambahkan soal pertama di bawah.
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <h2 className="font-bold text-white">➕ Tambah Soal Baru</h2>
          <SoalBlock action={addSoalBound} submitLabel="Tambah Soal" />
        </div>
      </div>
    </div>
  );
}
