import { GoogleGenerativeAI } from "@google/generative-ai";

// ==============================
// INIT
// ==============================
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyBTp-Ilhqfry5pSqOTvpeIPUEElCM2f8GM"
);

// ==============================
// MODEL (TEXT ONLY, DIRECT ANSWERS)
// ==============================
export const model = genAI.getGenerativeModel({
  model: "gemma-3-12b",
  generationConfig: {
    temperature: 0.6,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 600,
  }
});

// ==============================
// PROMPT (NO JSON, NO STRUCTURE)
// ==============================
export const unifiedPrompt = (
  nickname: string,
  age: string,
  location: string,
  query: string,
  language: string,
  hourOfDay?: number
) => `
You are HerCare+, a warm and respectful AI companion for women's wellbeing.

Speak like a real human.
Do NOT use JSON.
Do NOT format answers.
Do NOT list bullet points unless absolutely needed.
Just reply naturally.

Guidelines:
- Be kind, calm, and supportive
- No graphic or explicit sexual content
- If medical issue feels serious, gently suggest a doctor
- If emotional, validate feelings first
- If user is under 18 and topic is sexual, redirect to trusted adults
- One gentle suggestion at the end, nothing more

User details:
Name: ${nickname}
Age: ${age}
Location: ${location}
Language: ${language}
Time: ${hourOfDay && hourOfDay > 18 ? "Evening" : "Day"}

User says:
"${query}"

Reply now like a caring human friend.
`;

// ==============================
// TYPES
// ==============================
interface ProcessQueryParams {
  nickname: string;
  age: string;
  location: string;
  query: string;
  language?: string;
}

interface HerCareResponse {
  message: string;
  queryType: string;
}

// ==============================
// QUERY CLASSIFICATION (FOR UI ONLY)
// ==============================
function classifyQuery(query: string, age: string): string {
  const q = query.toLowerCase();
  const ageNum = parseInt(age) || 25;

  if (["pain", "fever", "bleed", "period", "hurt", "ache"].some(w => q.includes(w)))
    return "MEDICAL";

  if (["sad", "stress", "anxious", "love", "breakup", "relationship"].some(w => q.includes(w)))
    return "EMOTIONAL";

  if (["horny", "sexual", "touch", "body"].some(w => q.includes(w)))
    return ageNum < 18 ? "EXPRESSION_YOUNG" : "BODY_CURIOSITY";

  return "GENERAL";
}

// ==============================
// MAIN FUNCTION
// ==============================
export const processHerCareQuery = async ({
  nickname,
  age,
  location,
  query,
  language = "English",
}: ProcessQueryParams): Promise<HerCareResponse> => {
  try {
    const hour = new Date().getHours();
    const queryType = classifyQuery(query, age);

    const prompt = unifiedPrompt(
      nickname,
      age,
      location,
      query,
      language,
      hour
    );

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      message: text.trim(),
      queryType,
    };

  } catch (err) {
    console.error("HerCare AI error:", err);

    return {
      message:
        "I'm here with you. Something went wrong on my side, but you can try asking again.",
      queryType: "ERROR",
    };
  }
};

// ==============================
// QUICK TEST
// ==============================
export const quickResponse = async (query: string) => {
  return processHerCareQuery({
    nickname: "Friend",
    age: "25",
    location: "India",
    query,
    language: "English",
  });
};
