import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Zap, Users, PlusCircle } from 'lucide-react';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/dashboard');

  const [{ count: totalUsers }, { count: totalMateri }, { count: totalQuiz }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('materi').select('*', { count: 'exact', head: true }),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
  ]);

  const { data: materiList } = await supabase.from('materi').select('*').order('created_at', { ascending: false }).limit(5);
  const { data: quizList } = await supabase.from('quizzes').select('*, materi(judul)').order('created_at', { ascending: false }).limit(5);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">⚙️ Admin Panel</h1>
        <p className="text-slate-400 mt-1">Kelola materi, quiz, dan pengguna.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total User', value: totalUsers ?? 0, icon: Users, color: 'text-brand-400' },
          { label: 'Total Materi', value: totalMateri ?? 0, icon: BookOpen, color: 'text-emerald-400' },
          { label: 'Total Quiz', value: totalQuiz ?? 0, icon: Zap, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Materi */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Materi Terbaru</h2>
            <Link href="/admin/materi/tambah" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
              <PlusCircle className="w-4 h-4" /> Tambah
            </Link>
          </div>
          <div className="space-y-2">
            {materiList?.map((m: any) => (
              <div key={m.id_materi} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                <span className="text-sm text-slate-200 truncate">{m.judul}</span>
                <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{m.tingkat_kesulitan}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Quiz Terbaru</h2>
            <Link href="/admin/quiz/tambah" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
              <PlusCircle className="w-4 h-4" /> Tambah
            </Link>
          </div>
          <div className="space-y-2">
            {quizList?.map((q: any) => (
              <div key={q.id_quiz} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                <div>
                  <div className="text-sm text-slate-200 truncate">{q.judul_quiz}</div>
                  <div className="text-xs text-slate-500">{q.materi?.judul ?? 'Tanpa Materi'}</div>
                </div>
                <span className="text-xs text-yellow-400 flex-shrink-0 ml-2">{q.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
