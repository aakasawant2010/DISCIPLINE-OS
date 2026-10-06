# ⚡ DISCIPLINE OS

### Your AI-powered personal operating system.

> **Don't just track your life. Understand it.**

DISCIPLINE OS is an AI-powered self-reflection and personal growth platform designed to help you understand your **behavior, habits, health, emotions, discipline, goals, and long-term patterns**.

Instead of simply tracking what you did, DISCIPLINE OS asks a harder question:

> **Are your daily actions actually turning you into the person you want to become?**

The application combines structured daily reflection, AI analysis, behavioral pattern detection, personal goals, historical journal search, weekly/monthly reviews, and the **MIRROR** — an AI-powered analysis of the gap between who you say you want to be and what your behavior demonstrates.

---

## 🧠 Why DISCIPLINE OS?

Most productivity apps tell you:

> "Complete your habits."

DISCIPLINE OS asks:

> **"Why didn't you?"**

Most journaling apps store your thoughts.

DISCIPLINE OS analyzes them.

Most fitness apps show you numbers.

DISCIPLINE OS helps you understand what those numbers might mean in the context of your day.

The goal isn't to create another app you become addicted to checking.

The goal is to create a system that helps you become **more self-aware, disciplined, intentional, and consistent.**

---

# ✨ Core Features

## 🪞 1. The Mirror

The signature feature of DISCIPLINE OS.

**THE MIRROR** analyzes your historical reflections, goals, memories, and behavioral data to reveal:

- Who you say you want to be
- What your actions suggest about you
- The gap between intention and behavior
- Your strongest trait
- Your biggest recurring pattern
- Potential blind spots
- Concrete actions to take next

### Example

```text
WHO YOU SAY YOU WANT TO BE
A disciplined, high-performing individual.

WHO YOUR ACTIONS SAY YOU ARE
Someone who executes strongly in the morning but
struggles with sustained focus during difficult
afternoon work.

THE GAP
Your intentions are strong, but your behavior becomes
less consistent when tasks become ambiguous.

WHAT TO DO NEXT
1. Remove your phone during deep-work blocks.
2. Start difficult tasks before low-friction activities.
3. Define tomorrow's three non-negotiables tonight.
```

---

# 🔥 2. Daily Reflection

A structured reflection experience designed to go beyond traditional journaling.

Reflect on:

- Accomplishments
- Avoidance
- Distractions
- Focus
- Sleep
- Energy
- Exercise
- Nutrition
- Emotional state
- Relationships
- Personal growth
- Self-honesty

The AI turns your answers into an actionable daily assessment.

---

# 🤖 3. AI Daily Verdict

After completing your reflection, DISCIPLINE OS generates an AI-powered assessment containing:

### YOUR WIN
Your biggest genuine accomplishment.

### YOUR MISS
Where you fell short.

### YOUR PATTERN
A recurring behavior visible from your answers.

### YOUR BLIND SPOT
A potential issue you may not be noticing.

### YOUR SCORES

- Discipline
- Focus
- Health
- Relationships
- Learning
- Personal Growth
- Mood
- Overall Day

### TOMORROW

- One thing to win
- Three non-negotiables
- One thing to stop
- One thing to start
- One promise to yourself

---

# 🧨 4. Brutal Honesty Mode

DISCIPLINE OS has two reflection personalities:

### NORMAL MODE

Thoughtful, empathetic, constructive and analytical.

### BRUTAL MODE

Direct.

Uncomfortable.

Respectful.

No motivational clichés.

No unnecessary sugar coating.

No insults.

No shame.

The goal is to challenge the difference between **what you say and what you actually do**.

---

# 📊 5. Personal Analytics

Track your personal performance across multiple dimensions:

| Area | What it represents |
|---|---|
| Discipline | Consistency and execution |
| Focus | Attention and deep work |
| Health | Sleep, exercise and physical wellbeing |
| Learning | Growth and skill development |
| Relationships | Connection and interpersonal behavior |
| Mood | Emotional state |
| Personal Growth | Alignment with long-term goals |

