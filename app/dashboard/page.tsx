'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Executive Dashboard</h1>
            <p className="text-white/40 mt-2 font-medium">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="px-6 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Interview Ready</h3>
            <div className="text-3xl font-black mb-6">Start Training</div>
            <Link 
              href="/interview/setup"
              className="inline-block w-full py-4 rounded-2xl bg-white text-black text-center text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              New Session
            </Link>
          </div>

          <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Latest Report</h3>
              <div className="text-sm font-bold text-white/60 italic">No recent sessions found.</div>
            </div>
            <div className="mt-8 text-[10px] font-black uppercase text-blue-400">View All History</div>
          </div>

          <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Competency Map</h3>
            <div className="h-24 flex items-center justify-center border border-white/5 rounded-2xl bg-black/20">
              <span className="text-[10px] font-bold text-white/20 uppercase">Data visualization pending</span>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-black mb-8 px-2">Interview Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['FAANG Behavioral', 'System Design', 'Frontend Master', 'Product Manager'].map((title) => (
              <div key={title} className="group cursor-pointer p-6 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="font-bold text-sm mb-1">{title}</div>
                <div className="text-[10px] text-white/30 uppercase font-black">15 Minutes • Professional</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
