import Link from 'next/link';
import { BookOpen, Trophy, Zap, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">EduQuest</span>
        </div>
        <Link href="/login" className="btn-primary text-sm">
          Mulai Belajar →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-brand-600/20 text-brand-400 border border-brand-600/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Star className="w-4 h-4" /> Tugas Besar PBO – Kelompok WartegDepanMSU
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Belajar Jadi <span className="text-brand-400">Lebih Seru</span><br />
          dengan Gamifikasi
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-10">
          Kumpulkan XP, naiki level, raih badge, dan bersaing di leaderboard.
          Belajar sambil main — selesai quiz, XP langsung masuk!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login" className="btn-primary text-base px-8 py-3">
            Login dengan Google
          </Link>
          <Link href="/leaderboard" className="border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold px-8 py-3 rounded-xl transition-all duration-200">
            Lihat Leaderboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Materi Terstruktur', desc: 'Dari MUDAH ke SULIT — belajar sesuai kemampuanmu.', color: 'text-emerald-400' },
            { icon: Zap, title: 'Quiz & XP Instan', desc: 'Jawab soal pilihan ganda, XP langsung bertambah.', color: 'text-yellow-400' },
            { icon: Trophy, title: 'Leaderboard Global', desc: 'Lihat ranking kamu dibanding semua pemain.', color: 'text-brand-400' },
          ].map((f) => (
            <div key={f.title} className="card text-center">
              <f.icon className={`w-8 h-8 ${f.color} mx-auto mb-3`} />
              <h3 className="font-bold text-white mb-1">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        © 2026 EduQuest · Kelompok WartegDepanMSU · Tugas Besar PBO
      </footer>
    </main>
  );
}
