# System Design

## Architecture Overview

StudyAI is a single-page application (SPA) built with React and Vite. It communicates directly with:

1. **Supabase** – Authentication and PostgreSQL database
2. **Groq API** – AI model inference (Llama 3.3 70B)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│   Supabase   │     │   Groq API  │
│  (React)    │◀────│  (Auth + DB) │     │  (AI Chat)  │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Database Schema

### Tables

#### `chat_sessions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK → auth.users(id), not null |
| title | text | not null |
| created_at | timestamptz | default now() |

#### `messages`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| session_id | uuid | FK → chat_sessions(id), not null |
| role | text | not null (user / assistant) |
| content | text | not null |
| created_at | timestamptz | default now() |

### Relationships

```
auth.users ||--o{ chat_sessions : owns
chat_sessions ||--o{ messages : contains
```

## Row Level Security (RLS) Policies

### `chat_sessions`
- **Select**: `auth.uid() = user_id`
- **Insert**: `auth.uid() = user_id`
- **Delete**: `auth.uid() = user_id`

### `messages`
- **Select**: Exists select on chat_sessions where `auth.uid() = user_id` and `session_id = chat_sessions.id`
- **Insert**: Same as above
- **Delete**: Same as above

These policies ensure users can only access their own chat sessions and messages.

## API Flow

1. User sends a message
2. Frontend creates a `chat_sessions` row if none exists
3. Frontend inserts the user message into `messages`
4. Frontend sends the full conversation to Groq API
5. Groq returns the AI response
6. Frontend inserts the assistant message into `messages`
