
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBTp-Ilhqfry5pSqOTvpeIPUEElCM2f8GM";
  
  if (!apiKey) process.exit(1);

  try {
    console.log("📡 Listing Models...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
        console.log("✅ Available Models:");
        data.models.forEach((m: any) => console.log(` - ${m.name}`));
        
        // Find a generation model
        const chatModel = data.models.find((m: any) => m.supportedGenerationMethods.includes("generateContent"));
        if (chatModel) {
            console.log(`\n🎯 Selecting model: ${chatModel.name}`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: chatModel.name.replace("models/", "") });
            const result = await model.generateContent("Test");
            console.log("✅ Generation Successful: " + (await result.response).text());
        }
    } else {
        console.error("❌ Error Listing Models:", JSON.stringify(data, null, 2));
    }

  } catch (error: any) {
    console.error("❌ FAILED:", error);
  }
}

testGemini();
