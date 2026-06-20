import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import RoleToggle from '@/components/admin/RoleToggle';
import { setUserRole } from './actions';

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/dashboard');

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('xp', { ascending: false });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Admin Panel
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">👥 Kelola Pengguna</h1>
        <p className="text-slate-400 mt-1">Lihat semua pengguna dan atur siapa yang menjadi admin.</p>
      </div>

      <div className="space-y-3">
        {users?.map((u: any) => {
          const isSelf = u.id === user.id;
          const setRoleBound = setUserRole.bind(null, u.id);
          return (
            <div key={u.id} className="card flex items-center justify-between gap-4">
              <div className="min-w-0 flex items-center gap-3">
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm',
                  u.role === 'ADMIN' ? 'bg-brand-600/20 text-brand-300' : 'bg-slate-800 text-slate-400'
                )}>
                  {(u.display_name ?? u.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white truncate">{u.display_name ?? 'Tanpa Nama'}</h3>
                    {u.role === 'ADMIN' && <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />}
                    {isSelf && <span className="text-xs text-slate-500 flex-shrink-0">(kamu)</span>}
                  </div>
                  <p className="text-slate-400 text-sm truncate">{u.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {u.xp} XP
                    </span>
                    <span className="text-xs text-slate-500">Level {u.level}</span>
                  </div>
                </div>
              </div>
              <RoleToggle action={setRoleBound} currentRole={u.role} disabled={isSelf} />
            </div>
          );
        })}

        {(!users || users.length === 0) && (
          <div className="card text-center text-slate-400 py-12">Belum ada pengguna terdaftar.</div>
        )}
      </div>
    </div>
  );
}
