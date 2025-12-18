# Voca-Coach

**AI-Powered Voice & Emotional Intelligence Coaching Platform**

Voca-Coach is a comprehensive therapy and communication coaching application that helps users improve their vocal delivery, emotional awareness, and conversation skills through real-time AI feedback, biomarker tracking, and practice scenarios.

![Voca-Coach](./src/app/voca-coach-logo.png)

---

## 🎯 Features

### 1. **Live Session Recording** 
Real-time voice recording with AI-powered emotional analysis and coaching feedback.

- 🎙️ Browser-based audio recording
- 📊 Live arousal/stress level monitoring
- 🤖 AI-generated calming guidance using Google Gemini
- 🔊 Text-to-speech feedback with ElevenLabs
- 💾 Session history with calm scores and duration tracking

### 2. **Vocal Biomarker Analytics**
Track and visualize voice health patterns over time.

- 📈 Pitch variation tracking (Hz)
- ✨ Voice clarity scoring (0-100%)
- 😰 Stress indicator analysis
- 📅 7-day trend visualization
- 🧠 AI-generated health insights based on historical patterns

### 3. **Socratic Journal**
Reflective journaling with AI-powered Socratic questioning.

- 💬 Conversational chat interface
- 🔍 Automatic cognitive distortion detection
- 🎯 Socratic prompts to encourage self-reflection
- 💾 Persistent conversation history
- 🧘 Therapy-focused guidance

### 4. **AI Persona Practice**
Practice conversations with customizable AI personas.

- 🎭 Pre-built personas (Calm Mentor, Supportive Friend, Difficult Boss, Anxious Client)
- ✨ Create custom personas with specific personalities
- 💬 Real-time conversation with AI responses
- 🔊 Voice synthesis for persona responses
- 📝 Conversation history tracking

### 5. **User Dashboard**
Comprehensive overview of progress and statistics.

- 📊 Session count and average calm score
- 📓 Journal entry tracking
- 🔥 Streak monitoring
- 🎯 Points of improvement analysis
- 😊 Emotional analysis breakdown
- 📈 Live statistics panel

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **UI/UX**: Glassmorphism design with soft gradient backgrounds

### Backend
- **Runtime**: Node.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based with bcrypt password hashing

### AI & APIs
- **LLM**: Google Gemini 2.0 Flash (`gemini-2.0-flash-exp`)
- **Text-to-Speech**: ElevenLabs API (`eleven_flash_v2_5`)
- **Voice Analysis**: Custom tone analysis with AI

