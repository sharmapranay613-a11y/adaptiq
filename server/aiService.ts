/**
 * AdaptiQ AI Service Layer
 * Powered by Google Gemini API (@google/genai)
 */

import { GoogleGenAI, Type } from '@google/genai';
import type {
  GenerateQuestionsParams,
  GenerateQuestionsResult,
  AnalyzeMistakeParams,
  AnalyzeMistakeResult,
  ExplainTopicParams,
  ExplainTopicResult,
  TutorParams,
  TutorResult,
  MistakeType,
} from '../src/types/adaptiq';

// Lazy-initialized Gemini client singleton
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not configured in the server environment variables. Please check the Secrets panel.'
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;

      const errorMessage = String(err?.message || err || '');

      // Do NOT retry when Gemini quota is exhausted
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('RESOURCE_EXHAUSTED')
      ) {
        throw new Error(
          'Gemini API quota exceeded. Please check your Gemini API quota or billing.'
        );
      }

      // Retry only temporary server/network errors
      const isTransient =
        errorMessage.includes('503') ||
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('fetch failed');

      if (isTransient && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );

        continue;
      }

      throw err;
    }
  }

  throw new Error('Maximum retries reached');
}

     

/**
 * 1. generateQuestions(subject, topic, difficulty, count)
 * Generates structured multiple-choice questions for the given subject, topic, and difficulty.
 */
export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<GenerateQuestionsResult> {
  const { subject, topic, difficulty, count = 3 } = params;
  const ai = getGeminiClient();

  const prompt = `Generate ${count} high-quality multiple choice question(s) for the subject "${subject}", on the topic "${topic}" at "${difficulty}" difficulty level.
Each question must have exactly 4 clear options, specify the exact string of the correct answer (which must be one of the 4 options), and provide a concise, insightful explanation.`;

  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are AdaptiQ, an expert educational assessment AI. Always generate accurate, pedagogically sound, structured questions in valid JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: 'Array of generated questions',
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: 'The question text',
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Four multiple-choice options',
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: 'The exact text of the correct option',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Clear pedagogical explanation of why this answer is correct',
                  },
                },
                required: ['question', 'options', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    })
  );

  const text = response.text?.trim() || '{}';
  const parsed = JSON.parse(text) as GenerateQuestionsResult;

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid response structure received from Gemini API');
  }

  return parsed;
}

/**
 * 2. analyzeMistake(question, studentAnswer, correctAnswer, topic)
 * Classifies student error into one of 5 categories and provides remediation.
 */
export async function analyzeMistake(
  params: AnalyzeMistakeParams
): Promise<AnalyzeMistakeResult> {
  const { question, studentAnswer, correctAnswer, topic } = params;
  const ai = getGeminiClient();

  const validMistakeTypes: MistakeType[] = [
    'Conceptual',
    'Calculation',
    'Careless',
    'Question misunderstanding',
    'Memory/recall',
  ];

  const prompt = `Analyze this student error on the topic "${topic}":
Question: "${question}"
Student Answer: "${studentAnswer}"
Correct Answer: "${correctAnswer}"

Classify the mistake type strictly into one of the following 5 categories:
- Conceptual (fundamental misunderstanding of principles/concepts)
- Calculation (arithmetic, logic step, or index offset calculation error)
- Careless (syntax typo, missing keyword, or obvious oversight)
- Question misunderstanding (misreading the prompt, constraints, or what was asked)
- Memory/recall (forgetting a specific name, method signature, keyword, or rule)

Provide a constructive explanation of what went wrong and an actionable recommendation for the student.`;

  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are AdaptiQ Learning Diagnostic Engine. Accurately diagnose student misconceptions with precision and empathy.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mistakeType: {
              type: Type.STRING,
              enum: validMistakeTypes,
              description: 'Classification of the error',
            },
            explanation: {
              type: Type.STRING,
              description: 'Concise explanation of the student misconception',
            },
            recommendation: {
              type: Type.STRING,
              description: 'Actionable study recommendation or tip to avoid this mistake in the future',
            },
          },
          required: ['mistakeType', 'explanation', 'recommendation'],
        },
      },
    })
  );

  const text = response.text?.trim() || '{}';
  const parsed = JSON.parse(text) as AnalyzeMistakeResult;

  // Fallback check to ensure mistakeType is valid
  if (!validMistakeTypes.includes(parsed.mistakeType)) {
    parsed.mistakeType = 'Conceptual';
  }

  return parsed;
}

