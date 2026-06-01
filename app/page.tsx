'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#020202] text-white selection:bg-blue-500 selection:text-white overflow-hidden font-sans">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      </div>

      <header className="relative z-10 px-8 py-10 md:px-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <span className="font-black text-white text-base">AI</span>
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase">Interview.ai</span>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-10 text-[11px] font-bold tracking-[0.2em] uppercase text-white/40">
            <Link href="#features" className="hover:text-white transition-all">Platform</Link>
            <Link href="#enterprise" className="hover:text-white transition-all">Enterprise</Link>
          </nav>
          <Link href="/auth/login" className="px-6 py-2 rounded-xl border border-white/10 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all">
            Login
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-6xl mx-auto w-full pt-12 pb-24">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-[10px] font-black tracking-[0.3em] uppercase text-blue-400 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Real-time Behavioral Intelligence
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20">
          Precision Training<br />For High Stakes.
        </h1>
        
        <p className="text-lg md:text-xl text-white/40 max-w-2xl mb-14 leading-relaxed font-medium">
          The only interview simulator that analyzes <span className="text-white">STAR structure</span>, <span className="text-white">emotional tone</span>, and <span className="text-white">confidence markers</span> in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-24">
          <Link 
            href="/interview/setup"
            className="group relative px-10 py-5 rounded-2xl bg-white text-black font-black tracking-widest uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            <span className="relative z-10">Start Session</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity" />
          </Link>
          <Link 
            href="#demo"
            className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-black tracking-widest uppercase text-xs hover:bg-white/10 transition-all active:scale-95"
          >
            Watch Intelligence Demo
          </Link>
        </div>

        {/* Dynamic Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {[
            { title: "Behavioral Analytics", desc: "Real-time STAR adherence and confidence scoring using LLaMA 3.", icon: "⚡" },
            { title: "Contextual Memory", desc: "Adaptive follow-up questions based on your specific responses.", icon: "🧠" },
            { title: "Enterprise Ready", desc: "Multi-tenant dashboards for HR teams and universities.", icon: "🏢" }
          ].map((feature, i) => (
            <div key={i} className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 text-left hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-2xl opacity-20 group-hover:opacity-100 transition-opacity">
                {feature.icon}
              </div>
              <h3 className="font-black text-xs tracking-widest uppercase mb-4 text-white/40 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 py-12 px-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/20">
          © 2026 Interview.ai | Next-Gen Preparation
        </div>
        <div className="flex gap-10 text-[10px] font-bold tracking-widest uppercase text-white/20">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Open Source</span>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        :root { --font-sans: 'Inter', sans-serif; }
        body { background: #020202; }
      `}</style>
    </div>
  );
}
