import { useState, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"
import type { Session } from "@supabase/supabase-js"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import { useTheme } from "../context/ThemeContext"
import Icon from "../components/Icon"
import ConfirmModal from "../components/ConfirmModal"
import SessionSkeleton from "../components/SessionSkeleton"

interface Message { role: "user" | "assistant"; content: string }
interface ChatSession { id: string; title: string; created_at: string }

type ChatMode = "chat" | "quiz" | "summarize"
type QuizType = "flashcard" | "truefalse" | "identification" | "enumeration"

const suggestions = [
  "Explain how CPU scheduling works 🖥️",
  "Quiz me on data structures 📊",
  "What is the difference between TCP and UDP? 🌐",
  "Explain binary and hexadecimal numbers 🔢",
  "What is Object-Oriented Programming? 💡",
  "How does memory management work in OS? 🧠",
  "Explain the OSI model layers 📡",
  "What is a deadlock in operating systems? ⚠️",
  "Quiz me on basic circuit theory ⚡",
  "Explain how sorting algorithms work 🔄",
]

const modeLabels: Record<ChatMode, string> = {
  chat: "Chat",
  quiz: "Quiz Mode",
  summarize: "Note Summarizer",
}

const modeSystemPrompts: Record<ChatMode, string> = {
  chat: "You are StudyAI, a helpful and friendly AI study assistant specialized in Computer Engineering. Help students understand topics like data structures, algorithms, operating systems, computer networks, digital systems, OOP, and circuit theory. Quiz them, explain concepts clearly, and be encouraging and concise.",
  quiz: "You are StudyAI Quiz Mode.",
  summarize: "You are StudyAI Note Summarizer. Follow the summarization parameters provided exactly. Produce a clean, well-structured summary based only on the text provided. Never add information not present in the source.",
}

const quizTypes = [
  { type: "flashcard" as QuizType, emoji: "🃏", title: "Flashcard", desc: "Click to flip and reveal answers" },
  { type: "truefalse" as QuizType, emoji: "✅", title: "True or False", desc: "Pick true or false statements" },
  { type: "identification" as QuizType, emoji: "✍️", title: "Identification", desc: "Fill in the blank questions" },
  { type: "enumeration" as QuizType, emoji: "📋", title: "Enumeration", desc: "List items in order" },
]

const summarizeTones = ["Executive", "Academic", "Gist", "Synthesis", "Core"]
const summarizeFormats = ["Bullet Points", "Paragraph", "Structured", "Action Items"]
const summarizeLengths = ["Short", "Medium", "Long"]

const toneDescriptions: Record<string, string> = {
  "Executive": "professional, objective, and direct",
  "Academic": "formal, analytical, and structured",
  "Gist": "informal and punchy",
  "Synthesis": "structured and insightful",
  "Core": "minimalist and dense — one-line takeaways only",
}
const formatInstructions: Record<string, string> = {
  "Bullet Points": "Format as bullet points with key insights only.",
  "Paragraph": "Format as a smooth, readable paragraph.",
  "Structured": "Organize into three sections: Context → Key Points → Conclusion.",
  "Action Items": "Extract only actionable tasks and decisions as a checklist.",
}
const lengthInstructions: Record<string, string> = {
  "Short": "Keep it very brief — about 10% of the original length.",
  "Medium": "Aim for about 20% of the original length.",
  "Long": "Aim for about 30% of the original length.",
}

const PRIVACY_POLICY = `**StudyAI Privacy Policy**
*Last updated: May 2026*

**1. Information We Collect**
We collect information you provide directly to us, including your email address when you create an account, chat messages and quiz responses you submit, and session history stored to enable conversation continuity.

**2. How We Use Your Information**
Your data is used solely to provide and improve the StudyAI service — powering chat sessions, generating quizzes, and summarizing notes. We do not sell your personal information to third parties.

**3. Data Storage**
All chat sessions and messages are stored in Supabase, a secure cloud database. Each record is tied to your authenticated user ID and is accessible only by you.

**4. AI Processing**
Your messages are sent to the Groq API (LLaMA 3.3 70B) for AI inference. Groq's data handling is governed by their own privacy policy. We recommend avoiding sharing sensitive personal information in chat.

**5. Data Retention & Deletion**
You may delete any chat session at any time via the sidebar. Account deletion requests can be submitted to our support email and will be processed within 30 days.

**6. Cookies & Local Storage**
We use browser localStorage solely to remember your sidebar and theme preferences. No tracking or advertising cookies are used.

**7. Security**
We implement industry-standard security practices including authentication via Supabase Auth, row-level security on all database tables, and encrypted data in transit (TLS).

**8. Changes to This Policy**
We may update this policy periodically. Continued use of StudyAI after changes constitutes acceptance of the revised policy.

**9. Contact**
For privacy concerns, email us at **santos.jushouaoswald22@gmail.com**.`

function getInitials(email: string): string {
  const namePart = email.split("@")[0]
  const parts = namePart.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return namePart.slice(0, 2).toUpperCase()
}

function getDisplayName(email: string): string {
  const namePart = email.split("@")[0]
  const parts = namePart.split(/[._-]/)
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
}

function StudyAILogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#63dcb4" fillOpacity="0.12"/>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8.25" stroke="#63dcb4" strokeOpacity="0.25" strokeWidth="1.5"/>
      <rect x="7" y="11" width="18" height="13" rx="2" stroke="#63dcb4" strokeWidth="1.4" fill="none"/>
      <line x1="11" y1="8" x2="11" y2="11" stroke="#63dcb4" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="16" y1="7" x2="16" y2="11" stroke="#63dcb4" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="21" y1="8" x2="21" y2="11" stroke="#63dcb4" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="24" cy="7" r="3" fill="#63dcb4" fillOpacity="0.15" stroke="#63dcb4" strokeWidth="1.2"/>
      <line x1="21.8" y1="7" x2="26.2" y2="7" stroke="#63dcb4" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="24" y1="5.5" x2="24" y2="7" stroke="#63dcb4" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="24" y1="8.5" x2="25.2" y2="9.5" stroke="#63dcb4" strokeWidth="1" strokeLinecap="round"/>
      <line x1="10" y1="16" x2="14" y2="16" stroke="#63dcb4" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.7"/>
      <line x1="14" y1="16" x2="14" y2="19" stroke="#63dcb4" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.7"/>
      <line x1="14" y1="19" x2="18" y2="19" stroke="#63dcb4" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.7"/>
      <line x1="18" y1="19" x2="18" y2="16" stroke="#63dcb4" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.7"/>
      <line x1="18" y1="16" x2="22" y2="16" stroke="#63dcb4" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.7"/>
      <circle cx="14" cy="16" r="1.2" fill="#63dcb4"/>
      <circle cx="18" cy="19" r="1.2" fill="#63dcb4"/>
      <circle cx="18" cy="16" r="1.2" fill="#63dcb4" fillOpacity="0.5"/>
    </svg>
  )
}

