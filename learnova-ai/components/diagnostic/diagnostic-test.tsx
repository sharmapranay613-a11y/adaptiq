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
import { MasteryRing } from '@/components/mastery-ring'

import { diagnosticQuestions } from '@/lib/mock-data'

import {
  calculateScore,
  classifyMastery,
} from '@/lib/adaptiveEngine'

import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type TopicResult = {
  subject: string
  topic: string
  correct: number
  total: number
  score: number
  mistakes: number
}

type ConfidenceLevel = 25 | 50 | 75 | 100

export function DiagnosticTest() {
  const [current, setCurrent] = useState(0)

  const [answers, setAnswers] = useState<
    Record<number, number>
  >({})

  const [confidences, setConfidences] = useState<
    Record<number, ConfidenceLevel>
  >({})

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [topicResults, setTopicResults] = useState<
    TopicResult[]
  >([])

  const total = diagnosticQuestions.length
  const q = diagnosticQuestions[current]

  const answeredCount = Object.keys(answers).length

  const progress =
    total > 0
      ? Math.round(((current + 1) / total) * 100)
      : 0

  // --------------------------------------------------
  // Overall score
  // --------------------------------------------------

  const correct = diagnosticQuestions.filter(
    (question) =>
      answers[question.id] === question.correctIndex
  ).length

  const score = calculateScore(correct, total)

  const band = classifyMastery(score)

  // --------------------------------------------------
  // Select answer
  // --------------------------------------------------

  const select = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: optionIndex,
    }))
  }

  // --------------------------------------------------
  // Select confidence
  // --------------------------------------------------

  const selectConfidence = (
    confidence: ConfidenceLevel
  ) => {
    setConfidences((prev) => ({
      ...prev,
      [q.id]: confidence,
    }))
  }

  // --------------------------------------------------
  // Normalize strings
  // --------------------------------------------------

  const normalize = (value: string) =>
    value.trim().toLowerCase()

  // --------------------------------------------------
  // Calculate topic-level performance
  // --------------------------------------------------

  const calculateTopicResults = (): TopicResult[] => {
    const topicMap = new Map<
      string,
      {
        subject: string
        topic: string
        correct: number
        total: number
      }
    >()

    diagnosticQuestions.forEach((question) => {
      const key = `${normalize(
        question.subject
      )}::${normalize(question.topic)}`

      const existing = topicMap.get(key)

      const isCorrect =
        answers[question.id] === question.correctIndex

      if (existing) {
        existing.total += 1

        if (isCorrect) {
          existing.correct += 1
        }
      } else {
        topicMap.set(key, {
          subject: question.subject,
          topic: question.topic,
          correct: isCorrect ? 1 : 0,
          total: 1,
        })
      }
    })

    return Array.from(topicMap.values()).map((item) => ({
      subject: item.subject,
      topic: item.topic,
      correct: item.correct,
      total: item.total,
      score: calculateScore(
        item.correct,
        item.total
      ),
      mistakes: item.total - item.correct,
    }))
  }

  // --------------------------------------------------
  // Submit diagnostic
  // --------------------------------------------------

  const submitTest = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      // -----------------------------------------------
      // 1. Get logged-in user
      // -----------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error(
          'Failed to get user:',
          userError
        )

        alert(
          'Unable to verify your login. Please log in again.'
        )

        return
      }

      if (!user) {
        alert(
          'Please log in before submitting the test.'
        )

        return
      }

      // -----------------------------------------------
      // 2. Calculate topic results
      // -----------------------------------------------

      const calculatedTopicResults =
        calculateTopicResults()

      console.log(
        'Calculated topic results:',
        calculatedTopicResults
      )

      // -----------------------------------------------
      // 3. Save overall diagnostic attempt
      // -----------------------------------------------

      const {
        data: attempt,
        error: diagnosticError,
      } = await supabase
        .from('diagnostic_attempts')
        .insert({
          user_id: user.id,
          score,
          correct_answers: correct,
          total_questions: total,
        })
        .select('id')
        .single()

      if (diagnosticError) {
        console.error(
          'Failed to save diagnostic attempt:',
          diagnosticError
        )

        alert(
          'Could not save your test result. Please try again.'
        )

        return
      }

      if (!attempt) {
        alert(
          'Diagnostic attempt was saved, but its ID could not be retrieved.'
        )

        return
      }

      console.log(
        'Diagnostic attempt created:',
        attempt.id
      )

      // -----------------------------------------------
      // 4. Save individual answers
      // -----------------------------------------------

      const answerRows = diagnosticQuestions.map(
        (question) => {
          const selectedAnswer =
            answers[question.id]

          const isCorrect =
            selectedAnswer === question.correctIndex

          return {
            attempt_id: attempt.id,
            user_id: user.id,
            subject: question.subject,
            topic: question.topic,
            question_text: question.prompt,
            selected_answer: selectedAnswer,
            correct_answer: question.correctIndex,
            is_correct: isCorrect,

            // If confidence somehow wasn't selected,
            // store 0 instead of breaking submission.
            confidence:
              confidences[question.id] ?? 0,

            // Mistake classification will be added
            // in the next step.
            mistake_type: null,
          }
        }
      )

      console.log(
        'Saving diagnostic answers:',
        answerRows
      )

      const {
        error: answersError,
      } = await supabase
        .from('diagnostic_answers')
        .insert(answerRows)

      if (answersError) {
        console.error(
          'Failed to save diagnostic answers:',
          answersError
        )

        alert(
          'Your score was saved, but individual answers could not be saved.'
        )
      } else {
        console.log(
          `Saved ${answerRows.length} individual answers.`
        )
      }

      // -----------------------------------------------
      // 5. Get user's subjects
      // -----------------------------------------------

      const {
        data: subjects,
        error: subjectsError,
      } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', user.id)

      if (subjectsError) {
        console.error(
          'Failed to load subjects:',
          subjectsError
        )

        alert(
          'Diagnostic was saved, but your topic performance could not be updated.'
        )

        setTopicResults(
          calculatedTopicResults
        )

        setSubmitted(true)

        return
      }

      // -----------------------------------------------
      // 6. Update matching topics
      // -----------------------------------------------

      let updatedTopics = 0

      for (const result of calculatedTopicResults) {
        const matchingSubject =
          (subjects ?? []).find(
            (subject) =>
              normalize(subject.name) ===
              normalize(result.subject)
          )

        if (!matchingSubject) {
          console.warn(
            `No matching subject found for "${result.subject}".`
          )

          continue
        }

        // ---------------------------------------------
        // Find topic inside subject
        // ---------------------------------------------

        const {
          data: matchingTopics,
          error: topicLookupError,
        } = await supabase
          .from('topics')
          .select(
            'id, name, score, confidence, recent_mistakes'
          )
          .eq(
            'subject_id',
            matchingSubject.id
          )

        if (topicLookupError) {
          console.error(
            `Failed to load topics for ${result.subject}:`,
            topicLookupError
          )

          continue
        }

        const matchingTopic =
          (matchingTopics ?? []).find(
            (topic) =>
              normalize(topic.name) ===
              normalize(result.topic)
          )

        if (!matchingTopic) {
          console.warn(
            `No matching topic found for "${result.topic}" in "${result.subject}".`
          )

          continue
        }

        // ---------------------------------------------
        // Calculate average confidence for this topic
        // ---------------------------------------------

        const topicQuestions =
          diagnosticQuestions.filter(
            (question) =>
              normalize(question.subject) ===
                normalize(result.subject) &&
              normalize(question.topic) ===
                normalize(result.topic)
          )

        const topicConfidenceValues =
          topicQuestions
            .map(
              (question) =>
                confidences[question.id]
            )
            .filter(
              (
                value
              ): value is ConfidenceLevel =>
                value !== undefined
            )

        const averageConfidence =
          topicConfidenceValues.length > 0
            ? Math.round(
                topicConfidenceValues.reduce(
                  (sum, value) =>
                    sum + value,
                  0
                ) /
                  topicConfidenceValues.length
              )
            : 0

        // ---------------------------------------------
        // Update topic
        // ---------------------------------------------

        const {
          error: updateError,
        } = await supabase
          .from('topics')
          .update({
            score: result.score,
            confidence:
              averageConfidence,

            // Number of wrong answers
            // in this diagnostic.
            recent_mistakes:
              result.mistakes,
          })
          .eq(
            'id',
            matchingTopic.id
          )

        if (updateError) {
          console.error(
            `Failed to update topic "${result.topic}":`,
            updateError
          )

          continue
        }

        updatedTopics += 1

        console.log(
          `Updated ${result.subject} → ${result.topic}: ${result.score}% performance, ${averageConfidence}% confidence`
        )
      }

      // -----------------------------------------------
      // 7. Show result
      // -----------------------------------------------

      console.log(
        `Diagnostic saved. ${updatedTopics}/${calculatedTopicResults.length} topics updated.`
      )

      setTopicResults(
        calculatedTopicResults
      )

      setSubmitted(true)
    } catch (error) {
      console.error(
        'Unexpected error submitting diagnostic:',
        error
      )

      alert(
        'Something went wrong while submitting the test.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------

  const reset = () => {
    setAnswers({})
    setConfidences({})
    setCurrent(0)
    setSubmitted(false)
    setTopicResults([])
  }

  // ==================================================
  // RESULT SCREEN
  // ==================================================

  if (submitted) {
    const weakestTopic =
      topicResults.length > 0
        ? [...topicResults].sort(
            (a, b) =>
              a.score - b.score
          )[0]
        : null

    return (
      <div className="space-y-6">

        {/* Overall result */}

        <Card className="glass-strong flex flex-col items-center gap-5 p-8 text-center">

          <MasteryRing
            value={score}
            label={band}
            sublabel="Score band"
          />

          <div className="space-y-1">

            <h2 className="text-xl font-semibold">
              Diagnostic Complete — Score {score}%
            </h2>

            <p className="text-sm text-muted-foreground">
              {correct} of {total} correct. Your performance
              has been analyzed at the topic level.
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

        {/* Topic mastery */}

        <Card className="glass p-6">

          <h3 className="text-base font-semibold">
            Topic mastery
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Your measured performance for each topic in this
            diagnostic.
          </p>

          <div className="mt-5 space-y-4">

            {topicResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No topic-level results were calculated.
              </p>
            ) : (
              topicResults.map((topic) => (
                <div
                  key={`${topic.subject}-${topic.topic}`}
                  className="space-y-2"
                >

                  <div className="flex items-center justify-between text-sm">

                    <span>
                      {topic.topic}

                      <span className="ml-1 text-xs text-muted-foreground">
                        · {topic.subject}
                      </span>
                    </span>

                    <span className="font-semibold">
                      {topic.score}%
                    </span>

                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary">

                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        topic.score < 50
                          ? 'bg-warning'
                          : topic.score <= 75
                            ? 'bg-blue'
                            : 'bg-success'
                      )}
                      style={{
                        width: `${topic.score}%`,
                      }}
                    />

                  </div>

                  <p className="text-xs text-muted-foreground">
                    {topic.correct}/{topic.total} correct
                    {topic.mistakes > 0
                      ? ` · ${topic.mistakes} mistake${topic.mistakes > 1 ? 's' : ''}`
                      : ' · No mistakes'}
                  </p>

                </div>
              ))
            )}

          </div>

        </Card>

        {/* Weakest topic */}

        {weakestTopic && (
          <Card className="glass border-warning/20 p-6">

            <h3 className="text-base font-semibold">
              Priority topic
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Learnova will prioritize this area in your
              adaptive learning plan.
            </p>

            <div className="mt-4 rounded-xl bg-warning/10 p-4">

              <p className="font-semibold">
                {weakestTopic.topic}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {weakestTopic.subject} · {weakestTopic.score}%
                mastery · {weakestTopic.mistakes} mistake
                {weakestTopic.mistakes !== 1 ? 's' : ''}
              </p>

            </div>

          </Card>
        )}

        {/* Actions */}

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

  // ==================================================
  // QUESTION SCREEN
  // ==================================================

  const selectedConfidence =
    confidences[q.id]

  const hasAnswer =
    answers[q.id] !== undefined

  return (
    <div className="space-y-6">

      {/* Progress */}

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
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </Card>

      {/* Question */}

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

        {/* Options */}

        <div className="mt-6 space-y-3">

          {q.options.map((opt, i) => {

            const selected =
              answers[q.id] === i

            return (
              <button
                key={i}
                onClick={() => select(i)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all',
                  selected
                    ? 'border-violet/50 bg-violet/10 text-foreground'
                    : 'border-border bg-background/40 text-foreground/90 hover:border-violet/30 hover:bg-background/70'
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

        {/* Confidence */}

        <div className="mt-8 border-t pt-6">

          <div className="mb-3">

            <h3 className="text-sm font-semibold">
              How confident are you in your answer?
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              This helps Learnova compare your confidence
              with your actual performance.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            {[
              {
                value: 25 as ConfidenceLevel,
                label: 'Guessing',
              },
              {
                value: 50 as ConfidenceLevel,
                label: 'Somewhat confident',
              },
              {
                value: 75 as ConfidenceLevel,
                label: 'Confident',
              },
              {
                value: 100 as ConfidenceLevel,
                label: 'Very confident',
              },
            ].map((level) => {

              const selected =
                selectedConfidence ===
                level.value

              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    selectConfidence(
                      level.value
                    )
                  }
                  disabled={!hasAnswer}
                  className={cn(
                    'rounded-xl border p-3 text-center transition-all',
                    !hasAnswer &&
                      'cursor-not-allowed opacity-50',
                    selected
                      ? 'border-violet/50 bg-violet/10'
                      : 'border-border bg-background/40 hover:border-violet/30 hover:bg-background/70'
                  )}
                >

                  <div className="text-lg font-semibold">
                    {level.value}%
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {level.label}
                  </div>

                </button>
              )
            })}

          </div>

          {!hasAnswer && (
            <p className="mt-3 text-xs text-warning">
              Select an answer first.
            </p>
          )}

        </div>

      </Card>

      {/* Navigation */}

      <div className="flex items-center justify-between gap-3">

        <Button
          variant="outline"
          onClick={() =>
            setCurrent((c) =>
              Math.max(0, c - 1)
            )
          }
          disabled={
            current === 0 ||
            isSubmitting
          }
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        {current < total - 1 ? (

          <Button
            onClick={() =>
              setCurrent((c) =>
                Math.min(
                  total - 1,
                  c + 1
                )
              )
            }
            disabled={
              isSubmitting ||
              !hasAnswer ||
              !selectedConfidence
            }
          >
            Next
            <ChevronRight className="size-4" />
          </Button>

        ) : (

          <Button
            onClick={submitTest}
            disabled={
              answeredCount < total ||
              Object.keys(confidences).length <
                total ||
              isSubmitting
            }
          >
            <Send className="size-4" />

            {isSubmitting
              ? 'Saving...'
              : 'Submit test'}

          </Button>

        )}

      </div>

    </div>
  )
}