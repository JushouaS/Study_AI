# StudyAI

An AI-powered study companion built for Computer Engineering students. StudyAI helps you understand complex topics, generates quizzes, summarizes notes, and keeps track of your learning sessions.

## Features

- **AI Chat** – Ask questions about data structures, algorithms, OS, networks, OOP, and more
- **Quiz Mode** – Generate multiple-choice quizzes on any topic
- **Note Summarizer** – Paste long notes and get concise bullet-point summaries
- **Session Management** – Create, load, and delete chat sessions
- **Export Chats** – Download any chat session as a `.txt` file
- **Dark Mode Toggle** – Switch between dark and light themes
- **Mobile Responsive** – Collapsible sidebar for mobile devices
- **Email Confirmation** – Secure sign-up with Supabase email verification
- **Zod Validation** – Input validation with user-friendly error messages

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth + Database)
- Groq API (Llama 3.3 70B)
- Zod (Validation)
- React Router DOM
- Sonner (Toasts)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_GROQ_API_KEY` | Your Groq API key |

## Deployment

The app is deployed on Vercel. Push to the `main` branch to trigger auto-deployment.

- **Live Demo**: [https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)
- **GitHub**: [https://github.com/yourusername/study-ai](https://github.com/yourusername/study-ai)

## Branching Strategy

- `main` – Production branch
- `dev` – Integration branch
- `feature/*` – Feature branches

Use Pull Requests to merge into `dev`, then merge `dev` into `main`.

## Documentation

See the project documentation in the root directory:

- `PROJECT_OVERVIEW.md`
- `SYSTEM_DESIGN.md`
- `AI_COMPONENT_EXPLANATION.md`
- `DEVELOPMENT_PROCESS.md`
- `TEAM_CONTRIBUTION.md`
