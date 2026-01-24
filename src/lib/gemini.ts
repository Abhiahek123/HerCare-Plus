import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBTp-Ilhqfry5pSqOTvpeIPUEElCM2f8GM");

// UNIFIED HIGH-SPEED AGENT (Single Pass)
export const unifiedPrompt = (
  nickname: string,
  age: string,
  location: string,
  symptoms: string,
  language: string
) => `
ROLE: You are HerCare+, a caring older sister and intelligent health guide.
TASK: Analyze the symptoms and provide a smart, supportive response + actionable next steps in a SINGLE JSON output.

GUIDELINES (Smart & Natural):
1. Respond naturally and empathetically.
2. Be concise but complete (don't cut off important advice, but avoid filler).
3. If symptoms suggest emergency (bleeding, severe pain), flag 'show_doctor_choice' as true.
4. Output Language: ${language}

INPUT:
- User: ${nickname} (${age}y) from ${location}
- Symptoms: "${symptoms}"

OUTPUT PROTOCOL (JSON ONLY):
{
  "conversation": "string - Natural, smart, sisterly response",
  "show_doctor_choice": boolean,
  "recommended_action": "string - 2-3 word button label"
}
`;


// Use Gemini 2.0 Flash for speed and better instruction following
export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.45, // Low temperature for consistent but natural tone
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1024,
  }
});
