import React from 'react'

export default function ModeSelector({ mode, onModeChange }) {
  const modes = [
    { value: 'text_only', label: '📝 Text Only', desc: 'Chat with text' },
    { value: 'audio_only', label: '🎤 Audio Only', desc: 'Speak to chat' },
    { value: 'face_text', label: '👤📝 Face + Text', desc: 'Face & text' },
    { value: 'face_audio', label: '👤🎤 Face + Audio', desc: 'Face & speech' }
  ]

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-3">
        Select Chat Mode
      </label>
      <div className="mode-selector">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={`mode-button group ${mode === m.value ? 'active' : ''}`}
            title={m.desc}
          >
            <div className="text-lg">{m.label}</div>
            <div className="text-xs opacity-50 group-hover:opacity-100">
              {m.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
