import { NextResponse } from "next/server";
import { triagePrompt, conversationPrompt, model } from "@/lib/gemini";

// Rate limiting (in-memory, simple approach for MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 10): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Sanitize input
function sanitizeInput(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .slice(0, 2000);
}

// High-quality fallback responses that sound like HerCare+ sisterly voice
function getDevelopmentResponse(symptoms: string, nickname: string = "friend") {
  const symptomsLower = symptoms.toLowerCase();
  
  if (symptomsLower.includes('headache') || symptomsLower.includes('head')) {
    return {
      conversation: `${nickname}, I'm so sorry your head is hurting. Dealing with a headache can be so draining.\n\nIt could be due to stress, not getting enough sleep, or maybe you haven't had enough water today. Our bodies usually send these signals when we need to slow down.\n\nPlease try to rest in a quiet, dark room for a bit and sip some water. If it feels very sharp or doesn't go away with rest, it might be good to talk to someone.`,
      show_doctor_choice: true
    };
  }
  
  if (symptomsLower.includes('period') || symptomsLower.includes('cramp') || symptomsLower.includes('menstrual')) {
    return {
      conversation: `I hear you, ${nickname}. Period cramps can be so tough to deal with. Please know that you're not alone in feeling this way.\n\nThis kind of pain often happens because our body is working hard during our cycle. Using a warm heating pad on your belly or drinking some ginger tea might help you feel a bit more comfortable right now.\n\nYou deserve to rest today. If the pain feels like too much to handle or is different than usual, we can look for a kind doctor to help you.`,
      show_doctor_choice: true
    };
  }

  // General warm fallback
  return {
    conversation: `${nickname}, thank you for telling me about this. I know it isn't always easy to talk about health concerns.\n\nOur bodies are very sensitive, and what you're feeling is valid. While I can't know for sure without a proper check-up, I want you to remember to take deep breaths and be gentle with yourself today.\n\nWould you like to talk more about how long this has been happening, or should we find someone nearby who can take a closer look?`,
    show_doctor_choice: true
  };
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "anonymous";

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { age, symptoms, language, nickname, location } = body;

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 2) {
      return NextResponse.json(
        { error: "Please describe your symptoms in detail." },
        { status: 400 }
      );
    }

    const cleanSymptoms = sanitizeInput(symptoms);
    const cleanAge = age ? sanitizeInput(age.toString()) : "25";
    const cleanLanguage = sanitizeInput(language || "English");
    const cleanNickname = nickname ? sanitizeInput(nickname) : "Sister";
    const cleanLocation = location ? sanitizeInput(location) : "India";

    // Check if Gemini API is available
    if (!model || !process.env.GEMINI_API_KEY) {
      console.log("⚠️ Development mode: Using fallback responses (no API key)");
      const fallbackResponse = getDevelopmentResponse(cleanSymptoms);
      // Map fallback to new structure for now
      return NextResponse.json({
        conversation: fallbackResponse.conversation + " (Fallback Mode)",
        show_doctor_choice: true
      });
    }

    // --- PASS 1: TRIAGE AGENT ---
    try {
      const pass1Prompt = triagePrompt(cleanAge, cleanSymptoms, cleanLanguage);
      const pass1Result = await model.generateContent(pass1Prompt);
      const triageJson = pass1Result.response.text();
      const triageJsonClean = triageJson.replace(/```json/g, "").replace(/```/g, "").trim();

      // Parse to ensure valid JSON, though we pass string to next model
      let parsedTriage;
      try {
        parsedTriage = JSON.parse(triageJsonClean);
      } catch (e) {
        console.error("Pass 1 JSON parse error", e);
        parsedTriage = { category: "general health", severity: "medium", repeat_risk: "medium", recommended_action: "consult a doctor soon" }; // Fallback safety
      }

      // --- PASS 2: CONVERSATION AGENT ---
      const pass2Prompt = conversationPrompt(
        cleanNickname,
        cleanLocation,
        cleanSymptoms,
        JSON.stringify(parsedTriage),
        cleanLanguage
      );

      const pass2Result = await model.generateContent(pass2Prompt);
      const conversationText = pass2Result.response.text().trim();

      return NextResponse.json({
        conversation: conversationText,
        show_doctor_choice: true, // Always offer choice as per "Choice = trust"
        triage: parsedTriage // Optional, useful for debugging
      });

    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      return NextResponse.json(
        { error: "I am having a little trouble connecting. Please try again." }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." }, 
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
