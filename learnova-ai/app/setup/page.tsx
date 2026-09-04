'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, BookOpen } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { supabase } from '@/lib/supabase'

type SubjectForm = {
  id: string
  name: string
  examDate: string
  topics: string
}

export default function SetupPage() {
  // --------------------------------
  // PROFILE STATE
  // --------------------------------

  const [course, setCourse] = useState<string>('')

  // IMPORTANT:
  // Semester is ALWAYS stored as a string
  const [semester, setSemester] = useState<string>('')

  // --------------------------------
  // SUBJECT STATE
  // --------------------------------

  const [subjects, setSubjects] = useState<SubjectForm[]>([
    {
      id: crypto.randomUUID(),
      name: '',
      examDate: '',
      topics: '',
    },
  ])

  // --------------------------------
  // UI STATE
  // --------------------------------

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('course, semester')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error(
            'Failed to load profile:',
            error
          )
        }

        if (data) {
          // --------------------------------
          // IMPORTANT FIX
          // Supabase may return semester as
          // number instead of string.
          // --------------------------------

          setCourse(
            data.course == null
              ? ''
              : String(data.course)
          )

          setSemester(
            data.semester == null
              ? ''
              : String(data.semester)
          )
        }
      } catch (error) {
        console.error(
          'Profile loading error:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  // ==========================================
  // ADD SUBJECT
  // ==========================================

  const addSubject = () => {
    setSubjects((previousSubjects) => [
      ...previousSubjects,
      {
        id: crypto.randomUUID(),
        name: '',
        examDate: '',
        topics: '',
      },
    ])
  }

  // ==========================================
  // REMOVE SUBJECT
  // ==========================================

  const removeSubject = (id: string) => {
    setSubjects((previousSubjects) =>
      previousSubjects.filter(
        (subject) => subject.id !== id
      )
    )
  }

  // ==========================================
  // UPDATE SUBJECT
  // ==========================================

  const updateSubject = (
    id: string,
    field: keyof SubjectForm,
    value: string
  ) => {
    setSubjects((previousSubjects) =>
      previousSubjects.map((subject) => {
        if (subject.id !== id) {
          return subject
        }

        return {
          ...subject,
          [field]: value,
        }
      })
    )
  }

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const saveProfile = async () => {
    setMessage('')

    // --------------------------------
    // EXTRA SAFETY
    // --------------------------------

    const safeCourse = String(course ?? '')
    const safeSemester = String(semester ?? '')

    // --------------------------------
    // VALIDATE COURSE
    // --------------------------------

    if (!safeCourse.trim()) {
      setMessage('Please enter your course.')
      return
    }

    // --------------------------------
    // VALIDATE SEMESTER
    // --------------------------------

    if (!safeSemester.trim()) {
      setMessage('Please enter your semester.')
      return
    }

    // --------------------------------
    // VALIDATE SUBJECTS
    // --------------------------------

    const validSubjects = subjects.filter(
      (subject) =>
        String(subject.name ?? '').trim()
    )

    if (validSubjects.length === 0) {
      setMessage(
        'Please add at least one subject.'
      )
      return
    }

    setSaving(true)

    try {
      // ==================================
      // GET CURRENT USER
      // ==================================

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage(
          'Please log in before saving your profile.'
        )

        return
      }

      // ==================================
      // UPDATE PROFILE
      // ==================================

      const { error: profileError } =
        await supabase
          .from('profiles')
          .update({
            course: safeCourse.trim(),
            semester: safeSemester.trim(),
          })
          .eq('id', user.id)

      if (profileError) {
        console.error(
          'Profile update error:',
          profileError
        )

        setMessage(
          'Could not save your profile information.'
        )

        return
      }

      // ==================================
      // SAVE SUBJECTS
      // ==================================

      for (const subject of validSubjects) {
        const subjectName =
          String(subject.name ?? '').trim()

        const examDate =
          subject.examDate || null

        // --------------------------------
        // INSERT SUBJECT
        // --------------------------------

        const {
          data: savedSubject,
          error: subjectError,
        } = await supabase
          .from('subjects')
          .insert({
            user_id: user.id,
            name: subjectName,
            exam_date: examDate,
          })
          .select('id')
          .single()

        if (
          subjectError ||
          !savedSubject
        ) {
          console.error(
            'Subject save error:',
            subjectError
          )

          setMessage(
            `Could not save subject "${subjectName}".`
          )

          return
        }

        // ==================================
        // SAVE TOPICS
        // ==================================

        const topicNames =
          String(subject.topics ?? '')
            .split(',')
            .map((topic) => topic.trim())
            .filter(Boolean)

        if (topicNames.length > 0) {
          const topicRows =
            topicNames.map((topicName) => ({
              subject_id:
                savedSubject.id,

              name: topicName,

              score: 0,

              confidence: 0,

              recent_mistakes: 0,
            }))

          const { error: topicsError } =
            await supabase
              .from('topics')
              .insert(topicRows)

          if (topicsError) {
            console.error(
              'Topics save error:',
              topicsError
            )

            setMessage(
              `Subject "${subjectName}" was saved, but its topics could not be saved.`
            )

            return
          }
        }
      }

      // ==================================
      // SUCCESS
      // ==================================

      setMessage(
        'Profile, subjects and topics saved successfully!'
      )

      // Reset subject form

      setSubjects([
        {
          id: crypto.randomUUID(),
          name: '',
          examDate: '',
          topics: '',
        },
      ])
    } catch (error) {
      console.error(
        'Unexpected setup error:',
        error
      )

      setMessage(
        'Something went wrong. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading your profile...
        </p>
      </div>
    )
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* HEADER */}

      <div className="space-y-2">

        <div className="flex items-center gap-2 text-violet">
          <BookOpen className="size-5" />

          <span className="text-sm font-medium">
            Learning Profile
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Set up your learning profile
        </h1>

        <p className="text-sm text-muted-foreground">
          Tell Learnova what you are studying so it
          can personalize your learning plan.
        </p>

      </div>

      {/* ======================================
          ACADEMIC INFORMATION
      ====================================== */}

      <Card className="glass-strong p-6">

        <h2 className="text-base font-semibold">
          Academic information
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">

          {/* COURSE */}

          <div className="space-y-2">

            <label
              htmlFor="course"
              className="text-sm font-medium"
            >
              Course
            </label>

            <Input
              id="course"
              placeholder="e.g. B.Tech CSE"
              value={course}
              onChange={(event) => {
                setCourse(
                  String(event.target.value)
                )
              }}
            />

          </div>

          {/* SEMESTER */}

          <div className="space-y-2">

            <label
              htmlFor="semester"
              className="text-sm font-medium"
            >
              Semester
            </label>

            <Input
              id="semester"
              placeholder="e.g. 3"
              value={semester}
              onChange={(event) => {
                setSemester(
                  String(event.target.value)
                )
              }}
            />

          </div>

        </div>

      </Card>

      {/* ======================================
          SUBJECTS
      ====================================== */}

      <div className="space-y-4">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold">
              Your subjects
            </h2>

            <p className="text-sm text-muted-foreground">
              Add subjects, exam dates and topics.
            </p>

          </div>

          <Button
            variant="outline"
            onClick={addSubject}
          >
            <Plus className="size-4" />
            Add subject
          </Button>

        </div>

        {/* SUBJECT CARDS */}

        {subjects.map(
          (subject, index) => (
            <Card
              key={subject.id}
              className="glass p-6"
            >

              <div className="flex items-center justify-between">

                <h3 className="font-medium">
                  Subject {index + 1}
                </h3>

                {subjects.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeSubject(
                        subject.id
                      )
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}

              </div>

              <div className="mt-5 space-y-4">

                {/* SUBJECT NAME */}

                <div className="space-y-2">

                  <label
                    htmlFor={`subject-${subject.id}`}
                    className="text-sm font-medium"
                  >
                    Subject name
                  </label>

                  <Input
                    id={`subject-${subject.id}`}
                    placeholder="e.g. Java"
                    value={subject.name}
                    onChange={(event) =>
                      updateSubject(
                        subject.id,
                        'name',
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* EXAM DATE */}

                <div className="space-y-2">

                  <label
                    htmlFor={`exam-${subject.id}`}
                    className="text-sm font-medium"
                  >
                    Exam date
                  </label>

                  <Input
                    id={`exam-${subject.id}`}
                    type="date"
                    value={subject.examDate}
                    onChange={(event) =>
                      updateSubject(
                        subject.id,
                        'examDate',
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* TOPICS */}

                <div className="space-y-2">

                  <label
                    htmlFor={`topics-${subject.id}`}
                    className="text-sm font-medium"
                  >
                    Topics
                  </label>

                  <Input
                    id={`topics-${subject.id}`}
                    placeholder="Inheritance, Polymorphism, Encapsulation"
                    value={subject.topics}
                    onChange={(event) =>
                      updateSubject(
                        subject.id,
                        'topics',
                        event.target.value
                      )
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    Separate topics using commas.
                  </p>

                </div>

              </div>

            </Card>
          )
        )}

      </div>

      {/* ======================================
          MESSAGE
      ====================================== */}

      {message && (
        <Card className="glass p-4">

          <p className="text-sm text-muted-foreground">
            {message}
          </p>

        </Card>
      )}

      {/* ======================================
          SAVE
      ====================================== */}

      <Button
        className="w-full"
        size="lg"
        onClick={saveProfile}
        disabled={saving}
      >

        <Save className="size-4" />

        {saving
          ? 'Saving...'
          : 'Save & Build My Learning Profile'}

      </Button>

    </div>
  )
}