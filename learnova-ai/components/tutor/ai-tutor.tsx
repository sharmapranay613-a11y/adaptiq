'use client'

import { useRef, useState } from 'react'
import {
  Sparkles,
  Lightbulb,
  BookOpen,
  Code2,
  PencilRuler,
  Send,
  User,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { suggestedPrompts, type TutorMode } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Message = {
  role: 'user' | 'tutor'
  mode?: TutorMode
  title?: string
  text: string
}

const modes: {
  mode: TutorMode
  icon: typeof Lightbulb
  hint: string
}[] = [
  {
    mode: 'Hint',
    icon: Lightbulb,
    hint: 'Nudge me in the right direction',
  },
  {
    mode: 'Explanation',
    icon: BookOpen,
    hint: 'Teach the concept clearly',
  },
  {
    mode: 'Example',
    icon: Code2,
    hint: 'Show me a worked example',
  },
  {
    mode: 'Practice',
    icon: PencilRuler,
    hint: 'Quiz me to check understanding',
  },
]

const promptToMode: Record<string, TutorMode> = {
  'Explain simply': 'Explanation',
  'Give an example': 'Example',
  'Test my understanding': 'Practice',
  'Give me a hint': 'Hint',
}

export function AiTutor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'tutor',
      mode: 'Explanation',
      title: 'Learnova AI Tutor',
      text: 'Hi! I am your AI tutor. Ask me anything about your subject or choose a learning mode below.',
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToEnd = () =>
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      }),
    )

  const extractTutorText = (data: any, mode: TutorMode): string => {
    const result = data?.data ?? data

    if (typeof result === 'string') {
      return result
    }

    if (!result) {
      return 'Sorry, I could not generate a response.'
    }

    if (mode === 'Hint' && result.hint) {
      return result.hint
    }

    if (mode === 'Explanation' && result.simpleExplanation) {
      return result.simpleExplanation
    }

    if (mode === 'Example') {
      return (
        result.example ||
        result.workedExample ||
        result.codeExample ||
        result.simpleExplanation ||
        ''
      )
    }

    if (mode === 'Practice') {
      return (
        result.practiceQuestion ||
        result.question ||
        result.simpleExplanation ||
        ''
      )
    }

    return (
      result.response ||
      result.text ||
      result.answer ||
      result.message ||
      result.simpleExplanation ||
      result.hint ||
      result.example ||
      result.practiceQuestion ||
      JSON.stringify(result, null, 2)
    )
  }

  const askTutor = async (question: string, mode: TutorMode) => {
    try {
      setLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/tutor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            context: `The student is using Learnova AI. Learning mode: ${mode}.`,
          }),
        },
      )

      const contentType = response.headers.get('content-type') || ''

      let data: any

      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        throw new Error(text || 'Server returned an invalid response.')
      }

      if (!response.ok) {
        throw new Error(data?.error || 'AI tutor request failed.')
      }

      const tutorText = extractTutorText(data, mode)

      setMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          mode,
          title: `AI Tutor · ${mode}`,
          text: tutorText,
        },
      ])
    } catch (error) {
      console.error('Tutor error:', error)

      setMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          mode,
          title: 'AI Tutor',
          text:
            error instanceof Error
              ? `AI Tutor error: ${error.message}`
              : 'Sorry, I could not connect to the AI tutor right now. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
      scrollToEnd()
    }
  }

  const send = async (raw: string) => {
    const text = raw.trim()

    if (!text || loading) return

    const mode = promptToMode[text] ?? 'Explanation'

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text,
      },
    ])

    setInput('')
    scrollToEnd()

    await askTutor(text, mode)
  }

  const runMode = async (mode: TutorMode) => {
    if (loading) return

    const modePrompt =
      mode === 'Hint'
        ? 'Give me a hint to help me understand this topic.'
        : mode === 'Explanation'
          ? 'Explain this topic simply and clearly.'
          : mode === 'Example'
            ? 'Give me a simple worked example of this topic.'
            : 'Test my understanding with a practice question.'

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: `${mode} please`,
      },
    ])

    scrollToEnd()

    await askTutor(modePrompt, mode)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <Card className="glass-strong flex h-[560px] flex-col overflow-hidden p-0">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-blue text-primary-foreground">
            <Sparkles className="size-4" />
          </span>

          <div className="flex-1">
            <p className="text-sm font-semibold leading-none">
              Learnova Tutor
            </p>

            <p className="mt-1 text-[11px] text-muted-foreground">
              Adaptive · AI-powered learning
            </p>
          </div>

          <Badge variant="secondary" className="shadow-none">
            Gemini AI
          </Badge>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3',
                m.role === 'user' && 'flex-row-reverse',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  m.role === 'tutor'
                    ? 'bg-gradient-to-br from-violet to-blue text-primary-foreground'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {m.role === 'tutor' ? (
                  <Sparkles className="size-4" />
                ) : (
                  <User className="size-4" />
                )}
              </span>

              <div
                className={cn(
                  'max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed',
                  m.role === 'tutor'
                    ? 'border-border bg-background/50'
                    : 'border-violet/30 bg-violet/10',
                )}
              >
                {m.title && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet">
                    {m.title}
                  </p>
                )}

                <p
                  className={cn(
                    'text-pretty',
                    m.mode === 'Example' &&
                      'whitespace-pre-wrap font-mono text-[13px]',
                  )}
                >
                  {m.text}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-blue text-primary-foreground">
                <Sparkles className="size-4" />
              </span>

              <div className="rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="mb-2.5 flex flex-wrap gap-2">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                disabled={loading}
                className="rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-violet/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI tutor..."
              className="bg-background/50"
              disabled={loading}
            />

            <Button
              type="submit"
              size="icon"
              aria-label="Send"
              disabled={loading || !input.trim()}
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>

      <div className="space-y-3">
        <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Learning modes
        </p>

        {modes.map(({ mode, icon: Icon, hint }) => (
          <button
            key={mode}
            onClick={() => runMode(mode)}
            disabled={loading}
            className="w-full text-left disabled:cursor-not-allowed"
          >
            <Card className="glass gap-0 p-4 transition-colors hover:border-violet/40">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-violet/15 text-violet">
                  <Icon className="size-4" />
                </span>

                <span className="font-medium">{mode}</span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground text-pretty">
                {hint}
              </p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}