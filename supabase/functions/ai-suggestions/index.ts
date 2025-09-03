import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { expenses, budget } = await req.json();
    console.log("Received data:", { expenses, budget });

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert financial advisor.
The user will give you their expenses (category + amount) and a budget.
Your task:
1. Provide a short **analysis** summarizing the spending pattern vs budget.
2. Provide 3–5 practical **money-saving tips**.
3. Provide any **alerts** (e.g., overspending in categories, budget risk).
⚠️ Output must be ONLY valid JSON. Do not add extra text, markdown, or code fences.
Format:
{
  "analysis": "<summary text>",
  "tips": ["<tip1>", "<tip2>", "<tip3>"],
  "alerts": ["<alert1>", "<alert2>"]
}`;

    const userInput = { expenses, budget };

    console.log("Calling OpenRouter API...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 500,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userInput) },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenRouter raw response:", data);

    const aiResponseText = data.choices?.[0]?.message?.content;
    if (!aiResponseText) throw new Error("Invalid OpenRouter response structure");

    console.log("AI response text:", aiResponseText);

    let aiResponse;
    try {
      aiResponse = JSON.parse(aiResponseText);
    } catch (err) {
      console.error("Failed to parse AI response:", err);
      return new Response(JSON.stringify({ error: "AI response invalid" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!aiResponse.analysis || !aiResponse.tips || !aiResponse.alerts) {
      console.error("Missing required fields in AI response:", aiResponse);
      return new Response(JSON.stringify({ error: "AI response invalid" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Returning successful response");
    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-suggestions function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
