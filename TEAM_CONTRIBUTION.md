# 👥 Team Contribution

> StudyAI was developed as a team project for Computer Engineering students.
> This document outlines each member's role, responsibilities, and contributions throughout the development lifecycle.

---

## 📋 Team Overview

| Member | Role | Primary Area |
|---|---|---|
| **Jushoua Oswald G. Santos** |  Full-Stack Developer & Team Lead | Architecture · AI · Database · DevOps · Docs |
| Ong, Lorenz Althea | Frontend Developer | UI Components |
| Tolentino, David Ysrael | AI Support | Prompt Research |
| Seguis, Jelord | Backend Support | Database Setup |
| Yañez, Carmina Ylessa | Frontend Developer | Styling |
| Yañez, Sabriel Anne | UI/UX Designer | Design & Layout |

---

## 🏆 Lead Developer — Jushoua Oswald G. Santos

The architecture, core implementation, and documentation of StudyAI was primarily driven by the team lead. Below is a complete breakdown of all contributions:

---

### 1. 🖥️ Frontend Development

> Built the entire user-facing application from scratch.

- Developed all core React components — `Auth.tsx`, `Chat.tsx`, `NotFound.tsx`, `AuthCallback.tsx`
- Implemented fully responsive design using Tailwind CSS for desktop and mobile
- Created reusable components — `ConfirmModal.tsx`, `SessionSkeleton.tsx`, `ErrorBoundary.tsx`
- Configured React Router DOM for SPA navigation, protected routes, and 404 handling

---

### 2. 🗄️ Backend & Database

> Designed and secured the full data layer using Supabase.

- Configured and managed the Supabase project from scratch
- Designed the complete database schema — `chat_sessions` and `messages` tables
- Implemented Row Level Security (RLS) policies to ensure strict per-user data isolation
- Integrated Supabase Auth with email/password login and email confirmation callback

---

### 3. 🤖 AI Integration

> Integrated and fine-tuned the AI model powering all three study modes.

- Connected the Groq API using the Llama 3.3 70B model for fast AI inference
- Engineered all three system prompts — **Chat**, **Quiz**, and **Note Summarizer** modes
- Built the full message history pipeline to maintain conversation context across sessions
- Implemented robust error handling for API failures — `401`, `429`, `500`, and network timeouts

---

### 4. ⚙️ DevOps & Tooling

> Managed the build pipeline and production deployment.

- Configured the Vite build pipeline with TypeScript, Tailwind CSS, and path aliases
- Managed environment variables via `.env` and Vercel environment settings
- Authored `vercel.json` with SPA rewrite rules for correct client-side routing
- Deployed and maintained the production build on Vercel

---

### 5. 📄 Documentation

> Authored all project documentation end-to-end.

- Wrote `README.md` with full setup, environment, and deployment instructions
- Created `PROJECT_OVERVIEW.md`, `SYSTEM_DESIGN.md`, `AI_COMPONENT_EXPLANATION.md`
- Wrote `DEVELOPMENT_PROCESS.md` covering all build phases and technical challenges
- Authored this `TEAM_CONTRIBUTION.md` file

---

## 🤝 Supporting Members

Each team member provided focused assistance in their respective areas during the development process.

| Member | Area | Contribution |
|---|---|---|
| **Ong, Lorenz Althea** | Frontend | Assisted with UI component implementation and layout adjustments |
| **Tolentino, David Ysrael** | AI | Helped research prompt engineering approaches for Quiz and Summarizer modes |
| **Seguis, Jelord** | Backend | Assisted with initial Supabase table setup and migration testing |
| **Yañez, Carmina Ylessa** | Frontend | Contributed to styling refinements and Tailwind class adjustments |
| **Yañez, Sabriel Anne** | UI/UX | Provided design input on layout, color scheme, and mobile responsiveness |

---

## ⏱️ Time Investment

**Total estimated time: 40+ hours**

| Phase | Lead | Team Support | Estimated Time |
|---|---|---|---|
| Planning & Architecture | Jushoua | All members | ~4 hrs |
| Authentication & Database | Jushoua | Seguis | ~8 hrs |
| Core Chat & AI Integration | Jushoua | Tolentino | ~10 hrs |
| UI/UX & Responsive Design | Jushoua | Ong, Yañez C., Yañez S. | ~8 hrs |
| Advanced Features | Jushoua | — | ~6 hrs |
| Testing & Debugging | Jushoua | All members | ~4 hrs |
| Documentation | Jushoua | — | ~4 hrs |
| **Total** | | | **~44 hrs** |

---

> 💡 *This project was a valuable hands-on experience in full-stack development, AI integration, and production deployment for the entire team.*
