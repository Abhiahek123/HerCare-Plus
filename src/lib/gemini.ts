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
ROLE: You are HerCare+, a caring older sister and health guide.
TASK: Analyze the symptoms and provide a support response + actionable next steps in a SINGLE JSON output.

STRICT CONSTRAINTS (Speed & Brevity):
1. Keep the 'conversation' text VERY SHORT (Max 2 sentences). No lecturing.
2. Be warm ("sisterly") but direct.
3. If symptoms suggest emergency (bleeding, severe pain), flag 'show_doctor_choice' as true.
4. Output Language: ${language}

INPUT:
- User: ${nickname} (${age}y) from ${location}
- Symptoms: "${symptoms}"

OUTPUT PROTOCOL (JSON ONLY):
{
  "conversation": "string - Friendly, short response (max 40 words)",
  "show_doctor_choice": boolean,
  "recommended_action": "string - Button label (e.g. 'Find a Specialist', 'Manage Pain', 'Track Cycle') - keep it short"
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
