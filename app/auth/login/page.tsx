'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-6">
              <span className="font-black text-white text-lg">AI</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2 text-center">Welcome Back</h1>
            <p className="text-white/40 text-sm font-medium">Continue your professional journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-white/40 px-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-white/40 px-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-400/10 p-4 rounded-2xl border border-red-400/20 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-white text-black font-black tracking-widest uppercase text-xs hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-white/30 font-medium">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Create Profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