export default function Chat({ session }: { session: Session }) {
  const { theme, toggleTheme } = useTheme()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("studyai-sidebar-open")
    return saved !== null ? saved === "true" : true
  })
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [mode, setMode] = useState<ChatMode>("chat")
  const [search, setSearch] = useState("")
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [clearHistoryConfirm, setClearHistoryConfirm] = useState(false)

  // Sidebar cursor glow
  const [glowPos, setGlowPos] = useState<{ x: number; y: number } | null>(null)

  // Quiz state
  const [quizStep, setQuizStep] = useState<"select" | "quiz" | "results">("select")
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType | null>(null)
  const [quizTopic, setQuizTopic] = useState("")
  const [quizData, setQuizData] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [flippedCard, setFlippedCard] = useState(false)
  const [quizResults, setQuizResults] = useState<{ score: number; total: number } | null>(null)

  // Per-question quiz UX state
  const [showTFExplanation, setShowTFExplanation] = useState(false)
  const [identSubmitted, setIdentSubmitted] = useState(false)
  const [enumInputs, setEnumInputs] = useState<string[]>([])
  const [enumSubmitted, setEnumSubmitted] = useState(false)

  // Summarizer state
  const [summarizeText, setSummarizeText] = useState("")
  const [summarizeTone, setSummarizeTone] = useState("Executive")
  const [summarizeFormat, setSummarizeFormat] = useState("Bullet Points")
  const [summarizeLength, setSummarizeLength] = useState("Medium")

  // Animation state
  const [mounted, setMounted] = useState(false)
  const [modeChanging, setModeChanging] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<Message[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const userEmail = session.user.email || ""
  const initials = getInitials(userEmail)
  const displayName = getDisplayName(userEmail)

  const handleSidebarMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }
  const handleSidebarMouseLeave = () => {
    setGlowPos(null)
  }

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    localStorage.setItem("studyai-sidebar-open", String(sidebarOpen))
  }, [sidebarOpen])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [dropdownOpen])

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { loadSessions() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!glowRef.current) return
      glowRef.current.style.background =
        `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(99,220,180,0.05), transparent 50%)`
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  useEffect(() => {
    if (selectedQuizType === "enumeration" && quizData[currentQuestionIndex]) {
      const count = quizData[currentQuestionIndex].items?.length || 0
      setEnumInputs(new Array(count).fill(""))
    }
  }, [currentQuestionIndex, quizData, selectedQuizType])

  const loadSessions = async () => {
    setSessionsLoading(true)
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
      if (error) throw error
      if (data) setSessions(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sessions")
    } finally {
      setSessionsLoading(false)
    }
  }

  // ── FIXED: removed `currentSessionId &&` so that clicking "New chat" when
  //    there are no messages always bails early, regardless of whether a
  //    session ID exists. Previously, null currentSessionId bypassed the guard
  //    and inserted a fresh empty "New Chat" row on every click.
  const newSession = async () => {
    if (messages.length === 0) {
      setSidebarOpen(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({ user_id: session.user.id, title: "New Chat" })
        .select().single()
      if (error) throw error
      if (data) {
        setSessions(prev => [data, ...prev])
        setCurrentSessionId(data.id)
        setMessages([])
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create session")
    }
  }

  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId)
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
      if (error) throw error
      if (data) setMessages(data.map(m => ({ role: m.role, content: m.content })))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load messages")
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await supabase.from("messages").delete().eq("session_id", sessionId)
      const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId)
      if (error) throw error
      setSessions(prev => prev.filter(x => x.id !== sessionId))
      if (currentSessionId === sessionId) { setCurrentSessionId(null); setMessages([]) }
      toast.success("Chat session deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete session")
    } finally {
      setDeleteTarget(null)
    }
  }

  const clearAllHistory = async () => {
    setClearHistoryConfirm(false)
    try {
      const sessionIds = sessions.map(s => s.id)
      if (sessionIds.length > 0) {
        await supabase.from("messages").delete().in("session_id", sessionIds)
      }
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("user_id", session.user.id)
      if (error) throw error
      setSessions([])
      setCurrentSessionId(null)
      setMessages([])
      toast.success("All chat history cleared")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear history")
    }
  }

  const startRename = (s: ChatSession) => {
    setRenamingId(s.id)
    setRenameDraft(s.title)
  }

  const commitRename = async () => {
    const sessionId = renamingId
    const next = renameDraft.trim()
    if (!sessionId) return
    setRenamingId(null)
    if (!next) return
    const prev = sessions
    setSessions(p => p.map(x => x.id === sessionId ? { ...x, title: next } : x))
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({ title: next })
        .eq("id", sessionId)
      if (error) throw error
    } catch (err) {
      setSessions(prev)
      toast.error(err instanceof Error ? err.message : "Failed to rename session")
    }
  }

  const switchMode = (m: ChatMode) => {
    if (m === mode) return
    setModeChanging(true)
    setTimeout(() => {
      setMode(m)
      setMessages([])
      setCurrentSessionId(null)
      resetQuiz()
      resetSummarize()
      setModeChanging(false)
    }, 180)
  }

  const generateQuiz = async () => {
    if (!selectedQuizType || !quizTopic.trim()) {
      toast.error("Please select a quiz type and enter a topic")
      return
    }

    let sessionId = currentSessionId
    try {
      if (!sessionId) {
        const { data, error } = await supabase
          .from("chat_sessions")
          .insert({ user_id: session.user.id, title: `Quiz: ${quizTopic}` })
          .select().single()
        if (error) throw error
        if (!data) throw new Error("Failed to create session")
        sessionId = data.id
        setCurrentSessionId(data.id)
        setSessions(prev => [data, ...prev])
      }

      setLoading(true)
      const userMsg: Message = { role: "user", content: `Generate ${selectedQuizType} quiz on ${quizTopic}` }
      setMessages(prev => [...prev, userMsg])

      await supabase.from("messages").insert({ session_id: sessionId, role: "user", content: userMsg.content })

      let prompt = ""
      if (selectedQuizType === "flashcard") {
        prompt = `Generate 10 flashcard pairs about ${quizTopic} for Computer Engineering students. Return ONLY a JSON array with no markdown or code fences: [{"question": "...", "answer": "..."}]`
      } else if (selectedQuizType === "truefalse") {
        prompt = `Generate 10 true or false questions about ${quizTopic} for Computer Engineering students. Return ONLY a JSON array with no markdown or code fences: [{"statement": "...", "answer": true, "explanation": "..."}]`
      } else if (selectedQuizType === "identification") {
        prompt = `Generate 10 identification/fill-in-the-blank questions about ${quizTopic} for Computer Engineering students. Each question should have a clear one-word or short-phrase answer. Return ONLY a JSON array with no markdown or code fences: [{"question": "...", "answer": "..."}]`
      } else if (selectedQuizType === "enumeration") {
        prompt = `Generate 5 enumeration questions about ${quizTopic} for Computer Engineering students. Return ONLY a JSON array with no markdown or code fences: [{"prompt": "...", "items": ["item1", "item2", ...]}]`
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }]
        })
      })

      if (!res.ok) throw new Error(`Groq API error (${res.status})`)

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || ""

      try {
        const jsonMatch = reply.match(/\[[\s\S]*\]/)
        if (!jsonMatch) throw new Error("No JSON array found")
        const parsed = JSON.parse(jsonMatch[0])
        setQuizData(parsed)
        setCurrentQuestionIndex(0)
        setUserAnswers([])
        setFlippedCard(false)
        setShowTFExplanation(false)
        setIdentSubmitted(false)
        setEnumSubmitted(false)
        if (selectedQuizType === "enumeration" && parsed[0]) {
          setEnumInputs(new Array(parsed[0].items?.length || 0).fill(""))
        }
        setQuizStep("quiz")

        const itemCount = selectedQuizType === "enumeration" ? 5 : 10
        const assistantMsg: Message = { role: "assistant", content: `Quiz generated! ${itemCount} questions ready.` }
        setMessages(prev => [...prev, assistantMsg])
        await supabase.from("messages").insert({ session_id: sessionId, role: "assistant", content: assistantMsg.content })
      } catch {
        throw new Error("Failed to parse quiz data. Please try again.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const resetQuizPerQuestion = () => {
    setFlippedCard(false)
    setShowTFExplanation(false)
    setIdentSubmitted(false)
    setEnumInputs([])
    setEnumSubmitted(false)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      resetQuizPerQuestion()
    } else {
      calculateResults()
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      resetQuizPerQuestion()
    }
  }

  const calculateResults = () => {
    let correct = 0
    if (selectedQuizType === "flashcard") {
      correct = userAnswers.filter(a => a === true).length
    } else if (selectedQuizType === "truefalse") {
      correct = userAnswers.filter((a, i) => a === quizData[i]?.answer).length
    } else if (selectedQuizType === "identification") {
      correct = userAnswers.filter((a, i) => {
        if (typeof a !== "string") return false
        const userAns = a.trim().toLowerCase()
        const correctAns = (quizData[i]?.answer || "").trim().toLowerCase()
        return userAns === correctAns || correctAns.includes(userAns) && userAns.length > 2
      }).length
    } else if (selectedQuizType === "enumeration") {
      correct = userAnswers.filter(a => a === true).length
    }
    setQuizResults({ score: correct, total: quizData.length })
    setQuizStep("results")
  }

  const handleFlashcardAnswer = (knew: boolean) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = knew
    setUserAnswers(newAnswers)
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      resetQuizPerQuestion()
    } else {
      const finalAnswers = newAnswers
      let correct = finalAnswers.filter(a => a === true).length
      setQuizResults({ score: correct, total: quizData.length })
      setQuizStep("results")
    }
  }

  const handleTrueFalseAnswer = (answer: boolean) => {
    if (showTFExplanation) return
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)
    setShowTFExplanation(true)
  }

  const handleIdentificationAnswer = (answer: string) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)
  }

  const handleIdentificationSubmit = () => {
    if (!userAnswers[currentQuestionIndex]?.toString().trim()) {
      toast.error("Please type an answer first")
      return
    }
    setIdentSubmitted(true)
  }

  const handleEnumInput = (index: number, value: string) => {
    setEnumInputs(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleEnumerationSubmit = () => {
    const items: string[] = quizData[currentQuestionIndex]?.items || []
    let correctCount = 0
    enumInputs.forEach((input, i) => {
      const userVal = input.trim().toLowerCase()
      const correctVal = (items[i] || "").trim().toLowerCase()
      if (userVal && (userVal === correctVal || correctVal.includes(userVal) && userVal.length > 2)) {
        correctCount++
      }
    })
    const passed = correctCount >= Math.ceil(items.length / 2)
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = passed
    setUserAnswers(newAnswers)
    setEnumSubmitted(true)
  }

  const resetQuiz = () => {
    setQuizStep("select")
    setSelectedQuizType(null)
    setQuizTopic("")
    setQuizData([])
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setQuizResults(null)
    resetQuizPerQuestion()
  }

  const resetSummarize = () => {
    setSummarizeText("")
    setSummarizeTone("Executive")
    setSummarizeFormat("Bullet Points")
    setSummarizeLength("Medium")
  }

  const sendContent = async (content: string) => {
    let sessionId = currentSessionId
    try {
      if (!sessionId) {
        const title = mode === "summarize" ? "Note Summary" : content.slice(0, 40)
        const { data, error } = await supabase
          .from("chat_sessions")
          .insert({ user_id: session.user.id, title })
          .select().single()
        if (error) throw error
        if (!data) throw new Error("Failed to create chat session")
        sessionId = data.id
        setCurrentSessionId(data.id)
        setSessions(prev => [data, ...prev])
      }

      const userMsg: Message = { role: "user", content }
      setMessages(prev => [...prev, userMsg])
      setLoading(true)

      const { error: insertError } = await supabase.from("messages").insert({ session_id: sessionId, role: "user", content })
      if (insertError) throw insertError

      const currentMessages = messagesRef.current

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1024,
          messages: [
            { role: "system", content: modeSystemPrompts[mode] },
            ...currentMessages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content }
          ]
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error?.message || `Groq API error (${res.status})`)
      }

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || "Sorry, I could not respond."
      const assistantMsg: Message = { role: "assistant", content: reply }
      setMessages(prev => [...prev, assistantMsg])
      const { error: assistantInsertError } = await supabase.from("messages").insert({ session_id: sessionId, role: "assistant", content: reply })
      if (assistantInsertError) console.error("Failed to save assistant message:", assistantInsertError)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      toast.error(msg)
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${msg}` }])
    }
    setLoading(false)
  }

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    setInput("")
    await sendContent(trimmed)
  }

  const sendSummarize = async () => {
    if (!summarizeText.trim()) {
      toast.error("Please paste some text to summarize")
      return
    }
    const prompt = `Summarize the following text with these parameters:
- Tone/Style: ${summarizeTone} — ${toneDescriptions[summarizeTone]}
- ${formatInstructions[summarizeFormat]}
- ${lengthInstructions[summarizeLength]}

Rules:
- Preserve the original meaning and intent
- Extract only the most important insights
- Remove repetition and filler
- Never add information not present in the source

Text to summarize:
${summarizeText}`

    await sendContent(prompt)
  }

  const signOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    toast.success("Signed out")
  }

  const exportChat = () => {
    setDropdownOpen(false)
    if (messages.length === 0) { toast.error("No messages to export"); return }
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `studyai-chat-${currentSessionId || "export"}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Chat exported to .txt")
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopied(index)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  const modeButtons: ChatMode[] = ["chat", "quiz", "summarize"]
  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(search.trim().toLowerCase()))

  const pillBase = "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer pill-btn"
  const pillSelected = "border-indigo-500 dark:border-[#63dcb4] bg-indigo-50 dark:bg-[#63dcb4]/10 text-indigo-700 dark:text-[#63dcb4]"
  const pillUnselected = "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-[#63dcb4]/50 hover:text-indigo-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"

  const renderPrevButton = (onClick: () => void, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 py-3 rounded-xl font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
    >
      ← Previous
    </button>
  )

  const renderProgressBar = (current: number, total: number) => (
    <div className="w-full max-w-2xl mb-6">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
        <span>{current + 1} of {total}</span>
        <span>{Math.round(((current + 1) / total) * 100)}%</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-[#63dcb4] rounded-full progress-bar-fill"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  )

  const renderFlashcard = () => {
    const card = quizData[currentQuestionIndex]
    if (!card) return null
    const alreadyAnswered = userAnswers[currentQuestionIndex] !== undefined

    return (
      <div className="flex flex-col items-center w-full max-w-2xl animate-slideUp">
        {renderProgressBar(currentQuestionIndex, quizData.length)}
        <div
          className="flashcard-scene w-full h-72 sm:h-80 mb-6 cursor-pointer select-none"
          onClick={() => !flippedCard && setFlippedCard(true)}
          title={flippedCard ? undefined : "Click to reveal answer"}
        >
          <div className={`flashcard-inner w-full h-full relative${flippedCard ? " flipped" : ""}`}>
            <div className="flashcard-face flashcard-front rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-700 flex flex-col items-center justify-center px-8 text-center shadow-md">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 dark:text-indigo-300 mb-4">Question</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{card.question}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-6 flex items-center gap-1">
                <span>👆</span> Click to flip
              </p>
            </div>
            <div className="flashcard-face flashcard-back rounded-2xl border-2 border-[#63dcb4]/40 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-zinc-800 dark:to-zinc-750 flex flex-col items-center justify-center px-8 text-center shadow-md">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#63dcb4] mb-4">Answer</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{card.answer}</p>
            </div>
          </div>
        </div>

        {flippedCard ? (
          alreadyAnswered ? (
            <div className="flex gap-3 w-full animate-fadeUp">
              {renderPrevButton(prevQuestion, currentQuestionIndex === 0)}
              <button onClick={nextQuestion} className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 active:scale-[0.98]">
                {currentQuestionIndex === quizData.length - 1 ? "See Results" : "Next →"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-3 w-full animate-fadeUp">
                <button onClick={() => handleFlashcardAnswer(false)} className="flex-1 py-3 rounded-xl font-semibold border-2 border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200 active:scale-[0.98]">
                  ↺ Still Learning
                </button>
                <button onClick={() => handleFlashcardAnswer(true)} className="flex-1 py-3 rounded-xl font-semibold border-2 border-[#63dcb4]/50 text-emerald-700 dark:text-[#63dcb4] bg-emerald-50 dark:bg-[#63dcb4]/10 hover:bg-emerald-100 dark:hover:bg-[#63dcb4]/20 transition-all duration-200 active:scale-[0.98]">
                  ✓ Got It!
                </button>
              </div>
              {currentQuestionIndex > 0 && (
                <button onClick={prevQuestion} className="mt-2 w-full py-2 rounded-xl text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-150">
                  ← Go Back
                </button>
              )}
            </>
          )
        ) : (
          <>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 italic mb-3">Flip the card to reveal the answer</p>
            {alreadyAnswered ? (
              <div className="flex gap-3 w-full">
                {renderPrevButton(prevQuestion, currentQuestionIndex === 0)}
                <button onClick={nextQuestion} className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 active:scale-[0.98]">
                  {currentQuestionIndex === quizData.length - 1 ? "See Results" : "Next →"}
                </button>
              </div>
            ) : (
              currentQuestionIndex > 0 && (
                <div className="flex gap-3 w-full">
                  {renderPrevButton(prevQuestion)}
                </div>
              )
            )}
          </>
        )}
      </div>
    )
  }

  const renderTrueFalse = () => {
    const q = quizData[currentQuestionIndex]
    if (!q) return null
    const userAnswer = userAnswers[currentQuestionIndex]
    const isCorrect = userAnswer === q.answer
    return (
      <div className="flex flex-col items-center w-full max-w-2xl animate-slideUp">
        {renderProgressBar(currentQuestionIndex, quizData.length)}
        <div className="w-full bg-indigo-50 dark:bg-zinc-800 border-2 border-indigo-200 dark:border-zinc-700 rounded-2xl p-8 mb-6 text-center">
          <p className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">{q.statement}</p>
        </div>
        <div className="flex gap-4 w-full mb-4">
          <button
            onClick={() => handleTrueFalseAnswer(true)}
            disabled={showTFExplanation}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 active:scale-[0.97]
              ${showTFExplanation && userAnswer === true
                ? isCorrect
                  ? "bg-green-500 text-white scale-95 shadow-lg"
                  : "bg-red-400 text-white scale-95"
                : showTFExplanation
                ? "opacity-40 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-not-allowed"
                : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-700 hover:bg-green-500 hover:text-white hover:border-transparent hover:scale-[1.02]"
              }`}
          >
            ✅ True
          </button>
          <button
            onClick={() => handleTrueFalseAnswer(false)}
            disabled={showTFExplanation}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 active:scale-[0.97]
              ${showTFExplanation && userAnswer === false
                ? isCorrect
                  ? "bg-green-500 text-white scale-95 shadow-lg"
                  : "bg-red-400 text-white scale-95"
                : showTFExplanation
                ? "opacity-40 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 cursor-not-allowed"
                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-700 hover:bg-red-500 hover:text-white hover:border-transparent hover:scale-[1.02]"
              }`}
          >
            ❌ False
          </button>
        </div>

        {!showTFExplanation && currentQuestionIndex > 0 && (
          <button onClick={prevQuestion} className="w-full mb-2 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-150">
            ← Previous
          </button>
        )}

        {showTFExplanation && (
          <div className={`w-full p-4 rounded-xl mb-4 border-2 animate-fadeUp ${isCorrect ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-900 dark:text-green-200" : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200"}`}>
            <p className="font-bold mb-1 text-base">{isCorrect ? "✅ Correct!" : `❌ Incorrect — The answer is ${q.answer ? "True" : "False"}`}</p>
            <p className="text-sm leading-relaxed opacity-90">{q.explanation}</p>
          </div>
        )}

        {showTFExplanation && (
          <div className="flex gap-3 w-full animate-fadeUp">
            {renderPrevButton(prevQuestion, currentQuestionIndex === 0)}
            <button onClick={nextQuestion} className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 active:scale-[0.98]">
              {currentQuestionIndex === quizData.length - 1 ? "See Results" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderIdentification = () => {
    const q = quizData[currentQuestionIndex]
    if (!q) return null
    const userAnswer = userAnswers[currentQuestionIndex] as string || ""
    const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase() ||
      (q.answer.trim().toLowerCase().includes(userAnswer.trim().toLowerCase()) && userAnswer.trim().length > 2)
    return (
      <div className="flex flex-col items-center w-full max-w-2xl animate-slideUp">
        {renderProgressBar(currentQuestionIndex, quizData.length)}
        <div className="w-full bg-indigo-50 dark:bg-zinc-800 border-2 border-indigo-200 dark:border-zinc-700 rounded-2xl p-8 mb-6 text-center">
          <p className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">{q.question}</p>
        </div>
        <div className="w-full mb-4">
          <input
            type="text"
            value={userAnswer}
            onChange={e => !identSubmitted && handleIdentificationAnswer(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !identSubmitted && handleIdentificationSubmit()}
            placeholder="Type your answer..."
            disabled={identSubmitted}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all duration-200
              ${identSubmitted
                ? isCorrect
                  ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                  : "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                : "border-indigo-200 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-[#63dcb4] focus:ring-2 focus:ring-indigo-100 dark:focus:ring-[#63dcb4]/20"
              }`}
            autoFocus
          />
        </div>

        {!identSubmitted && currentQuestionIndex > 0 && (
          <button onClick={prevQuestion} className="w-full mb-2 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-150">
            ← Previous
          </button>
        )}

        {identSubmitted && (
          <div className={`w-full p-4 rounded-xl mb-4 border-2 animate-fadeUp ${isCorrect ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"}`}>
            {isCorrect ? (
              <p className="font-bold text-green-800 dark:text-green-300">✅ Correct!</p>
            ) : (
              <>
                <p className="font-bold text-red-800 dark:text-red-300 mb-1">❌ Not quite</p>
                <p className="text-sm text-red-700 dark:text-red-400">Correct answer: <span className="font-semibold">{q.answer}</span></p>
              </>
            )}
          </div>
        )}

        {!identSubmitted ? (
          <button onClick={handleIdentificationSubmit} disabled={!userAnswer.trim()} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">
            Submit Answer
          </button>
        ) : (
          <div className="flex gap-3 w-full animate-fadeUp">
            {renderPrevButton(prevQuestion, currentQuestionIndex === 0)}
            <button onClick={nextQuestion} className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 active:scale-[0.98]">
              {currentQuestionIndex === quizData.length - 1 ? "See Results" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderEnumeration = () => {
    const q = quizData[currentQuestionIndex]
    if (!q) return null
    const items: string[] = q.items || []
    return (
      <div className="flex flex-col items-center w-full max-w-2xl animate-slideUp">
        {renderProgressBar(currentQuestionIndex, quizData.length)}
        <div className="w-full bg-indigo-50 dark:bg-zinc-800 border-2 border-indigo-200 dark:border-zinc-700 rounded-2xl p-6 mb-5 text-center">
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{q.prompt}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">List {items.length} items in order</p>
        </div>

        <div className="w-full space-y-2 mb-4">
          {items.map((correctItem: string, idx: number) => {
            const userVal = (enumInputs[idx] || "").trim().toLowerCase()
            const correctVal = correctItem.trim().toLowerCase()
            const itemCorrect = userVal && (userVal === correctVal || correctVal.includes(userVal) && userVal.length > 2)
            return (
              <div key={idx} className="flex items-center gap-3" style={{ animation: `fadeUp 0.3s ease forwards`, animationDelay: `${idx * 40}ms`, opacity: 0 }}>
                <span className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 flex-shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={enumInputs[idx] || ""}
                  onChange={e => !enumSubmitted && handleEnumInput(idx, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !enumSubmitted) {
                      const nextInput = document.getElementById(`enum-input-${idx + 1}`)
                      if (nextInput) (nextInput as HTMLInputElement).focus()
                      else handleEnumerationSubmit()
                    }
                  }}
                  id={`enum-input-${idx}`}
                  placeholder={`Item ${idx + 1}`}
                  disabled={enumSubmitted}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all duration-200
                    ${enumSubmitted
                      ? itemCorrect
                        ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                        : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                      : "border-zinc-200 dark:border-zinc-700 focus:border-indigo-400 dark:focus:border-[#63dcb4] focus:ring-2 focus:ring-indigo-50 dark:focus:ring-[#63dcb4]/20"
                    }`}
                />
                {enumSubmitted && (
                  <span className={`text-lg flex-shrink-0 transition-all duration-300 ${itemCorrect ? "text-green-500 scale-110" : "text-red-400"}`}>
                    {itemCorrect ? "✓" : "✗"}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {!enumSubmitted && currentQuestionIndex > 0 && (
          <button onClick={prevQuestion} className="w-full mb-2 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-150">
            ← Previous
          </button>
        )}

        {enumSubmitted && (
          <div className="w-full p-4 rounded-xl mb-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 animate-fadeUp">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Correct Order</p>
            {items.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 py-0.5">
                <span className="text-xs font-bold text-zinc-400 w-5">{idx + 1}.</span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        )}

        {!enumSubmitted ? (
          <button onClick={handleEnumerationSubmit} disabled={enumInputs.every(v => !v.trim())} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">
            Check Answers
          </button>
        ) : (
          <div className="flex gap-3 w-full animate-fadeUp">
            {renderPrevButton(prevQuestion, currentQuestionIndex === 0)}
            <button onClick={nextQuestion} className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 active:scale-[0.98]">
              {currentQuestionIndex === quizData.length - 1 ? "See Results" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`flex h-screen bg-white dark:bg-[#0f0f10] text-zinc-900 dark:text-zinc-100 overflow-hidden app-root ${mounted ? "app-mounted" : ""}`}>
      {/* Full-page cursor glow */}
      <div ref={glowRef} className="pointer-events-none fixed inset-0 z-0 transition-[background] duration-75" />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fadeIn" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        onMouseMove={handleSidebarMouseMove}
        onMouseLeave={handleSidebarMouseLeave}
        className={`
          fixed md:static inset-y-0 left-0 z-50 flex flex-col relative
          bg-white dark:bg-[#171717]
          border-r border-zinc-200 dark:border-zinc-800
          sidebar-transition overflow-hidden
          ${sidebarOpen ? "w-60 sidebar-open" : "w-0 md:w-0"}
        `}
        style={{ minWidth: sidebarOpen ? undefined : 0 }}
      >
        <div className="flex flex-col h-full w-60 relative">
          {/* Cursor glow overlay */}
          {glowPos && (
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background: `radial-gradient(280px circle at ${glowPos.x}px ${glowPos.y}px, ${
                  theme === "dark" ? "rgba(45, 106, 79, 0.2)" : "rgba(0, 255, 127, 0.08)"
                }, transparent 70%)`,
              }}
            />
          )}

          {/* Logo */}
          <div className="relative z-10 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="logo-pulse">
              <StudyAILogo size={28} />
            </div>
            <div>
              <h2 className="sidebar-font font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-none tracking-tight">StudyAI</h2>
              <p className="sidebar-font text-[11px] text-zinc-400 mt-0.5 tracking-wide">Terminal meets Academia</p>
            </div>
          </div>

          {/* New chat */}
          <div className="relative z-10 px-2 pt-3 pb-1">
            <button
              onClick={newSession}
              className="sidebar-item-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 group active:scale-[0.97]"
            >
              <span className="flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:rotate-90">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 5V11M5 8H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="sidebar-font text-sm font-medium">New chat</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative z-10 px-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-150 focus-within:bg-zinc-50 dark:focus-within:bg-zinc-800/80">
              <span className="flex items-center justify-center w-5 h-5 flex-shrink-0 text-zinc-400">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="sidebar-font flex-1 bg-transparent text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Session list */}
          <nav className="relative z-10 flex-1 overflow-y-auto">
            {sessionsLoading ? (
              <div className="px-2 py-2"><SessionSkeleton count={5} /></div>
            ) : filteredSessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400 sidebar-font animate-fadeIn">No chats yet</div>
            ) : (
              <div className="px-2 py-1.5 space-y-px">
                {filteredSessions.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`session-item group flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer ${
                      currentSessionId === s.id ? "session-active" : "session-inactive"
                    }`}
                    style={{ animation: `fadeUp 0.25s ease forwards`, animationDelay: `${idx * 30}ms`, opacity: 0 }}
                    onClick={() => loadSession(s.id)}
                    onDoubleClick={() => startRename(s)}
                  >
                    <span className="session-accent" />
                    <div className="flex-1 overflow-hidden">
                      {renamingId === s.id ? (
                        <input
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename()
                            if (e.key === "Escape") setRenamingId(null)
                          }}
                          onBlur={commitRename}
                          className="w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-0.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none sidebar-font"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="sidebar-font text-sm truncate">{s.title}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(s.id) }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500 transition-all duration-200 flex-shrink-0 ml-1 hover:scale-110"
                      title="Delete session"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </nav>

          {/* User footer */}
          <div className="relative z-10 border-t border-zinc-200 dark:border-zinc-800 p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 ring-2 ring-transparent hover:ring-[#63dcb4]/40 transition-all duration-200">
                <span className="sidebar-font text-xs font-semibold text-zinc-700 dark:text-zinc-200">{initials}</span>
              </div>
              <div className="flex-1 min-w-0 flex items-center">
                <p className="sidebar-font text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{displayName}</p>
              </div>
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`relative w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center justify-center transition-all duration-150 ${dropdownOpen ? "scale-95 bg-zinc-100 dark:bg-zinc-700" : ""}`}
                  title="Options"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="2.5" r="1.2" fill="currentColor" className="text-zinc-500 dark:text-zinc-400"/>
                    <circle cx="7" cy="7" r="1.2" fill="currentColor" className="text-zinc-500 dark:text-zinc-400"/>
                    <circle cx="7" cy="11.5" r="1.2" fill="currentColor" className="text-zinc-500 dark:text-zinc-400"/>
                  </svg>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#171717]" />
                </button>

                {dropdownOpen && (
                  <div className="absolute bottom-9 right-0 w-52 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden z-50 dropdown-enter">
                    <button onClick={exportChat} className="dropdown-item w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-150">
                      <Icon name="download" className="text-base text-zinc-500" />
                      Export Chat
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); setClearHistoryConfirm(true) }}
                      className="dropdown-item w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-150"
                    >
                      <Icon name="delete_sweep" className="text-base text-zinc-500" />
                      Clear History
                    </button>
                    <div className="border-t border-zinc-100 dark:border-zinc-800 mx-2" />
                    <button
                      onClick={() => { setDropdownOpen(false); setShowPrivacyPolicy(true) }}
                      className="dropdown-item w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-150"
                    >
                      <Icon name="shield" className="text-base text-zinc-500" />
                      Privacy Policy
                    </button>
                    <div className="border-t border-zinc-100 dark:border-zinc-800 mx-2" />
                    <button onClick={signOut} className="dropdown-item w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150">
                      <Icon name="logout" className="text-base text-red-500" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f10] flex-shrink-0 header-slide-down">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Icon name={sidebarOpen ? "close" : "menu"} className="text-xl" />
          </button>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-full p-1 mode-switcher">
            {modeButtons.map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-250 whitespace-nowrap relative ${
                  mode === m
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm mode-active"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-700/50"
                }`}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95 hover:rotate-12"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} className="text-xl" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className={`flex-1 overflow-y-auto transition-opacity duration-180 ${modeChanging ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
          style={{ transition: "opacity 180ms ease, transform 180ms ease" }}>
          <div className="max-w-2xl mx-auto px-4 py-4">

            {/* ── Quiz: Type Selection ── */}
            {mode === "quiz" && quizStep === "select" && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8">
                <div className="text-center mb-10 animate-fadeUp" style={{ animationDelay: "60ms" }}>
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Choose Quiz Type</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Select how you want to study</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                  {quizTypes.map((qt, idx) => (
                    <button
                      key={qt.type}
                      onClick={() => setSelectedQuizType(qt.type)}
                      className={`quiz-type-card group p-6 rounded-xl border-2 transition-all duration-200 text-center hover:-translate-y-1 active:scale-[0.97] ${
                        selectedQuizType === qt.type
                          ? "border-indigo-500 dark:border-[#63dcb4] bg-indigo-50 dark:bg-[#63dcb4]/10 shadow-md shadow-indigo-100 dark:shadow-[#63dcb4]/10"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-[#63dcb4] hover:bg-indigo-50 dark:hover:bg-[#63dcb4]/5 hover:shadow-md"
                      }`}
                      style={{ animation: `fadeUp 0.3s ease forwards`, animationDelay: `${80 + idx * 60}ms`, opacity: 0 }}
                    >
                      <div className="text-4xl mb-3 transition-transform duration-200 group-hover:scale-110">{qt.emoji}</div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">{qt.title}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{qt.desc}</p>
                      {selectedQuizType === qt.type && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-[#63dcb4] animate-fadeIn">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="w-full max-w-md space-y-3 animate-fadeUp" style={{ animationDelay: "320ms" }}>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
                    placeholder="Enter a topic (e.g. OSI Model, Data Structures)"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 dark:focus:border-[#63dcb4] focus:ring-2 focus:ring-indigo-100 dark:focus:ring-[#63dcb4]/20 transition-all duration-200"
                  />
                  <button
                    onClick={generateQuiz}
                    disabled={!selectedQuizType || !quizTopic.trim() || loading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${
                      theme === "dark"
                        ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110"
                        : "text-[#1B4332] bg-[#F0FFF4] border-2 border-[#1B4332] hover:bg-[#1B4332] hover:text-white"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : "Start Quiz →"}
                  </button>
                </div>
              </div>

            ) : mode === "quiz" && quizStep === "quiz" ? (
              <div className="flex flex-col items-center justify-start min-h-[calc(100vh-200px)] py-8">
                <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 animate-fadeUp">
                  <span>{quizTypes.find(q => q.type === selectedQuizType)?.emoji}</span>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {quizTypes.find(q => q.type === selectedQuizType)?.title} · {quizTopic}
                  </span>
                  <button onClick={resetQuiz} className="ml-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors hover:scale-110" title="Exit quiz">✕</button>
                </div>

                {selectedQuizType === "flashcard" && renderFlashcard()}
                {selectedQuizType === "truefalse" && renderTrueFalse()}
                {selectedQuizType === "identification" && renderIdentification()}
                {selectedQuizType === "enumeration" && renderEnumeration()}
              </div>

            ) : mode === "quiz" && quizStep === "results" ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8">
                <div className="text-center max-w-sm w-full bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm results-card">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-6 score-bounce">
                    <span className="text-4xl">
                      {quizResults && (quizResults.score / quizResults.total) >= 0.8 ? "🎉"
                        : quizResults && (quizResults.score / quizResults.total) >= 0.5 ? "👍"
                        : "💪"}
                    </span>
                  </div>
                  <h2 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 score-count">
                    {quizResults?.score}<span className="text-3xl text-zinc-400 dark:text-zinc-500">/{quizResults?.total}</span>
                  </h2>
                  <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                    {quizResults ? Math.round((quizResults.score / quizResults.total) * 100) : 0}%
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    {quizTopic} · {quizTypes.find(q => q.type === selectedQuizType)?.title}
                  </p>
                  <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
                    {quizResults && (quizResults.score / quizResults.total) >= 0.9
                      ? "Outstanding! You mastered this topic! 🌟"
                      : quizResults && (quizResults.score / quizResults.total) >= 0.8
                      ? "Excellent work! Keep it up! 🚀"
                      : quizResults && (quizResults.score / quizResults.total) >= 0.6
                      ? "Good effort! Review and try again! 📚"
                      : "Keep practicing — you'll get there! 💪"}
                  </p>
                  <button onClick={resetQuiz} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 active:scale-[0.98]">
                    Try Another Quiz
                  </button>
                </div>
              </div>

            ) : mode === "summarize" && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8">
                <div className="text-center mb-8 animate-fadeUp" style={{ animationDelay: "40ms" }}>
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Note Summarizer</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Paste your notes and configure your summary</p>
                </div>

                <div className="w-full max-w-2xl space-y-6">
                  {[
                    { label: "Tone / Style", items: summarizeTones, value: summarizeTone, setter: setSummarizeTone },
                    { label: "Format", items: summarizeFormats, value: summarizeFormat, setter: setSummarizeFormat },
                    { label: "Length", items: summarizeLengths, value: summarizeLength, setter: setSummarizeLength },
                  ].map((group, gi) => (
                    <div key={group.label} className="animate-fadeUp" style={{ animationDelay: `${80 + gi * 60}ms` }}>
                      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2.5">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map(t => (
                          <button key={t} onClick={() => group.setter(t)} className={`${pillBase} ${group.value === t ? pillSelected : pillUnselected}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="animate-fadeUp" style={{ animationDelay: "260ms" }}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2.5">Your Notes</p>
                    <textarea
                      value={summarizeText}
                      onChange={e => setSummarizeText(e.target.value)}
                      placeholder="Paste your notes, lecture text, or any content here..."
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 dark:focus:border-[#63dcb4] focus:ring-2 focus:ring-indigo-100 dark:focus:ring-[#63dcb4]/20 transition-all duration-200 resize-none text-sm leading-relaxed"
                    />
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 text-right">{summarizeText.length} chars</p>
                  </div>

                  <button
                    onClick={sendSummarize}
                    disabled={!summarizeText.trim() || loading}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] animate-fadeUp"
                    style={{ animationDelay: "300ms" }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Summarizing...
                      </span>
                    ) : "Summarize →"}
                  </button>
                </div>
              </div>

            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 animate-fadeUp logo-float" style={{ animationDelay: "40ms" }}>
                      <StudyAILogo size={52} />
                    </div>
                    <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 animate-fadeUp" style={{ animationDelay: "80ms" }}>
                      What are we studying today?
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed animate-fadeUp" style={{ animationDelay: "120ms" }}>
                      Ask me anything about your studies. I can explain concepts, quiz you, or summarize notes.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(suggestion)}
                          className="suggestion-card p-3 text-left text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 active:scale-[0.98]"
                          style={{ animation: `fadeUp 0.3s ease forwards`, animationDelay: `${160 + idx * 35}ms`, opacity: 0 }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`group flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} message-enter`}
                        style={{ animation: `messageSlide 0.35s cubic-bezier(0.34,1.3,0.64,1) forwards`, animationDelay: `${Math.min(i * 20, 120)}ms`, opacity: 0 }}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-[#63dcb4]/20 border border-[#63dcb4]/30 flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110">
                            <span className="text-xs font-bold text-[#63dcb4]">S</span>
                          </div>
                        )}

                        <div className={`max-w-xl ${msg.role === "user" ? "text-right" : "flex-1"}`}>
                          <p className="text-xs font-medium mb-1 text-zinc-400 dark:text-zinc-500">
                            {msg.role === "user" ? "You" : "StudyAI"}
                          </p>
                          {msg.role === "user" ? (
                            <div className="inline-block text-left bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed px-4 py-2.5 rounded-2xl rounded-tr-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-150">
                              {msg.content}
                            </div>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-sm leading-7">
                              <ReactMarkdown
                                components={{
                                  code: ({ inline, children, ...props }: any) =>
                                    inline ? (
                                      <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-xl overflow-x-auto my-3 font-mono text-xs" {...props}>
                                        <code>{children}</code>
                                      </pre>
                                    ),
                                  a: ({ children, ...props }: any) => (
                                    <a className="text-[#63dcb4] hover:underline" {...props}>{children}</a>
                                  ),
                                  h1: ({ children }: any) => <h1 className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">{children}</h1>,
                                  h2: ({ children }: any) => <h2 className="text-base font-semibold mt-3 mb-2 text-zinc-900 dark:text-zinc-100">{children}</h2>,
                                  h3: ({ children }: any) => <h3 className="text-sm font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100">{children}</h3>,
                                  ul: ({ children }: any) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                  ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                  li: ({ children }: any) => <li className="text-sm">{children}</li>,
                                  blockquote: ({ children }: any) => (
                                    <blockquote className="border-l-2 border-[#63dcb4]/50 pl-3 italic text-zinc-500 dark:text-zinc-400 my-2">{children}</blockquote>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {msg.role === "assistant" && (
                          <button
                            onClick={() => copyToClipboard(msg.content, i)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all duration-150 flex-shrink-0 self-start mt-6 hover:scale-110"
                            title="Copy response"
                          >
                            {copied === i
                              ? <Icon name="check" className="text-sm text-[#63dcb4]" />
                              : <Icon name="content_copy" className="text-sm" />
                            }
                          </button>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-3 justify-start animate-fadeUp">
                        <div className="w-7 h-7 rounded-full bg-[#63dcb4]/20 border border-[#63dcb4]/30 flex items-center justify-center flex-shrink-0 typing-pulse">
                          <span className="text-xs font-bold text-[#63dcb4]">S</span>
                        </div>
                        <div className="flex gap-1 pt-2">
                          <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full typing-dot" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full typing-dot" style={{ animationDelay: "160ms" }} />
                          <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full typing-dot" style={{ animationDelay: "320ms" }} />
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Input bar ── */}
        {mode !== "quiz" && !(mode === "summarize" && messages.length === 0) && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f10] px-4 py-4 flex-shrink-0 input-bar-slide">
            <div className="max-w-2xl mx-auto space-y-2">
              <div className={`flex items-center gap-2 bg-white dark:bg-zinc-800/80 border rounded-2xl px-4 py-3 transition-all duration-200 ${
                inputFocused
                  ? "border-zinc-400 dark:border-zinc-500 ring-2 ring-zinc-100 dark:ring-zinc-800 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Ask me anything about your studies..."
                  className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 ${input.trim() ? "hover:scale-105 active:scale-95" : ""}`}
                >
                  <Icon name="send" className="text-sm" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 px-1">
                <span>Press Enter to send</span>
                <span className={`transition-colors duration-200 ${input.length > 200 ? "text-amber-400" : ""}`}>{input.length} chars</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Delete session confirm modal ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Chat Session"
        message="Are you sure you want to delete this chat session? This action cannot be undone."
        onConfirm={() => deleteTarget && deleteSession(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Clear history confirm modal ── */}
      <ConfirmModal
        open={clearHistoryConfirm}
        title="Clear All History"
        message="This will permanently delete all your chat sessions and messages. This action cannot be undone."
        onConfirm={clearAllHistory}
        onCancel={() => setClearHistoryConfirm(false)}
      />

      {/* ── Privacy Policy Modal ── */}
      {showPrivacyPolicy && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 modal-backdrop"
          onClick={() => setShowPrivacyPolicy(false)}
        >
          <div
            className="bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden modal-enter"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#63dcb4]/15 flex items-center justify-center">
                  <Icon name="shield" className="text-sm text-[#63dcb4]" />
                </div>
                <h3 className="sidebar-font text-sm font-semibold text-zinc-900 dark:text-zinc-100">Privacy Policy</h3>
              </div>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150 hover:scale-110 hover:rotate-90"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300">
                <ReactMarkdown>{PRIVACY_POLICY}</ReactMarkdown>
              </div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 py-3 flex-shrink-0">
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-150 active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

        .sidebar-font {
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          letter-spacing: -0.01em;
        }

        .app-root {
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .app-mounted {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes messageSlide {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes inputBarSlide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoPulse {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(99,220,180,0)); }
          50%       { filter: drop-shadow(0 0 6px rgba(99,220,180,0.5)); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes progressFill {
          from { width: 0%; }
        }
        @keyframes scorePopIn {
          0%   { opacity: 0; transform: scale(0.5) rotate(-5deg); }
          70%  { transform: scale(1.12) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes scoreBounce {
          0%   { transform: translateY(0); }
          30%  { transform: translateY(-12px); }
          50%  { transform: translateY(0); }
          70%  { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pillPress {
          0%   { transform: scale(1); }
          50%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }

        .animate-fadeUp   { animation: fadeUp   0.3s ease forwards; }
        .animate-fadeIn   { animation: fadeIn   0.25s ease forwards; }
        .animate-slideUp  { animation: slideUp  0.35s cubic-bezier(0.34,1.2,0.64,1) forwards; }

        .header-slide-down { animation: headerSlide 0.4s ease forwards; }
        .input-bar-slide   { animation: inputBarSlide 0.4s ease 0.15s both; }

        .sidebar-transition {
          transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-open > div {
          animation: fadeIn 0.2s ease 0.1s both;
        }

        .modal-backdrop { animation: backdropIn 0.2s ease forwards; }
        .modal-enter    { animation: modalIn    0.28s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        .dropdown-enter { animation: dropdownFadeIn 0.18s cubic-bezier(0.34,1.2,0.64,1) forwards; }

        .dropdown-item:nth-child(1) { animation: fadeUp 0.18s ease 0.02s both; }
        .dropdown-item:nth-child(2) { animation: fadeUp 0.18s ease 0.05s both; }
        .dropdown-item:nth-child(3) { animation: fadeUp 0.18s ease 0.08s both; }
        .dropdown-item:nth-child(4) { animation: fadeUp 0.18s ease 0.11s both; }
        .dropdown-item:nth-child(5) { animation: fadeUp 0.18s ease 0.14s both; }

        .logo-pulse { animation: logoPulse 3.5s ease-in-out infinite; }
        .logo-float { animation: logoFloat 4s ease-in-out infinite; }

        .progress-bar-fill { transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }

        .score-bounce { animation: scoreBounce 0.8s ease 0.3s both; }
        .score-count  { animation: scorePopIn  0.5s cubic-bezier(0.34,1.4,0.64,1) 0.15s both; }
        .results-card { animation: slideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards; }

        .typing-dot { animation: typingDot 1.2s ease-in-out infinite; }
        .typing-pulse { animation: logoPulse 1.5s ease-in-out infinite; }

        .pill-btn:active { animation: pillPress 0.15s ease forwards; }

        .mode-active {
          position: relative;
        }
        .mode-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 2px;
          background: #63dcb4;
          border-radius: 2px;
          animation: fadeIn 0.2s ease forwards;
        }

        .session-item {
          position: relative;
          overflow: hidden;
          transition: background 0.18s ease, color 0.18s ease, transform 0.12s ease;
        }
        .session-item:hover { transform: translateX(2px); }
        .session-accent {
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 2px; height: 60%;
          border-radius: 0 2px 2px 0;
          background: #63dcb4;
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
          opacity: 0;
        }
        .session-item:hover .session-accent,
        .session-active .session-accent { transform: translateY(-50%) scaleY(1); opacity: 1; }
        .session-active  { background: #f4f4f5; color: #18181b; }
        .dark .session-active { background: #1B4332; color: #fff; }
        .session-inactive { color: #a1a1aa; }
        .session-inactive:hover { background: #f9fafb; color: #18181b; }
        .dark .session-inactive { color: #71717a; }
        .dark .session-inactive:hover {
          background: linear-gradient(to right, #1B4332cc, #2D6A4F88);
          color: #fff;
        }

        .sidebar-item-btn { position: relative; overflow: hidden; }
        .sidebar-item-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(99,220,180,0.08), transparent);
          transform: translateX(-100%);
          transition: transform 0s;
        }
        .sidebar-item-btn:hover::after {
          transform: translateX(100%);
          transition: transform 0.5s ease;
        }

        .quiz-type-card { position: relative; overflow: hidden; }
        .quiz-type-card::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(99,220,180,0.08) 50%, transparent 60%);
          transform: translateX(-100%) rotate(10deg);
          transition: transform 0s;
        }
        .quiz-type-card:hover::after {
          transform: translateX(150%) rotate(10deg);
          transition: transform 0.55s ease;
        }

        .suggestion-card { position: relative; overflow: hidden; }
        .suggestion-card::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(99,220,180,0.06), transparent);
          transform: translateX(-100%);
        }
        .suggestion-card:hover::after {
          transform: translateX(100%);
          transition: transform 0.4s ease;
        }

        .flashcard-scene { perspective: 1200px; }
        .flashcard-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .flashcard-inner.flipped { transform: rotateY(180deg); }
        .flashcard-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .flashcard-back { transform: rotateY(180deg); }
        .flashcard-scene:hover .flashcard-inner:not(.flipped) {
          transform: rotateY(4deg) rotateX(2deg);
        }
      `}</style>
    </div>
  )
}