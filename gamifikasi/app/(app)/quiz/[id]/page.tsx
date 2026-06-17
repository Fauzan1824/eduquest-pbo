'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Zap, CheckCircle2, XCircle, Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

interface Props { params: { id: string } }

export default function QuizPage({ params }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [soalList, setSoalList] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data: q } = await supabase.from('quizzes').select('*').eq('id_quiz', params.id).single();
      setQuiz(q);

      const { data: soal } = await supabase
        .from('soal')
        .select('*, pilihan_jawaban(*)')
        .eq('id_quiz', params.id)
        .order('urutan');
      setSoalList(soal ?? []);

      // Buat game session
      const { data: session } = await supabase
        .from('game_sessions')
        .insert({ player_id: user.id, quiz_id: Number(params.id), status: 'BERJALAN' })
        .select()
        .single();
      if (session) setSessionId(session.id_session);

      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleAnswer(label: string) {
    if (answered) return;
    setSelected(label);
    setAnswered(true);

    const soal = soalList[current];
    const pilihan = soal.pilihan_jawaban.find((p: any) => p.label === label);
    const isBenar = pilihan?.is_benar ?? false;
    const poin = isBenar ? soal.poin : 0;

    setScore(s => s + poin);
    setXpEarned(x => x + poin);

    if (sessionId && userId) {
      await supabase.from('jawaban_player').insert({
        session_id: sessionId,
        soal_id: soal.id_soal,
        pilihan_id: pilihan.id_pilihan,
        jawaban_user: label,
        is_benar: isBenar,
        poin_diperoleh: poin,
      });
    }
  }

  async function nextQuestion() {
    if (current + 1 >= soalList.length) {
      // Selesai — simpan score & update XP
      if (sessionId && userId) {
        await supabase.from('game_sessions').update({ status: 'SELESAI', waktu_selesai: new Date().toISOString() }).eq('id_session', sessionId);
        await supabase.from('scores').insert({ session_id: sessionId, player_id: userId, nilai_score: score + (answered ? soalList[current]?.poin ?? 0 : 0), total_xp: xpEarned });
        // Update XP di profiles
        const { data: profile } = await supabase.from('profiles').select('xp, level').eq('id', userId).single();
        if (profile) {
          const newXp = (profile.xp ?? 0) + xpEarned;
          const newLevel = Math.floor(newXp / 100) + 1;
          await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', userId);
        }
      }
      setFinished(true);
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
    setAnswered(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (finished) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Quiz Selesai! 🎉</h2>
        <p className="text-slate-400 mb-6">Kamu telah menyelesaikan semua soal.</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className="text-sm text-slate-400">Total Skor</div>
          </div>
          <div className="bg-yellow-400/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{xpEarned} XP</div>
            <div className="text-sm text-slate-400">XP Diperoleh</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1 btn-primary text-center">Ke Dashboard</Link>
          <Link href="/leaderboard" className="flex-1 border border-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-center hover:border-slate-500 transition-colors">Leaderboard</Link>
        </div>
      </div>
    </div>
  );

  const soal = soalList[current];
  if (!soal) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/materi" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-white text-sm">{quiz?.judul_quiz}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${((current + 1) / soalList.length) * 100}%` }} />
            </div>
            <span className="text-xs text-slate-400">{current + 1}/{soalList.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
          <Zap className="w-4 h-4" />{xpEarned}
        </div>
      </div>

      <div className="card mb-6">
        <p className="text-sm text-slate-400 mb-2">Soal {current + 1}</p>
        <p className="text-white text-lg font-semibold leading-relaxed">{soal.teks_soal}</p>
      </div>

      <div className="space-y-3 mb-6">
        {soal.pilihan_jawaban?.map((p: any) => {
          const isSelected = selected === p.label;
          const isCorrect = p.is_benar;
          return (
            <button key={p.id_pilihan} onClick={() => handleAnswer(p.label)} disabled={answered}
              className={clsx(
                'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200',
                !answered && 'border-slate-700 hover:border-brand-600/50 hover:bg-slate-800/50',
                answered && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                answered && isSelected && !isCorrect && 'border-red-500 bg-red-500/10',
                answered && !isSelected && !isCorrect && 'border-slate-800 opacity-50',
              )}
            >
              <span className={clsx(
                'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
                !answered ? 'bg-slate-800 text-slate-300' :
                isCorrect ? 'bg-emerald-500 text-white' :
                isSelected ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-500'
              )}>{p.label}</span>
              <span className={clsx('flex-1 text-sm', answered && isCorrect ? 'text-emerald-300' : answered && isSelected ? 'text-red-300' : 'text-slate-200')}>
                {p.teks_pilihan}
              </span>
              {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
              {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <button onClick={nextQuestion} className="btn-primary w-full">
          {current + 1 >= soalList.length ? 'Selesaikan Quiz 🏆' : 'Soal Berikutnya →'}
        </button>
      )}
    </div>
  );
}
