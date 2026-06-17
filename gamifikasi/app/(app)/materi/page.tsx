import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const levelColor: Record<string, string> = {
  MUDAH: 'bg-emerald-500/20 text-emerald-400',
  SEDANG: 'bg-yellow-500/20 text-yellow-400',
  SULIT: 'bg-red-500/20 text-red-400',
};

export default async function MateriPage() {
  const supabase = createClient();
  const { data: materiList } = await supabase
    .from('materi')
    .select('*')
    .order('tingkat_kesulitan', { ascending: true });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📚 Materi Pembelajaran</h1>
        <p className="text-slate-400 mt-1">Pilih materi yang ingin kamu pelajari.</p>
      </div>

      <div className="space-y-4">
        {materiList?.map((m: any) => (
          <Link key={m.id_materi} href={`/materi/${m.id_materi}`}
            className="card flex items-center justify-between hover:border-brand-600/50 hover:bg-slate-800/50 transition-all group cursor-pointer block">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{m.judul}</h3>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{m.deskripsi}</p>
                <span className={clsx('badge-pill mt-2', levelColor[m.tingkat_kesulitan])}>
                  {m.tingkat_kesulitan}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-brand-400 flex-shrink-0 ml-4" />
          </Link>
        ))}
        {(!materiList || materiList.length === 0) && (
          <div className="card text-center text-slate-400 py-12">
            Belum ada materi. Admin belum menambahkan konten.
          </div>
        )}
      </div>
    </div>
  );
}
