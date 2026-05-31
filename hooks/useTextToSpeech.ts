'use client';

import { useRef } from 'react';

export function useTextToSpeech(gender: string = 'female') {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (text: string, onEnd?: () => void) => {
    // 1. Stop any ongoing speech
    stopSpeaking();

    // Map gender to ElevenLabs Voice ID
    const voiceId = gender === 'male' ? 'pNInz6obpgDQGcFmaJgB' : 'Xb7hH8MSUJpSbSDYk0k2';

    try {
      // 2. Attempt premium ElevenLabs speech via our API
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        if (onEnd) {
          audio.onended = onEnd;
        }
        
        await audio.play();
        return;
      } else {
        throw new Error(`Speech API returned status ${response.status}`);
      }
    } catch (err) {
      console.error("Premium speech failed, falling back to native TTS:", err);
    }

    // 3. Fallback to Native Browser Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice;
      
      if (gender === 'male') {
        // Look for common male voices
        preferredVoice = voices.find(v => 
          v.lang.includes('en') && 
          (v.name.includes('David') || v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Alex'))
        );
      } else {
        // Look for common female voices
        preferredVoice = voices.find(v => 
          v.lang.includes('en') && 
          (v.name.includes('Samantha') || v.name.includes('Google US English Female') || v.name.includes('Zira') || v.name.includes('Google'))
        );
      }
      
      // Fallback if the preferred gendered voice is not found
      if (!preferredVoice) {
        preferredVoice = voices.find(v => v.lang.includes('en'));
      }

      if (preferredVoice) utterance.voice = preferredVoice;
      if (onEnd) utterance.onend = onEnd;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    // Stop native synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Stop premium audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  return { speak, stopSpeaking };
}

