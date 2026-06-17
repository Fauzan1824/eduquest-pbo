import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Cek apakah user adalah admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <div className="flex min-h-screen">
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
