'use client'

import Link from 'next/link'
import {
  BrainCircuit,
  TriangleAlert,
  Lightbulb,
  ArrowRight,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { accentClasses, scoreAccent } from '@/lib/accents'
import { classifyMastery } from '@/lib/adaptiveEngine'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

type Subject = {
  id: string
  name: string
  exam_date: string | null
}

type Topic = {
  id: string
  subject_id: string
  name: string
  score: number
  confidence: number
  recent_mistakes: number
}

type Diagnostic = {
  score: number
  correct_answers: number
  total_questions: number
  created_at: string
}

type TopicWithSubject = Topic & {
  subjectName: string
}

export default function AnalysisPage() {
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [topics, setTopics] = useState<TopicWithSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true)
        setError('')

        // --------------------------------------------------
        // 1. Get logged-in user
        // --------------------------------------------------

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (!user) {
          setError('Please log in to view your analysis.')
          return
        }

        // --------------------------------------------------
        // 2. Get latest diagnostic attempt
        // --------------------------------------------------

        const {
          data: diagnosticData,
          error: diagnosticError,
        } = await supabase
          .from('diagnostic_attempts')
          .select(
            'score, correct_answers, total_questions, created_at'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (diagnosticError) {
          throw diagnosticError
        }

        if (diagnosticData) {
          setDiagnostic(diagnosticData)
        }

        // --------------------------------------------------
        // 3. Get user's subjects
        // --------------------------------------------------

        const {
          data: subjectData,
          error: subjectError,
        } = await supabase
          .from('subjects')
          .select('id, name, exam_date')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (subjectError) {
          throw subjectError
        }

        const subjects: Subject[] = subjectData ?? []

        // --------------------------------------------------
        // 4. Get user's topics
        // --------------------------------------------------

        if (subjects.length === 0) {
          setTopics([])
          return
        }

        const subjectIds = subjects.map((subject) => subject.id)

        const {
          data: topicData,
          error: topicError,
        } = await supabase
          .from('topics')
          .select(
            'id, subject_id, name, score, confidence, recent_mistakes'
          )
          .in('subject_id', subjectIds)
          .order('score', { ascending: true })

        if (topicError) {
          throw topicError
        }

        // --------------------------------------------------
        // 5. Attach subject name to each topic
        // --------------------------------------------------

        const subjectMap = new Map(
          subjects.map((subject) => [subject.id, subject.name])
        )

        const mappedTopics: TopicWithSubject[] = (topicData ?? []).map(
          (topic) => ({
            ...topic,
            score: Number(topic.score ?? 0),
            confidence: Number(topic.confidence ?? 0),
            recent_mistakes: Number(topic.recent_mistakes ?? 0),
            subjectName:
              subjectMap.get(topic.subject_id) ?? 'Unknown subject',
          })
        )

        setTopics(mappedTopics)
      } catch (err) {
        console.error('Failed to load analysis:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load analysis.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [])

  // --------------------------------------------------
  // Derived values
  // --------------------------------------------------

  const score = diagnostic?.score ?? 0

  const band = classifyMastery(score)

  const weakTopics = topics
    .filter((topic) => topic.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)

  const strongestConfidenceGapTopic =
    topics.length > 0
      ? [...topics].sort(
          (a, b) =>
            Math.max(0, b.confidence - b.score) -
            Math.max(0, a.confidence - a.score)
        )[0]
      : null

  const confidenceGap = strongestConfidenceGapTopic
    ? Math.max(
        0,
        strongestConfidenceGapTopic.confidence -
          strongestConfidenceGapTopic.score
      )
    : 0

  const totalRecentMistakes = topics.reduce(
    (sum, topic) => sum + topic.recent_mistakes,
    0
  )

  const averageTopicScore =
    topics.length > 0
      ? Math.round(
          topics.reduce((sum, topic) => sum + topic.score, 0) /
            topics.length
        )
      : 0

  const averageConfidence =
    topics.length > 0
      ? Math.round(
          topics.reduce((sum, topic) => sum + topic.confidence, 0) /
            topics.length
        )
      : 0

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analyze"
          title="AI Analysis"
          description="Learnova interprets your diagnostic and learning profile."
        />

        <Card className="glass p-8">
          <div className="flex items-center gap-3">
            <BrainCircuit className="size-5 animate-pulse text-violet" />

            <div>
              <p className="font-medium">
                Loading your learning analysis...
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Fetching your latest diagnostic and topic performance.
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // --------------------------------------------------
  // Error state
  // --------------------------------------------------

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analyze"
          title="AI Analysis"
          description="Learnova interprets your diagnostic and learning profile."
        />

        <Card className="glass border-destructive/30 p-6">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 text-destructive" />

            <div>
              <h3 className="font-semibold">
                Unable to load analysis
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // --------------------------------------------------
  // No diagnostic state
  // --------------------------------------------------

  if (!diagnostic) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analyze"
          title="AI Analysis"
          description="Learnova interprets your diagnostic and learning profile."
        />

        <Card className="glass-strong p-8">
          <div className="flex items-start gap-3">
            <BrainCircuit className="mt-1 size-6 text-violet" />

            <div>
              <h3 className="text-lg font-semibold">
                No diagnostic attempt yet
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Complete your diagnostic test first. Learnova will
                analyze your performance here.
              </p>

              <Button
                nativeButton={false}
                className="mt-4"
                render={<Link href="/diagnostic" />}
              >
                Take Diagnostic Test
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // --------------------------------------------------
  // Recommended action
  // --------------------------------------------------

  let recommendation = ''

  if (weakTopics.length > 0) {
    const weakest = weakTopics[0]

    recommendation = `Your diagnostic score is ${score}%. Focus first on ${weakest.name} in ${weakest.subjectName}, which currently has ${weakest.score}% mastery. Build the concept foundation before moving to advanced practice.`
  } else if (confidenceGap >= 20 && strongestConfidenceGapTopic) {
    recommendation = `Your confidence is higher than measured performance in ${strongestConfidenceGapTopic.name}. Practice this topic with reassessment to make sure your confidence matches your actual understanding.`
  } else if (score <= 75) {
    recommendation = `Your diagnostic score is ${score}%. Your foundation is developing. Use targeted revision and practice questions to strengthen the topics where your performance is lowest.`
  } else {
    recommendation = `Your diagnostic score is ${score}%. You have a strong foundation. Continue with challenge questions and regular reassessment to maintain your progress.`
  }

  return (
    <div className="space-y-6">

      <PageHeader
        eyebrow="Analyze"
        title="AI Analysis"
        description="Learnova interprets your diagnostic — not just the score, but your topic performance, confidence, and recent mistakes."
      />

      {/* ==================================================
          SCORE + WEAK TOPICS
          ================================================== */}

      <div className="grid gap-4 lg:grid-cols-3">

        <Card className="glass-strong flex flex-col justify-between gap-4 p-6">

          <div className="flex items-center gap-2 text-violet">
            <BrainCircuit className="size-5" />

            <span className="text-sm font-medium">
              Diagnostic score
            </span>
          </div>

          <div>
            <p className="text-4xl font-semibold">
              {score}%
            </p>

            <Badge
              className={
                band === 'Weak'
                  ? 'mt-2 bg-warning/15 text-warning shadow-none'
                  : band === 'Average'
                    ? 'mt-2 bg-blue/15 text-blue shadow-none'
                    : 'mt-2 bg-success/15 text-success shadow-none'
              }
            >
              {band} band
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            Latest diagnostic · {diagnostic.correct_answers}/
            {diagnostic.total_questions} correct
          </p>

        </Card>

        <Card className="glass p-6 lg:col-span-2">

          <div className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-warning" />

            <h3 className="text-base font-semibold">
              Weak topics
            </h3>
          </div>

          {weakTopics.length === 0 ? (
            <div className="mt-5 rounded-xl border border-border/60 p-4">
              <p className="text-sm text-muted-foreground">
                No weak topics have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">

              {weakTopics.map((topic) => {
                const accent = accentClasses[
                  scoreAccent(topic.score)
                ]

                return (
                  <div
                    key={topic.id}
                    className="flex items-center gap-4"
                  >
                    <span className="w-40 shrink-0 text-sm">
                      {topic.name}

                      <span className="ml-1 text-xs text-muted-foreground">
                        · {topic.subjectName}
                      </span>
                    </span>

                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          accent.bar
                        )}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, topic.score)
                          )}%`,
                        }}
                      />
                    </div>

                    <span
                      className={cn(
                        'w-10 text-right text-sm font-semibold',
                        accent.text
                      )}
                    >
                      {topic.score}%
                    </span>
                  </div>
                )
              })}

            </div>
          )}

        </Card>
      </div>

      {/* ==================================================
          REAL LEARNING SIGNALS
          ================================================== */}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* Recent mistakes */}

        <Card className="glass p-6">

          <div className="flex items-center gap-2">
            <Target className="size-5 text-warning" />

            <h3 className="text-base font-semibold">
              Mistake intelligence
            </h3>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Learnova tracks recent mistakes for each topic to decide
            where additional practice is needed.
          </p>

          <div className="mt-5 rounded-xl border border-border/60 p-5">

            <p className="text-3xl font-semibold">
              {totalRecentMistakes}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              recorded recent mistakes
            </p>

          </div>

          {topics.length > 0 && (
            <div className="mt-4 space-y-2">

              {[...topics]
                .filter((topic) => topic.recent_mistakes > 0)
                .sort(
                  (a, b) =>
                    b.recent_mistakes - a.recent_mistakes
                )
                .slice(0, 3)
                .map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                  >
                    <span className="text-sm">
                      {topic.name}
                    </span>

                    <span className="text-sm font-semibold text-warning">
                      {topic.recent_mistakes}
                    </span>
                  </div>
                ))}

            </div>
          )}

        </Card>

        {/* Confidence */}

        <Card className="glass p-6">

          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-violet" />

            <h3 className="text-base font-semibold">
              Confidence vs performance
            </h3>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Learnova compares what you think you know with your
            measured topic performance.
          </p>

          {strongestConfidenceGapTopic ? (
            <div className="mt-5 space-y-4">

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {strongestConfidenceGapTopic.name}
                </span>

                <Badge variant="outline">
                  {strongestConfidenceGapTopic.subjectName}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs text-muted-foreground">
                    Confidence
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {strongestConfidenceGapTopic.confidence}%
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs text-muted-foreground">
                    Performance
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {strongestConfidenceGapTopic.score}%
                  </p>
                </div>

              </div>

              <div className="rounded-xl bg-violet/10 p-4">

                <p className="text-xs text-muted-foreground">
                  Confidence gap
                </p>

                <p className="mt-1 text-2xl font-semibold text-violet">
                  {confidenceGap}%
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {confidenceGap >= 20
                    ? 'Your confidence is considerably higher than your measured performance.'
                    : 'Your confidence is reasonably aligned with your measured performance.'}
                </p>

              </div>

            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-border/60 p-5">
              <p className="text-sm text-muted-foreground">
                Topic confidence data is not available yet.
              </p>
            </div>
          )}

        </Card>

      </div>

      {/* ==================================================
          LEARNING OVERVIEW
          ================================================== */}

      <Card className="glass p-6">

        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-success" />

          <h3 className="text-base font-semibold">
            Learning overview
          </h3>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">

          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs text-muted-foreground">
              Average topic performance
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {averageTopicScore}%
            </p>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs text-muted-foreground">
              Average confidence
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {averageConfidence}%
            </p>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs text-muted-foreground">
              Topics tracked
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {topics.length}
            </p>
          </div>

        </div>

      </Card>

      {/* ==================================================
          RECOMMENDED ACTION
          ================================================== */}

      <Card className="glass-strong border-violet/25 p-6">

        <div className="flex items-start gap-3">

          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-blue text-primary-foreground">
            <Lightbulb className="size-4.5" />
          </span>

          <div className="flex-1">

            <h3 className="text-base font-semibold">
              Recommended action
            </h3>

            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90 text-pretty">
              {recommendation}
            </p>

            <Button
              nativeButton={false}
              className="mt-4"
              render={<Link href="/study-plan" />}
            >
              Generate Adaptive Plan
              <ArrowRight className="size-4" />
            </Button>

          </div>

        </div>

      </Card>

    </div>
  )
}