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
import {
  tutorResponses,
  suggestedPrompts,
  type TutorMode,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Message = {
  role: 'user' | 'tutor'
  mode?: TutorMode
  title?: string
  text: string
}

const modes: { mode: TutorMode; icon: typeof Lightbulb; hint: string }[] = [
  { mode: 'Hint', icon: Lightbulb, hint: 'Nudge me in the right direction' },
  { mode: 'Explanation', icon: BookOpen, hint: 'Teach the concept clearly' },
  { mode: 'Example', icon: Code2, hint: 'Show me worked code' },
  { mode: 'Practice', icon: PencilRuler, hint: 'Quiz me to check understanding' },
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
      title: 'Learning: Java Inheritance',
      text: "I am your Learnova tutor. We are focusing on Java Inheritance — your highest-priority topic. Pick a mode below or ask anything. I will scaffold you from Hint to Explanation to Example to a Practice question.",
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToEnd = () =>
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }),
    )

  const respond = (mode: TutorMode) => {
    // FUTURE: replace this canned lookup with a Gemini streaming call.
    const r = tutorResponses[mode]
    setMessages((prev) => [...prev, { role: 'tutor', mode, title: r.title, text: r.body }])
    scrollToEnd()
  }

  const send = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    const mode = promptToMode[text] ?? 'Explanation'
    setTimeout(() => respond(mode), 250)
    scrollToEnd()
  }

  const runMode = (mode: TutorMode) => {
    setMessages((prev) => [...prev, { role: 'user', text: `${mode} please` }])
    setTimeout(() => respond(mode), 250)
    scrollToEnd()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <Card className="glass-strong flex h-[560px] flex-col overflow-hidden p-0">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-blue text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-none">Learnova Tutor</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Adaptive · Java Inheritance</p>
          </div>
          <Badge variant="secondary" className="shadow-none">Gemini — coming soon</Badge>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  m.role === 'tutor'
                    ? 'bg-gradient-to-br from-violet to-blue text-primary-foreground'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {m.role === 'tutor' ? <Sparkles className="size-4" /> : <User className="size-4" />}
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
                <p className={cn('text-pretty', m.mode === 'Example' && 'whitespace-pre-wrap font-mono text-[13px]')}>
                  {m.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className="mb-2.5 flex flex-wrap gap-2">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-violet/40 hover:text-foreground"
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
              placeholder="Ask about Java Inheritance..."
              className="bg-background/50"
            />
            <Button type="submit" size="icon" aria-label="Send">
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
          <button key={mode} onClick={() => runMode(mode)} className="w-full text-left">
            <Card className="glass gap-0 p-4 transition-colors hover:border-violet/40">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-violet/15 text-violet">
                  <Icon className="size-4" />
                </span>
                <span className="font-medium">{mode}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-pretty">{hint}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
