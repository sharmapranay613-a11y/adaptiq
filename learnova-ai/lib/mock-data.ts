/**
 * LEARNOVA AI — Centralized mock data.
 *
 * Everything the UI renders comes from this file so a future developer can
 * swap these exports for real sources:
 *   - `student`, subject/topic mastery  -> Backend / API
 *   - `diagnosticQuestions` + scoring    -> Adaptive Learning Engine
 *   - `aiInsight`, `analysis`, tutor msgs-> Gemini AI
 *
 * No component holds its own domain data. Keep it that way.
 */

export type Student = {
  name: string
  program: string
  initials: string
}

export const student: Student = {
  name: 'Rahul Sharma',
  program: 'B.Tech CSE',
  initials: 'RS',
}

export type Subject = {
  key: string
  name: string
  mastery: number
  accent: 'violet' | 'blue' | 'cyan' | 'success' | 'warning'
}

export const overallMastery = 64
export const examCountdownDays = 15

export const subjects: Subject[] = [
  { key: 'java', name: 'Java', mastery: 72, accent: 'violet' },
  { key: 'dbms', name: 'DBMS', mastery: 78, accent: 'blue' },
  { key: 'maths', name: 'Maths', mastery: 48, accent: 'warning' },
  { key: 'os', name: 'OS', mastery: 61, accent: 'cyan' },
]

export type AiInsight = {
  topic: string
  performance: number
  confidence: number
  confidenceGap: number
  mistakes: number
  type: string
  reasoning: string
}

export const aiInsight: AiInsight = {
  topic: 'Java Inheritance',
  performance: 42,
  confidence: 85,
  confidenceGap: 43,
  mistakes: 4,
  type: 'Conceptual',
  reasoning:
    'You feel highly confident (85%) but measured performance is only 42% — a 43% confidence gap. This blind spot is the highest-risk area because you are unlikely to revise a topic you believe you already know. With the exam 15 days away, closing conceptual gaps early yields the biggest score gains.',
}

export type MistakeType = {
  label: string
  count: number
  color: 'violet' | 'blue' | 'cyan' | 'success' | 'warning'
  description: string
}

export const mistakeTypes: MistakeType[] = [
  {
    label: 'Conceptual',
    count: 2,
    color: 'violet',
    description: 'Misunderstood the underlying idea or rule.',
  },
  {
    label: 'Calculation',
    count: 0,
    color: 'blue',
    description: 'Correct approach, arithmetic slip.',
  },
  {
    label: 'Careless',
    count: 1,
    color: 'cyan',
    description: 'Knew it, rushed the answer.',
  },
  {
    label: 'Misunderstanding',
    count: 1,
    color: 'warning',
    description: 'Misread what the question asked.',
  },
  {
    label: 'Recall',
    count: 0,
    color: 'success',
    description: 'Could not remember the fact in time.',
  },
]

export type Question = {
  id: number
  subject: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  prompt: string
  options: string[]
  correctIndex: number
}

export const diagnosticQuestions: Question[] = [
  {
    id: 1,
    subject: 'Java',
    topic: 'Inheritance',
    difficulty: 'Medium',
    prompt:
      'Which keyword is used in Java for a subclass to inherit from a superclass?',
    options: ['implements', 'extends', 'inherits', 'super'],
    correctIndex: 1,
  },
  {
    id: 2,
    subject: 'Java',
    topic: 'Inheritance',
    difficulty: 'Medium',
    prompt:
      'What does the `super` keyword refer to inside a subclass constructor?',
    options: [
      'The current object',
      'A static field',
      'The immediate parent class',
      'The topmost Object class only',
    ],
    correctIndex: 2,
  },
  {
    id: 3,
    subject: 'Java',
    topic: 'Inheritance',
    difficulty: 'Medium',
    prompt: 'Java does NOT support which of the following directly?',
    options: [
      'Single inheritance',
      'Multilevel inheritance',
      'Multiple inheritance of classes',
      'Hierarchical inheritance',
    ],
    correctIndex: 2,
  },
  {
    id: 4,
    subject: 'Java',
    topic: 'Inheritance',
    difficulty: 'Medium',
    prompt:
      'When a subclass redefines a method of its superclass with the same signature, it is called:',
    options: ['Overloading', 'Overriding', 'Hiding', 'Shadowing'],
    correctIndex: 1,
  },
  {
    id: 5,
    subject: 'Java',
    topic: 'Inheritance',
    difficulty: 'Medium',
    prompt:
      'Which access modifier allows a member to be inherited and visible to subclasses but not to unrelated classes?',
    options: ['private', 'protected', 'default (package)', 'final'],
    correctIndex: 1,
  },
]

/** The demo result shown after submitting — a fixed "weak" outcome. */
export const diagnosticResult = {
  score: 42,
  band: 'Weak' as const,
  topic: 'Java Inheritance',
  correct: 2,
  total: 5,
}

export type WeakTopic = {
  topic: string
  subject: string
  score: number
}

export const weakTopics: WeakTopic[] = [
  { topic: 'Java Inheritance', subject: 'Java', score: 42 },
  { topic: 'Maths Integration', subject: 'Maths', score: 48 },
  { topic: 'OS Scheduling', subject: 'OS', score: 55 },
]

