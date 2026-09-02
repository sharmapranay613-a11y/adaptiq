const API_URL = "https://adaptiq-uepm.onrender.com";

export async function checkAIHealth() {
  const response = await fetch(`${API_URL}/api/ai/health`);

  if (!response.ok) {
    throw new Error("Backend connection failed");
  }

  return response.json();
}

export async function generateQuestions(
  subject: string,
  topic: string,
  difficulty = "intermediate",
  count = 3
) {
  const response = await fetch(
    `${API_URL}/api/ai/generate-questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        topic,
        difficulty,
        count,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate questions");
  }

  return response.json();
}

export async function analyzeMistake(
  question: string,
  studentAnswer: string,
  correctAnswer: string,
  topic: string
) {
  const response = await fetch(
    `${API_URL}/api/ai/analyze-mistake`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        studentAnswer,
        correctAnswer,
        topic,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to analyze mistake");
  }

  return response.json();
}

export async function explainTopic(
  topic: string,
  studentLevel = "intermediate"
) {
  const response = await fetch(
    `${API_URL}/api/ai/explain-topic`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        studentLevel,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to explain topic");
  }

  return response.json();
}

export async function tutor(
  question: string,
  context = ""
) {
  const response = await fetch(
    `${API_URL}/api/ai/tutor`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        context,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Tutor request failed");
  }

  return response.json();
}