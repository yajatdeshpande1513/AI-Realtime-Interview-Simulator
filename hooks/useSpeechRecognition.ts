'use client';

import { useState, useEffect, useRef } from 'react';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      // Critical Settings
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Optimized for your location

      recognitionRef.current.onresult = (event: any) => {
        let accumulated = '';
        for (let i = 0; i < event.results.length; ++i) {
          accumulated += event.results[i][0].transcript;
        }
        setTranscript(accumulated.trim());
      };

      recognitionRef.current.onend = () => {
        // If it stops unexpectedly, restart if we're supposed to be listening
        if (isListening) recognitionRef.current.start();
      };
    }
  }, [isListening]);

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  return { transcript, isListening, startListening, stopListening, setTranscript };
}