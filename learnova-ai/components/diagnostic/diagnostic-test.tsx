'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Send,
  RotateCcw,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MistakeBreakdown } from '@/components/mistake-breakdown'
import { MasteryRing } from '@/components/mastery-ring'
import { diagnosticQuestions } from '@/lib/mock-data'
import {
  calculateScore,
  classifyMastery,
} from '@/lib/adaptiveEngine'
import { cn } from '@/lib/utils'

export function DiagnosticTest() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const total = diagnosticQuestions.length
  const q = diagnosticQuestions[current]

  const answeredCount = Object.keys(answers).length

  const progress = Math.round(((current + 1) / total) * 100)

  // Calculate actual score
  const correct = diagnosticQuestions.filter(
    (question) =>
      answers[question.id] === question.correctIndex
  ).length

  const score = calculateScore(correct, total)
  const band = classifyMastery(score)

  const select = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: optionIndex,
    }))
  }

  const submitTest = () => {
    // Save score so Analysis page can use it
    localStorage.setItem(
      'learnova_diagnostic_score',
      String(score)
    )

    // Save correct answers count
    localStorage.setItem(
      'learnova_diagnostic_correct',
      String(correct)
    )

    // Save total questions
    localStorage.setItem(
      'learnova_diagnostic_total',
      String(total)
    )

    setSubmitted(true)
  }

  const reset = () => {
    setAnswers({})
    setCurrent(0)
    setSubmitted(false)
  }

  // RESULT SCREEN
  if (submitted) {
    return (
      <div className="space-y-6">

        <Card className="glass-strong flex flex-col items-center gap-5 p-8 text-center">

          <MasteryRing
            value={score}
            label={band}
            sublabel="Score band"
          />

          <div className="space-y-1">

            <h2 className="text-xl font-semibold">
              Java Inheritance — Score {score}%
            </h2>

            <p className="text-sm text-muted-foreground">
              {correct} of {total} correct. Your diagnostic
              performance has been calculated from your answers.
            </p>

          </div>

          <Badge
            className={
              band === 'Weak'
                ? 'bg-warning/15 text-warning shadow-none'
                : band === 'Average'
                  ? 'bg-blue/15 text-blue shadow-none'
                  : 'bg-success/15 text-success shadow-none'
            }
          >
            {band}
            {band === 'Weak'
              ? ' — needs attention'
              : band === 'Average'
                ? ' — keep practicing'
                : ' — strong performance'}
          </Badge>

        </Card>

        {/* TOPIC MASTERY + MISTAKES */}

        <div className="grid gap-4 lg:grid-cols-2">

          <Card className="glass p-6">

            <h3 className="text-base font-semibold">
              Topic mastery
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Estimated mastery after this diagnostic.
            </p>

            <div className="mt-5 space-y-3">

              <div className="flex items-center justify-between text-sm">

                <span>
                  Java · Inheritance
                </span>

                <span className="font-semibold">
                  {score}%
                </span>

              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">

                <div
                  className="h-full rounded-full bg-warning transition-all duration-500"
                  style={{ width: `${score}%` }}
                />

              </div>

            </div>

          </Card>

          <Card className="glass p-6">

            <h3 className="text-base font-semibold">
              Mistake types
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Your incorrect answers.
            </p>

            <div className="mt-5">
              <MistakeBreakdown />
            </div>

          </Card>

        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-3">

          <Button
            nativeButton={false}
            render={<Link href="/analysis" />}
          >
            See AI analysis
            <ArrowRight className="size-4" />
          </Button>

          <Button
            variant="outline"
            onClick={reset}
          >
            <RotateCcw className="size-4" />
            Retake test
          </Button>

        </div>

      </div>
    )
  }

  // QUESTION SCREEN
  return (
    <div className="space-y-6">

      {/* PROGRESS */}

      <Card className="glass p-4">

        <div className="flex items-center justify-between text-sm">

          <span className="text-muted-foreground">
            Question {current + 1} of {total}
          </span>

          <span className="font-medium text-violet">
            {answeredCount}/{total} answered
          </span>

        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">

          <div
            className="h-full rounded-full bg-gradient-to-r from-violet to-blue transition-all duration-500"
            style={{ width: `${progress}%` }}
          />

        </div>

      </Card>

      {/* QUESTION */}

      <Card className="glass-strong p-6 sm:p-8">

        <div className="flex flex-wrap items-center gap-2">

          <Badge
            variant="secondary"
            className="shadow-none"
          >
            {q.subject}
          </Badge>

          <Badge
            variant="secondary"
            className="shadow-none"
          >
            {q.topic}
          </Badge>

          <Badge className="bg-cyan/15 text-cyan shadow-none">
            {q.difficulty}
          </Badge>

        </div>

        <h2 className="mt-4 text-lg font-medium leading-relaxed text-balance">
          {q.prompt}
        </h2>

        {/* OPTIONS */}

        <div className="mt-6 space-y-3">

          {q.options.map((opt, i) => {

            const selected = answers[q.id] === i

            return (
              <button
                key={i}
                onClick={() => select(i)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all',
                  selected
                    ? 'border-violet/50 bg-violet/10 text-foreground'
                    : 'border-border bg-background/40 text-foreground/90 hover:border-violet/30 hover:bg-background/70',
                )}
              >

                {selected ? (
                  <CheckCircle2 className="size-5 shrink-0 text-violet" />
                ) : (
                  <Circle className="size-5 shrink-0 text-muted-foreground" />
                )}

                <span className="font-mono text-xs text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>

                {opt}

              </button>
            )
          })}

        </div>

      </Card>

      {/* NAVIGATION */}

      <div className="flex items-center justify-between gap-3">

        <Button
          variant="outline"
          onClick={() =>
            setCurrent((c) => Math.max(0, c - 1))
          }
          disabled={current === 0}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        {current < total - 1 ? (

          <Button
            onClick={() =>
              setCurrent((c) =>
                Math.min(total - 1, c + 1)
              )
            }
          >
            Next
            <ChevronRight className="size-4" />
          </Button>

        ) : (

          <Button
            onClick={submitTest}
            disabled={answeredCount < total}
          >
            <Send className="size-4" />
            Submit test
          </Button>

        )}

      </div>

    </div>
  )
}