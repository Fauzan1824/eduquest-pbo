'use server';

import { requireAdmin } from '@/lib/admin-guard';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMateri(formData: FormData) {
  const { supabase } = await requireAdmin();

  const judul = String(formData.get('judul') ?? '').trim();
  const deskripsi = String(formData.get('deskripsi') ?? '').trim();
  const tingkat_kesulitan = String(formData.get('tingkat_kesulitan') ?? 'MUDAH');
  const ringkasan = String(formData.get('ringkasan') ?? '').trim();

  if (!judul || !deskripsi) {
    throw new Error('Judul dan deskripsi wajib diisi.');
  }

  const { error } = await supabase.from('materi').insert({
    judul,
    deskripsi,
    tingkat_kesulitan,
    ringkasan: ringkasan || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/admin/materi');
  revalidatePath('/materi');
  redirect('/admin/materi');
}

export async function updateMateri(idMateri: number, formData: FormData) {
  const { supabase } = await requireAdmin();

  const judul = String(formData.get('judul') ?? '').trim();
  const deskripsi = String(formData.get('deskripsi') ?? '').trim();
  const tingkat_kesulitan = String(formData.get('tingkat_kesulitan') ?? 'MUDAH');
  const ringkasan = String(formData.get('ringkasan') ?? '').trim();

  if (!judul || !deskripsi) {
    throw new Error('Judul dan deskripsi wajib diisi.');
  }

  const { error } = await supabase
    .from('materi')
    .update({
      judul,
      deskripsi,
      tingkat_kesulitan,
      ringkasan: ringkasan || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id_materi', idMateri);

  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/admin/materi');
  revalidatePath('/materi');
  revalidatePath(`/materi/${idMateri}`);
  redirect('/admin/materi');
}

export async function deleteMateri(formData: FormData) {
  const { supabase } = await requireAdmin();
  const idMateri = Number(formData.get('id_materi'));

  const { error } = await supabase.from('materi').delete().eq('id_materi', idMateri);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/admin/materi');
  revalidatePath('/materi');
}
