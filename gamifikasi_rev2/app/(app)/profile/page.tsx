import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Zap, Star, Flame, Trophy, LogOut } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: badges } = await supabase
    .from('player_badges')
    .select('badge:badges(*)')
    .eq('player_id', user.id);

  const displayName = user.user_metadata?.full_name ?? profile?.display_name ?? user.email?.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">👤 Profil Saya</h1>

      {/* User card */}
      <div className="card mb-6 flex items-center gap-5">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full ring-2 ring-brand-600" />
        ) : (
          <div className="w-16 h-16 bg-brand-600/20 rounded-full flex items-center justify-center text-2xl font-bold text-brand-400">
            {displayName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-white">{displayName}</h2>
          <p className="text-slate-400 text-sm">{user.email}</p>
          <span className="badge-pill bg-brand-600/20 text-brand-400 mt-1">
            {profile?.role ?? 'PLAYER'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Level', value: profile?.level ?? 1, icon: Star, color: 'text-brand-400' },
          { label: 'Total XP', value: profile?.xp ?? 0, icon: Zap, color: 'text-yellow-400' },
          { label: 'Streak', value: `${profile?.streak ?? 0}d`, icon: Flame, color: 'text-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-slate-400 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card mb-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> Badge Diperoleh
        </h3>
        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((b: any) => (
              <div key={b.badge?.id_badge} className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-3 py-2">
                <div className="text-sm font-semibold text-yellow-400">🏅 {b.badge?.nama_badge}</div>
                <div className="text-xs text-slate-400 mt-0.5">{b.badge?.deskripsi}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Belum ada badge. Selesaikan quiz untuk mendapatkan badge!</p>
        )}
      </div>

      <LogoutButton />
    </div>
  );
}
