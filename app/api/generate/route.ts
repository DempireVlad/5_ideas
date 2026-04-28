import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { topic, category } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key is missing" }), {
        status: 500,
      });
    }

    const prompt = `You are a creative strategist. Your task is to generate "Top 5 Ideas" for the topic: "${topic}".
Context category: "${category}".

MANDATORY RULES:
1. If the category is "Business", provide ideas on HOW A BUSINESS can use this topic for growth (promotions, strategies, service improvements).
2. If the category is "Video Content", provide ideas for video scripts or formats.
3. DO NOT suggest creating new apps or SaaS platforms unless the topic explicitly requires it.
4. Each idea must have a clear short title and a description of 1–2 sentences.

Example for the topic "Coffee" in the "Business" category:
- "Tasting Subscription": offer customers a new type of beans every month.
- "Coffee for a Review": a free cup in exchange for an honest review on social media.

Provide the answer STRICTLY in JSON format:
{
  "ideas": [
    { "title": "Title", "description": "Description" }
  ]
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();
    const cleanedText = aiText.replace(/```json|```/g, "").trim();

    return new Response(JSON.stringify({ text: cleanedText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server Error";
    console.error("Server Error:", error);

    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return new Response(
        JSON.stringify({
          error:
            "Gemini API quota exceeded. Please try again later or check your billing/quota in Google AI Studio.",
        }),
        { status: 429 },
      );
    }

    if (message.includes("401") || message.includes("403")) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid or inaccessible GEMINI_API_KEY. Please check your key and access rights.",
        }),
        { status: 401 },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Server error during generation. Please try again.",
      }),
      { status: 500 },
    );
  }
}