export const analysis = {
  score: 42,
  confidence: 85,
  performance: 42,
  confidenceGap: 43,
  recommendedAction:
    'Start with a guided conceptual walkthrough of Java Inheritance (super, method overriding, access modifiers), then re-test with 5 fresh medium questions to confirm the gap has closed.',
}

export type PlanItem = {
  topic: string
  subject: string
  minutes: number
  reason: string
  accent: 'violet' | 'blue' | 'cyan' | 'success' | 'warning'
}

export const studyPlan: PlanItem[] = [
  {
    topic: 'Java Inheritance',
    subject: 'Java',
    minutes: 60,
    reason: 'Largest confidence gap (43%) and 4 recent mistakes.',
    accent: 'violet',
  },
  {
    topic: 'Maths Integration',
    subject: 'Maths',
    minutes: 45,
    reason: 'Lowest subject mastery at 48%.',
    accent: 'warning',
  },
  {
    topic: 'DBMS Normalization',
    subject: 'DBMS',
    minutes: 30,
    reason: 'Strong topic — light reinforcement to keep it exam-ready.',
    accent: 'blue',
  },
  {
    topic: 'OS Revision',
    subject: 'OS',
    minutes: 25,
    reason: 'Mid mastery (61%); spaced revision prevents decay.',
    accent: 'cyan',
  },
  {
    topic: 'Practice Quiz',
    subject: 'Mixed',
    minutes: 20,
    reason: 'Mixed retrieval practice across all subjects.',
    accent: 'success',
  },
]

export const totalPlanMinutes = studyPlan.reduce((s, i) => s + i.minutes, 0)

export const planReasons = [
  'Low scores: Maths (48%) and Java Inheritance (42%) drag your overall mastery.',
  'Repeated mistakes: 4 recorded on Inheritance, mostly conceptual.',
  'Confidence gap: a 43% gap means you would skip this topic on your own.',
  'Exam urgency: only 15 days left, so effort is front-loaded onto high-impact topics.',
]

export type TutorMode = 'Hint' | 'Explanation' | 'Example' | 'Practice'

export const suggestedPrompts = [
  'Explain simply',
  'Give an example',
  'Test my understanding',
  'Give me a hint',
]

/** Canned tutor responses. Replace with Gemini streaming later. */
export const tutorResponses: Record<TutorMode, { title: string; body: string }> = {
  Hint: {
    title: 'Hint',
    body: 'Think about the difference between an "is-a" and a "has-a" relationship. Inheritance models "is-a" — a Car is-a Vehicle. Which keyword expresses that a class *is a kind of* another class?',
  },
  Explanation: {
    title: 'Explanation',
    body: 'Inheritance lets a subclass reuse and extend a superclass. Use `extends` to inherit. The subclass gets the parent\'s public/protected members, can call parent behavior with `super`, and can override methods to specialize behavior. Java allows single (class) inheritance but supports multiple interfaces via `implements`.',
  },
  Example: {
    title: 'Example',
    body: 'class Vehicle { void start() { System.out.println("Engine on"); } }\nclass Car extends Vehicle {\n  @Override void start() { super.start(); System.out.println("Car ready"); }\n}\nnew Car().start(); // Engine on / Car ready',
  },
  Practice: {
    title: 'Practice Question',
    body: 'A class Dog extends Animal and overrides speak(). If Animal.speak() prints "..." and Dog.speak() calls super.speak() then prints "Woof", what is the output of new Dog().speak()? (Answer: "..." then "Woof")',
  },
}

/** Progress page: mastery trend over the last 8 sessions. */
export const progressTrend = [
  { session: 'S1', mastery: 42, confidence: 85 },
  { session: 'S2', mastery: 47, confidence: 80 },
  { session: 'S3', mastery: 51, confidence: 76 },
  { session: 'S4', mastery: 55, confidence: 74 },
  { session: 'S5', mastery: 58, confidence: 71 },
  { session: 'S6', mastery: 62, confidence: 70 },
  { session: 'S7', mastery: 65, confidence: 69 },
  { session: 'S8', mastery: 68, confidence: 69 },
]

export const topicMasteryProgress = [
  { topic: 'Java', mastery: 72 },
  { topic: 'DBMS', mastery: 78 },
  { topic: 'Maths', mastery: 48 },
  { topic: 'OS', mastery: 61 },
]

export const headlineImprovement = {
  topic: 'Java Inheritance',
  from: 42,
  to: 68,
  delta: 26,
}

export type LoopStage = {
  key: string
  label: string
  description: string
}

export const learningLoop: LoopStage[] = [
  { key: 'assess', label: 'Assess', description: 'Diagnostic test measures true level.' },
  { key: 'analyze', label: 'Analyze', description: 'AI finds weak topics & mistake types.' },
  { key: 'personalize', label: 'Personalize', description: 'Adaptive plan targets your gaps.' },
  { key: 'learn', label: 'Learn', description: 'AI tutor teaches with hints & examples.' },
  { key: 'practice', label: 'Practice', description: 'Targeted quizzes reinforce learning.' },
  { key: 'reassess', label: 'Reassess', description: 'Re-test to verify the gap closed.' },
  { key: 'adapt', label: 'Adapt', description: 'Plan updates from new evidence.' },
]
