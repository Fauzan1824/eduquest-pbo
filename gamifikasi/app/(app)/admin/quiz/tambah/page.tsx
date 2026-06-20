import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuizBuilder from '@/components/admin/QuizBuilder';
import { createQuiz } from '../actions';

export default async function TambahQuizPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/dashboard');

  const { data: materiList } = await supabase.from('materi').select('id_materi, judul').order('judul');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/quiz" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Kelola Quiz
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">➕ Tambah Quiz</h1>
        <p className="text-slate-400 mt-1">Buat quiz baru lengkap dengan soal dan pilihan jawaban.</p>
      </div>

      <QuizBuilder action={createQuiz} materiList={materiList ?? []} />
    </div>
  );
}
