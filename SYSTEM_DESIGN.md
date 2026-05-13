# 🏗️ System Design

> This document describes the architecture, database schema, security model, and API flow of StudyAI.

---

## 🧩 Architecture Overview

StudyAI is a **Single-Page Application (SPA)** built with React and Vite. It communicates directly with two external services — no custom backend server is needed.

```
┌──────────────────────────────────────────────────────┐
│                    Client (React)                    │
│              Vite + TypeScript + Tailwind            │
└───────────────┬──────────────────────┬───────────────┘
                │                      │
                ▼                      ▼
   ┌────────────────────┐   ┌──────────────────────┐
   │      Supabase      │   │      Groq API        │
   │  Auth + PostgreSQL │   │  Llama 3.3 70B (LLM) │
   └────────────────────┘   └──────────────────────┘
```

| Service | Responsibility |
|---|---|
| **React + Vite** | UI rendering, routing, state management |
| **Supabase Auth** | User sign-up, login, email verification |
| **Supabase PostgreSQL** | Persistent storage of sessions and messages |
| **Groq API** | AI model inference (Llama 3.3 70B) |

---

## 🗄️ Database Schema

### Table: `chat_sessions`

Stores each user's study sessions.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` |
| `user_id` | `uuid` | Foreign Key → `auth.users(id)`, Not Null |
| `title` | `text` | Not Null |
| `created_at` | `timestamptz` | `default now()` |

---

### Table: `messages`

Stores individual messages within a session.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` |
| `session_id` | `uuid` | Foreign Key → `chat_sessions(id)`, Not Null |
| `role` | `text` | Not Null — `user` or `assistant` |
| `content` | `text` | Not Null |
| `created_at` | `timestamptz` | `default now()` |

---

### Relationships

```
auth.users
    │
    │ 1 : many
    ▼
chat_sessions
    │
    │ 1 : many
    ▼
messages
```

- One **user** can have many **chat sessions**
- One **chat session** can have many **messages**

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Users can **only access their own data**.

### `chat_sessions`

| Policy | Rule |
|---|---|
| `SELECT` | `auth.uid() = user_id` |
| `INSERT` | `auth.uid() = user_id` |
| `DELETE` | `auth.uid() = user_id` |

### `messages`

| Policy | Rule |
|---|---|
| `SELECT` | Session exists where `auth.uid() = user_id` AND `session_id = chat_sessions.id` |
| `INSERT` | Same as SELECT |
| `DELETE` | Same as SELECT |

> ✅ These policies ensure complete data isolation — no user can read, write, or delete another user's sessions or messages.

---

## 🔄 API Flow

The following describes the full lifecycle of a single message exchange:

```
User types message
        │
        ▼
1. Check if session exists
   └─ No → Create new row in chat_sessions
        │
        ▼
2. Insert user message into messages table
        │
        ▼
3. Send full conversation history to Groq API
        │
        ▼
4. Groq returns AI response (Llama 3.3 70B)
        │
        ▼
5. Insert assistant response into messages table
        │
        ▼
6. Render updated chat in UI
```

> The full conversation history is sent to Groq on every request to maintain context across the session.
