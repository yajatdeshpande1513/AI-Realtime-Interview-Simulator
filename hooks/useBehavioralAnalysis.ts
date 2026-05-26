'use client';

import { useState } from 'react';

export interface AnalysisResult {
  question?: string;
  answer?: string;
  scores: {
    star: number;
    communication: number;
    confidence: number;
    accuracy: number;
    relevance: number;
  };
  analysis: {
    star_components: {
      situation: boolean;
      task: boolean;
      action: boolean;
      result: boolean;
    };
    filler_words: string[];
    tone: string;
    feedback: string;
    confidence_reasoning: string;
  };
}

export function useBehavioralAnalysis() {
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const analyzeResponse = async (answer: string, question: string, type: string = 'Behavioral', emotion: string = 'Neutral') => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, question, type, emotion }),
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data: AnalysisResult = await res.json();
      const enrichedData = { ...data, question, answer };
      setLastAnalysis(enrichedData);
      setHistory(prev => [...prev, enrichedData]);
      return enrichedData;
    } catch (err) {
      console.error('Analysis error:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeResponse, lastAnalysis, isAnalyzing, history };
}
