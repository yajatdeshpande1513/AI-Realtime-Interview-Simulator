'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis';

// 1. Move all your original logic into a safe inner component
function LiveInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewType = searchParams.get('type') || 'behavioral';
  const voiceType = searchParams.get('voice') || 'female';

  const greetings: Record<string, string> = {
    behavioral: "Hello! I'm your behavioral interviewer today. To start, could you tell me about a time you faced a significant challenge at work and how you handled it?",
    technical: "Welcome to the technical round. Let's start with your core engineering philosophy. How do you approach designing for scalability and maintainability?",
    'case-study': "Hello! Today we'll walk through a business case. Imagine a leading retailer is seeing a 20% drop in foot traffic. How would you start diagnosing the problem?",
    leadership: "Welcome. As a leader here, how do you balance short-term delivery pressures with long-term team growth and vision?"
  };

  const initialGreeting = greetings[interviewType] || greetings.behavioral;

  const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([
    { role: 'model', content: initialGreeting }
  ]);
  const [aiResponse, setAiResponse] = useState<string>(initialGreeting);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);

  const candidateVideoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef('');
  const initialized = useRef(false);

  const { transcript, isListening, startListening, stopListening, setTranscript } = useSpeechRecognition();
  const { speak, stopSpeaking } = useTextToSpeech(voiceType);
  const { analyzeResponse, lastAnalysis, isAnalyzing, history } = useBehavioralAnalysis();
  const { analysis: faceAnalysis, modelsLoaded } = useFaceAnalysis(candidateVideoRef);

  // Sync ref with state for use in async handlers
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (candidateVideoRef.current) {
          candidateVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    startCamera();

    setTimeout(() => {
      setIsSpeaking(true);
      speak(initialGreeting, () => setIsSpeaking(false));
    }, 1000);

    return () => {
      if (candidateVideoRef.current?.srcObject) {
        const stream = candidateVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      stopSpeaking();
    };
  }, []);

  const processCandidateResponse = async (text: string) => {
    if (!text.trim()) return;

    setIsAiThinking(true);
    setError(null);

    const historySnapshot = [...chatHistory];
    const currentQuestion = chatHistory[chatHistory.length - 1].content;

    try {
      analyzeResponse(text, currentQuestion, interviewType, faceAnalysis?.expression || 'Neutral');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historySnapshot })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const newResponse = data.text;
      setAiResponse(newResponse);

      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'model', content: newResponse }
      ]);

      setIsAiThinking(false);
      setIsSpeaking(true);
      speak(newResponse, () => setIsSpeaking(false));

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsAiThinking(false);
      const errorMsg = "I'm having trouble with my connection. Could you repeat that?";
      setAiResponse(errorMsg);
      speak(errorMsg);
    } finally {
      setTranscript('');
      transcriptRef.current = '';
    }
  };

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
      setTimeout(() => {
        const textToSend = transcriptRef.current.trim();
        if (textToSend) {
          processCandidateResponse(textToSend);
        } else {
          setError("I didn't catch that. Please speak clearly and try again.");
        }
      }, 800);
    } else {
      setTranscript('');
      transcriptRef.current = '';
      setError(null);
      stopSpeaking();
      setIsSpeaking(false);
      startListening();
    }
  };

  const handleEndInterview = () => {
    localStorage.setItem('interviewReport', JSON.stringify({
      chatHistory,
      analysisHistory: history,
      duration: '15:00'
    }));
    router.push('/interview/report');
  };

  const videoSrc = videoError
    ? (isSpeaking ? "/recruiter_talk.mp4" : "/recruiter_idle.mp4")
    : (voiceType === 'male'
      ? (isSpeaking ? "/recruiter_male_talk.mp4" : "/recruiter_male_idle.mp4")
      : (isSpeaking ? "/recruiter_female_talk.mp4" : "/recruiter_female_idle.mp4")
    );

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white p-4 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 px-6 py-4 glass-panel rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-[0.2em] text-white/40 uppercase">Session Active</span>
            <span className="text-sm font-medium text-white/90">AI {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview</span>
          </div>
        </div>
        <button
          onClick={handleEndInterview}
          className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 text-sm font-semibold transition-all"
        >
          Finish Session
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
        {/* Recruiter View */}
        <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          <video
            src={videoSrc}
            autoPlay loop muted playsInline
            key={`${voiceType}-${isSpeaking ? "talking" : "idle"}-${videoError}`}
            onError={() => setVideoError(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isSpeaking ? 'opacity-100 scale-105' : 'opacity-60'}`}
          />

          <div className="absolute inset-x-0 bottom-0 p-10 z-20 flex flex-col items-center">
            {isAiThinking ? (
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-8 py-4 rounded-2xl border border-white/10 animate-pulse">
                <span className="text-sm font-semibold text-blue-400 tracking-wider uppercase">Analyzing...</span>
              </div>
            ) : (
              <div className={`transition-all duration-500 ${aiResponse ? 'opacity-100' : 'opacity-0'}`}>
                <p className="bg-white/5 backdrop-blur-3xl text-white/95 px-8 py-5 rounded-3xl text-xl font-medium border border-white/10 text-center max-w-2xl">
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Candidate View */}
        <div className="flex flex-col gap-6">
          <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/10 bg-zinc-950">
            <video
              ref={candidateVideoRef}
              autoPlay playsInline muted
              className="w-full h-full object-cover transform -scale-x-100 opacity-90"
            />
            {/* Analysis Overlay */}
            {lastAnalysis && (
              <div className="absolute top-6 right-6 flex flex-col gap-3 z-30 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-2xl w-64">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3">Live Analysis</h3>
                  <div className="flex flex-col gap-4">
                    {/* STAR Indicators */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-white/70">STAR Method</span>
                      <div className="flex gap-1">
                        {['S', 'T', 'A', 'R'].map((letter, i) => {
                          const key = ['situation', 'task', 'action', 'result'][i];
                          const active = (lastAnalysis.analysis.star_components as any)[key];
                          return (
                            <div key={letter} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${active ? 'bg-green-500 text-black' : 'bg-white/5 text-white/20'}`}>
                              {letter}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Confidence Meter */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                        <span className="text-white/40">Confidence</span>
                        <span className="text-blue-400">{lastAnalysis.scores.confidence}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${lastAnalysis.scores.confidence}%` }} />
                      </div>
                      <p className="text-[8px] text-white/30 leading-tight mt-1 italic">
                        {lastAnalysis.analysis.confidence_reasoning}
                      </p>
                    </div>
                    {/* ML Expression Analysis */}
                    {faceAnalysis && (
                      <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl">
                        <span className="text-[9px] font-bold uppercase text-white/40">Emotion</span>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{faceAnalysis.expression}</span>
                      </div>
                    )}
                    {/* Feedback Snippet */}
                    <p className="text-[10px] leading-relaxed text-white/60 italic border-t border-white/5 pt-3">
                      "{lastAnalysis.analysis.feedback.length > 80 ? lastAnalysis.analysis.feedback.substring(0, 80) + '...' : lastAnalysis.analysis.feedback}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Standalone ML Analysis */}
            {!lastAnalysis && faceAnalysis && (
              <div className="absolute top-6 right-6 z-30 animate-in fade-in slide-in-from-right-4">
                <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-2xl w-48">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3">Facial Analysis</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-white/70 capitalize">{faceAnalysis.expression}</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Status Overlays */}
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">
                {isListening ? 'Microphone Active' : 'Microphone Standby'}
              </span>
            </div>

            {/* Transcript Preview */}
            {transcript && (
              <div className="absolute inset-x-6 bottom-32 z-30 flex justify-center">
                <div className="bg-blue-600/20 backdrop-blur-2xl border border-blue-500/30 px-6 py-3 rounded-2xl max-w-lg shadow-2xl">
                  <p className="text-blue-200 text-sm italic font-medium">"{transcript}"</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute bottom-32 inset-x-6 z-40 flex justify-center">
                <div className="bg-red-500/20 backdrop-blur-2xl border border-red-500/30 px-6 py-3 rounded-2xl shadow-2xl">
                  <p className="text-red-200 text-sm font-bold">{error}</p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-6 z-30">
              <button
                onClick={handleToggleRecording}
                disabled={isAiThinking}
                className={`group flex items-center gap-4 px-10 py-5 rounded-full transition-all shadow-2xl ${isListening ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-zinc-100'
                  }`}
              >
                {isAiThinking ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white/80 rounded-full animate-spin" />
                ) : (
                  <span className="font-bold tracking-wide">
                    {isListening ? 'Stop & Respond' : transcript ? 'Send Follow-up' : 'Click to Respond'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes wave { 0%, 100% { height: 4px; } 50% { height: 16px; } }
        .animate-wave { animation: wave 1s ease-in-out infinite; }
        .glass-panel { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); }
      `}</style>
    </div>
  );
}

// 2. Main Page Component acting as the boundary shell
export default function LiveInterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#050505] items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-white/40 tracking-wider uppercase animate-pulse">Initializing Room...</p>
        </div>
      </div>
    }>
      <LiveInterviewContent />
    </Suspense>
  );
}