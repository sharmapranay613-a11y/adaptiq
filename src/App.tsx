/**
 * @license
 * AdaptiQ AI Layer - Developer Console & Verification Suite
 * Designed for Member 1 and Frontend Engineers to test, verify, and integrate the AI functions.
 */

import React, { useState, useEffect } from 'react';
import {
  generateQuestions,
  analyzeMistake,
  explainTopic,
  tutor,
  runJavaInheritanceTests,
  checkAiHealth,
} from './services/adaptiqClient';
import type {
  GenerateQuestionsResult,
  AnalyzeMistakeResult,
  ExplainTopicResult,
  TutorResult,
  TestResultItem,
  MistakeType,
} from './types/adaptiq';
import {
  CheckCircle2,
  XCircle,
  Play,
  Copy,
  Check,
  Code2,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  BookOpen,
  MessageSquareQuote,
  Terminal,
  Activity,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tests' | 'qgen' | 'mistake' | 'explain' | 'tutor' | 'docs'>('tests');
  const [healthStatus, setHealthStatus] = useState<{ status: string; geminiConfigured: boolean } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Test Suite State
  const [testingRunning, setTestingRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [testsExecuted, setTestsExecuted] = useState(false);

  // 1. generateQuestions state
  const [qSubject, setQSubject] = useState('Computer Science');
  const [qTopic, setQTopic] = useState('Java Inheritance & Method Overriding');
  const [qDifficulty, setQDifficulty] = useState('intermediate');
  const [qCount, setQCount] = useState(2);
  const [qLoading, setQLoading] = useState(false);
  const [qResult, setQResult] = useState<GenerateQuestionsResult | null>(null);
  const [qError, setQError] = useState<string | null>(null);

  // 2. analyzeMistake state
  const [mQuestion, setMQuestion] = useState('Which method will execute when calling a.sound() on Animal a = new Dog()?');
  const [mStudentAnswer, setMStudentAnswer] = useState('Animal sound() executes because variable reference type is Animal');
  const [mCorrectAnswer, setMCorrectAnswer] = useState('Dog sound() executes due to dynamic method dispatch (runtime polymorphism)');
  const [mTopic, setMTopic] = useState('Java Polymorphism & Method Overriding');
  const [mLoading, setMLoading] = useState(false);
  const [mResult, setMResult] = useState<AnalyzeMistakeResult | null>(null);
  const [mError, setMError] = useState<string | null>(null);

  // 3. explainTopic state
  const [eTopic, setETopic] = useState('Java "super" keyword in constructors');
  const [eLevel, setELevel] = useState('beginner');
  const [eLoading, setELoading] = useState(false);
  const [eResult, setEResult] = useState<ExplainTopicResult | null>(null);
  const [eError, setEError] = useState<string | null>(null);

  // 4. tutor state
  const [tQuestion, setTQuestion] = useState('Why does my subclass constructor say "Implicit super constructor is undefined for default constructor"?');
  const [tContext, setTContext] = useState('Subclass constructor in Java when superclass has no no-arg constructor');
  const [tLoading, setTLoading] = useState(false);
  const [tResult, setTResult] = useState<TutorResult | null>(null);
  const [tError, setTError] = useState<string | null>(null);

  useEffect(() => {
    checkAiHealth()
      .then((res) => setHealthStatus({ status: res.status, geminiConfigured: res.geminiConfigured }))
      .catch(() => setHealthStatus({ status: 'error', geminiConfigured: false }));
  }, []);

  const handleRunAllTests = async () => {
    setTestingRunning(true);
    try {
      const response = await runJavaInheritanceTests();
      setTestResults(response.results);
      setTestsExecuted(true);
    } catch (err: any) {
      alert('Error executing test runner: ' + err.message);
    } finally {
      setTestingRunning(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setQLoading(true);
    setQError(null);
    try {
      const res = await generateQuestions({
        subject: qSubject,
        topic: qTopic,
        difficulty: qDifficulty,
        count: qCount,
      });
      setQResult(res);
    } catch (err: any) {
      setQError(err.message || 'Failed to generate questions');
    } finally {
      setQLoading(false);
    }
  };

  const handleAnalyzeMistake = async () => {
    setMLoading(true);
    setMError(null);
    try {
      const res = await analyzeMistake({
        question: mQuestion,
        studentAnswer: mStudentAnswer,
        correctAnswer: mCorrectAnswer,
        topic: mTopic,
      });
      setMResult(res);
    } catch (err: any) {
      setMError(err.message || 'Failed to analyze mistake');
    } finally {
      setMLoading(false);
    }
  };

  const handleExplainTopic = async () => {
    setELoading(true);
    setEError(null);
    try {
      const res = await explainTopic({
        topic: eTopic,
        studentLevel: eLevel,
      });
      setEResult(res);
    } catch (err: any) {
      setEError(err.message || 'Failed to explain topic');
    } finally {
      setELoading(false);
    }
  };

  const handleTutor = async () => {
    setTLoading(true);
    setTError(null);
    try {
      const res = await tutor({
        question: tQuestion,
        context: tContext,
      });
      setTResult(res);
    } catch (err: any) {
      setTError(err.message || 'Failed to tutor');
    } finally {
      setTLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const getMistakeBadgeColor = (type: MistakeType) => {
    switch (type) {
      case 'Conceptual':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Calculation':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Careless':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Question misunderstanding':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Memory/recall':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">AdaptiQ</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Service Layer
                </span>
              </div>
              <p className="text-xs text-zinc-500">Gemini 3.7 Flash • Full-Stack SDK Ready for Frontend Integration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 text-xs font-medium text-zinc-700 border border-zinc-200">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Backend API:</span>
              <span className="font-semibold text-emerald-700">Online (:3000)</span>
            </div>

            <button
              id="run-tests-header-btn"
              onClick={handleRunAllTests}
              disabled={testingRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {testingRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Testing Java Cases...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run Java Inheritance Tests
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-zinc-200 px-6">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto py-2">
          <button
            id="tab-tests"
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tests'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Verification Suite (Java Tests)
          </button>

          <button
            id="tab-qgen"
            onClick={() => setActiveTab('qgen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'qgen'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            1. generateQuestions()
          </button>

          <button
            id="tab-mistake"
            onClick={() => setActiveTab('mistake')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'mistake'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            2. analyzeMistake()
          </button>

          <button
            id="tab-explain"
            onClick={() => setActiveTab('explain')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'explain'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            3. explainTopic()
          </button>

          <button
            id="tab-tutor"
            onClick={() => setActiveTab('tutor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tutor'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            4. tutor() (Socratic)
          </button>

          <button
            id="tab-docs"
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'docs'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Frontend Integration Guide
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-6 flex-1">
        {/* TAB 1: Verification Suite */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Java / Inheritance AI Verification Suite</h2>
                <p className="text-sm text-zinc-600 mt-1">
                  Tests all 4 core AI functions against Java Object-Oriented Inheritance & Polymorphism benchmarks.
                </p>
              </div>
              <button
                id="execute-all-tests-btn"
                onClick={handleRunAllTests}
                disabled={testingRunning}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap"
              >
                {testingRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Test Matrix...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Execute All 4 Java Tests
                  </>
                )}
              </button>
            </div>

            {testsExecuted ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResults.map((test, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          {test.status === 'passed' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                          )}
                          <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded">
                            {test.functionName}()
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">{test.latencyMs}ms</span>
                      </div>

                      <h3 className="font-semibold text-zinc-900 text-sm">{test.title}</h3>

                      <div className="mt-3 bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-xs overflow-x-auto max-h-56">
                        <pre>{JSON.stringify(test.output || test.error, null, 2)}</pre>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                      <span>Status: <strong className={test.status === 'passed' ? 'text-emerald-700' : 'text-rose-700'}>{test.status.toUpperCase()}</strong></span>
                      <span className="text-zinc-400">Java/Inheritance Benchmark</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-dashed border-zinc-300 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-800">Ready to run verification suite</h3>
                <p className="text-sm text-zinc-500 max-w-md mt-1 mb-6">
                  Click the button below to test <code className="bg-zinc-100 px-1 py-0.5 rounded text-xs">generateQuestions</code>, <code className="bg-zinc-100 px-1 py-0.5 rounded text-xs">analyzeMistake</code>, <code className="bg-zinc-100 px-1 py-0.5 rounded text-xs">explainTopic</code>, and <code className="bg-zinc-100 px-1 py-0.5 rounded text-xs">tutor</code> against Java Inheritance test scenarios.
                </p>
                <button
                  onClick={handleRunAllTests}
                  disabled={testingRunning}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Run Verification Tests
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: generateQuestions */}
        {activeTab === 'qgen' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900">1. generateQuestions() Playground</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Generates structured multiple-choice questions with 4 options and explanations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={qSubject}
                  onChange={(e) => setQSubject(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={qTopic}
                  onChange={(e) => setQTopic(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Count</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={qCount}
                    onChange={(e) => setQCount(parseInt(e.target.value) || 1)}
                    className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setQSubject('Computer Science');
                    setQTopic('Java Inheritance & Polymorphism');
                    setQDifficulty('intermediate');
                    setQCount(2);
                  }}
                  className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
                >
                  Load Java Preset
                </button>
              </div>

              <button
                id="btn-call-qgen"
                onClick={handleGenerateQuestions}
                disabled={qLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {qLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Generate Questions
              </button>
            </div>

            <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-zinc-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-900">Output Payload (Structured JSON)</h3>
                {qResult && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {qResult.questions.length} Question(s)
                  </span>
                )}
              </div>

              {qError && (
                <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {qError}
                </div>
              )}

              {qResult ? (
                <div className="space-y-4 flex-1">
                  {qResult.questions.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm space-y-2">
                      <p className="font-bold text-zinc-900">
                        {idx + 1}. {item.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {item.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded border text-xs ${
                              opt === item.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                                : 'bg-white border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <span className="opacity-60 mr-1.5">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-zinc-200 text-xs text-zinc-600">
                        <strong className="text-zinc-800">Explanation:</strong> {item.explanation}
                      </div>
                    </div>
                  ))}

                  <div className="bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(qResult, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-12">
                  <HelpCircle className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs">Click "Generate Questions" to test the AI output</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: analyzeMistake */}
        {activeTab === 'mistake' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900">2. analyzeMistake() Playground</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Classifies errors into Conceptual, Calculation, Careless, Question misunderstanding, or Memory/recall.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={mTopic}
                  onChange={(e) => setMTopic(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Question</label>
                <textarea
                  rows={2}
                  value={mQuestion}
                  onChange={(e) => setMQuestion(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Student Answer (Incorrect)</label>
                <input
                  type="text"
                  value={mStudentAnswer}
                  onChange={(e) => setMStudentAnswer(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Correct Answer</label>
                <input
                  type="text"
                  value={mCorrectAnswer}
                  onChange={(e) => setMCorrectAnswer(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    setMTopic('Java Inheritance Method Overriding');
                    setMQuestion('Which keyword is used in Java to inherit a class?');
                    setMStudentAnswer('implements');
                    setMCorrectAnswer('extends');
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
                >
                  Preset: Extends vs Implements
                </button>
              </div>

              <button
                id="btn-call-mistake"
                onClick={handleAnalyzeMistake}
                disabled={mLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {mLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Analyze Student Mistake
              </button>
            </div>

            <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-zinc-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">Diagnostic Result</h3>

              {mError && (
                <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {mError}
                </div>
              )}

              {mResult ? (
                <div className="space-y-4 flex-1">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-600">Classification:</span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getMistakeBadgeColor(
                          mResult.mistakeType
                        )}`}
                      >
                        {mResult.mistakeType}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">Explanation</h4>
                      <p className="text-sm text-zinc-700 leading-relaxed bg-white p-3 rounded-lg border border-zinc-200">
                        {mResult.explanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">Recommendation</h4>
                      <p className="text-sm text-zinc-700 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-indigo-950">
                        {mResult.recommendation}
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(mResult, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-12">
                  <AlertTriangle className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs">Submit mistake scenario to see AI classification</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: explainTopic */}
        {activeTab === 'explain' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900">3. explainTopic() Playground</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Returns simpleExplanation, example, keyPoints, and practiceQuestion.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={eTopic}
                  onChange={(e) => setETopic(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Student Level</label>
                <select
                  value={eLevel}
                  onChange={(e) => setELevel(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    setETopic('Java Abstract Classes vs Interfaces in Inheritance');
                    setELevel('intermediate');
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
                >
                  Preset: Abstract vs Interface
                </button>
              </div>

              <button
                id="btn-call-explain"
                onClick={handleExplainTopic}
                disabled={eLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {eLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Explain Topic
              </button>
            </div>

            <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-zinc-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">Structured Explanation</h3>

              {eError && (
                <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {eError}
                </div>
              )}

              {eResult ? (
                <div className="space-y-4 flex-1">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">
                        Simple Explanation
                      </h4>
                      <p className="text-sm text-zinc-800 leading-relaxed bg-white p-3 rounded-lg border border-zinc-200">
                        {eResult.simpleExplanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">Example</h4>
                      <pre className="text-xs bg-zinc-900 text-zinc-100 p-3 rounded-lg overflow-x-auto font-mono">
                        {eResult.example}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">Key Points</h4>
                      <ul className="space-y-1.5">
                        {eResult.keyPoints.map((kp, idx) => (
                          <li key={idx} className="text-xs text-zinc-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">
                        Practice Question
                      </h4>
                      <p className="text-xs font-medium text-indigo-900 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        {eResult.practiceQuestion}
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(eResult, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-12">
                  <BookOpen className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs">Request an explanation to preview structured output</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: tutor */}
        {activeTab === 'tutor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900">4. tutor() Socratic Scaffold</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Follows: <strong>Hint → Simple Explanation → Example → Practice Question</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Student Question</label>
                <textarea
                  rows={3}
                  value={tQuestion}
                  onChange={(e) => setTQuestion(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Context / Background</label>
                <input
                  type="text"
                  value={tContext}
                  onChange={(e) => setTContext(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    setTQuestion('Can I override a private or static method in Java?');
                    setTContext('Java inheritance and method hiding rules');
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
                >
                  Preset: Overriding Static Methods
                </button>
              </div>

              <button
                id="btn-call-tutor"
                onClick={handleTutor}
                disabled={tLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {tLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Ask Tutor
              </button>
            </div>

            <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-zinc-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">Progressive 4-Step Socratic Flow</h3>

              {tError && (
                <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {tError}
                </div>
              )}

              {tResult ? (
                <div className="space-y-4 flex-1">
                  <div className="space-y-3">
                    {/* 1. Hint */}
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Hint</h4>
                      </div>
                      <p className="text-xs text-amber-950 leading-relaxed font-medium pl-7">
                        {tResult.hint}
                      </p>
                    </div>

                    {/* 2. Simple Explanation */}
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Simple Explanation</h4>
                      </div>
                      <p className="text-xs text-blue-950 leading-relaxed pl-7">
                        {tResult.simpleExplanation}
                      </p>
                    </div>

                    {/* 3. Example */}
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 text-white text-xs font-bold flex items-center justify-center">3</span>
                        <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Example</h4>
                      </div>
                      <pre className="text-xs bg-zinc-900 text-zinc-100 p-3 rounded-lg overflow-x-auto font-mono mt-2">
                        {tResult.example}
                      </pre>
                    </div>

                    {/* 4. Practice Question */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Practice Question</h4>
                      </div>
                      <p className="text-xs text-emerald-950 font-medium pl-7">
                        {tResult.practiceQuestion}
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(tResult, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-12">
                  <MessageSquareQuote className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs">Ask a question to view the scaffolded tutor steps</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Frontend Docs */}
        {activeTab === 'docs' && (
          <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Member 1 Frontend Integration Guide</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  All 4 functions are exported and ready to import directly into any React component or service.
                </p>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(`import { generateQuestions, analyzeMistake, explainTopic, tutor } from './services/adaptiqClient';

// 1. Generate Questions
const { questions } = await generateQuestions({
  subject: 'Computer Science',
  topic: 'Java Inheritance',
  difficulty: 'intermediate',
  count: 3,
});

// 2. Analyze Student Mistake
const analysis = await analyzeMistake({
  question: 'In Java, what keyword inherits a class?',
  studentAnswer: 'implements',
  correctAnswer: 'extends',
  topic: 'Java Inheritance',
});

// 3. Explain Topic
const topic = await explainTopic({
  topic: 'Java Inheritance and super keyword',
  studentLevel: 'beginner',
});

// 4. Socratic Tutor (Hint -> Simple Explanation -> Example -> Practice Question)
const tutorHelp = await tutor({
  question: 'How do I call superclass constructor in Java?',
  context: 'Java Inheritance',
});`)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-all"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet ? 'Copied to Clipboard!' : 'Copy Code Snippet'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-700">1. generateQuestions()</span>
                <p className="text-xs text-zinc-600">
                  Accepts <code className="bg-white px-1 py-0.5 border rounded">subject</code>, <code className="bg-white px-1 py-0.5 border rounded">topic</code>, <code className="bg-white px-1 py-0.5 border rounded">difficulty</code>, <code className="bg-white px-1 py-0.5 border rounded">count</code>. Returns array of 4-option questions with correct answer and explanation.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-700">2. analyzeMistake()</span>
                <p className="text-xs text-zinc-600">
                  Accepts <code className="bg-white px-1 py-0.5 border rounded">question</code>, <code className="bg-white px-1 py-0.5 border rounded">studentAnswer</code>, <code className="bg-white px-1 py-0.5 border rounded">correctAnswer</code>, <code className="bg-white px-1 py-0.5 border rounded">topic</code>. Returns classified <code className="bg-white px-1 py-0.5 border rounded">mistakeType</code> (Conceptual, Calculation, Careless, Question misunderstanding, Memory/recall), explanation, and recommendation.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-700">3. explainTopic()</span>
                <p className="text-xs text-zinc-600">
                  Accepts <code className="bg-white px-1 py-0.5 border rounded">topic</code>, <code className="bg-white px-1 py-0.5 border rounded">studentLevel</code>. Returns <code className="bg-white px-1 py-0.5 border rounded">simpleExplanation</code>, <code className="bg-white px-1 py-0.5 border rounded">example</code>, <code className="bg-white px-1 py-0.5 border rounded">keyPoints</code> array, and <code className="bg-white px-1 py-0.5 border rounded">practiceQuestion</code>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-700">4. tutor()</span>
                <p className="text-xs text-zinc-600">
                  Accepts <code className="bg-white px-1 py-0.5 border rounded">question</code>, <code className="bg-white px-1 py-0.5 border rounded">context</code>. Returns scaffolded progressive steps: <code className="bg-white px-1 py-0.5 border rounded">hint</code>, <code className="bg-white px-1 py-0.5 border rounded">simpleExplanation</code>, <code className="bg-white px-1 py-0.5 border rounded">example</code>, and <code className="bg-white px-1 py-0.5 border rounded">practiceQuestion</code>.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <pre>{`// Example integration inside your React component:
import React, { useState } from 'react';
import { tutor, analyzeMistake } from './services/adaptiqClient';

export function QuizFeedback({ question, selectedOption, correctOption, topic }) {
  const [analysis, setAnalysis] = useState(null);

  const handleDiagnose = async () => {
    const result = await analyzeMistake({
      question,
      studentAnswer: selectedOption,
      correctAnswer: correctOption,
      topic,
    });
    setAnalysis(result);
  };

  return (
    <div>
      <button onClick={handleDiagnose}>Analyze My Mistake</button>
      {analysis && (
        <div>
          <span>Mistake Type: {analysis.mistakeType}</span>
          <p>{analysis.explanation}</p>
          <p>Tip: {analysis.recommendation}</p>
        </div>
      )}
    </div>
  );
}`}</pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <span>AdaptiQ • AI Service Layer • Structured JSON Output Engine</span>
          <span>Powered by Google Gemini 3.7 Flash</span>
        </div>
      </footer>
    </div>
  );
}
