/**
 * @license
 * AdaptiQ AI Layer - TypeScript Interfaces & Types
 */

export type MistakeType =
  | 'Conceptual'
  | 'Calculation'
  | 'Careless'
  | 'Question misunderstanding'
  | 'Memory/recall';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | string;
export type StudentLevel = 'beginner' | 'intermediate' | 'advanced' | string;

// 1. generateQuestions
export interface QuestionItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GenerateQuestionsParams {
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  count: number;
}

export interface GenerateQuestionsResult {
  questions: QuestionItem[];
}

// 2. analyzeMistake
export interface AnalyzeMistakeParams {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  topic: string;
}

export interface AnalyzeMistakeResult {
  mistakeType: MistakeType;
  explanation: string;
  recommendation: string;
}

// 3. explainTopic
export interface ExplainTopicParams {
  topic: string;
  studentLevel: StudentLevel;
}

export interface ExplainTopicResult {
  simpleExplanation: string;
  example: string;
  keyPoints: string[];
  practiceQuestion: string;
}

// 4. tutor
export interface TutorParams {
  question: string;
  context?: string;
}

export interface TutorResult {
  hint: string;
  simpleExplanation: string;
  example: string;
  practiceQuestion: string;
}

// Generic API wrapper types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  latencyMs?: number;
}

export interface TestResultItem {
  functionName: string;
  title: string;
  status: 'passed' | 'failed' | 'running';
  latencyMs?: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}
