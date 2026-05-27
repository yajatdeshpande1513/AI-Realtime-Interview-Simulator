'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export interface FaceAnalysisResult {
  expression: string;
  probability: number;
}

export function useFaceAnalysis(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [analysis, setAnalysis] = useState<FaceAnalysisResult | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("Face-api models loaded");
      } catch (err) {
        console.error("Error loading face-api models:", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    let interval: any;
    if (modelsLoaded && videoRef.current) {
      interval = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detections = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detections) {
            const expressions = detections.expressions;
            const topExpression = Object.entries(expressions).reduce((a, b) => (a[1] > b[1] ? a : b));
            setAnalysis({
              expression: topExpression[0],
              probability: topExpression[1],
            });
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded, videoRef]);

  return { analysis, modelsLoaded };
}
