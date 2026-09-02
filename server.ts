import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  generateQuestions,
  analyzeMistake,
  explainTopic,
  tutor,
} from './server/aiService.ts';
import type { TestResultItem } from './src/types/adaptiq.ts';

// Load environment variables if present
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Health Check
app.get('/api/ai/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    service: 'AdaptiQ AI Layer',
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// 1. generateQuestions endpoint
app.post('/api/ai/generate-questions', async (req, res) => {
  const startTime = Date.now();
  try {
    const { subject, topic, difficulty = 'intermediate', count = 3 } = req.body;
    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: "subject" and "topic" are required.',
      });
    }

    const data = await generateQuestions({
      subject: String(subject),
      topic: String(topic),
      difficulty: String(difficulty),
      count: Number(count) || 3,
    });

    res.json({
      success: true,
      data,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-questions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions',
      latencyMs: Date.now() - startTime,
    });
  }
});

// 2. analyzeMistake endpoint
app.post('/api/ai/analyze-mistake', async (req, res) => {
  const startTime = Date.now();
  try {
    const { question, studentAnswer, correctAnswer, topic } = req.body;
    if (!question || !studentAnswer || !correctAnswer || !topic) {
      return res.status(400).json({
        success: false,
        error:
          'Missing required parameters: "question", "studentAnswer", "correctAnswer", and "topic" are required.',
      });
    }

    const data = await analyzeMistake({
      question: String(question),
      studentAnswer: String(studentAnswer),
      correctAnswer: String(correctAnswer),
      topic: String(topic),
    });

    res.json({
      success: true,
      data,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-mistake:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze mistake',
      latencyMs: Date.now() - startTime,
    });
  }
});

// 3. explainTopic endpoint
app.post('/api/ai/explain-topic', async (req, res) => {
  const startTime = Date.now();
  try {
    const { topic, studentLevel = 'intermediate' } = req.body;
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: "topic" is required.',
      });
    }

    const data = await explainTopic({
      topic: String(topic),
      studentLevel: String(studentLevel),
    });

    res.json({
      success: true,
      data,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/explain-topic:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to explain topic',
      latencyMs: Date.now() - startTime,
    });
  }
});

// 4. tutor endpoint
app.post('/api/ai/tutor', async (req, res) => {
  const startTime = Date.now();
  try {
    const { question, context = '' } = req.body;
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: "question" is required.',
      });
    }

    const data = await tutor({
      question: String(question),
      context: String(context),
    });

    res.json({
      success: true,
      data,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/tutor:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run tutor logic',
      latencyMs: Date.now() - startTime,
    });
  }
});

// Automated Test Runner for Java/Inheritance examples
app.post('/api/ai/run-tests', async (req, res) => {
  const results: TestResultItem[] = [];

  // Test 1: generateQuestions with Java / Inheritance
  const t1Start = Date.now();
  try {
    const input1 = {
      subject: 'Computer Science',
      topic: 'Java Inheritance (method overriding & super keyword)',
      difficulty: 'intermediate',
      count: 2,
    };
    const output1 = await generateQuestions(input1);
    results.push({
      functionName: 'generateQuestions',
      title: 'Java Inheritance: Method Overriding & Super',
      status:
        output1.questions && output1.questions.length >= 2 ? 'passed' : 'failed',
      latencyMs: Date.now() - t1Start,
      input: input1,
      output: output1 as unknown as Record<string, unknown>,
    });
  } catch (err: any) {
    results.push({
      functionName: 'generateQuestions',
      title: 'Java Inheritance: Method Overriding & Super',
      status: 'failed',
      latencyMs: Date.now() - t1Start,
      input: { topic: 'Java Inheritance' },
      error: err.message,
    });
  }

  // Test 2: analyzeMistake with Java / Inheritance
  const t2Start = Date.now();
  try {
    const input2 = {
      question:
        'In Java, if a subclass defines a method with the same name and parameters as in its superclass, what is this called?',
      studentAnswer: 'Method Overloading',
      correctAnswer: 'Method Overriding',
      topic: 'Java Inheritance Polymorphism',
    };
    const output2 = await analyzeMistake(input2);
    results.push({
      functionName: 'analyzeMistake',
      title: 'Java Inheritance: Overriding vs Overloading Misconception',
      status: output2.mistakeType ? 'passed' : 'failed',
      latencyMs: Date.now() - t2Start,
      input: input2,
      output: output2 as unknown as Record<string, unknown>,
    });
  } catch (err: any) {
    results.push({
      functionName: 'analyzeMistake',
      title: 'Java Inheritance: Overriding vs Overloading Misconception',
      status: 'failed',
      latencyMs: Date.now() - t2Start,
      input: { topic: 'Java Inheritance' },
      error: err.message,
    });
  }

  // Test 3: explainTopic with Java / Inheritance
  const t3Start = Date.now();
  try {
    const input3 = {
      topic: 'Java Inheritance and the "super" keyword in constructors',
      studentLevel: 'beginner',
    };
    const output3 = await explainTopic(input3);
    results.push({
      functionName: 'explainTopic',
      title: 'Java Inheritance: "super" keyword for Beginners',
      status:
        output3.simpleExplanation && output3.practiceQuestion ? 'passed' : 'failed',
      latencyMs: Date.now() - t3Start,
      input: input3,
      output: output3 as unknown as Record<string, unknown>,
    });
  } catch (err: any) {
    results.push({
      functionName: 'explainTopic',
      title: 'Java Inheritance: "super" keyword for Beginners',
      status: 'failed',
      latencyMs: Date.now() - t3Start,
      input: { topic: 'Java Inheritance' },
      error: err.message,
    });
  }

  // Test 4: tutor with Java / Inheritance
  const t4Start = Date.now();
  try {
    const input4 = {
      question:
        'Why does my Java code give a compiler error: "Constructor Dog() cannot be applied to given types"? Animal has Animal(String name).',
      context: 'Student is learning inheritance and creating a subclass Dog extending Animal.',
    };
    const output4 = await tutor(input4);
    results.push({
      functionName: 'tutor',
      title: 'Java Inheritance: Socratic Tutor for Super Constructor Error',
      status: output4.hint && output4.simpleExplanation ? 'passed' : 'failed',
      latencyMs: Date.now() - t4Start,
      input: input4,
      output: output4 as unknown as Record<string, unknown>,
    });
  } catch (err: any) {
    results.push({
      functionName: 'tutor',
      title: 'Java Inheritance: Socratic Tutor for Super Constructor Error',
      status: 'failed',
      latencyMs: Date.now() - t4Start,
      input: { topic: 'Java Inheritance' },
      error: err.message,
    });
  }

  res.json({
    success: results.every((r) => r.status === 'passed'),
    allPassed: results.every((r) => r.status === 'passed'),
    results,
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AdaptiQ AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
