import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const emotionEmojis = {
  joy: '\ud83d\ude0a',
  sadness: '\ud83d\ude22',
  anger: '\ud83d\ude20',
  fear: '\ud83d\ude28',
  surprise: '\ud83d\ude32',
  disgust: '\ud83e\udd2e',
  neutral: '\ud83d\ude10',
  confusion: '\ud83d\ude15',
};

export default function EmotionDisplay({ mode, emotion = 'neutral', emotionScores = { neutral: 1.0 } }) {
  const [emotionData, setEmotionData] = useState({
    emotion,
    emotionScores,
  });

  useEffect(() => {
    let intervalId;

    if (mode?.startsWith('face')) {
      const fetchEmotionData = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/emotion/face`);
          if (response.data.success) {
            setEmotionData({
              emotion: response.data.emotion,
              emotionScores: response.data.emotion_scores,
            });
          }
        } catch (error) {
          console.error('Error fetching emotion data:', error);
        }
      };

      intervalId = setInterval(fetchEmotionData, 3000); // Fetch every 3 seconds
    } else {
      setEmotionData({ emotion, emotionScores });
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup on mode change or unmount
    };
  }, [mode, emotion, emotionScores]); // Re-run effect when mode or detected emotion changes

  const currentEmotion = emotionData.emotion;
  const currentEmotionScores = emotionData.emotionScores;
  const emoji = emotionEmojis[currentEmotion] || '\ud83d\ude10';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{emoji}</span>
        <div>
          <p className="text-sm text-gray-600">Detected Emotion</p>
          <p className="text-lg font-bold text-gray-800 capitalize">{currentEmotion}</p>
        </div>
      </div>

      {currentEmotionScores && Object.keys(currentEmotionScores).length > 0 && (
        <div className="text-right">
          <p className="text-xs text-gray-600 mb-2">Emotion Confidence</p>
          <div className="space-y-1">
            {Object.entries(currentEmotionScores)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([emo, score]) => (
                <div key={emo} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-16 text-right capitalize">
                    {emo}
                  </span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
