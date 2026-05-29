import React, { useState } from 'react'

export default function ChatInput({ onSendMessage, isLoading, mode }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput('')
    }
  }

  // Don't show text input for audio-only mode
  if (mode === 'audio_only') {
    return (
      <div className="text-center text-gray-500 py-4">
        Use the microphone button to send audio →
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="input-group">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}
        className="placeholder-gray-400"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="loading-spinner"></span>
            Sending...
          </>
        ) : (
          <>
            Send
            <span>➤</span>
          </>
        )}
      </button>
    </form>
  )
}
