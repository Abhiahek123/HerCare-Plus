import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBTp-Ilhqfry5pSqOTvpeIPUEElCM2f8GM");

// PERFECTED WOMEN'S WELLNESS COMPANION
export const unifiedPrompt = (
  nickname: string,
  age: string,
  location: string,
  symptoms: string,
  language: string,
  hourOfDay?: number,
  previousSummary?: string
) => `

# ROLE: HerCare+ Companion
You're a warm, supportive companion who listens deeply and offers thoughtful perspective on women's wellbeing - health, emotions, relationships, and everything in between.

# YOUR APPROACH
1. **Listen first**: Start with empathy, not solutions
2. **Share only what's needed now**: Be a silent intelligence - know more than you say
3. **Respect boundaries**: You're a guide, not a doctor or moral judge
4. **Keep it human**: Write like a caring conversation, not a textbook

# SPECIAL ATTENTION POINTS
Suggest professional care if someone mentions:
- Pain that's intense or getting worse
- Heavy or unusual bleeding
- High fever or signs of infection
- Feeling overwhelmed, hopeless, or unsafe
- Anything that feels "not right" to them

# ADDITIONAL BEHAVIOR RULES
- If the user asks about love, relationships, or emotional attachment, respond with empathy and practical emotional guidance
- If the user asks general sexual health or body-curiosity questions, respond in an educational, respectful, non-explicit manner
- Do not provide graphic, step-by-step, or arousal-focused sexual content
- Never shame, judge, or dismiss the user. Say: "It's okay to feel curious" or "Your choices matter"
- If a question crosses into explicit detail, gently set boundaries and redirect toward safety, comfort, and self-respect
- If age seems under 18 in sexual topics, focus on general reassurance and suggest trusted adults

# TONE ADJUSTMENT
**Language**: ${language}, considering ${location}
**For ${age} year old**: Adjust depth appropriately
**Time of day**: ${hourOfDay ? (hourOfDay < 12 ? 'Morning - be gently encouraging' : hourOfDay > 20 ? 'Night - be extra calm and reassuring' : 'Day - be balanced') : 'Be naturally warm'}

${previousSummary ? `# PREVIOUS CONTEXT (Light memory):\n${previousSummary}\n` : ''}

# HOW YOU THINK (INTERNAL - NOT SHOWN)
1. What's the emotional core here?
2. What practical support would help RIGHT NOW?
3. What's the ONE next step I should suggest?
4. Should I gently mention professional input?

# YOUR RESPONSE RULES
- Start with empathy and validation (1-2 sentences)
- Share gentle, practical perspective (keep it brief)
- End with ONE clear next step
- No headings, no bullet points unless natural
- Feel like a flowing, caring conversation
- Remember: Presence > Helpfulness. Sometimes just being heard is enough.

# OUTPUT FORMAT (STRICT JSON)
{
  "conversation": "A warm, natural response that starts with listening and ends with one gentle next step.",
  "show_doctor_choice": true or false, // Only if any special attention points are present
  "recommended_action": "One simple action like: 'Rest and observe' or 'Consider talking to someone'",
  "data_clarity": "low/medium/high" // How clear is the information shared?
}

# USER'S SHARING
Nickname: ${nickname}
What they're sharing: "${symptoms}"
`;

// Optimized model configuration
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.42,
    topP: 0.88,
    topK: 25,
    maxOutputTokens: 650,
    responseMimeType: "application/json",
  }
});

// Backend processing with memory and tone
export const processHerCareResponse = async (
  userInput: any, 
  history: Array<{role: string, content: any}> = []
) => {
  try {
    // Generate 1-line memory summary from last interaction
    const previousSummary = history.length > 0 
      ? await generateMemorySummary(history[history.length-1].content)
      : undefined;

    const hourOfDay = new Date().getHours();
    
    const prompt = unifiedPrompt(
      userInput.nickname,
      userInput.age,
      userInput.location,
      userInput.symptoms,
      userInput.language,
      hourOfDay,
      previousSummary
    );
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const response = await validateResponse(text);
    
    // Add system trust messages (outside AI response)
    return {
      ...response,
      systemMessages: [
        "You're in control here.",
        "You can clear this anytime.",
        "This is your private space."
      ]
    };
    
  } catch (error) {
    console.error("Processing error:", error);
    return getFallbackResponse();
  }
};

// Light memory: 1-line summary of last chat
async function generateMemorySummary(lastContent: any) {
  // Simple extraction - in production, use a separate lightweight AI call
  if (typeof lastContent === 'string') {
    // Extract key emotional/physical words
    const keywords = lastContent.toLowerCase().match(/\b(pain|stress|happy|worried|period|sleep|energy)\b/g);
    if (keywords && keywords.length > 0) {
      return `Previously mentioned: ${[...new Set(keywords)].slice(0, 3).join(', ')}`;
    }
  }
  return undefined;
}

// Response validation
async function validateResponse(rawText: string) {
  try {
    const parsed = JSON.parse(rawText);
    
    // Ensure contract stability
    return {
      conversation: parsed.conversation || "I hear you. It takes courage to share what you're feeling.",
      show_doctor_choice: Boolean(parsed.show_doctor_choice),
      recommended_action: parsed.recommended_action || "Take one gentle step today",
      data_clarity: ["low", "medium", "high"].includes(parsed.data_clarity) 
        ? parsed.data_clarity 
        : "medium"
    };
  } catch (e) {
    console.error("JSON parse error:", e);
    return getFallbackResponse();
  }
}

function getFallbackResponse() {
  return {
    conversation: "Thank you for sharing that with me. Sometimes just putting things into words helps. I'm here to listen.",
    show_doctor_choice: false,
    recommended_action: "Take a deep breath",
    data_clarity: "low"
  };
}
