import React, { useState, useRef } from 'react'

export default function MicrophoneButton({ onAudioRecorded, isLoading, onRecordingStateChange }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const isRecordingRef = useRef(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  // Convert Blob to WAV format if needed
  const blobToWAV = async (blob) => {
    // If already wav, return as is
    if (blob.type === 'audio/wav') {
      console.log('Already WAV format, skipping conversion')
      return blob
    }

    // If webm/opus, convert to PCM first
    console.log('Converting', blob.type, 'to WAV...')
    const arrayBuffer = await blob.arrayBuffer()
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      console.log('Decoded audio:', {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        length: audioBuffer.length
      })

      // Get audio data from all channels and mix to mono if needed
      let monoData
      if (audioBuffer.numberOfChannels === 1) {
        monoData = audioBuffer.getChannelData(0)
      } else {
        // Mix channels to mono
        monoData = new Float32Array(audioBuffer.length)
        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
          const channelData = audioBuffer.getChannelData(ch)
          for (let i = 0; i < audioBuffer.length; i++) {
            monoData[i] += channelData[i] / audioBuffer.numberOfChannels
          }
        }
      }

      // Boost volume to ensure speech is recognized
      const boostedData = new Float32Array(monoData.length)
      let maxSample = 0
      for (let i = 0; i < monoData.length; i++) {
        maxSample = Math.max(maxSample, Math.abs(monoData[i]))
      }

      const boostFactor = maxSample > 0 ? 0.9 / maxSample : 1.0
      for (let i = 0; i < monoData.length; i++) {
        boostedData[i] = monoData[i] * boostFactor
      }

      console.log('Audio boost factor:', boostFactor, 'Max sample:', maxSample)

      const wavBlob = encodeWAV(boostedData, audioBuffer.sampleRate)
      return wavBlob
    } catch (error) {
      console.error('Could not decode audio:', error)
      // Try to use blob as-is as fallback
      return blob
    }
  }

  // Convert raw PCM audio to WAV format
  const encodeWAV = (samples, sampleRate) => {
    const numChannels = 1
    const bitsPerSample = 16
    const bytesPerSample = bitsPerSample / 8
    const blockAlign = numChannels * bytesPerSample

    const subchunk1Size = 16
    const subchunk2Size = samples.length * bytesPerSample
    const fileSize = 36 + subchunk2Size

    const headerBuffer = new ArrayBuffer(44)
    const view = new DataView(headerBuffer)

    // RIFF chunk descriptor
    view.setUint8(0, 'R'.charCodeAt(0))
    view.setUint8(1, 'I'.charCodeAt(0))
    view.setUint8(2, 'F'.charCodeAt(0))
    view.setUint8(3, 'F'.charCodeAt(0))
    view.setUint32(4, fileSize, true)
    view.setUint8(8, 'W'.charCodeAt(0))
    view.setUint8(9, 'A'.charCodeAt(0))
    view.setUint8(10, 'V'.charCodeAt(0))
    view.setUint8(11, 'E'.charCodeAt(0))

    // fmt sub-chunk
    view.setUint8(12, 'f'.charCodeAt(0))
    view.setUint8(13, 'm'.charCodeAt(0))
    view.setUint8(14, 't'.charCodeAt(0))
    view.setUint8(15, ' '.charCodeAt(0))
    view.setUint32(16, subchunk1Size, true)
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitsPerSample, true)

    // data sub-chunk
    view.setUint8(36, 'd'.charCodeAt(0))
    view.setUint8(37, 'a'.charCodeAt(0))
    view.setUint8(38, 't'.charCodeAt(0))
    view.setUint8(39, 'a'.charCodeAt(0))
    view.setUint32(40, subchunk2Size, true)

    const pcmDataBuffer = new ArrayBuffer(subchunk2Size)
    const pcmView = new DataView(pcmDataBuffer)
    let index = 0

    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]))
      pcmView.setInt16(index, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      index += 2
    }

    console.log('Encoded WAV:', {
      sampleRate,
      samples: samples.length,
      duration: (samples.length / sampleRate).toFixed(2) + 's',
      byteLength: subchunk2Size + 44
    })

    return new Blob([headerBuffer, pcmDataBuffer], { type: 'audio/wav' })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      audioChunksRef.current = []

      // Try to use audio/wav if supported, otherwise use default
      const mimeType = MediaRecorder.isTypeSupported('audio/wav')
        ? 'audio/wav'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      console.log('Using MIME type:', mimeType)

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log('Audio chunk received:', event.data.size, 'bytes')
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, total chunks:', audioChunksRef.current.length)
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null

        if (audioChunksRef.current.length === 0) {
          console.warn('No audio chunks recorded!')
          alert('No audio was recorded. Please try again.')
          setIsRecording(false)
          isRecordingRef.current = false
          onRecordingStateChange?.(false)
          return
        }

        // Combine chunks into single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        console.log('Initial blob:', audioBlob.size, 'bytes, type:', audioBlob.type)

        // Convert to WAV if not already
        const wavBlob = await blobToWAV(audioBlob)
        console.log('Final WAV blob:', wavBlob.size, 'bytes, type:', wavBlob.type)

        onAudioRecorded(wavBlob)

        setIsRecording(false)
        isRecordingRef.current = false
        onRecordingStateChange?.(false)
        clearInterval(timerRef.current)
        setRecordingTime(0)
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        alert('Recording error: ' + event.error)
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      isRecordingRef.current = true
      onRecordingStateChange?.(true)
      setRecordingTime(0)

      console.log('Recording started with MIME type:', mimeType)

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => {
          if (t >= 60) {
            stopRecording()
            return 0
          }
          return t + 1
        })
      }, 1000)
    } catch (error) {
      console.error('Microphone error:', error)
      alert('Cannot access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (!isRecordingRef.current) return

    const mediaRecorder = mediaRecorderRef.current

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      console.log('Stopping recording...')
      mediaRecorder.stop()
    } else {
      setIsRecording(false)
      isRecordingRef.current = false
      onRecordingStateChange?.(false)
    }

    clearInterval(timerRef.current)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-3">
      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span>Recording... {formatTime(recordingTime)}</span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400'
          }`}
        >
          {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Max 60 seconds per recording
      </p>
    </div>
  )
}
