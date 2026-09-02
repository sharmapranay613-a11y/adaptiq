export type MasteryLevel = "Weak" | "Average" | "Strong";

export interface Topic {
  name: string;
  score: number;
  confidence?: number;
  recentMistakes?: number;
}

export interface StudyTask {
  topic: string;
  minutes: number;
  reason: string;
  activity: string;
}

export function calculateScore(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export function classifyMastery(score: number): MasteryLevel {
  if (score < 50) return "Weak";
  if (score <= 75) return "Average";
  return "Strong";
}

export function identifyWeakTopics(topics: Topic[]): Topic[] {
  return topics
    .filter((topic) => topic.score < 50)
    .sort((a, b) => a.score - b.score);
}

export function calculateConfidenceGap(
  confidence: number,
  performance: number
): number {
  return Math.max(0, Math.round(confidence - performance));
}

export function calculateTopicPriority(
  weakness: number,
  examUrgency: number,
  recentMistakes: number
): number {
  return Math.round(
    weakness * 0.5 +
      examUrgency * 0.3 +
      recentMistakes * 0.2
  );
}

function getWeakness(score: number): number {
  return Math.max(0, 100 - score);
}

function getExamUrgency(daysLeft: number): number {
  if (daysLeft <= 3) return 100;
  if (daysLeft <= 7) return 80;
  if (daysLeft <= 15) return 60;
  if (daysLeft <= 30) return 40;
  return 20;
}

export function generateStudyPlan(
  topics: Topic[],
  dailyStudyMinutes: number,
  examDaysLeft: number
): StudyTask[] {
  if (!topics.length || dailyStudyMinutes <= 0) return [];

  const urgency = getExamUrgency(examDaysLeft);

  const prioritized = topics
    .map((topic) => {
      const weakness = getWeakness(topic.score);

      const mistakes = Math.min(
        100,
        (topic.recentMistakes ?? 0) * 20
      );

      const priority = calculateTopicPriority(
        weakness,
        urgency,
        mistakes
      );

      return {
        ...topic,
        priority,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  const totalPriority = prioritized.reduce(
    (sum, topic) => sum + Math.max(topic.priority, 1),
    0
  );

  return prioritized.map((topic) => {
    const minutes = Math.max(
      15,
      Math.round(
        (Math.max(topic.priority, 1) / totalPriority) *
          dailyStudyMinutes
      )
    );

    const mastery = classifyMastery(topic.score);

    let activity = "Practice questions";

    if (mastery === "Weak") {
      activity = "Concept learning + examples + practice";
    } else if (mastery === "Average") {
      activity = "Revision + practice questions";
    } else {
      activity = "Quick revision + challenge questions";
    }

    return {
      topic: topic.name,
      minutes,
      activity,
      reason:
        topic.score < 50
          ? `Low performance (${topic.score}%)`
          : "Included for regular progress",
    };
  });
}

export function updateLearningProfile(
  topics: Topic[],
  updatedTopics: Topic[]
): Topic[] {
  const updates = new Map(
    updatedTopics.map((topic) => [topic.name, topic])
  );

  return topics.map(
    (topic) => updates.get(topic.name) ?? topic
  );
}

export function generateAdaptiveChange(
  previousScore: number,
  newScore: number,
  topic: string
): string {
  if (newScore > previousScore) {
    return `${topic} improved from ${previousScore}% to ${newScore}%. Study time can now shift toward weaker topics.`;
  }

  if (newScore < previousScore) {
    return `${topic} dropped from ${previousScore}% to ${newScore}%. More practice and revision are recommended.`;
  }

  return `${topic} remained at ${newScore}%. Continue targeted practice and reassessment.`;
}

export const demoTopics: Topic[] = [
  {
    name: "Java Inheritance",
    score: 42,
    confidence: 85,
    recentMistakes: 4,
  },
  {
    name: "DBMS",
    score: 78,
    confidence: 75,
    recentMistakes: 1,
  },
  {
    name: "Mathematics",
    score: 48,
    confidence: 60,
    recentMistakes: 3,
  },
  {
    name: "Operating Systems",
    score: 61,
    confidence: 70,
    recentMistakes: 2,
  },
];