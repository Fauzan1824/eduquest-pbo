import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Zap, Users, PlusCircle, ChevronRight, ShieldCheck } from 'lucide-react';

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

      {/* Stats / Navigasi */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total User', value: totalUsers ?? 0, icon: Users, color: 'text-brand-400', href: '/admin/users' },
          { label: 'Total Materi', value: totalMateri ?? 0, icon: BookOpen, color: 'text-emerald-400', href: '/admin/materi' },
          { label: 'Total Quiz', value: totalQuiz ?? 0, icon: Zap, color: 'text-yellow-400', href: '/admin/quiz' },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card text-center hover:border-brand-600/50 hover:bg-slate-800/50 transition-all">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Materi */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Link href="/admin/materi" className="flex items-center gap-1 font-bold text-white hover:text-brand-300 transition-colors">
              Materi Terbaru <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/admin/materi/tambah" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
              <PlusCircle className="w-4 h-4" /> Tambah
            </Link>
          </div>
          <div className="space-y-2">
            {materiList?.map((m: any) => (
              <Link key={m.id_materi} href={`/admin/materi/${m.id_materi}`} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl hover:bg-slate-700/70 transition-colors">
                <span className="text-sm text-slate-200 truncate">{m.judul}</span>
                <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{m.tingkat_kesulitan}</span>
              </Link>
            ))}
            {(!materiList || materiList.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada materi.</p>
            )}
          </div>
        </div>

        {/* Quiz */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Link href="/admin/quiz" className="flex items-center gap-1 font-bold text-white hover:text-brand-300 transition-colors">
              Quiz Terbaru <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/admin/quiz/tambah" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
              <PlusCircle className="w-4 h-4" /> Tambah
            </Link>
          </div>
          <div className="space-y-2">
            {quizList?.map((q: any) => (
              <Link key={q.id_quiz} href={`/admin/quiz/${q.id_quiz}`} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl hover:bg-slate-700/70 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm text-slate-200 truncate">{q.judul_quiz}</div>
                  <div className="text-xs text-slate-500">{q.materi?.judul ?? 'Tanpa Materi'}</div>
                </div>
                <span className="text-xs text-yellow-400 flex-shrink-0 ml-2">{q.xp} XP</span>
              </Link>
            ))}
            {(!quizList || quizList.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada quiz.</p>
            )}
          </div>
        </div>
      </div>

      <Link
        href="/admin/users"
        className="card mt-6 flex items-center justify-between hover:border-brand-600/50 hover:bg-slate-800/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Kelola Pengguna</h3>
            <p className="text-slate-400 text-sm">Lihat semua pengguna & atur role admin.</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </Link>
    </div>
  );
}
