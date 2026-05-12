# AI Component Explanation

## OpenAI / Groq Integration

StudyAI uses the **Groq API** to run inference on the **Llama 3.3 70B** model. Groq provides fast inference speeds and is compatible with the OpenAI API format.

### API Endpoint

```
POST https://api.groq.com/openai/v1/chat/completions
```

### Request Structure

```typescript
{
  model: 'llama-3.3-70b-versatile',
  max_tokens: 1024,
  messages: [
    { role: 'system', content: '<mode-specific prompt>' },
    ...previousMessages,
    { role: 'user', content: '<user input>' }
  ]
}
```

### Authentication

The API key is stored in a `.env` file as `VITE_GROQ_API_KEY` and injected at build time using Vite's `import.meta.env` system.

## Prompt Engineering

StudyAI uses three distinct system prompts depending on the active mode:

### 1. Chat Mode
```
You are StudyAI, a helpful and friendly AI study assistant specialized in Computer Engineering.
Help students understand topics like data structures, algorithms, operating systems,
computer networks, digital systems, OOP, and circuit theory. Quiz them, explain concepts
clearly, and be encouraging and concise.
```

### 2. Quiz Mode
```
You are StudyAI Quiz Mode. For every user prompt, generate a multiple-choice quiz with
4 options (A, B, C, D) related to the topic. Include the correct answer at the end.
Make questions challenging but fair for Computer Engineering students. Format clearly with markdown.
```

### 3. Note Summarizer Mode
```
You are StudyAI Note Summarizer. Take the user's pasted text and summarize it into
clear, concise bullet points. Highlight key concepts, definitions, and important details.
Keep it structured and easy to study from.
```

## Error Handling

All API calls are wrapped in `try/catch` blocks. If the Groq API fails:

1. The error message is displayed to the user as an assistant message
2. A toast notification appears with the error details
3. The loading state is cleared so the user can retry

### Common Errors Handled
- Invalid API key (401)
- Rate limiting (429)
- Model unavailable (500)
- Network timeouts
