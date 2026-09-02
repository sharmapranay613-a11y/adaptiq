/**
 * CLI Test Suite for AdaptiQ AI Layer
 * Validates all 4 core functions using Java / Inheritance test cases.
 */
import dotenv from 'dotenv';
dotenv.config();

import {
  generateQuestions,
  analyzeMistake,
  explainTopic,
  tutor,
} from '../server/aiService.ts';

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('  ADAPTIQ AI SERVICE LAYER - TEST SUITE');
  console.log('  Testing Java / Inheritance Test Cases');
  console.log('='.repeat(60));

  let passed = 0;
  let total = 4;

  // 1. generateQuestions
  console.log('\n[1/4] Testing generateQuestions()...');
  try {
    const qRes = await generateQuestions({
      subject: 'Computer Science',
      topic: 'Java Inheritance & Method Overriding',
      difficulty: 'intermediate',
      count: 2,
    });
    console.log(`  ✓ Generated ${qRes.questions.length} questions successfully:`);
    qRes.questions.forEach((q, idx) => {
      console.log(`    Q${idx + 1}: ${q.question}`);
      console.log(`       Options: ${q.options.join(' | ')}`);
      console.log(`       Correct: ${q.correctAnswer}`);
      console.log(`       Explanation: ${q.explanation}\n`);
    });
    if (qRes.questions.length >= 2 && qRes.questions[0].correctAnswer) {
      passed++;
    }
  } catch (err: any) {
    console.error('  ✗ generateQuestions failed:', err.message);
  }

  // 2. analyzeMistake
  console.log('[2/4] Testing analyzeMistake()...');
  try {
    const mRes = await analyzeMistake({
      question:
        'In Java, if class Dog extends Animal and overrides sound(), which method runs on Animal a = new Dog(); a.sound()?',
      studentAnswer: 'Animal sound() runs because reference type is Animal',
      correctAnswer: 'Dog sound() runs due to dynamic method dispatch (runtime polymorphism)',
      topic: 'Java Polymorphism & Dynamic Method Dispatch',
    });
    console.log('  ✓ Mistake Analysis Output:');
    console.log(`    Classification: ${mRes.mistakeType}`);
    console.log(`    Explanation: ${mRes.explanation}`);
    console.log(`    Recommendation: ${mRes.recommendation}\n`);
    if (mRes.mistakeType && mRes.explanation) {
      passed++;
    }
  } catch (err: any) {
    console.error('  ✗ analyzeMistake failed:', err.message);
  }

  // 3. explainTopic
  console.log('[3/4] Testing explainTopic()...');
  try {
    const expRes = await explainTopic({
      topic: 'Java "super" keyword in constructors and method calls',
      studentLevel: 'beginner',
    });
    console.log('  ✓ Topic Explanation Output:');
    console.log(`    Simple Explanation: ${expRes.simpleExplanation}`);
    console.log(`    Example: ${expRes.example}`);
    console.log(`    Key Points: ${expRes.keyPoints.join(' • ')}`);
    console.log(`    Practice Question: ${expRes.practiceQuestion}\n`);
    if (expRes.simpleExplanation && expRes.example && expRes.practiceQuestion) {
      passed++;
    }
  } catch (err: any) {
    console.error('  ✗ explainTopic failed:', err.message);
  }

  // 4. tutor
  console.log('[4/4] Testing tutor()...');
  try {
    const tutorRes = await tutor({
      question:
        'How do I call a parent class constructor with arguments from a subclass constructor in Java?',
      context: 'Student understands inheritance but is getting constructor errors.',
    });
    console.log('  ✓ Tutor Scaffolded Output:');
    console.log(`    [Hint]: ${tutorRes.hint}`);
    console.log(`    [Simple Explanation]: ${tutorRes.simpleExplanation}`);
    console.log(`    [Example]: ${tutorRes.example}`);
    console.log(`    [Practice Question]: ${tutorRes.practiceQuestion}\n`);
    if (tutorRes.hint && tutorRes.simpleExplanation && tutorRes.example && tutorRes.practiceQuestion) {
      passed++;
    }
  } catch (err: any) {
    console.error('  ✗ tutor failed:', err.message);
  }

  console.log('='.repeat(60));
  console.log(`Test Summary: ${passed}/${total} functions passed.`);
  console.log('='.repeat(60));

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
