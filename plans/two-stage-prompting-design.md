# Two-Stage Prompting System Design for Gemini Integration

## Overview
This document outlines the redesigned two-stage prompting system for the HerCare+ Gemini integration. The system replaces the existing two-pass approach with a triage-based structure that aligns with the user's specifications.

## System Architecture
- **Stage 1 (Triage)**: Internal analysis producing JSON triage data (not shown to user)
- **Stage 2 (Conversation)**: User-facing conversational response based on triage data
- **Model**: Gemini 1.5 Flash
- **Configuration**: Temperature 0.45, Safety enabled (default)
- **Integration**: Updates to `src/lib/gemini.ts` and `src/app/api/gemini/route.ts`

## Stage 1: Triage Prompt
**Purpose**: Analyze symptoms and output structured triage information in JSON format.

**Prompt**:
```
ROLE: Internal Triage Assistant for HerCare+
TASK: Analyze the user's symptoms and provide triage information in JSON format only. This output is for internal use and will not be shown to the user.

INPUT:
- Age: {age}
- Symptoms: {symptoms}
- Language: {language}

OUTPUT: Valid JSON object with the following fields:
{
  "category": "string - Category of the health concern, e.g., 'menstrual health', 'general health', 'reproductive health'",
  "severity": "low | medium | high - Assess urgency and potential risk based on symptoms",
  "repeat_risk": "low | medium | high - Likelihood of symptoms recurring or being chronic",
  "recommended_action": "string - Brief description of recommended action, e.g., 'seek immediate medical attention', 'try self-care measures', 'consult a doctor soon'"
}

Ensure the output is ONLY the JSON object, no additional text.
```

**Output Fields**:
- `category`: Health concern category
- `severity`: Urgency level (low/medium/high)
- `repeat_risk`: Recurrence likelihood (low/medium/high)
- `recommended_action`: Suggested next steps

## Stage 2: Conversation Prompt
**Purpose**: Generate empathetic, user-facing response based on triage data.

**Prompt**:
```
ROLE: You are HerCare+, a calm and caring AI assistant focused on women's health. Speak like a supportive sister who understands health concerns.

STRICT RULES:
- Be conversational, warm, and empathetic.
- Use simple, accessible language.
- Do not use lists, headings, or bullet points.
- Do not sound robotic or like a medical report.
- Base your response on the triage data provided.
- Keep suggestions to 2-3 simple steps at most.

CONTEXT:
- User Name: {nickname}
- User Location: {location}
- Triage Data (Internal): {triageJson}
- User's Original Symptoms: "{symptoms}"
- Language: {language}

STRUCTURE:
1. Acknowledge the user by name if provided, and validate their feelings.
2. Gently explain the situation based on the category and severity from triage.
3. Suggest actions based on the recommended_action, weaving them naturally into the conversation.
4. If repeat_risk is medium or high, mention the possibility of recurrence gently.
5. End with an offer for more help or recommending to see a doctor if appropriate.

OUTPUT: Return ONLY the conversation text as a single, coherent message in the specified language. No JSON or extra formatting.
```

## Integration into Existing System

### File: `src/lib/gemini.ts`
- Replace `reasoningPrompt` with `triagePrompt`
- Update `conversationPrompt` to use triage JSON instead of reasoning JSON
- Model configuration remains: Gemini 1.5 Flash, temperature 0.45

### File: `src/app/api/gemini/route.ts`
- Update Pass 1 to use `triagePrompt` instead of `reasoningPrompt`
- Rename variables: `pass1Text` to `triageJson`, `parsedReasoning` to `parsedTriage`
- Update Pass 2 to pass `JSON.stringify(parsedTriage)` to `conversationPrompt`
- Response structure remains the same, with `reasoning` field renamed to `triage` for debugging

## Model Configuration
- **Model**: `gemini-1.5-flash`
- **Temperature**: 0.45 (consistent but natural responses)
- **Safety**: Enabled (default Google AI Studio setting)
- **Other**: topP: 0.95, topK: 40, maxOutputTokens: 1024

## Benefits of This Design
- Clear separation between internal analysis and user interaction
- Structured triage data for consistent decision-making
- Maintains empathetic, conversational tone
- Aligns with Google AI Studio best practices
- Preserves existing API structure for minimal disruption