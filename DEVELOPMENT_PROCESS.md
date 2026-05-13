# 🔧 Development Process

> This document outlines the step-by-step build process, key decisions made during development, and how technical challenges were solved.

---

## 🗺️ Build Phases

### Phase 1 — Project Setup

Establishing the foundation and folder structure.

| Step | Action |
|---|---|
| 1 | Initialized Vite + React + TypeScript project |
| 2 | Installed Tailwind CSS and configured custom theme colors |
| 3 | Set up folder structure: `src/pages`, `src/lib`, `src/context`, `src/components` |

---

### Phase 2 — Authentication

Building secure user sign-up and login flows.

| Step | Action |
|---|---|
| 1 | Created Supabase project and configured Auth settings |
| 2 | Built `Auth.tsx` with email/password login and sign-up |
| 3 | Added password strength indicator |
| 4 | Implemented email confirmation redirect via `/auth/callback` |
| 5 | Added Zod validation for all form inputs |
| 6 | Added toast notifications for user feedback |

---

### Phase 3 — Database & Chat

Setting up persistence and the core AI chat feature.

| Step | Action |
|---|---|
| 1 | Created `chat_sessions` and `messages` tables in Supabase |
| 2 | Enabled Row Level Security (RLS) policies on both tables |
| 3 | Built `Chat.tsx` with sidebar, message display, and input area |
| 4 | Integrated Groq API for AI responses |
| 5 | Implemented session creation, loading, and deletion |

---

### Phase 4 — UI/UX Improvements

Polishing the interface for usability across devices and themes.

| Step | Action |
|---|---|
| 1 | Added mobile-responsive sidebar with hamburger toggle |
| 2 | Implemented dark/light mode toggle with `localStorage` persistence |
| 3 | Added loading skeletons for the session list |
| 4 | Built reusable `ConfirmModal` component for delete confirmations |
| 5 | Created custom `NotFound` 404 page |
| 6 | Styled toast notifications to match the dark theme |

---

### Phase 5 — Advanced Features

Extending the app beyond basic chat.

| Feature | Implementation |
|---|---|
| 🧪 **Quiz Mode** | Mode toggle that switches the system prompt to generate MCQs |
| 📝 **Note Summarizer** | Dedicated mode for generating bullet-point summaries |
| 📤 **Chat Export** | Downloads chat history as `.txt` using Blob and an anchor tag |
| 🔀 **React Router** | Added routing for auth callback handling and 404 pages |

---

## 🧱 Challenges & Solutions

### Challenge 1 — Direct Supabase API Calls from Frontend

**Problem:**
The original checklist referenced API routes like `/api/chat-sessions`, but StudyAI is a Vite SPA with no custom backend server.

**Solution:**
Used the Supabase JS client directly from the frontend. Security is enforced entirely through Row Level Security (RLS) policies on the database — no backend layer needed.

```
Frontend → Supabase JS Client → Supabase (RLS enforced) → PostgreSQL
```

---

### Challenge 2 — Email Confirmation in an SPA

**Problem:**
Supabase email confirmation links contain OAuth hash fragments that need to be handled client-side.

**Solution:**
Created a dedicated `/auth/callback` route that calls `supabase.auth.getSession()` on load, extracts the session from the URL fragment, and redirects the user to the home page.

---

### Challenge 3 — Dark Mode with Hardcoded Colors

**Problem:**
The app used specific hex color values throughout components, making a global dark mode difficult to implement.

**Solution:**
- Configured Tailwind with `darkMode: 'class'`
- Created a `ThemeContext` that toggles a `.dark` class on the `<html>` element
- Replaced hardcoded colors with Tailwind dark-mode utility classes (`dark:bg-gray-900`, etc.)

---

### Challenge 4 — Mobile Sidebar Layout

**Problem:**
The sidebar was always visible and broke the layout on small screens, overlapping content.

**Solution:**
- Made the sidebar `position: fixed` with CSS `transform: translateX`
- Added a semi-transparent overlay behind the sidebar on mobile
- Added a hamburger toggle button that shows/hides the sidebar on small viewports

---

### Challenge 5 — Mode Switching (Chat / Quiz / Summarizer)

**Problem:**
Each AI mode required a different system prompt, placeholder text, and UI label — managing these as separate states became messy.

**Solution:**
Created a `mode` state backed by a **mode config object** that bundles all mode-specific properties together:

```typescript
const modeConfig = {
  chat: {
    label: 'Chat',
    prompt: '...chat system prompt...',
    placeholder: 'Ask a question...'
  },
  quiz: {
    label: 'Quiz',
    prompt: '...quiz system prompt...',
    placeholder: 'Enter a topic to generate a quiz...'
  },
  summarize: {
    label: 'Summarizer',
    prompt: '...summarizer system prompt...',
    placeholder: 'Paste your notes here...'
  }
}
```

Switching modes updates a single `mode` key, and all dependent UI and API behavior derives from `modeConfig[mode]`.
