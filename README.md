# Emotion-Aware Chatbot - Full Stack Application

![React](https://img.shields.io/badge/React-18-blue?style=flat-square) ![FastAPI](https://img.shields.io/badge/FastAPI-Modern-green?style=flat-square) ![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=flat-square) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Modern-38B2AC?style=flat-square)

**A production-ready web application combining AI chatbot with multimodal emotion detection using React frontend and FastAPI backend.**

## 🎯 Features

### 🤖 AI Chatbot
- Powered by Google Gemini API
- Empathetic, context-aware responses
- Conversation history tracking
- RAG knowledge base for emotional support

### 😊 Multimodal Emotion Detection
- **Text Emotion**: RoBERTa-based classification
- **Facial Emotion**: Vision Transformer model
- **Audio Emotion**: Speech-to-text + analysis
- **Fusion**: Weighted combination of multiple modalities

### 💬 Chat Modes
1. **Text Only** - Pure text chat
2. **Audio Only** - Voice input via microphone
3. **Face + Text** - Camera + text messages
4. **Face + Audio** - Full multimodal experience

### 🎨 Modern UI
- Responsive design with TailwindCSS
- Real-time emotion visualization
- Live camera feed
- Audio recording interface
- Smooth animations and transitions

### 🔌 Production Features
- RESTful API with FastAPI
- CORS enabled for cross-origin requests
- Pydantic data validation
- Comprehensive error handling
- Logging and monitoring

---

## 🛠️ Tech Stack

### Frontend
```
React 18 + Hooks
├─ Vite (Build Tool)
├─ TailwindCSS (Styling)
├─ Axios (HTTP Client)
└─ WebRTC (Media APIs)
```

### Backend
```
FastAPI + Uvicorn
├─ Pydantic (Data Validation)
├─ Transformers (HuggingFace Models)
├─ OpenCV (Computer Vision)
├─ Google Gemini (LLM)
└─ Google Speech-to-Text (Audio)
```

### ML Models
```
Text Emotion:     j-hartmann/emotion-english-distilroberta-base
Facial Emotion:   trpakov/vit-face-expression
Audio:            Google Speech-to-Text API
Chatbot:          Google Gemini 2.5 Flash
```

---

## 📁 Project Structure

```
emotional_chatbot/
├── 📁 backend/
│   ├── app.py                           # FastAPI main app
│   ├── requirements.txt                 # Backend deps
│   ├── 📁 models/
│   │   └── schemas.py                   # Pydantic models
│   ├── 📁 routes/
│   │   ├── chat.py                      # Chat endpoint
│   │   ├── audio.py                     # Audio transcription
│   │   └── emotion.py                   # Emotion detection
│   └── 📁 utils/
│       ├── emotion_fusion.py            # Emotion fusion logic
│       └── audio_handler.py             # Audio processing
│
├── 📁 frontend/
│   ├── package.json                     # Frontend deps
│   ├── vite.config.js                   # Vite config
│   ├── tailwind.config.js               # TailwindCSS config
│   ├── index.html                       # HTML entry
│   ├── 📁 public/                       # Static assets
│   └── 📁 src/
│       ├── main.jsx                     # React entry
│       ├── App.jsx                      # Main component
│       ├── index.css                    # Styles
│       └── 📁 components/
│           ├── ChatMessages.jsx         # Message display
│           ├── ChatInput.jsx            # Text input
│           ├── ModeSelector.jsx         # Mode selection
│           ├── EmotionDisplay.jsx       # Emotion viz
│           ├── CameraWindow.jsx         # Webcam feed
│           └── MicrophoneButton.jsx     # Voice recording
│
├── backend/services/
│   ├── chatbot_service.py
│   └── text_emotion_service.py
│
├── 📄 README.md                         # This file
├── 📄 SETUP_GUIDE.md                    # Detailed setup
├── 📄 QUICK_START.md                    # Quick start (5 min)
└── 📄 .env.example                      # Environment template
```

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- Python 3.9+
- Node.js 16+
- Microphone & Webcam
- Google Gemini API Key (free at [aistudio.google.com](https://aistudio.google.com))

### Setup

```bash
# 1️⃣ Backend Setup
cd c:\project\emotional_chatbot
python -m venv venv
venv\Scripts\activate
pip install -r backend/requirements.txt
pip install -r requirements.txt

# 2️⃣ Create .env file
# Add to c:\project\emotional_chatbot\.env:
# GEMINI_API_KEY=your_key_here
# API_PORT=8000

# 3️⃣ Start Backend (Terminal 1)
python -m uvicorn backend.app:app --reload

# 4️⃣ Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

### Access
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

---

## 📚 API Documentation

### Endpoints

#### POST /api/chat
Chat with emotion detection
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_message": "I feel great!",
    "mode": "text_only"
  }'
```

#### POST /api/audio
Transcribe audio
```bash
curl -X POST http://localhost:8000/api/audio \
  -F "file=@audio.wav"
```

#### GET /api/emotion/face
Get current facial emotion
```bash
curl http://localhost:8000/api/emotion/face
```

#### POST /api/fusion
Fuse emotions from multiple modalities
```bash
curl -X POST http://localhost:8000/api/fusion \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am happy",
    "face_emotion": "joy"
  }'
```

---

## 🎮 Using the Application

### Step 1: Select Chat Mode
Choose from 4 modes in the mode selector

### Step 2: Input Message
- **Text Only**: Type message → Send
- **Audio Only**: Click 🎤 → Speak → Stop
- **Face + Text**: Click camera, then type → Send
- **Face + Audio**: Click camera, then 🎤 → Speak

### Step 3: View Response
- Chatbot responds with empathetic message
- Emotion is detected and displayed
- Confidence scores shown

### Step 4: Analyze Emotion
- See emoji for detected emotion
- View confidence breakdown
- Watch face emotion if camera active

---

## 🔧 Configuration

### Backend Environment Variables
```env
# .env file in project root
GEMINI_API_KEY=your_google_gemini_api_key
API_PORT=8000
ENVIRONMENT=development
```

### Frontend Environment Variables
```env
# frontend/.env.local
VITE_API_URL=http://localhost:8000
```

---

## 📊 Emotion Detection Details

### Text Emotion Analysis
- **Model**: DistilRoBERTa (emotion-english)
- **Emotions**: joy, sadness, anger, fear, surprise, disgust, neutral
- **Method**: Transformer-based classification

### Facial Emotion Detection
- **Model**: Vision Transformer (ViT)
- **Input**: Live webcam feed
- **Performance**: Optimized inference every 10 frames
- **Emotions**: Happy, Neutral, Sad, Angry, Fearful, Disgusted, Surprised

### Audio Emotion Analysis
- **Method**: Transcribe audio + analyze text
- **API**: Google Speech-to-Text
- **Quality**: Works best with clear speech

### Emotion Fusion
- **Text weight**: 50%
- **Face weight**: 30%
- **Audio weight**: 20%
- **Result**: Weighted average of scores

---

## 🚀 Deployment

### Deploy Backend to Heroku
```bash
echo "web: uvicorn backend.app:app --host 0.0.0.0 --port \$PORT" > Procfile
heroku create app-name
git push heroku main
```

### Deploy Frontend to Vercel
```bash
npm install -g vercel
cd frontend
vercel
```

### Docker Deployment
```bash
# Build backend image
docker build -t chatbot-backend ./backend
docker run -p 8000:8000 --env-file .env chatbot-backend

# Build frontend image  
docker build -t chatbot-frontend ./frontend
docker run -p 5173:5173 chatbot-frontend
```

---

## ⚠️ Troubleshooting

### Backend Won't Start
```bash
# Check if port is in use
netstat -ano | findstr :8000

# Clear cache
pip cache purge

# Reinstall
pip install -r backend/requirements.txt
```

### Frontend Build Error
```bash
# Clear node modules
rm -r node_modules
npm install
npm run dev
```

### Camera/Microphone Not Working
1. Check browser permissions
2. Hard refresh (Ctrl+Shift+R)
3. Try HTTPS (required for some operations)

### API Connection Error
1. Verify backend running: `http://localhost:8000/health`
2. Check CORS settings in `backend/app.py`
3. Verify frontend API URL

### API Key Invalid
1. Get new key from [aistudio.google.com](https://aistudio.google.com)
2. Update `.env` file
3. Restart backend

---

## 📈 Performance Optimization

### Frontend
- ✅ Lazy loading components
- ✅ Optimized re-renders with React hooks
- ✅ Image optimization
- ✅ Code splitting with Vite

### Backend
- ✅ Lazy model loading
- ✅ Efficient inference scheduling
- ✅ Connection pooling
- ✅ Response caching

### Models
- ✅ DistilRoBERTa (70M params, fast)
- ✅ ViT face detection (skip frames optimization)
- ✅ Batch processing support

---

## 🔐 Security

- ✅ Environment variables for secrets
- ✅ CORS restricted to localhost
- ✅ Input validation with Pydantic
- ✅ Rate limiting ready (can add Slow API)
- ✅ Error messages don't expose internals

### To secure for production:
```python
# Update CORS origins in backend/app.py
origins = ["https://yourdomain.com"]

# Add rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

---

## 📝 Development Notes

### Adding New Features

**New Chat Mode:**
1. Add to `ModeType` enum in `schemas.py`
2. Add logic in `chat.py` route
3. Add UI in `ModeSelector.jsx`

**New Emotion Model:**
1. Create in `backend/utils/`
2. Add route in `emotion.py`
3. Update frontend components

**New Emotion Source:**
1. Add to fusion logic in `emotion_fusion.py`
2. Update weights if needed
3. Test fusion accuracy

---

## 🧪 Testing

```bash
# Test API endpoints
python -m pytest backend/tests/

# Test frontend components
npm run test

# E2E testing
npm run e2e
```

---

## 📚 Resources

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Transformers](https://huggingface.co/transformers)
- [Google Gemini API](https://ai.google.dev)

---

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- [ ] Add more emotion models
- [ ] Implement emotion history charts
- [ ] Add user preferences/settings
- [ ] Create mobile app (React Native)
- [ ] Add websocket support for real-time
- [ ] Implement user authentication
- [ ] Add conversation export

---

## 📄 License

MIT License - see LICENSE file for details

---

## ✅ Checklist

- [x] React frontend with modern UI
- [x] FastAPI backend with REST APIs
- [x] Text emotion detection
- [x] Facial emotion detection  
- [x] Audio transcription
- [x] Emotion fusion
- [x] Chatbot integration
- [x] Multiple chat modes
- [x] Real-time emotion display
- [x] Production-ready code
- [x] Comprehensive documentation
- [x] Error handling
- [x] CORS configuration
- [x] Environment setup guide

---

**Built with ❤️ using React + FastAPI + AI**

Questions? Check [SETUP_GUIDE.md](SETUP_GUIDE.md) or [QUICK_START.md](QUICK_START.md)
