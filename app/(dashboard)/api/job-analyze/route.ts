// app/api/job-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeJobOffer, parseAnalysisResult } from "@/lib/job-analysis";
import { createClient } from "@/utils/supabase/server";  // Zmiana na klienta serwerowego

export async function POST(req: NextRequest) {
  console.log("🔍 API: Rozpoczęcie analizy oferty pracy");
  
  try {
    // Pobieranie klienta Supabase dla środowiska serwerowego
    const supabase = await createClient();
    
    // Sprawdzenie autoryzacji używając bezpieczniejszej metody getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log("❌ API: Brak autoryzacji - użytkownik niezalogowany");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log(`✅ API: Użytkownik zalogowany: ${user.id}`);

    // Pobranie danych z żądania
    const { jobOfferId, jobDescription } = await req.json();
    
    if (!jobOfferId || !jobDescription) {
      console.log("❌ API: Brak wymaganych pól:", { jobOfferId: !!jobOfferId, jobDescription: !!jobDescription });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    console.log(`✅ API: Pobrano dane oferty ID: ${jobOfferId}`);

    // Sprawdzenie czy oferta należy do użytkownika
    const { data: jobOffer, error: jobError } = await supabase
        .from("job_offers")
        .select("id, full_description")
        .eq("id", jobOfferId)
        .eq("user_id", user.id)
        .single();

    if (jobError || !jobOffer) {
      console.log("❌ API: Oferta nie znaleziona lub brak dostępu:", jobError);
      return NextResponse.json(
        { error: "Job offer not found or access denied" },
        { status: 403 }
      );
    }
    console.log(`✅ API: Oferta należy do użytkownika, długość opisu: ${jobOffer.full_description?.length || 0} znaków`);

    // Sprawdzenie czy analiza już istnieje
    const { data: existingAnalysis, error: analysisError } = await supabase
      .from("job_analysis_results")
      .select("*")
      .eq("job_offer_id", jobOfferId)
      .single();

    // Jeśli analiza istnieje, zwróć ją
    if (existingAnalysis) {
      console.log(`✅ API: Znaleziono istniejącą analizę dla oferty ID: ${jobOfferId}`);
      return NextResponse.json({ analysis: existingAnalysis });
    }
    
    if (analysisError && analysisError.code !== 'PGRST116') {
      console.log(`⚠️ API: Błąd podczas sprawdzania istniejącej analizy:`, analysisError);
    }

    console.log(`🔄 API: Rozpoczynam nową analizę oferty ID: ${jobOfferId}`);
    
    // Upewnij się, że mamy co analizować - użyj opisu z bazy danych, nie z requesta
    const descriptionToAnalyze = jobOffer.full_description || jobDescription;
    if (!descriptionToAnalyze || descriptionToAnalyze.trim().length < 20) {
      console.log(`❌ API: Opis oferty zbyt krótki lub pusty: ${descriptionToAnalyze?.length || 0} znaków`);
      return NextResponse.json(
        { error: "Job description is too short or empty" },
        { status: 400 }
      );
    }

    // Analiza oferty
    const { analysis, tokenStats } = await analyzeJobOffer(descriptionToAnalyze);
    console.log(`✅ API: Analiza zakończona, długość odpowiedzi: ${analysis?.length || 0} znaków`);
    
    // Parsowanie wyniku analizy
    const parsedAnalysis = parseAnalysisResult(analysis);
    console.log(`✅ API: Parsowanie zakończone, znalezione sekcje:`, 
      Object.entries(parsedAnalysis).map(([key, value]) => `${key}: ${value.length} elementów`));
    
    // Zapisanie wyniku analizy w bazie danych
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("job_analysis_results")
      .insert({
        job_offer_id: jobOfferId,
        skills: parsedAnalysis.skills,
        technologies: parsedAnalysis.technologies,
        experience: parsedAnalysis.experience,
        education: parsedAnalysis.education,
        languages: parsedAnalysis.languages,
        other_requirements: parsedAnalysis.other_requirements
      })
      .select()
      .single();

    if (saveError) {
      console.error("❌ API: Błąd zapisywania analizy:", saveError);
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }
    console.log(`✅ API: Analiza zapisana w bazie danych`);

    // Zwrócenie wyniku
    return NextResponse.json({
      analysis: savedAnalysis,
      rawAnalysis: analysis,
      tokenStats
    });
    
  } catch (error) {
    console.error("❌ API: Krytyczny błąd analizy oferty:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}