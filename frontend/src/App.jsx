import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import ModeSelector from './components/ModeSelector'
import EmotionDisplay from './components/EmotionDisplay'
import CameraWindow from './components/CameraWindow'
import MicrophoneButton from './components/MicrophoneButton'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [mode, setMode] = useState('text_only')
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your emotion-aware chatbot. How are you feeling today?",
      emotion: 'joy'
    }
  ])
  const [emotion, setEmotion] = useState('neutral')
  const [emotionScores, setEmotionScores] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [faceEmotion, setFaceEmotion] = useState(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start/stop camera based on mode
  useEffect(() => {
    const shouldUseCamera = ['face_text', 'face_audio'].includes(mode)
    setIsCameraActive(shouldUseCamera)
  }, [mode])

  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim()) return

    // Add user message to chat
    const userMessageObj = {
      id: messages.length + 1,
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessageObj])

    setIsLoading(true)
    try {
      // Prepare conversation history
      const conversationHistory = messages
        .filter(msg => msg.type === 'bot')
        .map(msg => msg.content)

      // Send to backend
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        user_message: userMessage,
        mode: mode,
        conversation_history: conversationHistory,
        detected_emotion: faceEmotion
      })

      // Add bot response
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response.data.chatbot_response,
        emotion: response.data.detected_emotion,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setEmotion(response.data.detected_emotion)
      setEmotionScores(response.data.emotion_scores)

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        emotion: 'sadness',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAudioTranscription = async (audioBlob) => {
    setIsLoading(true)
    try {
      console.log('Audio blob received:', audioBlob.size, 'bytes, type:', audioBlob.type)
      
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')

      console.log('Sending audio to backend...')
      const response = await axios.post(`${API_BASE_URL}/api/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Backend response:', response.data)

      if (response.data.transcribed_text) {
        console.log('Transcribed text:', response.data.transcribed_text)
        handleSendMessage(response.data.transcribed_text)
      } else {
        console.warn('No transcribed text in response')
        alert('Could not transcribe audio. Please try again.')
      }
    } catch (error) {
      console.error('Error transcribing audio:', error)
      alert('Error transcribing audio: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    // Reset face emotion when mode changes
    setFaceEmotion(null)
  }

  const handleFaceEmotionDetected = (detectedEmotion) => {
    setFaceEmotion(detectedEmotion)
  }

  const handleRecordingStateChange = (state) => {
    setIsRecording(state)
  }

  return (
    <div className="chat-container bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            😊 Emotion-Aware Chatbot
          </h1>
          <p className="text-gray-600">
            Multimodal emotion detection with empathetic responses
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex gap-6 p-4">
          {/* Left: Chat Interface */}
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg">
            {/* Mode Selector */}
            <div className="border-b border-gray-200 p-4">
              <ModeSelector mode={mode} onModeChange={handleModeChange} />
            </div>

            {/* Chat Messages */}
            <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />

            {/* Emotion Display */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <EmotionDisplay mode={mode} emotion={emotion} emotionScores={emotionScores} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                mode={mode}
                isRecording={isRecording}
              />
            </div>
          </div>

          {/* Right: Utilities */}
          <div className="w-80 flex flex-col gap-4">
            {/* Camera Window */}
            {isCameraActive && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">📹 Camera Feed</h3>
                <CameraWindow
                  isActive={isCameraActive}
                  onEmotionDetected={handleFaceEmotionDetected}
                />
              </div>
            )}

            {/* Microphone Button */}
            {['audio_only', 'face_audio'].includes(mode) && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">🎤 Voice Input</h3>
                <MicrophoneButton
                  onAudioRecorded={handleAudioTranscription}
                  isLoading={isLoading}
                  onRecordingStateChange={handleRecordingStateChange}
                />
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">ℹ️ Info</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Mode:</strong> {mode.replace('_', ' ')}</p>
                <p><strong>Current Emotion:</strong> {emotion}</p>
                {faceEmotion && <p><strong>Face Emotion:</strong> {faceEmotion}</p>}
                <p><strong>Messages:</strong> {messages.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
