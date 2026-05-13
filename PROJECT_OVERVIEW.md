# 📋 Project Overview

> StudyAI is an intelligent, accessible study companion built specifically for Computer Engineering students — designed to simplify complex concepts, reinforce learning, and keep study sessions organized.

---

## 🎯 Objectives

StudyAI was built to address the core challenges CE students face when studying independently:

| # | Objective |
|---|---|
| 1 | Explain complex technical concepts in simple, digestible terms |
| 2 | Generate practice quizzes for active self-assessment |
| 3 | Summarize lecture notes and textbook content into study-friendly formats |
| 4 | Maintain a persistent history of study sessions for future review |

---

## 📦 Scope

### ✅ In Scope

- User authentication with email verification
- Real-time AI chat powered by Groq API (Llama 3.3 70B)
- Three distinct AI modes: **Chat**, **Quiz**, and **Note Summarizer**
- Session persistence using Supabase PostgreSQL
- Responsive web interface (desktop + mobile)
- Dark / light theme support
- Chat export functionality (`.txt`)

### ❌ Out of Scope

- Offline / PWA support
- Native mobile applications (iOS / Android)
- Real-time collaborative study rooms
- Integration with Learning Management Systems (LMS) such as Moodle or Canvas

---

## 👥 Target Users

### Primary Users
**Computer Engineering undergraduate students (1st – 4th year)**
Students who need on-demand help with technical subjects like OS, networks, data structures, and algorithms.

### Secondary Users
**Self-taught programmers and bootcamp students**
Learners outside of formal institutions who want a structured AI-powered study tool.

### Key Use Cases

- 📖 Preparing for exams on operating systems, networking, and data structures
- 📝 Reviewing and condensing lecture notes into bullet-point summaries
- 🧪 Self-testing with AI-generated multiple-choice quizzes
- 💡 Getting quick, clear explanations for confusing topics

---

## 🧑‍💻 Key User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| 1 | Student | Ask questions about CPU scheduling | I can understand it before my OS exam |
| 2 | Student | Generate quizzes on data structures | I can test and reinforce my knowledge |
| 3 | Student | Paste my notes and get a summary | I can study more efficiently |
| 4 | Student | Have my chat history saved | I can review past explanations anytime |
