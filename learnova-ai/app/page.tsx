'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Target,
  ArrowRight,
  Brain,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { MasteryRing } from '@/components/mastery-ring'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubjectCard } from '@/components/dashboard/subject-card'
import { supabase } from '@/lib/supabase'

type DashboardSubject = {
  key: string
  name: string
  mastery: number
  accent: 'violet' | 'blue' | 'cyan' | 'warning'
}

type Topic = {
  id: string
  name: string
  score: number
  confidence: number
  recent_mistakes: number
  subject_id: string
}

type Subject = {
  id: string
  name: string
  exam_date: string | null
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('Student')

  const [subjects, setSubjects] = useState<
    DashboardSubject[]
  >([])

  const [overallMastery, setOverallMastery] =
    useState(0)

  const [examCountdownDays, setExamCountdownDays] =
    useState<number | null>(null)

  const [priorityTopic, setPriorityTopic] =
    useState('—')

  const [priorityScore, setPriorityScore] =
    useState(0)

  const [priorityConfidence, setPriorityConfidence] =
    useState(0)

  const [priorityMistakes, setPriorityMistakes] =
    useState(0)

  const [loading, setLoading] = useState(true)

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // ==================================
        // LOAD PROFILE
        // ==================================

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error(
            'Failed to load profile:',
            profileError
          )
        }

        if (profile?.full_name) {
          setUserName(profile.full_name)
        } else if (user.email) {
          setUserName(
            user.email.split('@')[0]
          )
        }

        // ==================================
        // LOAD SUBJECTS
        // ==================================

        const {
          data: subjectData,
          error: subjectError,
        } = await supabase
          .from('subjects')
          .select(
            'id, name, exam_date'
          )
          .eq('user_id', user.id)
          .order('created_at', {
            ascending: true,
          })

        if (subjectError) {
          console.error(
            'Failed to load subjects:',
            subjectError
          )

          return
        }

        const userSubjects =
          (subjectData ?? []) as Subject[]

        // ==================================
        // NO SUBJECTS
        // ==================================

        if (userSubjects.length === 0) {
          setSubjects([])
          setOverallMastery(0)
          setPriorityTopic('—')
          setPriorityScore(0)
          setPriorityConfidence(0)
          setPriorityMistakes(0)
          setExamCountdownDays(null)

          return
        }

        // ==================================
        // LOAD TOPICS
        // ==================================

        const subjectIds =
          userSubjects.map(
            (subject) => subject.id
          )

        const {
          data: topicData,
          error: topicError,
        } = await supabase
          .from('topics')
          .select(
            'id, name, score, confidence, recent_mistakes, subject_id'
          )
          .in(
            'subject_id',
            subjectIds
          )

        if (topicError) {
          console.error(
            'Failed to load topics:',
            topicError
          )

          return
        }

        const userTopics =
          (topicData ?? []) as Topic[]

        // ==================================
        // SUBJECT MASTERY
        // ==================================

        const accentOptions:
          DashboardSubject['accent'][] = [
            'violet',
            'blue',
            'cyan',
            'warning',
          ]

        const dashboardSubjects =
          userSubjects.map(
            (subject, index) => {
              const subjectTopics =
                userTopics.filter(
                  (topic) =>
                    topic.subject_id ===
                    subject.id
                )

              const mastery =
                subjectTopics.length > 0
                  ? Math.round(
                      subjectTopics.reduce(
                        (
                          sum,
                          topic
                        ) =>
                          sum +
                          (topic.score ?? 0),
                        0
                      ) /
                        subjectTopics.length
                    )
                  : 0

              return {
                key: subject.id,
                name: subject.name,
                mastery,
                accent:
                  accentOptions[
                    index %
                      accentOptions.length
                  ],
              }
            }
          )

        setSubjects(
          dashboardSubjects
        )

        // ==================================
        // OVERALL MASTERY
        // ==================================

        if (userTopics.length > 0) {
          const totalScore =
            userTopics.reduce(
              (sum, topic) =>
                sum +
                (topic.score ?? 0),
              0
            )

          const averageScore =
            Math.round(
              totalScore /
                userTopics.length
            )

          setOverallMastery(
            averageScore
          )
        } else {
          setOverallMastery(0)
        }

        // ==================================
        // PRIORITY TOPIC
        // ==================================

        if (userTopics.length > 0) {
          const weakestTopic =
            [...userTopics].sort(
              (a, b) =>
                (a.score ?? 0) -
                (b.score ?? 0)
            )[0]

          setPriorityTopic(
            weakestTopic.name
          )

          setPriorityScore(
            weakestTopic.score ?? 0
          )

          setPriorityConfidence(
            weakestTopic.confidence ?? 0
          )

          setPriorityMistakes(
            weakestTopic.recent_mistakes ??
              0
          )
        } else {
          setPriorityTopic('—')
          setPriorityScore(0)
          setPriorityConfidence(0)
          setPriorityMistakes(0)
        }

        // ==================================
        // EXAM COUNTDOWN
        // ==================================

        const upcomingExams =
          userSubjects
            .filter(
              (subject) =>
                subject.exam_date
            )
            .map((subject) => ({
              ...subject,

              examTime: new Date(
                `${subject.exam_date}T23:59:59`
              ).getTime(),
            }))
            .filter(
              (subject) =>
                subject.examTime >=
                Date.now()
            )
            .sort(
              (a, b) =>
                a.examTime -
                b.examTime
            )

        if (
          upcomingExams.length > 0
        ) {
          const nearestExam =
            upcomingExams[0]

          const difference =
            nearestExam.examTime -
            Date.now()

          const days =
            Math.max(
              0,
              Math.ceil(
                difference /
                  (1000 *
                    60 *
                    60 *
                    24)
              )
            )

          setExamCountdownDays(
            days
          )
        } else {
          setExamCountdownDays(
            null
          )
        }
      } catch (error) {
        console.error(
          'Unexpected dashboard error:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // ==========================================
  // DYNAMIC AI INSIGHT
  // ==========================================

  function getInsight() {
    if (loading) {
      return {
        title: 'Analyzing your learning data...',
        description:
          'Learnova is analyzing your subjects, topics and recent performance.',
        type: 'Analyzing',
      }
    }

    if (subjects.length === 0) {
      return {
        title: 'Start building your learning profile',
        description:
          'Add your subjects and topics to let Learnova identify weak areas and personalize your study plan.',
        type: 'Getting Started',
      }
    }

    if (priorityScore === 0) {
      return {
        title: 'Complete your diagnostic test',
        description:
          'Your topics are currently at their starting state. Take the diagnostic test so Learnova can measure your actual performance.',
        type: 'Assessment',
      }
    }

    const confidenceGap =
      Math.max(
        0,
        priorityConfidence -
          priorityScore
      )

    if (
      confidenceGap >= 20
    ) {
      return {
        title: `${priorityTopic} needs attention`,
        description: `Your confidence is ${priorityConfidence}% but your measured performance is ${priorityScore}%. There is a ${confidenceGap}% confidence gap, so this topic should be reviewed before moving to stronger areas.`,
        type: 'Confidence Gap',
      }
    }

    if (
      priorityMistakes >= 3
    ) {
      return {
        title: `${priorityTopic} has repeated mistakes`,
        description: `You have made ${priorityMistakes} recent mistakes in this topic. Learnova recommends targeted practice and another assessment to identify the underlying issue.`,
        type: 'Mistake Pattern',
      }
    }

    if (
      priorityScore < 50
    ) {
      return {
        title: `${priorityTopic} is your weakest topic`,
        description: `Your current performance is ${priorityScore}%. Learnova recommends focusing on concepts, examples and practice questions before moving to challenge-level problems.`,
        type: 'Weak Topic',
      }
    }

    if (
      overallMastery < 75
    ) {
      return {
        title: 'Keep strengthening your foundation',
        description: `Your current overall mastery is ${overallMastery}%. Continue practicing weaker topics while regularly reassessing your progress.`,
        type: 'Progress',
      }
    }

    return {
      title: 'You are progressing well',
      description: `Your overall mastery is ${overallMastery}%. Continue revision and use challenge questions to deepen your understanding.`,
      type: 'Strong Progress',
    }
  }

  const insight = getInsight()

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <PageHeader
        eyebrow={`Welcome back, ${userName.split(' ')[0]}`}
        title="Your learning dashboard"
        description="A live snapshot of your mastery, powered by continuous AI assessment and analysis."
      >
        <Button
          nativeButton={false}
          render={
            <Link href="/diagnostic" />
          }
        >
          Take diagnostic test
          <ArrowRight className="size-4" />
        </Button>
      </PageHeader>

      {/* MASTERY + SUBJECTS */}

      <div className="grid gap-4 lg:grid-cols-3">

        {/* OVERALL MASTERY */}

        <Card className="glass-strong flex flex-col items-center justify-center gap-4 p-6 text-center">

          <MasteryRing
            value={overallMastery}
            label="Overall"
            sublabel="Mastery"
          />

          <p className="text-sm text-muted-foreground text-pretty">

            {loading
              ? 'Loading your learning data...'
              : overallMastery === 0
                ? 'Add subjects and topics to start tracking your mastery.'
                : overallMastery < 50
                  ? 'Focus on your weakest topics to build a stronger foundation.'
                  : overallMastery < 75
                    ? 'You are making progress. Keep strengthening your weak areas.'
                    : 'Great progress. Use challenge questions to deepen your understanding.'}

          </p>

        </Card>

        {/* SUBJECTS */}

        <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:grid-cols-2">

          {subjects.length > 0 ? (
            subjects.map(
              (subject) => (
                <SubjectCard
                  key={subject.key}
                  subject={subject}
                />
              )
            )
          ) : !loading ? (
            <Card className="glass col-span-2 flex items-center justify-center p-8 text-center">

              <div>

                <p className="font-medium">
                  No subjects added yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add your subjects and topics
                  to start building your
                  adaptive learning profile.
                </p>

              </div>

            </Card>
          ) : (
            <Card className="glass col-span-2 flex items-center justify-center p-8">

              <p className="text-sm text-muted-foreground">
                Loading subjects...
              </p>

            </Card>
          )}

        </div>

      </div>

      {/* STATS */}

      <div className="grid gap-4 lg:grid-cols-3">

        {/* EXAM COUNTDOWN */}

        <Card className="glass flex items-center gap-4 p-5">

          <span className="flex size-11 items-center justify-center rounded-xl bg-warning/15 text-warning">

            <CalendarDays className="size-5" />

          </span>

          <div>

            <p className="text-sm text-muted-foreground">
              Exam countdown
            </p>

            <p className="text-2xl font-semibold">

              {loading
                ? '...'
                : examCountdownDays !== null
                  ? `${examCountdownDays} days`
                  : 'Not set'}

            </p>

          </div>

        </Card>

        {/* PRIORITY TOPIC */}

        <Card className="glass flex items-center gap-4 p-5">

          <span className="flex size-11 items-center justify-center rounded-xl bg-violet/15 text-violet">

            <Target className="size-5" />

          </span>

          <div className="min-w-0">

            <p className="text-sm text-muted-foreground">
              Priority topic
            </p>

            <p className="truncate text-2xl font-semibold">
              {loading
                ? '...'
                : priorityTopic}
            </p>

          </div>

        </Card>

        {/* OVERALL MASTERY */}

        <Card className="glass flex items-center gap-4 p-5">

          <span className="flex size-11 items-center justify-center rounded-xl bg-cyan/15 text-cyan">

            <TrendingUp className="size-5" />

          </span>

          <div>

            <p className="text-sm text-muted-foreground">
              Overall mastery
            </p>

            <p className="text-2xl font-semibold">

              {loading
                ? '...'
                : `${overallMastery}%`}

            </p>

          </div>

        </Card>

      </div>

      {/* ==========================================
          DYNAMIC AI INSIGHT
      ========================================== */}

      <Card className="glass-strong p-6">

        <div className="flex items-start gap-4">

          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet/15 text-violet">

            {insight.type ===
            'Mistake Pattern' ? (
              <AlertTriangle className="size-5" />
            ) : insight.type ===
              'Progress' ? (
              <TrendingUp className="size-5" />
            ) : (
              <Brain className="size-5" />
            )}

          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <p className="text-sm font-medium text-violet">
                AI Insight
              </p>

              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {insight.type}
              </span>

            </div>

            <h3 className="mt-2 text-lg font-semibold">
              {insight.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {insight.description}
            </p>

          </div>

        </div>

        {/* PRIORITY DETAILS */}

        {!loading &&
          priorityScore > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl bg-secondary/50 p-4">

                <p className="text-xs text-muted-foreground">
                  Performance
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {priorityScore}%
                </p>

              </div>

              <div className="rounded-xl bg-secondary/50 p-4">

                <p className="text-xs text-muted-foreground">
                  Confidence
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {priorityConfidence}%
                </p>

              </div>

              <div className="rounded-xl bg-secondary/50 p-4">

                <p className="text-xs text-muted-foreground">
                  Recent mistakes
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {priorityMistakes}
                </p>

              </div>

            </div>
          )}

      </Card>

    </div>
  )
}