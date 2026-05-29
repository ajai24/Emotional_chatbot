import React, { useEffect, useRef, useState } from 'react'

export default function CameraWindow({ isActive, onEmotionDetected }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [facesDetected, setFacesDetected] = useState(0)
  const [detectedEmotion, setDetectedEmotion] = useState(null)

  useEffect(() => {
    if (!isActive) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Load face-api models and set up detection
        const video = videoRef.current
        const canvas = canvasRef.current
        
        if (video && canvas) {
          video.onloadedmetadata = () => {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            setupFaceDetection(video, canvas)
          }
        }
      } catch (error) {
        console.error('Camera access error:', error)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [isActive])

  const setupFaceDetection = (video, canvas) => {
    const ctx = canvas.getContext('2d')
    let frameCount = 0

    const detectFaces = () => {
      if (video && canvas && ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        frameCount++

        // Perform simple face detection using canvas pixel analysis
        // This is a placeholder - in production, integrate face-api.js or similar
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Count skin-tone colored pixels (simple heuristic)
        let skinPixels = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          // Simple skin tone detection
          if (
            r > 95 &&
            g > 40 &&
            b > 20 &&
            r > b &&
            r > g &&
            Math.abs(r - g) > 15 &&
            a > 200
          ) {
            skinPixels++
          }
        }

        const skinPercentage = (skinPixels / (canvas.width * canvas.height)) * 100

        // Simulate emotion detection based on skin detection
        if (skinPercentage > 5) {
          setFacesDetected(1)
          
          // Simulate emotion detection (in real implementation, use face-api or tf.js)
          const emotions = ['joy', 'neutral', 'sadness', 'surprise']
          const simulatedEmotion = emotions[frameCount % emotions.length]
          
          setDetectedEmotion(simulatedEmotion)
          onEmotionDetected?.(simulatedEmotion)
        } else {
          setFacesDetected(0)
          setDetectedEmotion(null)
          onEmotionDetected?.(null)
        }
      }
      requestAnimationFrame(detectFaces)
    }

    detectFaces()
  }

  if (!isActive) {
    return (
      <div className="camera-placeholder">
        <div className="text-center">
          <p className="text-lg">📹 Camera disabled</p>
          <p className="text-sm opacity-75">Select a mode with camera to enable</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-auto rounded-lg bg-black"
        style={{ maxHeight: '300px' }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      <div className="mt-2 text-sm text-gray-600 text-center">
        📹 Live Camera Feed
        {facesDetected > 0 && <p className="text-green-600 font-semibold">✓ Face detected</p>}
        {detectedEmotion && <p className="text-blue-600">Emotion: {detectedEmotion}</p>}
      </div>
    </div>
  )
}
