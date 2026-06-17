'use client';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <button onClick={logout}
      className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold py-3 rounded-xl transition-colors">
      <LogOut className="w-4 h-4" />
      Keluar dari Akun
    </button>
  );
}
