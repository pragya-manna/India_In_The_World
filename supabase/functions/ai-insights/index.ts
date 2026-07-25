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

    let context = "";

    // Fetch live India data for every dashboard indicator.
    const { data: allIndicators, error: indicatorsError } = await supabase
      .from("indicators")
      .select("id, name, unit, category_id, categories(name)")
      .order("display_order");

    if (indicatorsError) throw indicatorsError;

    const indicatorIds = (allIndicators || []).map((indicator) => indicator.id);

    const { data: indiaRankings, error: rankingsError } = await supabase
      .from("rankings")
      .select("indicator_id, year, value, rank")
      .eq("country_id", "IN")
      .in("indicator_id", indicatorIds)
      .order("year", { ascending: false });

    if (rankingsError) throw rankingsError;

    // If the request is for a specific category or indicator,
    // restrict the AI context to that selection. Otherwise, send all dashboard data.
    const scopedIndicators = (allIndicators || []).filter((indicator) => {
      if (indicator_id) return indicator.id === indicator_id;
      if (category_id) return indicator.category_id === category_id;
      return true;
    });

    const rankingsByIndicator = new Map<string, typeof indiaRankings>();

    for (const ranking of indiaRankings || []) {
      const current = rankingsByIndicator.get(ranking.indicator_id) || [];
      current.push(ranking);
      rankingsByIndicator.set(ranking.indicator_id, current);
    }

    context = scopedIndicators.map((indicator) => {
      const records = (rankingsByIndicator.get(indicator.id) || [])
        .sort((a, b) => b.year - a.year)
        .slice(0, 3);

      const history = records.length
        ? records.map((record) =>
          `${record.year}: value ${record.value ?? "unavailable"}, rank ${record.rank ? `#${record.rank}` : "unavailable"
          }`
        ).join(" | ")
        : "No India data available";

      return `${indicator.categories?.name || "Uncategorized"} — ${indicator.name} (${indicator.unit}): ${history}`;
    }).join("\n");

    let content: string;

    if (openrouterKey) {
      const systemPrompt = `You are Bharat AI assistant for the India in the World Dashboard.
Answer the user's question directly and clearly.
You can answer general questions about India and the world, as well as questions based on dashboard data.
Use the supplied live India dashboard data as the primary source of truth.
If a requested metric has no data, clearly say that it is unavailable.
Do not invent statistics, rankings, years, trends, or comparisons.
Never invent exact rankings, dates, or statistics when data was not provided.
Format all answers as clean Markdown for a dashboard interface.
For reports:
- Start with ## Report Title
- Use ### for sections
- Use - for concise bullet points
- Use bold only for metric names
- Keep paragraphs short
- Do not output raw HTML
- Do not use more than 450 words `;

      const userPrompt = `Question: ${prompt}

Dashboard data, if available:
${context || "No dashboard data was selected."}

Answer the question directly. Do not ask the user to provide a dataset unless the question specifically requires unavailable exact data.`;

      const openrouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openrouterKey}`,
          "HTTP-Referer": "https://india-in-the-world.app",
          "X-Title": "India in the World Dashboard",
        },
        body: JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free",
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
        model: openrouterKey ? "google/gemma-4-26b-a4b-it:free" : "rule-based",
      });
    }

    return new Response(
      JSON.stringify({ success: true, content, model: openrouterKey ? "google/gemma-4-26b-a4b-it:free" : "rule-based" }),
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
