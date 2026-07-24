import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping of our indicator IDs to World Bank API indicator codes
const worldBankIndicatorMap: Record<string, string> = {
  gdp_rank: "NY.GDP.MKTP.CD",
  gdp_ppp_rank: "NY.GDP.MKTP.PP.CD",
  gdp_per_capita_rank: "NY.GDP.PCAP.CD",
  gdp_growth: "NY.GDP.MKTP.KD.ZG",
  inflation: "FP.CPI.TOTL.ZG",
  unemployment: "SL.UEM.TOTL.ZS",
  public_debt_gdp: "GC.DOD.TOTL.GD.ZS",
  rd_expenditure: "GB.XPD.RSDV.GD.ZS",
  internet_penetration: "IT.NET.USER.ZS",
  life_expectancy: "SP.DYN.LE00.IN",
  infant_mortality: "SP.DYN.IMRT.IN",
  forest_cover: "AG.LND.FRST.ZS",
  renewable_energy: "EG.FEC.RNEW.ZS",
  co2_per_capita: "EN.ATM.CO2E.PC",
  literacy_rate: "SE.ADT.LITR.ZS",
  female_labor: "SL.TLF.TOTL.FE.ZS",
  gini: "SI.POV.GINI",
  urbanization_rate: "SP.URB.TOTL.IN.ZS",
  patents_per_million: "IP.PAT.RESD",
  corruption_control: "GOV_WGI_CC.EST",
  rule_of_law: "GOV_WGI_RL.EST",
  government_effectiveness: "GOV_WGI_GE.EST",
  regulatory_quality: "GOV_WGI_RQ.EST",
  political_stability: "GOV_WGI_PV.EST",
  voice_accountability: "GOV_WGI_VA.EST",
  primary_enrollment: "SE.PRM.ENRR",
  education_expenditure: "SE.XPD.TOTL.GD.ZS",
  hospital_beds: "SH.MED.BEDS.ZS",
  health_expenditure: "SH.XPD.CHEX.GD.ZS",
  homicide_rate: "VC.IHR.PSRC.P5",
};

// ISO2 -> our country ID mapping (most are identical)
// World Bank uses ISO2 codes which match our country IDs for most cases

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const indicatorId = url.searchParams.get("indicator");
    const countryCode = url.searchParams.get("country") || "all";
    const years = url.searchParams.get("years") || "10"; // last N years

    if (!indicatorId) {
      return new Response(
        JSON.stringify({ error: "Missing 'indicator' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const wbCode = worldBankIndicatorMap[indicatorId];
    if (!wbCode) {
      return new Response(
        JSON.stringify({ error: `Indicator '${indicatorId}' not mapped to World Bank` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from World Bank API
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - Number(years);
    const wbUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${wbCode}?format=json&per_page=10000&date=${startYear}:${currentYear}`;
    console.log("Fetching:", wbUrl);

    const wbResponse = await fetch(wbUrl);
    if (!wbResponse.ok) {
      throw new Error(`World Bank API returned ${wbResponse.status}`);
    }

    const wbData = await wbResponse.json();
    const records = wbData[1] || [];

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ message: "No data found", fetched: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get our countries for ISO2 mapping
    const { data: ourCountries } = await supabase.from("countries").select("id, iso2");
    const iso2ToId: Record<string, string> = {};
    (ourCountries || []).forEach((c: { id: string; iso2: string | null }) => {
      if (c.iso2) iso2ToId[c.iso2] = c.id;
    });

    // Get indicator to check higher_is_better
    const { data: indicator } = await supabase
      .from("indicators")
      .select("id, higher_is_better")
      .eq("id", indicatorId)
      .maybeSingle();

    // Transform and upsert rankings
    const rankingsToUpsert: {
      indicator_id: string;
      country_id: string;
      year: number;
      value: number;
    }[] = [];

    let skippedAggregates = 0;
    for (const record of records) {
      const wbCountryCode = record.country?.id;
      const ourCountryId = iso2ToId[wbCountryCode];
      const year = parseInt(record.date);
      const value = record.value;

      if (!ourCountryId) {
        skippedAggregates++;
        continue; // World Bank region/income-group aggregates we don't track
      }
      if (value !== null && !isNaN(Number(value))) {
        rankingsToUpsert.push({
          indicator_id: indicatorId,
          country_id: ourCountryId,
          year,
          value: Number(value),
        });
      }
    }

    // Upsert in batches
    let upserted = 0;
    const batchErrors: string[] = [];
    const batchSize = 500;
    for (let i = 0; i < rankingsToUpsert.length; i += batchSize) {
      const batch = rankingsToUpsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from("rankings")
        .upsert(batch, { onConflict: "indicator_id,country_id,year" });
      if (error) {
        console.error("Upsert error:", error);
        batchErrors.push(error.message);
      } else {
        upserted += batch.length;
      }
    }

    // Compute ranks for the latest year
    const latestYear = Math.max(...rankingsToUpsert.map((r) => r.year));
    const latestData = rankingsToUpsert.filter((r) => r.year === latestYear);
    const sorted = [...latestData].sort((a, b) =>
      indicator?.higher_is_better ? b.value - a.value : a.value - b.value
    );

    // Batch update ranks in one call instead of ~230 sequential calls
    // (the old one-by-one loop was causing timeouts on larger indicators)
    const rankUpdates = sorted.map((item, i) => ({
      indicator_id: indicatorId,
      country_id: item.country_id,
      year: latestYear,
      value: item.value,
      rank: i + 1,
    }));

    if (rankUpdates.length > 0) {
      const rankBatchSize = 500;
      for (let i = 0; i < rankUpdates.length; i += rankBatchSize) {
        const batch = rankUpdates.slice(i, i + rankBatchSize);
        const { error: rankError } = await supabase
          .from("rankings")
          .upsert(batch, { onConflict: "indicator_id,country_id,year" });
        if (rankError) {
          console.error("Rank batch upsert error:", rankError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        indicator: indicatorId,
        world_bank_code: wbCode,
        fetched: rankingsToUpsert.length,
        upserted,
        skipped_aggregates: skippedAggregates,
        batch_errors: batchErrors,
        latest_year: latestYear,
        ranked: sorted.length,
      }),
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