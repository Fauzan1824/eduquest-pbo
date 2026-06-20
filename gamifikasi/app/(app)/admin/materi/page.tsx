import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Pencil } from 'lucide-react';
import { clsx } from 'clsx';
import DeleteButton from '@/components/admin/DeleteButton';
import { deleteMateri } from './actions';

const levelColor: Record<string, string> = {
  MUDAH: 'bg-emerald-500/20 text-emerald-400',
  SEDANG: 'bg-yellow-500/20 text-yellow-400',
  SULIT: 'bg-red-500/20 text-red-400',
};

export default async function AdminMateriPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/dashboard');

  const { data: materiList } = await supabase
    .from('materi')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">📚 Kelola Materi</h1>
          <p className="text-slate-400 mt-1">Tambah, ubah, atau hapus materi pembelajaran.</p>
        </div>
        <Link href="/admin/materi/tambah" className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
          <PlusCircle className="w-4 h-4" /> Tambah Materi
        </Link>
      </div>

      <div className="space-y-3">
        {materiList?.map((m: any) => (
          <div key={m.id_materi} className="card flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white truncate">{m.judul}</h3>
                <span className={clsx('badge-pill flex-shrink-0', levelColor[m.tingkat_kesulitan])}>
                  {m.tingkat_kesulitan}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 line-clamp-1">{m.deskripsi}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href={`/admin/materi/${m.id_materi}`}
                title="Edit"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton
                action={deleteMateri}
                confirmText={`Hapus materi "${m.judul}"? Quiz terkait juga akan kehilangan referensinya.`}
                hiddenFields={{ id_materi: m.id_materi }}
              />
            </div>
          </div>
        ))}

        {(!materiList || materiList.length === 0) && (
          <div className="card text-center text-slate-400 py-12">
            Belum ada materi. Klik &quot;Tambah Materi&quot; untuk membuat yang pertama.
          </div>
        )}
      </div>
    </div>
  );
}
