/**
 * @license
 * AdaptiQ Client SDK
 * 
 * Reusable AI layer client for Member 1 / Frontend Team.
 * Connects directly to the secure server-side Gemini endpoints.
 * 
 * Example usage in React components:
 * 
 * ```ts
 * import { generateQuestions, analyzeMistake, explainTopic, tutor } from '@/src/services/adaptiqClient';
 * 
 * // 1. Generate Questions
 * const qData = await generateQuestions({
 *   subject: 'Computer Science',
 *   topic: 'Java Inheritance',
 *   difficulty: 'intermediate',
 *   count: 3
 * });
 * console.log(qData.questions);
 * 
 * // 2. Analyze Mistake
 * const analysis = await analyzeMistake({
 *   question: 'Which keyword prevents a method from being overridden in Java?',
 *   studentAnswer: 'static',
 *   correctAnswer: 'final',
 *   topic: 'Java Inheritance'
 * });
 * console.log(analysis.mistakeType, analysis.explanation, analysis.recommendation);
 * 
 * // 3. Explain Topic
 * const topicExplanation = await explainTopic({
 *   topic: 'Java Inheritance and Polymorphism',
 *   studentLevel: 'intermediate'
 * });
 * 
 * // 4. Socratic Tutor
 * const tutorResponse = await tutor({
 *   question: 'Why can dog not access private fields of Animal?',
 *   context: 'Java inheritance modifiers'
 * });
 * ```
 */

import type {
  GenerateQuestionsParams,
  GenerateQuestionsResult,
  AnalyzeMistakeParams,
  AnalyzeMistakeResult,
  ExplainTopicParams,
  ExplainTopicResult,
  TutorParams,
  TutorResult,
  ApiResponse,
  TestResultItem,
} from '../types/adaptiq';

async function postJson<T>(endpoint: string, payload: unknown): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json.data;
}

/**
 * 1. Generates structured multiple-choice questions for any subject and topic.
 */
export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<GenerateQuestionsResult> {
  return postJson<GenerateQuestionsResult>('/api/ai/generate-questions', params);
}

/**
 * 2. Classifies student errors (Conceptual, Calculation, Careless, Question misunderstanding, Memory/recall)
 * and provides explanations and recommendations.
 */
export async function analyzeMistake(
  params: AnalyzeMistakeParams
): Promise<AnalyzeMistakeResult> {
  return postJson<AnalyzeMistakeResult>('/api/ai/analyze-mistake', params);
}

/**
 * 3. Breaks down any topic for a given student level into simple explanations,
 * code/real examples, key points, and practice questions.
 */
export async function explainTopic(
  params: ExplainTopicParams
): Promise<ExplainTopicResult> {
  return postJson<ExplainTopicResult>('/api/ai/explain-topic', params);
}

/**
 * 4. Progressive Socratic Tutor providing Hint → Simple Explanation → Example → Practice Question.
 */
export async function tutor(params: TutorParams): Promise<TutorResult> {
  return postJson<TutorResult>('/api/ai/tutor', params);
}

/**
 * Executes server-side Java/Inheritance end-to-end verification suite.
 */
export async function runJavaInheritanceTests(): Promise<{
  success: boolean;
  allPassed: boolean;
  results: TestResultItem[];
}> {
  const response = await fetch('/api/ai/run-tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

/**
 * Checks AI Service and Gemini API connectivity.
 */
export async function checkAiHealth(): Promise<{
  status: string;
  service: string;
  geminiConfigured: boolean;
  timestamp: string;
}> {
  const res = await fetch('/api/ai/health');
  return res.json();
}
