'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const INTERVIEW_TYPES = [
  {
    id: 'behavioral',
    name: 'Behavioral',
    desc: 'Focuses on past behavior and STAR method competencies.',
    icon: '🤝'
  },
  {
    id: 'technical',
    name: 'Technical',
    desc: 'Role-specific questions and technical problem solving.',
    icon: '💻'
  },
  {
    id: 'case-study',
    name: 'Case Study',
    desc: 'Structured business cases and logical reasoning.',
    icon: '📊'
  },
  {
    id: 'leadership',
    name: 'Leadership',
    desc: 'Strategic scenarios and stakeholder management.',
    icon: '👑'
  }
];

export default function SetupPage() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [selectedType, setSelectedType] = useState('behavioral');
  const [selectedVoice, setSelectedVoice] = useState('female');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermissions(true);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Please allow camera and microphone access to proceed.");
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleContinue = () => {
    if (hasPermissions) {
      router.push(`/interview/live?type=${selectedType}&voice=${selectedVoice}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white p-8 items-center justify-center font-sans">
      <div className="w-full max-w-4xl glass-panel p-10 rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-6">
          Step 1: Configuration
        </div>
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Interview Setup</h1>
        <p className="text-white/40 mb-12 text-center max-w-md">
          Select your interview track and ensure your hardware is ready for behavioral analysis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
          {/* Hardware Check */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/30">Hardware Check</h3>
            <div className="relative aspect-video bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 shadow-inner group">
              {!hasPermissions && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📷</span>
                  </div>
                  <button 
                    onClick={requestPermissions}
                    className="px-6 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all"
                  >
                    Enable Camera
                  </button>
                </div>
              )}
              <video 
                ref={videoRef}
                autoPlay playsInline muted 
                className="w-full h-full object-cover transform -scale-x-100 opacity-80"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${hasPermissions ? 'bg-green-500' : 'bg-white/20'}`} />
                <span className="text-[10px] font-bold uppercase tracking-tight opacity-60">
                  {hasPermissions ? 'Camera Ready' : 'Camera Offline'}
                </span>
              </div>
            </div>
            {error && (
              <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                {error}
              </div>
            )}
          </div>

          {/* Interview Type Selection */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/30">Select Track</h3>
            <div className="grid grid-cols-1 gap-3">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                    selectedType === type.id 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                    selectedType === type.id ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 text-white/40 group-hover:bg-white/10'
                  }`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm ${selectedType === type.id ? 'text-white' : 'text-white/80'}`}>{type.name}</h4>
                    <p className="text-[11px] text-white/40 leading-snug">{type.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedType === type.id ? 'border-blue-500 bg-blue-500' : 'border-white/10'
                  }`}>
                    {selectedType === type.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Recruiter Voice Selection */}
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/30 mt-6">Interviewer Voice</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'female', name: 'Female Voice', desc: 'Alice (Engaging)', icon: '👩‍🏫' },
                { id: 'male', name: 'Male Voice', desc: 'Adam (Professional)', icon: '👨‍💼' }
              ].map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                    selectedVoice === voice.id 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                    selectedVoice === voice.id ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 text-white/40 group-hover:bg-white/10'
                  }`}>
                    {voice.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-xs ${selectedVoice === voice.id ? 'text-white' : 'text-white/80'}`}>{voice.name}</h4>
                    <p className="text-[9px] text-white/40 leading-none mt-0.5">{voice.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          disabled={!hasPermissions}
          className={`w-full py-5 rounded-[1.5rem] font-bold tracking-wider uppercase text-sm transition-all shadow-2xl ${
            hasPermissions 
              ? 'bg-white text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] shadow-white/10' 
              : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
          }`}
        >
          {hasPermissions ? 'Initialize Session' : 'Hardware Access Required'}
        </button>
      </div>
    </div>
  );
}