/**
 * 3. explainTopic(topic, studentLevel)
 * Explains a topic tailored to student level with simple explanation, example, key points, and practice question.
 */
export async function explainTopic(
  params: ExplainTopicParams
): Promise<ExplainTopicResult> {
  const { topic, studentLevel = 'intermediate' } = params;
  const ai = getGeminiClient();

  const prompt = `Explain the topic "${topic}" tailored specifically for a "${studentLevel}" level student.
Provide:
1. simpleExplanation: A clear, accessible explanation without overwhelming jargon.
2. example: A concrete, practical code or conceptual example.
3. keyPoints: 2 to 4 bullet points highlighting essential takeaways.
4. practiceQuestion: A single targeted question for the student to test their comprehension.`;

  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are AdaptiQ Explainer AI. Break down complex topics into intuitive, easy-to-grasp concepts with practical examples.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleExplanation: {
              type: Type.STRING,
              description: 'Clear, level-appropriate explanation',
            },
            example: {
              type: Type.STRING,
              description: 'Concise, practical code or real-world example',
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Essential bullet points',
            },
            practiceQuestion: {
              type: Type.STRING,
              description: 'One targeted follow-up question to test comprehension',
            },
          },
          required: ['simpleExplanation', 'example', 'keyPoints', 'practiceQuestion'],
        },
      },
    })
  );

  const text = response.text?.trim() || '{}';
  const parsed = JSON.parse(text) as ExplainTopicResult;

  if (!parsed.simpleExplanation || !Array.isArray(parsed.keyPoints)) {
    throw new Error('Invalid explanation structure from Gemini API');
  }

  return parsed;
}

/**
 * 4. tutor(question, context)
 * Follows the progressive 4-stage learning structure:
 * Hint → Simple Explanation → Example → Practice Question
 * Does not dump walls of text; provides clean, scaffolded progression.
 */
export async function tutor(params: TutorParams): Promise<TutorResult> {
  const { question, context = '' } = params;
  const ai = getGeminiClient();

  const prompt = `Student Question: "${question}"
${context ? `Additional Context/Prior Learning: "${context}"` : ''}

Provide a structured, scaffolded Socratic tutoring response following these 4 progressive stages:
1. Hint: A gentle clue/nudge that directs the student's thinking without immediately giving away the answer.
2. Simple Explanation: A concise, direct, step-by-step breakdown of the concept needed to solve it.
3. Example: A minimal, illustrative code or practical snippet demonstrating the pattern.
4. Practice Question: A quick, related question for the student to confirm mastery.

Keep each section concise and punchy.`;

  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are AdaptiQ Socratic Tutor. Scaffold learning progressively (Hint → Simple Explanation → Example → Practice Question). Never overwhelm the student with long walls of text.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hint: {
              type: Type.STRING,
              description: 'A gentle clue/nudge to guide thinking',
            },
            simpleExplanation: {
              type: Type.STRING,
              description: 'Concise step-by-step concept explanation',
            },
            example: {
              type: Type.STRING,
              description: 'Short illustrative code or scenario example',
            },
            practiceQuestion: {
              type: Type.STRING,
              description: 'A follow-up question to check understanding',
            },
          },
          required: ['hint', 'simpleExplanation', 'example', 'practiceQuestion'],
        },
      },
    })
  );

  const text = response.text?.trim() || '{}';
  const parsed = JSON.parse(text) as TutorResult;

  if (!parsed.hint || !parsed.simpleExplanation) {
    throw new Error('Invalid tutor response format from Gemini API');
  }

  return parsed;
}