View trends across your personal history instead of judging yourself based on a single day.

---

# 🔎 6. Journal Intelligence

Your historical reflections become searchable.

Ask questions like:

```text
What excuses do I keep repeating?

When was I happiest?

When was I most productive?

What keeps distracting me?

What problems keep appearing?

When did I last mention procrastination?

What patterns have appeared over the last month?
```

The AI searches your reflection history and provides answers grounded in the available data.

If there isn't enough information, the system is designed to say so instead of inventing an answer.

---

# 📅 7. Weekly Review

At the end of the week, DISCIPLINE OS analyzes your recent reflections and generates:

- Best day
- Worst day
- Average score
- Biggest win
- Biggest mistake
- Most common distraction
- Most productive behavior
- Emotional trend
- Fitness trend
- Learning trend
- Sleep trend
- Discipline trend

Then creates:

### KEEP
What is working.

### STOP
What is hurting progress.

### START
What needs to change.

### ONE BIG GOAL
The most important objective for the following week.

---

# 🗓️ 8. Monthly Personal Audit

The monthly review asks:

# 30 DAYS. WHO DID YOU BECOME?

Compare your progress and identify:

- What improved
- What declined
- What repeated
- What you're avoiding
- What you should double down on
- What you should let go of

The system also creates a forward-looking projection:

> **If you continue behaving exactly like this for the next 12 months, where will you end up?**

---

# 💬 9. AI Reflection Coach

DISCIPLINE OS includes a conversational AI coach capable of maintaining reflection context.

The AI can consider:

- Today's reflection
- Goals
- Behavioral patterns
- Memories
- Commitments
- Available biometric context
- Previous conversation

Instead of simply answering questions, it can challenge assumptions and end reflections with a concrete question or action.

---

# 🧠 10. Personal Memory

DISCIPLINE OS can maintain meaningful context around your personal development.

Examples:

- Goals
- Commitments
- Recurring challenges
- Important habits
- Personal priorities

The objective is to make the AI increasingly useful as more reflection history becomes available.

---

# ❤️ 11. Health & Wearable Context

DISCIPLINE OS is designed to work with health and wearable data such as WHOOP.

The idea is simple:

```text
HEALTH DATA
     ↓
DAILY CONTEXT
     ↓
REFLECTION
     ↓
AI ANALYSIS
     ↓
BEHAVIORAL INSIGHTS
```

Instead of looking at health metrics in isolation, the system can use them as additional context when evaluating the user's day.

---

# 🏗️ Architecture

DISCIPLINE OS uses a modern full-stack architecture:

```text
┌──────────────────────────────┐
│          React UI            │
│        TypeScript            │
│          Vite                │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Express Backend        │
│          server.ts           │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ Gemini API   │  │ Fallback     │
│ AI Engine    │  │ Rule Engine  │
└──────────────┘  └──────────────┘
```

The backend keeps the Gemini API integration server-side through `GEMINI_API_KEY`. The repository uses the Google GenAI SDK and Express for the server layer.

---

# 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion

### Backend

- Node.js
- Express
- TypeScript
- TSX
- dotenv

### AI

- Google Gemini
- `@google/genai`
- Structured JSON AI responses
- Rule-based fallback engine

The current repository's `package.json` confirms these core dependencies and development tooling.

---

# ⚙️ Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/aakasawant2010/DISCIPLINE-OS.git

cd DISCIPLINE-OS
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

Do **not** commit your `.env` file.

The repository already includes an `.env.example` file for environment configuration.

## 4. Start the development server

```bash
npm run dev
```

The application will be available through the local development server.

---

# 📦 Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the frontend and backend.

```bash
npm start
```

Starts the production server.

```bash
npm run preview
```

Runs the Vite production preview.

```bash
npm run lint
```

Runs TypeScript validation.

```bash
npm run clean
```

