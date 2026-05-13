# 🎓 StudyAI

> An AI-powered study companion built for Computer Engineering students.

StudyAI helps you understand complex topics, generate quizzes, summarize notes, and track your learning sessions — all in one place.

**🔗 Live Demo:** https://study-ai-pearl-nu.vercel.app
**📁 Repository:** https://github.com/JushouaS/study-ai

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat** | Ask questions about data structures, algorithms, OS, networks, OOP, and more |
| 🧪 **Quiz Mode** | Auto-generate multiple-choice quizzes on any topic |
| 📝 **Note Summarizer** | Paste long notes and get concise bullet-point summaries |
| 💾 **Session Management** | Create, load, rename, and delete chat sessions |
| 📤 **Export Chats** | Download any session as a `.txt` file |
| 🌙 **Dark Mode** | Toggle between dark and light themes |
| 📱 **Mobile Responsive** | Collapsible sidebar optimized for mobile devices |
| 🔐 **Auth & Security** | Secure sign-up with Supabase email verification |
| ✅ **Input Validation** | Zod-powered validation with user-friendly error messages |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Auth + Database | Supabase |
| AI Model | Groq API (Llama 3.3 70B) |
| Validation | Zod |
| Routing | React Router DOM |
| Notifications | Sonner (Toasts) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JushouaS/study-ai.git
   cd study-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

---

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | ✅ |
| `VITE_GROQ_API_KEY` | Your Groq API key for LLM access | ✅ |

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## ☁️ Deployment

This app is deployed on **Vercel** with automatic deployments on push to `main`.

### Manual Deploy
```bash
npm run build       # builds to /dist
vercel --prod       # deploy to production
```

### Vercel Config (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This ensures client-side routing works correctly on all routes.

> Make sure to add all environment variables in **Vercel Dashboard → Settings → Environment Variables**.

---

## 🌿 Branching Strategy

```
main          ← Production (auto-deploys to Vercel)
 └── dev       ← Integration branch
      └── feature/*   ← Individual feature branches
```

**Workflow:**
1. Branch off `dev` → `feature/your-feature`
2. Open a Pull Request into `dev`
3. After review, merge `dev` → `main` to deploy

---

## 📚 Documentation

Detailed documentation is available in the project root:

| File | Description |
|---|---|
| [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) | High-level project goals and scope |
| [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) | Architecture and system design decisions |
| [`AI_COMPONENT_EXPLANATION.md`](./AI_COMPONENT_EXPLANATION.md) | How the AI/LLM integration works |
| [`DEVELOPMENT_PROCESS.md`](./DEVELOPMENT_PROCESS.md) | Development workflow and conventions |
| [`TEAM_CONTRIBUTION.md`](./TEAM_CONTRIBUTION.md) | Team members and individual contributions |

---

## 📄 License

This project was built as an academic project for Computer Engineering students.
