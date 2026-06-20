'use server';

import { requireAdmin } from '@/lib/admin-guard';
import { revalidatePath } from 'next/cache';

export async function setUserRole(targetUserId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const newRole = String(formData.get('role') ?? '');
  if (newRole !== 'ADMIN' && newRole !== 'PLAYER') {
    throw new Error('Role tidak valid.');
  }

  if (targetUserId === user.id && newRole === 'PLAYER') {
    throw new Error('Kamu tidak bisa menurunkan role akunmu sendiri dari sini.');
  }

  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', targetUserId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/admin/users');
}
