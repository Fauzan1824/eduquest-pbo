import { createClient } from '@/lib/supabase/server';
import { Trophy, Medal, Zap, Flame } from 'lucide-react';
import { clsx } from 'clsx';

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: leaderboard } = await supabase
    .from('profiles')
    .select('id, display_name, xp, level, streak')
    .order('xp', { ascending: false })
    .limit(50);

  const rankColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
  const rankBg = ['bg-yellow-400/10 border-yellow-400/20', 'bg-slate-400/10 border-slate-400/20', 'bg-orange-400/10 border-orange-400/20'];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-slate-400 mt-1">Ranking pemain berdasarkan total XP</p>
      </div>

      {/* Top 3 */}
      {leaderboard && leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[1, 0, 2].map((i) => {
            const p = leaderboard[i];
            if (!p) return null;
            const rank = i + 1;
            const heights = ['h-28', 'h-36', 'h-24'];
            return (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2', rankBg[i], rankColors[i])}>
                  {(p.display_name ?? 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-xs text-center">
                  <div className={clsx('font-bold', rankColors[i])}>#{rank}</div>
                  <div className="text-slate-300 text-xs truncate max-w-[80px]">{p.display_name ?? 'User'}</div>
                  <div className="text-slate-500 text-xs">{p.xp} XP</div>
                </div>
                <div className={clsx('w-20 rounded-t-xl flex items-center justify-center', heights[i], rankBg[i])}>
                  <Medal className={clsx('w-6 h-6', rankColors[i])} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {leaderboard?.map((p: any, i: number) => {
          const isMe = p.id === user?.id;
          return (
            <div key={p.id} className={clsx(
              'flex items-center gap-4 p-4 rounded-xl border transition-all',
              isMe ? 'border-brand-600/50 bg-brand-600/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            )}>
              <div className={clsx('w-8 text-center font-bold text-sm', i < 3 ? rankColors[i] : 'text-slate-500')}>
                #{i + 1}
              </div>
              <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300">
                {(p.display_name ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">
                  {p.display_name ?? 'User'}
                  {isMe && <span className="ml-2 text-xs text-brand-400">(Kamu)</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-400">Lv.{p.level}</span>
                  <span className="flex items-center gap-1 text-xs text-orange-400">
                    <Flame className="w-3 h-3" />{p.streak}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                <Zap className="w-4 h-4" />{p.xp}
              </div>
            </div>
          );
        })}
        {(!leaderboard || leaderboard.length === 0) && (
          <div className="card text-center text-slate-400 py-12">
            Belum ada pemain. Jadilah yang pertama!
          </div>
        )}
      </div>
    </div>
  );
}
