import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Zap, PlayCircle } from 'lucide-react';
import { clsx } from 'clsx';

const levelColor: Record<string, string> = {
  MUDAH: 'bg-emerald-500/20 text-emerald-400',
  SEDANG: 'bg-yellow-500/20 text-yellow-400',
  SULIT: 'bg-red-500/20 text-red-400',
};

export default async function MateriDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: materi } = await supabase
    .from('materi')
    .select('*')
    .eq('id_materi', params.id)
    .single();

  if (!materi) notFound();

  const { data: quizList } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id_materi', params.id);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/materi" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Materi
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={clsx('badge-pill mb-3', levelColor[materi.tingkat_kesulitan])}>
              {materi.tingkat_kesulitan}
            </span>
            <h1 className="text-2xl font-bold text-white">{materi.judul}</h1>
          </div>
        </div>
        <p className="text-slate-300 mt-4 leading-relaxed">{materi.deskripsi}</p>
        {materi.ringkasan && (
          <div className="mt-6 p-4 bg-brand-600/10 border border-brand-600/20 rounded-xl">
            <p className="text-sm font-semibold text-brand-400 mb-1">📌 Ringkasan</p>
            <p className="text-slate-300 text-sm">{materi.ringkasan}</p>
          </div>
        )}
      </div>

      {/* Quiz terkait */}
      <h2 className="font-bold text-white mb-4">🎯 Quiz untuk Materi Ini</h2>
      {quizList && quizList.length > 0 ? (
        <div className="space-y-3">
          {quizList.map((q: any) => (
            <div key={q.id_quiz} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{q.judul_quiz}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {q.xp} XP
                  </span>
                </div>
              </div>
              <Link href={`/quiz/${q.id_quiz}`}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <PlayCircle className="w-4 h-4" />
                Mulai Quiz
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center text-slate-400 py-8">
          Belum ada quiz untuk materi ini.
        </div>
      )}
    </div>
  );
}
