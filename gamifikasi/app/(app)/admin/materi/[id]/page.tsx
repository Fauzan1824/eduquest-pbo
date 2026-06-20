import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MateriForm from '@/components/admin/MateriForm';
import { updateMateri } from '../actions';

export default async function EditMateriPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/dashboard');

  const { data: materi } = await supabase.from('materi').select('*').eq('id_materi', params.id).single();
  if (!materi) notFound();

  const updateMateriWithId = updateMateri.bind(null, materi.id_materi);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/materi" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Kelola Materi
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">✏️ Edit Materi</h1>
        <p className="text-slate-400 mt-1">Perbarui informasi materi ini.</p>
      </div>

      <MateriForm action={updateMateriWithId} submitLabel="Simpan Perubahan" initial={materi} />
    </div>
  );
}
