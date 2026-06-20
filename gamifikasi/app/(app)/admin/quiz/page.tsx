import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Pencil, Zap, ListChecks } from 'lucide-react';
import DeleteButton from '@/components/admin/DeleteButton';
import { deleteQuiz } from './actions';

export default async function AdminQuizPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/dashboard');

  const { data: quizList } = await supabase
    .from('quizzes')
    .select('*, materi(judul), soal(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">🎯 Kelola Quiz</h1>
          <p className="text-slate-400 mt-1">Tambah, ubah, atau hapus quiz dan soalnya.</p>
        </div>
        <Link href="/admin/quiz/tambah" className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
          <PlusCircle className="w-4 h-4" /> Tambah Quiz
        </Link>
      </div>

      <div className="space-y-3">
        {quizList?.map((q: any) => (
          <div key={q.id_quiz} className="card flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{q.judul_quiz}</h3>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs text-slate-500">{q.materi?.judul ?? 'Tanpa Materi'}</span>
                <span className="text-xs text-yellow-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {q.xp} XP
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ListChecks className="w-3 h-3" /> {q.soal?.[0]?.count ?? 0} soal
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href={`/admin/quiz/${q.id_quiz}`}
                title="Edit"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton
                action={deleteQuiz}
                confirmText={`Hapus quiz "${q.judul_quiz}"? Semua soal dan riwayat pengerjaannya akan ikut terhapus.`}
                hiddenFields={{ id_quiz: q.id_quiz }}
              />
            </div>
          </div>
        ))}

        {(!quizList || quizList.length === 0) && (
          <div className="card text-center text-slate-400 py-12">
            Belum ada quiz. Klik &quot;Tambah Quiz&quot; untuk membuat yang pertama.
          </div>
        )}
      </div>
    </div>
  );
}
