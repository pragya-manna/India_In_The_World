# Fetches all World Bank indicators into your Supabase project.
# Run this from the project root: .\fetch_all_indicators.ps1

$projectUrl = "https://kzrlazbwoupqvjmqqdsw.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cmxhemJ3b3VwcXZqbXFxZHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTM4ODYsImV4cCI6MjEwMDM2OTg4Nn0.JNa-pq4ImUtfMk0SFRl48NdQCYNL06CbRpiQucZ6gMk"

$indicators = @(
    # "gdp_rank",
    # "gdp_ppp_rank",
    # "gdp_per_capita_rank",
    # "gdp_growth",
    # "inflation",
    # "unemployment",
    # "public_debt_gdp",
    # "rd_expenditure",
    # "internet_penetration",
    # "life_expectancy",
    # "infant_mortality",
    # "forest_cover",
    # "renewable_energy",
    # "co2_per_capita",
    # "literacy_rate",
    # "female_labor",
    # "gini",
    # "urbanization_rate",
    # "patents_per_million",
    "corruption_control",
    "rule_of_law",
    "government_effectiveness",
    "regulatory_quality",
    "political_stability",
    "voice_accountability",
    "primary_enrollment",
    "education_expenditure"
)

foreach ($indicator in $indicators) {
    Write-Host "Fetching $indicator..." -ForegroundColor Cyan
    try {
        $uri = "$projectUrl/functions/v1/fetch-world-bank?indicator=$indicator&country=all&years=10"
        $response = Invoke-WebRequest -UseBasicParsing -Uri $uri -Headers @{"Authorization"="Bearer $anonKey"}
        Write-Host $response.Content -ForegroundColor Green
    } catch {
        Write-Host "FAILED: $indicator - $_" -ForegroundColor Red
    }
    Start-Sleep -Seconds 2
    Write-Host "---"
}

Write-Host "All done!" -ForegroundColor Yellow
