# Development Process

## Step-by-Step Build Process

### Phase 1: Project Setup
1. Initialized Vite + React + TypeScript project
2. Installed Tailwind CSS and configured custom theme colors
3. Set up folder structure (`src/pages`, `src/lib`, `src/context`, `src/components`)

### Phase 2: Authentication
1. Created Supabase project and configured Auth
2. Built `Auth.tsx` with email/password login and sign-up
3. Added password strength indicator
4. Implemented email confirmation redirect (`/auth/callback`)
5. Added Zod validation for form inputs
6. Added toast notifications for user feedback

### Phase 3: Database & Chat
1. Created `chat_sessions` and `messages` tables in Supabase
2. Enabled Row Level Security (RLS) policies
3. Built `Chat.tsx` with sidebar, message display, and input
4. Integrated Groq API for AI responses
5. Implemented session creation, loading, and deletion

### Phase 4: UI/UX Improvements
1. Added mobile responsive sidebar with hamburger toggle
2. Implemented dark/light mode toggle with localStorage persistence
3. Added loading skeletons for session list
4. Built reusable `ConfirmModal` component for delete confirmation
5. Created custom `NotFound` 404 page
6. Added toast styling to match the dark theme

### Phase 5: Advanced Features
1. **Quiz Mode** – Toggle that changes system prompt to generate MCQs
2. **Note Summarizer** – Dedicated mode for bullet-point summaries
3. **Chat Export** – Download chat as `.txt` using Blob and anchor tag
4. **React Router** – Added routing for auth callback and 404 handling

## Challenges & Solutions

### Challenge 1: Direct Supabase API Calls from Frontend
**Problem**: The checklist mentioned API routes (`/api/chat-sessions`), but this is a Vite SPA without a backend.
**Solution**: Used Supabase client directly from the frontend with RLS policies for security.

### Challenge 2: Email Confirmation in SPA
**Problem**: Supabase email confirmation requires handling OAuth hash fragments.
**Solution**: Created `/auth/callback` route that calls `supabase.auth.getSession()` and redirects to home.

### Challenge 3: Dark Mode with Existing Hardcoded Colors
**Problem**: The app used specific hex colors everywhere.
**Solution**: Added Tailwind `darkMode: 'class'` config and a ThemeContext that toggles a class on `<html>`.

### Challenge 4: Mobile Sidebar
**Problem**: Sidebar was always visible and broke layout on small screens.
**Solution**: Made sidebar fixed with transform translate, added overlay, and hamburger toggle button.

### Challenge 5: Mode Switching
**Problem**: Quiz and Summarize modes needed different system prompts and UI states.
**Solution**: Added a `mode` state with a mode config object containing labels, prompts, and placeholder text.