Removes generated build artifacts.

These commands are defined in the repository's current `package.json`.

---

# 🔌 API Architecture

The backend exposes dedicated AI endpoints for different parts of the experience.

### Daily Reflection

```http
POST /api/reflect/analyze
```

Analyzes daily reflection answers and returns structured insights and scores.

### The Mirror

```http
POST /api/mirror/generate
```

Analyzes historical reflections, goals and memories to generate the personal MIRROR.

### Journal Search

```http
POST /api/search/ask
```

Allows users to query their historical reflections.

### Weekly Review

```http
POST /api/review/weekly
```

Generates a structured weekly personal review.

### Monthly Review

```http
POST /api/review/monthly
```

Generates a 30-day personal audit.

### Reflection Chat

```http
POST /api/chat
```

Provides the conversational AI reflection coach.

These endpoints and their AI workflows are implemented in the current Express server.

---

# 🛡️ AI Reliability

DISCIPLINE OS is designed to avoid blindly trusting generated output.

The AI instructions emphasize:

- No fabricated historical information
- No invented dates
- No unsupported behavioral patterns
- Explicitly acknowledge insufficient data
- Structured JSON responses
- Graceful error handling
- Rule-based fallback when the Gemini API is unavailable

The backend also includes a deterministic fallback reflection engine when an AI API key is unavailable.

---

# 🔐 Security

Never commit secrets such as:

```text
.env
GEMINI_API_KEY
WHOOP_CLIENT_SECRET
WHOOP_REFRESH_TOKEN
API keys
OAuth credentials
```

Use environment variables or a secure secret-management solution.

For production deployment, keep API credentials on the server rather than exposing private credentials in frontend code.

---

# 🎯 Product Philosophy

DISCIPLINE OS is built around one principle:

> **Your intentions don't define you. Your repeated actions do.**

The application isn't designed to tell users that they're doing great.

It is designed to help them see themselves clearly.

### Awareness → Reflection → Pattern → Decision → Action → Growth

---

# 🗺️ Roadmap

Potential future improvements:

- [ ] Full WHOOP OAuth integration
- [ ] Long-term behavioral pattern engine
- [ ] Vector-based semantic journal search
- [ ] Advanced personal memory system
- [ ] Calendar integration
- [ ] Screen-time integration
- [ ] Apple Health integration
- [ ] Google Fit integration
- [ ] Goal progress intelligence
- [ ] AI-generated personal reports
- [ ] PDF personal performance reports
- [ ] Mobile application
- [ ] Push notifications
- [ ] Secure authentication
- [ ] Cloud synchronization
- [ ] Advanced privacy controls
- [ ] Personal AI agent
- [ ] MCP-based integrations

---

# 🧪 Project Status

**Status: Active Development**

DISCIPLINE OS is currently an evolving personal productivity and self-reflection platform.

The architecture is intentionally designed to allow additional AI capabilities, integrations and behavioral intelligence to be added over time.

---

# 🤝 Contributing

Contributions, ideas and improvements are welcome.

```bash
git checkout -b feature/your-feature

git add .

git commit -m "feat: add your feature"

git push origin feature/your-feature
```

Then open a Pull Request.

---

# ⚠️ Disclaimer

DISCIPLINE OS is a personal reflection and productivity tool.

It is **not a medical device, therapist, psychologist, doctor, or diagnostic system**.

AI-generated insights should be treated as reflections and suggestions rather than professional medical or psychological advice.

---

# 👨‍💻 Author

**Akash Sawant**

Generative AI Engineer | AI Application Developer

GitHub:  
https://github.com/aakasawant2010

---

# ⭐ Support

If you find DISCIPLINE OS interesting, consider giving the repository a ⭐ on GitHub.

It helps the project grow.

---

## ⚡ DISCIPLINE OS

> **Don't just track your life.**
>
> **Understand it.**
>
> **Confront it.**
>
> **Change it.**
>
> **Become who you said you would become.**
