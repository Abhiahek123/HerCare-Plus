import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBTp-Ilhqfry5pSqOTvpeIPUEElCM2f8GM");

// ENHANCED WITH SMART QUERY ROUTING
export const unifiedPrompt = (
  nickname: string,
  age: string,
  location: string,
  symptoms: string,
  language: string,
  hourOfDay?: number
) => `

# CRITICAL FIRST STEP: UNDERSTAND THE QUERY TYPE

Analyze this query: "${symptoms}"

Is it:
A) Physical health/medical concern? (pain, discomfort, body changes, illness)
B) Emotional/relationship/personal concern? (feelings, relationships, stress, love)
C) Sexual health/body curiosity? (questions about body, intimacy, curiosity)
D) Casual/emotional expression? (statements like "I'm horny", "I'm sad", "I'm happy")

# YOUR ROLE: HerCare+ Companion
You're a warm, supportive companion who adapts to what the user needs.

# RESPONSE RULES BY QUERY TYPE:

## IF QUERY TYPE A (Medical/Physical):
* Start with empathy: "I hear this is affecting you physically"
* Ask gently: "How long has this been happening?"
* Suggest professional care if: pain is severe, bleeding is heavy, fever is high, or something feels "alarmingly wrong"
* Recommended action: "Rest and observe" or "Consider checking with a doctor"

## IF QUERY TYPE B (Emotional/Relationship):
* Start with validation: "These feelings are real and important"
* Be a thoughtful listener: Ask gentle questions to understand
* Never judge relationships or emotions
* Recommended action: "Take time to reflect" or "Talk to someone you trust"

## IF QUERY TYPE C (Sexual Health/Body Curiosity):
* Be educational and respectful
* Keep it non-explicit: Focus on safety, comfort, consent
* Normalize curiosity without graphic details
* Recommended action: "Learn about your body safely" or "Talk to a trusted adult/health provider"

## IF QUERY TYPE D (Casual Expression):
* Match the emotional tone
* If "I'm horny": "It's normal to have these feelings. Remember to respect yourself and others, and make choices that feel safe and right for you."
* If emotional: Reflect and validate
* Recommended action: "Be gentle with yourself"

# TONE & APPROACH
* Language: ${language} (consider ${location} culture)
* For ${age} year old: Adjust appropriately
* Time: ${hourOfDay ? (hourOfDay > 20 ? 'Evening - be calm' : hourOfDay < 6 ? 'Late night - be reassuring' : 'Normal hours - be present') : 'Be natural'}
* Be human, not robotic
* ONE clear next step only

# OUTPUT FORMAT (JSON ONLY)
{
  "conversation": "Start with appropriate response for the query type. Be warm, brief, and human. End with one gentle question or reflection.",
  "show_doctor_choice": true/false, // True ONLY for clear medical concerns needing attention
  "recommended_action": "One simple step like: 'Reflect on this' or 'Rest and hydrate'"
}

# USER CONTEXT
Nickname: ${nickname}
Sharing: "${symptoms}"
`;

// Optimized model
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.5, // Slightly higher for more natural variation
    topP: 0.9,
    topK: 30,
    maxOutputTokens: 600,
    responseMimeType: "application/json",
  }
});

// SMARTER PROCESSING FUNCTION
export const processQuery = async (
  nickname: string,
  age: string,
  location: string,
  query: string,
  language: string = "English"
) => {
  try {
    const hour = new Date().getHours();
    
    // First, do a quick classification on our side
    const queryType = classifyQuery(query);
    
    // Add classification hint to prompt for better results
    const enhancedQuery = `${query} [Detected as: ${queryType}]`;
    
    const prompt = unifiedPrompt(
      nickname,
      age,
      location,
      enhancedQuery,
      language,
      hour
    );
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const response = await validateResponse(text);
    
    // Add UI micro-copy based on query type
    const uiMessages = getUIMessages(queryType, age);
    
    return {
      ...response,
      uiMessages,
      queryType
    };
    
  } catch (error) {
    console.error("Processing error:", error);
    return getFallbackResponse(query);
  }
};

// SIMPLE QUERY CLASSIFICATION
function classifyQuery(query: string): string {
  const lowerQuery = query.toLowerCase().trim();
  
  // Medical indicators
  const medicalWords = ['pain', 'hurt', 'ache', 'fever', 'bleed', 'period', 'headache', 'stomach', 'vomit', 'dizzy', 'sick', 'ill', 'symptom'];
  if (medicalWords.some(word => lowerQuery.includes(word))) return "MEDICAL";
  
  // Emotional indicators
  const emotionalWords = ['sad', 'happy', 'angry', 'stressed', 'anxious', 'depressed', 'lonely', 'love', 'crush', 'relationship', 'breakup'];
  if (emotionalWords.some(word => lowerQuery.includes(word))) return "EMOTIONAL";
  
  // Sexual/body curiosity indicators (careful handling)
  const bodyWords = ['horny', 'arous', 'masturbat', 'sexual', 'intimacy', 'body', 'touch', 'feel', 'curious', 'private'];
  if (bodyWords.some(word => lowerQuery.includes(word))) return "BODY_CURIOSITY";
  
  // Casual expression
  if (lowerQuery.length < 20 && !lowerQuery.includes('?')) return "EXPRESSION";
  
  return "GENERAL";
}

// UI MESSAGES BASED ON QUERY TYPE
function getUIMessages(queryType: string, age: string): string[] {
  const baseMessages = ["This is your private space.", "You're in control here."];
  
  switch(queryType) {
    case "MEDICAL":
      return [...baseMessages, "Listen to your body."];
    case "EMOTIONAL":
      return [...baseMessages, "Your feelings matter."];
    case "BODY_CURIOSITY":
      return age < 18 
        ? [...baseMessages, "It's okay to be curious.", "Talk to trusted adults about body questions."]
        : [...baseMessages, "Your body, your journey.", "Always prioritize safety and consent."];
    default:
      return baseMessages;
  }
}

async function validateResponse(rawText: string) {
  try {
    const parsed = JSON.parse(rawText);
    
    return {
      conversation: parsed.conversation || "Thank you for sharing. I'm here to listen.",
      show_doctor_choice: Boolean(parsed.show_doctor_choice),
      recommended_action: parsed.recommended_action || "Take a moment for yourself"
    };
  } catch (e) {
    console.error("JSON parse error:", e);
    return getFallbackResponse("");
  }
}

function getFallbackResponse(query: string) {
  // Smarter fallback based on query
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("horny") || lowerQuery.includes("arous")) {
    return {
      conversation: "It's completely normal to have these feelings. Remember to respect yourself and make choices that feel safe and right for you.",
      show_doctor_choice: false,
      recommended_action: "Be gentle with yourself",
      uiMessages: ["This is your private space.", "Your feelings are valid."]
    };
  }
  
  return {
    conversation: "Thank you for sharing that. Sometimes the first step is just putting it into words.",
    show_doctor_choice: false,
    recommended_action: "Take a deep breath",
    uiMessages: ["You're in control here.", "This conversation is private."]
  };
}
