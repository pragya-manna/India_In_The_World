import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { prompt, indicator_id, category_id, insight_type, save } = await req.json();

    // Gather context data from the database
    let context = "";

    if (indicator_id) {
      const { data: indicator } = await supabase
        .from("indicators")
        .select("*, categories(*)")
        .eq("id", indicator_id)
        .maybeSingle();

      const { data: rankings } = await supabase
        .from("rankings")
        .select("*, countries(name, flag_emoji)")
        .eq("indicator_id", indicator_id)
        .order("year", { ascending: false });

      const { data: sources } = await supabase
        .from("sources")
        .select("*")
        .eq("indicator_id", indicator_id);

      context = `Indicator: ${indicator?.name} (${indicator?.unit})
Category: ${indicator?.categories?.name}
Description: ${indicator?.description}
Higher is better: ${indicator?.higher_is_better}

Rankings data:
${(rankings || []).slice(0, 50).map((r) => `${r.year} | ${r.countries?.name} | Value: ${r.value} | Rank: ${r.rank}`).join("\n")}

Sources:
${(sources || []).map((s) => `${s.organization} - ${s.report_name} (${s.url})`).join("\n")}
`;
    } else if (category_id) {
      const { data: category } = await supabase
        .from("categories")
        .select("*")
        .eq("id", category_id)
        .maybeSingle();

      const { data: indicators } = await supabase
        .from("indicators")
        .select("*")
        .eq("category_id", category_id);

      context = `Category: ${category?.name}
Description: ${category?.description}

Indicators in this category:
${(indicators || []).map((i) => `- ${i.name} (${i.unit})`).join("\n")}
`;
    }

    let content: string;

    if (openrouterKey) {
      const systemPrompt = `You are an expert analyst on India's global rankings. You analyze data from international indices (UN, World Bank, IMF, WHO, etc.) and provide clear, insightful summaries. Be concise but informative. Use data points when available. Respond in a professional but accessible tone.`;

      const userPrompt = `${prompt}

Context data:
${context}

Provide a clear, data-driven insight about India's performance. Include specific numbers and rankings when available. Suggest areas for improvement if relevant.`;

      const openrouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openrouterKey}`,
          "HTTP-Referer": "https://india-in-the-world.app",
          "X-Title": "India in the World Dashboard",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!openrouterResponse.ok) {
        throw new Error(`OpenRouter API returned ${openrouterResponse.status}`);
      }

      const openrouterData = await openrouterResponse.json();
      content = openrouterData.choices?.[0]?.message?.content || "Unable to generate insight.";
    } else {
      content = generateFallbackInsight(prompt, context, indicator_id, category_id);
    }

    // Save the insight if requested
    if (save && content) {
      await supabase.from("ai_insights").insert({
        indicator_id: indicator_id || null,
        category_id: category_id || null,
        insight_type: insight_type || "summary",
        content,
        model: openrouterKey ? "meta-llama/llama-3.1-8b-instruct:free" : "rule-based",
      });
    }

    return new Response(
      JSON.stringify({ success: true, content, model: openrouterKey ? "meta-llama/llama-3.1-8b-instruct:free" : "rule-based" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackInsight(
  prompt: string,
  context: string,
  indicatorId: string | null,
  categoryId: string | null
): string {
  // Parse rankings from context to generate a basic insight
  const rankLines = context.match(/(\d{4}) \| (.+?) \| Value: (.+?) \| Rank: (.+)/g) || [];
  const indiaLines = rankLines.filter((l) => l.includes("India"));

  if (indiaLines.length > 0) {
    const latest = indiaLines[0];
    const match = latest.match(/(\d{4}) \| .+? \| Value: (.+?) \| Rank: (.+)/);
    if (match) {
      const [, year, value, rank] = match;
      return `Based on the latest available data (${year}), India's value is ${value} with a global rank of #${rank}. ${indicatorId ? "This indicator reflects India's performance relative to other nations. " : ""}For deeper analysis, connect an OpenAI API key to generate AI-powered insights with trend analysis and improvement recommendations.`;
    }
  }

  return `I can see data for this ${categoryId ? "category" : "indicator"}. To generate detailed AI-powered insights with trend analysis, comparisons, and recommendations, please configure an OpenAI API key in your Supabase project secrets. Without it, I can still show you the raw data — explore the dashboard and comparison pages for visualizations.`;
}
