import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBTp-Ilhqfry5pSqOTvpeIPUEElCM2f8GM");

// PERFECTED PROMPT WITH SMART ROUTING
export const unifiedPrompt = (
  nickname: string,
  age: string,
  location: string,
  symptoms: string,
  language: string,
  hourOfDay?: number
) => `

# QUERY TYPE ANALYSIS
Based on: "${symptoms}"

# HERECARE+ COMPANION GUIDELINES
You're a warm, supportive companion for women's wellbeing. Adapt your response to the query type.

## RESPONSE PATTERNS:

1. **MEDICAL CONCERNS** (pain, fever, bleeding, physical discomfort):
   - Start with empathy for physical experience
   - Ask about duration gently
   - Suggest doctor if severe/unusual
   - Action: "Rest and observe" or "Consider checking"

2. **EMOTIONAL CONCERNS** (feelings, relationships, stress, love):
   - Validate emotions first
   - Ask gentle questions
   - Never judge
   - Action: "Take time for yourself" or "Talk to someone trusted"

3. **BODY CURIOSITY** (questions about body, intimacy, sexual health):
   - Be educational, respectful
   - Keep non-explicit
   - Focus on safety, consent, comfort
   - Action: "Learn about your body safely"

4. **CASUAL EXPRESSION** ("I'm horny", "I'm sad", emotional states):
   - Match emotional tone
   - Normalize feelings
   - Gentle guidance
   - Action: "Be gentle with yourself"

# CRITICAL SAFETY RULES
- If under 18 and sexual topic: redirect to trusted adults
- No graphic details ever
- No shame or judgment
- Professional suggestion only for clear medical concerns

# TONE & FORMAT
Language: ${language}
For ${age} year old: adjust appropriately
Time: ${hourOfDay ? (hourOfDay > 18 ? 'Evening - calm tone' : 'Day - normal tone') : 'Warm tone'}
Be human, brief, flowing
ONE clear next step only

# OUTPUT (JSON ONLY)
{
  "conversation": "Start appropriately for query type. Be warm, brief, human. End with one gentle reflection.",
  "show_doctor_choice": true/false, // Only for clear medical concerns needing attention
  "recommended_action": "One simple step" // 2-4 words max
}

# USER
${nickname}: "${symptoms}"
`;

// Model configuration
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.5,
    topP: 0.9,
    topK: 30,
    maxOutputTokens: 600,
    responseMimeType: "application/json",
  }
});

// TYPES
interface HerCareResponse {
  conversation: string;
  show_doctor_choice: boolean;
  recommended_action: string;
  uiMessages?: string[];
  queryType?: string;
}

interface ProcessQueryParams {
  nickname: string;
  age: string;
  location: string;
  query: string;
  language?: string;
}

// MAIN PROCESSING FUNCTION
export const processHerCareQuery = async ({
  nickname,
  age,
  location,
  query,
  language = "English"
}: ProcessQueryParams): Promise<HerCareResponse> => {
  try {
    const hour = new Date().getHours();
    
    // Classify query
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
    
    const response = validateResponse(text);
    const uiMessages = getUIMessages(queryType, parseInt(age) || 25);
    
    return {
      ...response,
      uiMessages,
      queryType
    };
    
  } catch (error) {
    console.error("Processing error:", error);
    return getFallbackResponse(query, parseInt(age) || 25);
  }
};

// SIMPLE QUERY CLASSIFICATION
function classifyQuery(query: string, age: string): string {
  const lowerQuery = query.toLowerCase().trim();
  const ageNum = parseInt(age) || 25;
  
  // Medical indicators
  const medicalWords = ['pain', 'hurt', 'ache', 'fever', 'bleed', 'period', 'headache', 'sick', 'ill', 'symptom'];
  if (medicalWords.some(word => lowerQuery.includes(word))) return "MEDICAL";
  
  // Emotional indicators
  const emotionalWords = ['sad', 'happy', 'angry', 'stress', 'anxious', 'love', 'crush', 'relationship', 'breakup'];
  if (emotionalWords.some(word => lowerQuery.includes(word))) return "EMOTIONAL";
  
  // Body curiosity (careful)
  const bodyWords = ['horny', 'arous', 'sexual', 'body', 'touch', 'private'];
  if (bodyWords.some(word => lowerQuery.includes(word))) {
    return ageNum < 18 ? "EXPRESSION_YOUNG" : "BODY_CURIOSITY";
  }
  
  // Casual expression
  if (lowerQuery.length < 30 && !lowerQuery.includes('?')) return "EXPRESSION";
  
  return "GENERAL";
}

// UI MESSAGES
function getUIMessages(queryType: string, age: number): string[] {
  const baseMessages = ["This is your private space.", "You're in control here."];
  
  switch(queryType) {
    case "MEDICAL":
      return [...baseMessages, "Listen to your body."];
    case "EMOTIONAL":
      return [...baseMessages, "Your feelings matter."];
    case "BODY_CURIOSITY":
      return age < 18 
        ? [...baseMessages, "Talk to trusted adults."]
        : [...baseMessages, "Your body, your journey."];
    case "EXPRESSION_YOUNG":
      return [...baseMessages, "You can talk to trusted adults."];
    default:
      return baseMessages;
  }
}

// RESPONSE VALIDATION
function validateResponse(rawText: string): HerCareResponse {
  try {
    const parsed = JSON.parse(rawText);
    
    // Ensure conversation is a string and not empty
    let conversation = parsed.conversation || "Thank you for sharing. I'm here to listen.";
    
    // Clean up common issues
    if (conversation.includes('```json')) {
      conversation = conversation.replace(/```json|```/g, '').trim();
    }
    
    return {
      conversation: conversation.substring(0, 500), // Limit length
      show_doctor_choice: Boolean(parsed.show_doctor_choice),
      recommended_action: parsed.recommended_action?.substring(0, 30) || "Take a moment"
    };
  } catch (e) {
    console.error("JSON parse error:", e);
    return getFallbackResponse("", 25);
  }
}

// FALLBACK RESPONSES
function getFallbackResponse(query: string, age: number): HerCareResponse {
  const lowerQuery = query.toLowerCase();
  
  // Specific fallbacks for common cases
  if (lowerQuery.includes("horny")) {
    return {
      conversation: "These feelings are normal. Remember to respect yourself and make choices that feel safe and right for you.",
      show_doctor_choice: false,
      recommended_action: "Be gentle with yourself",
      uiMessages: ["This is your private space.", "Your feelings are valid."],
      queryType: "EXPRESSION"
    };
  }
  
  if (lowerQuery.includes("pain") || lowerQuery.includes("hurt")) {
    return {
      conversation: "I hear you're experiencing discomfort. If it's severe or worrying, consider checking with a healthcare provider.",
      show_doctor_choice: true,
      recommended_action: "Rest and observe",
      uiMessages: ["Listen to your body.", "You're in control here."],
      queryType: "MEDICAL"
    };
  }
  
  // General fallback
  return {
    conversation: "Thank you for sharing that with me. I'm here to listen and support you.",
    show_doctor_choice: false,
    recommended_action: "Take a deep breath",
    uiMessages: ["You're in control here.", "This conversation is private."],
    queryType: "GENERAL"
  };
}

// SIMPLE VERSION FOR DEMO/QUICK TEST
export const quickResponse = async (query: string): Promise<HerCareResponse> => {
  return processHerCareQuery({
    nickname: "Friend",
    age: "25",
    location: "India",
    query: query,
    language: "English"
  });
};
