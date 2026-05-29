import React from 'react'

export default function ChatMessages({ messages, messagesEndRef }) {
  const emotionEmojis = {
    joy: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😨',
    surprise: '😲',
    disgust: '🤮',
    neutral: '😐',
    confusion: '😕'
  }

  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`chat-bubble ${message.type === 'user' ? 'bubble-user' : 'bubble-bot'}`}
        >
          <div className="bubble-content">
            <p className="text-sm">{message.content}</p>
            {message.type === 'bot' && message.emotion && (
              <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
                <span>{emotionEmojis[message.emotion] || '😐'}</span>
                <span className="capitalize">{message.emotion}</span>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
