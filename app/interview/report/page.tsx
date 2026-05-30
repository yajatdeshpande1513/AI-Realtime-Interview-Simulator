'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ReportPage() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('interviewReport');
    if (data) {
      setReport(JSON.parse(data));
    }
  }, []);

  if (!report) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse text-white/20 font-black tracking-widest uppercase">Loading Report...</div>
    </div>
  );

  const { analysisHistory = [] } = report;
  
  // Aggregate scores for the radar chart
  const aggregateScores = analysisHistory.reduce((acc: any, curr: any) => {
    if (curr.scores) {
      acc.star += curr.scores.star || 0;
      acc.communication += curr.scores.communication || 0;
      acc.confidence += curr.scores.confidence || 0;
      acc.accuracy += curr.scores.accuracy || 0;
      acc.relevance += curr.scores.relevance || 0;
      acc.count += 1;
    }
    return acc;
  }, { star: 0, communication: 0, confidence: 0, accuracy: 0, relevance: 0, count: 0 });

  const finalCount = aggregateScores.count || 1;
  const finalScores = {
    star: Math.round(aggregateScores.star / finalCount),
    communication: Math.round(aggregateScores.communication / finalCount),
    confidence: Math.round(aggregateScores.confidence / finalCount),
    accuracy: Math.round(aggregateScores.accuracy / finalCount),
    relevance: Math.round(aggregateScores.relevance / finalCount),
  };

  // Simple SVG Radar Chart
  const categories = ['STAR', 'Comm.', 'Conf.', 'Acc.', 'Rel.'];
  const values = [finalScores.star, finalScores.communication, finalScores.confidence, finalScores.accuracy, finalScores.relevance];
  const points = values.map((v, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const r = (v / 100) * 100;
    return `${120 + r * Math.cos(angle)},${120 + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div className="min-h-screen bg-[#020202] text-white p-8 md:p-16 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-end mb-16">
        <div>
          <div className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-500 mb-4">Post-Session Analysis</div>
          <h1 className="text-5xl font-black tracking-tighter">Performance Scorecard</h1>
        </div>
        <Link href="/" className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all">
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart Section */}
        <div className="lg:col-span-1 glass-panel p-10 rounded-[3rem] border border-white/5 bg-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <h3 className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-10">Competency Map</h3>
          
          <svg width="240" height="240" className="drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            {/* Background Polygons */}
            {[20, 40, 60, 80, 100].map(r => (
              <polygon
                key={r}
                points={categories.map((_, i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  return `${120 + r * Math.cos(angle)},${120 + r * Math.sin(angle)}`;
                }).join(' ')}
                fill="none"
                stroke="white"
                strokeOpacity="0.05"
              />
            ))}
            {/* Axis Lines */}
            {categories.map((_, i) => {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              return (
                <line
                  key={i}
                  x1="120" y1="120"
                  x2={120 + 100 * Math.cos(angle)}
                  y2={120 + 100 * Math.sin(angle)}
                  stroke="white"
                  strokeOpacity="0.05"
                />
              );
            })}
            {/* Data Polygon */}
            <polygon
              points={points}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>

          <div className="grid grid-cols-2 gap-8 mt-10 w-full">
            {Object.entries(finalScores).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-tighter mb-1">{key}</div>
                <div className="text-xl font-black text-white">{value as number}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Feedback Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h3 className="text-[10px] font-black tracking-widest uppercase text-white/40 px-4">Session Timeline</h3>
          {analysisHistory.length === 0 ? (
            <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-center text-white/20 italic">
              No response data recorded for this session.
            </div>
          ) : (
            analysisHistory.map((item: any, i: number) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                      Q{i + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Question Asked</span>
                      <span className="text-sm font-bold text-white/80 mt-1">{item.question || "Follow-up question"}</span>
                      <span className="text-xs font-bold text-green-400 uppercase tracking-tighter mt-2">{item.analysis.tone} Tone</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['S', 'T', 'A', 'R'].map((letter, idx) => {
                      const key = ['situation', 'task', 'action', 'result'][idx];
                      const active = item.analysis.star_components[key];
                      return (
                        <div key={letter} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${active ? 'bg-green-500 text-black' : 'bg-white/5 text-white/20'}`}>
                          {letter}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed font-medium mb-6 italic">
                  "{item.analysis.feedback}"
                </p>
                <div className="flex gap-6 border-t border-white/5 pt-6">
                   <div className="flex flex-col">
                     <span className="text-[9px] font-bold uppercase text-white/20 mb-1">Filler Words</span>
                     <div className="flex gap-1 flex-wrap">
                        {item.analysis.filler_words.length > 0 ? (
                          item.analysis.filler_words.map((word: string, j: number) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{word}</span>
                          ))
                        ) : (
                          <span className="text-[10px] text-white/40">None detected</span>
                        )}
                     </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <style jsx global>{`
        .glass-panel { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(40px); }
      `}</style>
    </div>
  );
}
