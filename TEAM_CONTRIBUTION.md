# 👥 Team Contribution

> This document outlines the roles and contributions of each team member in the development of StudyAI.

---

## 📋 Project: StudyAI

| Member | Role | Responsibility |
|---|---|---|
| **Jushoua Oswald G. Santos** | Full-Stack Developer & Team Lead | Architecture, core implementation, AI integration, database design, DevOps, documentation |
| Ong, Lorenz Althea | Frontend Developer | UI component support |
| Tolentino, David Ysrael | AI Support | Prompt research assistance |
| Seguis, Jelord | Backend Support | Database setup assistance |
| Yañez, Carmina Ylessa | Frontend Developer | Styling support |
| Yañez, Sabriel Anne | UI/UX | Design input and layout suggestions |

---

## 🏆 Lead Developer — Jushoua Oswald G. Santos

The majority of the project was designed, built, and documented by the team lead. Below is a full breakdown of contributions:

### 1. 🖥️ Frontend Development
- Built all core React components — `Auth.tsx`, `Chat.tsx`, `NotFound.tsx`, `AuthCallback.tsx`
- Implemented fully responsive design using Tailwind CSS
- Created reusable components — `ConfirmModal.tsx`, `SessionSkeleton.tsx`, `ErrorBoundary.tsx`
- Set up React Router DOM for SPA navigation and route handling

### 2. 🗄️ Backend & Database
- Configured and managed the Supabase project
- Designed the full database schema (`chat_sessions`, `messages` tables)
- Implemented Row Level Security (RLS) policies for data isolation
- Integrated Supabase Auth with email confirmation and callback handling

### 3. 🤖 AI Integration
- Integrated the Groq API with the Llama 3.3 70B model
- Engineered all three system prompts — Chat, Quiz, and Note Summarizer modes
- Implemented robust error handling for API failures (401, 429, 500, network errors)

### 4. ⚙️ DevOps & Tooling
- Configured the Vite build pipeline with TypeScript and Tailwind
- Managed environment variables and `.env` setup
- Configured `vercel.json` and deployed the production build to Vercel

### 5. 📄 Documentation
- Wrote the full `README.md` with setup and deployment instructions
- Authored all project documentation files
- Documented system design, AI architecture, and development process

---

## 🤝 Supporting Members

| Member | Area | Contribution |
|---|---|---|
| Ong, Lorenz Althea | Frontend | Assisted with UI component implementation and layout adjustments |
| Tolentino, David Ysrael | AI | Helped research prompt engineering approaches for quiz and summarizer modes |
| Seguis, Jelord | Backend | Assisted with initial Supabase table setup and migration testing |
| Yañez, Carmina Ylessa | Frontend | Contributed to styling and Tailwind class adjustments |
| Yañez, Sabriel Anne | UI/UX | Provided design input on layout, color scheme, and mobile responsiveness |

---

## ⏱️ Time Investment

**Total estimated time: 40+ hours**

| Phase | Estimated Time |
|---|---|
| Planning & Architecture | ~4 hrs |
| Authentication & Database | ~8 hrs |
| Core Chat & AI Integration | ~10 hrs |
| UI/UX & Responsive Design | ~8 hrs |
| Advanced Features | ~6 hrs |
| Testing & Debugging | ~4 hrs |
| Documentation | ~4 hrs |
