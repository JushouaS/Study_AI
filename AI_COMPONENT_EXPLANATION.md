# 🤖 AI Component Explanation

> This document explains how StudyAI integrates with the Groq API, how prompts are engineered for each mode, and how errors are handled gracefully.

---

## ⚡ Groq API Integration

StudyAI uses the **Groq API** to run inference on the **Llama 3.3 70B** model. Groq provides ultra-fast inference speeds and is fully compatible with the OpenAI API format — making it a drop-in replacement.

| Property | Value |
|---|---|
| **Provider** | Groq |
| **Model** | `llama-3.3-70b-versatile` |
| **API Format** | OpenAI-compatible |
| **Max Tokens** | 1024 per response |
| **Endpoint** | `POST https://api.groq.com/openai/v1/chat/completions` |

---

### Request Structure

Every request sends the full conversation history to maintain context across the session:

```typescript
{
  model: 'llama-3.3-70b-versatile',
  max_tokens: 1024,
  messages: [
    { role: 'system', content: '<mode-specific system prompt>' },  // sets AI behavior
    ...previousMessages,                                            // full history for context
    { role: 'user', content: '<latest user input>' }               // current message
  ]
}
```

---

### Authentication

The API key is stored securely in a `.env` file and injected at build time via Vite's environment variable system:

```typescript
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
```

> ⚠️ The `.env` file is gitignored and must be added manually in **Vercel → Settings → Environment Variables** before deploying.

---

## 🧠 Prompt Engineering

StudyAI uses three distinct **system prompts** — one per AI mode. The active mode determines which prompt is sent at the start of every request, shaping the model's behavior and response format.

---

### 1. 💬 Chat Mode

General-purpose study assistant for Computer Engineering topics.

```
You are StudyAI, a helpful and friendly AI study assistant specialized in Computer Engineering.
Help students understand topics like data structures, algorithms, operating systems,
computer networks, digital systems, OOP, and circuit theory. Quiz them, explain concepts
clearly, and be encouraging and concise.
```

**Best for:** Concept explanations, follow-up questions, exam prep discussions.

---

### 2. 🧪 Quiz Mode

Generates structured multiple-choice quizzes on any topic.

```
You are StudyAI Quiz Mode. For every user prompt, generate a multiple-choice quiz with
4 options (A, B, C, D) related to the topic. Include the correct answer at the end.
Make questions challenging but fair for Computer Engineering students. Format clearly with markdown.
```

**Best for:** Self-testing, exam practice, knowledge reinforcement.

**Example output format:**
```
**Question:** What is the time complexity of binary search?

A) O(n)
B) O(log n)
C) O(n²)
D) O(1)

**Answer:** B) O(log n)
```

---

### 3. 📝 Note Summarizer Mode

Condenses pasted lecture notes or textbook content into structured bullet points.

```
You are StudyAI Note Summarizer. Take the user's pasted text and summarize it into
clear, concise bullet points. Highlight key concepts, definitions, and important details.
Keep it structured and easy to study from.
```

**Best for:** Summarizing lecture slides, textbook chapters, and handwritten notes.

---

## 🛡️ Error Handling

All Groq API calls are wrapped in `try/catch` blocks. Failures are surfaced to the user without crashing the app.

### Error Flow

```
API call fails
      │
      ▼
catch block triggered
      │
      ├──▶ Display error as assistant message in chat
      ├──▶ Show toast notification with error details
      └──▶ Clear loading state so user can retry
```

### Handled Error Codes

| HTTP Code | Error | Handling |
|---|---|---|
| `401` | Invalid API key | Prompts user to check their API key |
| `429` | Rate limit exceeded | Notifies user to wait before retrying |
| `500` | Model unavailable | Shows service error message |
| `network` | Timeout / no connection | Shows network error with retry option |