### Database Schema
- **Users**: Authentication and user profiles
- **Sessions**: De-escalation session records
- **JournalEntries**: Reflective journal logs
- **Biomarkers**: Vocal health metrics
- **CustomPersonas**: User-created AI personas

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- ElevenLabs API key ([Get one here](https://elevenlabs.io))
- Google Vertex AI API key ([Get one here](https://ai.google.dev))

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/voca-coach.git](https://github.com/cemeiq12/voca-coach)
   cd voca-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./prisma/dev.db"
   
   # JWT Secret (generate a random string)
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   
   # ElevenLabs API
   ELEVENLABS_API_KEY="your-elevenlabs-api-key"
   
   # Google Vertex AI
   GOOGLE_VERTEX_AI_API_KEY="your-google-api-key"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
voca-coach/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── voca-coach-logo.png    # App logo
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── sessions/      # Session management
│   │   │   ├── biomarkers/    # Biomarker data
│   │   │   ├── journal/       # Journal entries
│   │   │   ├── personas/      # Persona management
│   │   │   ├── analyze-tone/  # Voice analysis
│   │   │   ├── analyze-trends/# Trend analysis
│   │   │   ├── journal-insight/# Socratic prompting
│   │   │   ├── persona-chat/  # Persona conversations
│   │   │   └── tts/           # Text-to-speech
│   │   ├── dashboard/         # User dashboard
│   │   ├── de-escalation/     # Live session page
│   │   ├── biomarkers/        # Analytics page
│   │   ├── journal/           # Journaling page
│   │   ├── persona/           # Persona practice page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── ProfileDropdown.tsx# User profile menu
│   │   ├── ProfilePictureUpload.tsx # Profile pic handler
│   │   ├── StatusBadge.tsx    # Status indicators
│   │   ├── CircularProgress.tsx # Progress charts
│   │   ├── EmotionScale.tsx   # Emotion visualization
│   │   ├── LiveStatsPanel.tsx # Statistics panel
│   │   └── UserProfileCard.tsx# User info card
│   ├── hooks/
│   │   └── useAuth.tsx        # Authentication hook
│   └── lib/
│       ├── prisma.ts          # Prisma client
│       ├── auth.ts            # Auth utilities
│       └── vertex.ts          # Google Gemini client
└── package.json
```

---

## 🎨 Design Philosophy

Voca-Coach features a modern, therapy-oriented design with a cohesive branding system:

### Color Palette
- **Primary Blue**: `#38B8FF` - Vibrant, energetic blue for primary actions
- **Purple**: `#8B5EFF` - Calm, professional purple for emphasis
- **Cyan**: `#7AEFFF` - Fresh, soothing cyan for accents
- **Light Variations**: Softer shades for backgrounds and gradients

### Typography
- **Font Family**: Inter
  - **Headings**: Inter ExtraBold (36px)
  - **Subheadings**: Inter Bold (28px)
  - **Paragraphs**: Inter Semibold (16px)

### UI Elements
- **Soft Gradient Background**: Calming blue → purple → pink transitions
- **Glassmorphism UI**: Frosted glass cards with backdrop blur
- **Clean Design**: Professional iconography without emojis
- **Consistent Navigation**: Unified navbar across all pages
- **Profile Dropdown**: Easy access to settings and logout

---

## 🔐 Authentication

JWT-based authentication with:
- Secure password hashing using bcrypt
- Protected API routes
- Client-side auth hook (`useAuth`)
- Automatic redirect for unauthenticated users

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Sessions
- `POST /api/sessions` - Save session data
- `GET /api/sessions` - Get user sessions

### Biomarkers
- `POST /api/biomarkers` - Save biomarker data
- `GET /api/biomarkers` - Get biomarker history

### Journal
- `POST /api/journal` - Save journal entry
- `GET /api/journal` - Get journal entries

### Personas
- `GET /api/personas` - Get user personas
- `POST /api/personas` - Create custom persona

### AI Analysis
- `POST /api/analyze-tone` - Analyze voice tone with AI
- `POST /api/analyze-trends` - Generate insights from trends
- `POST /api/journal-insight` - Get Socratic prompts
- `POST /api/persona-chat` - Chat with AI persona
- `POST /api/tts` - Convert text to speech

### Statistics
- `GET /api/stats` - Get user dashboard statistics

---

## 🧪 Usage Examples

### Starting a Live Session
1. Navigate to "Live Session" from the navbar
2. Click "Start Recording" to begin
3. Speak naturally while monitoring your arousal level
4. Click "Stop Recording" to receive AI feedback
5. Listen to the AI-generated guidance
6. Save your session to track progress

### Tracking Biomarkers
1. Complete live sessions to generate biomarker data
2. Navigate to "Analytics" to view trends
3. Review 7-day charts for pitch, clarity, and stress
4. Read AI-generated health insights
5. Monitor progress with circular progress indicators

### Using the Socratic Journal
1. Navigate to "Journal" from the navbar
2. Type your thoughts and feelings
3. Receive Socratic questions from the AI
4. Engage in reflective conversation
5. Review detected cognitive distortions

### Practicing with Personas
1. Navigate  to "Persona" from the navbar
2. Select a preset persona or create a custom one
3. Click "Start Conversation"
4. Chat with the AI persona
5. Listen to voice responses
6. End the conversation when finished

---

## 🌈 Design Features

### Components

#### ProfileDropdown
- User info display
- Profile picture upload
- Navigation links
- Sign out button

#### StatusBadge
- Color-coded status indicators (success, warning, info, overtime)
- Clean pill-shaped design
- Icon support

#### CircularProgress
- Animated SVG progress circles
- Customizable colors
- Percentage display with labels

#### EmotionScale
- Text-based emotion indicators
- Progress bar visualization
- Frequency tracking

---

## 🚧 Future Enhancements

- [ ] Mobile app version (React Native)
- [ ] Advanced voice analysis with ML models
- [ ] Group therapy session support
- [ ] Export session reports (PDF)
- [ ] Integration with calendar apps
- [ ] Gamification with achievements
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Real-time collaboration features
- [ ] Wearable device integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI language understanding
- **ElevenLabs** for natural text-to-speech synthesis
- **Next.js** team for an amazing framework
- **Prisma** for elegant database management

---

## 📞 Support

For questions or support, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for better communication and emotional well-being**
