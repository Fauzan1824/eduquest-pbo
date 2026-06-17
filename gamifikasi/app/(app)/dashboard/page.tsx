import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Trophy, Zap, Flame, Star, ChevronRight } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: badges } = await supabase
    .from('player_badges')
    .select('badge:badges(nama_badge, deskripsi)')
    .eq('player_id', user.id)
    .limit(3);

  const { data: recentSessions } = await supabase
    .from('game_sessions')
    .select('*, quiz:quizzes(judul_quiz)')
    .eq('player_id', user.id)
    .eq('status', 'SELESAI')
    .order('waktu_selesai', { ascending: false })
    .limit(3);

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const streak = profile?.streak ?? 0;
  const xpForNext = level * 100;
  const xpProgress = Math.min((xp % 100) / 100 * 100, 100);
  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Player';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Halo, {displayName}! 👋
        </h1>
        <p className="text-slate-400 mt-1">Lanjutkan perjalanan belajarmu hari ini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Level', value: level, icon: Star, color: 'text-brand-400', bg: 'bg-brand-600/10' },
          { label: 'Total XP', value: xp, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Streak', value: `${streak} hari`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'Badge', value: badges?.length ?? 0, icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">Progress ke Level {level + 1}</span>
          <span className="text-sm text-slate-400">{xp % 100} / 100 XP</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-bold text-white mb-4">Mulai Sekarang</h2>
          <div className="space-y-3">
            <Link href="/materi" className="flex items-center justify-between p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors group">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Lihat Semua Materi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
            </Link>
            <Link href="/leaderboard" className="flex items-center justify-between p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors group">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-brand-400" />
                <span className="text-sm font-medium text-slate-200">Cek Leaderboard</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <h2 className="font-bold text-white mb-4">Quiz Terakhir</h2>
          {recentSessions && recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((s: any) => (
                <div key={s.id_session} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{s.quiz?.judul_quiz}</div>
                    <div className="text-xs text-slate-500">Selesai</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Belum ada quiz yang diselesaikan. <Link href="/materi" className="text-brand-400 hover:underline">Mulai sekarang!</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}
