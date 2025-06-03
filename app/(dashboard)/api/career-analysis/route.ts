import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createModel, logTokenUsage } from "@/lib/gemini-client";

// Instrukcja systemowa dla analizy ścieżki kariery
const SYSTEM_INSTRUCTION = 
  "Jesteś doświadczonym doradcą kariery i ekspertem HR z głęboką wiedzą o rynku pracy (w tym rynku polskim i międzynarodowym). " +
  "Analizujesz profil zawodowy użytkownika w 4 krokach: " +
  "1. OBECNE STANOWISKO - określasz aktualne stanowisko i poziom na podstawie CV i doświadczenia " +
  "2. CEL KARIERY - na podstawie ofert do których się aplikuje określasz docelowe stanowisko " +
  "3. GAP ANALYSIS - porównujesz obecne umiejętności z wymaganiami docelowymi i identyfikujesz luki " +
  "4. PLAN UZUPEŁNIENIA - konkretny plan działań (kursy, certyfikaty, projekty, książki, LinkedIn) do osiągnięcia celu w krótkim czasie " +
  "5. DALSZY ROZWÓJ - 2 realistyczne ścieżki rozwoju WYŻEJ od docelowego stanowiska " +
  "Każdy element planu musi być szczegółowo opisany, wyceniony i oszacowany czasowo. " +
  "Skup się na praktycznych, wykonalnych działaniach które można udokumentować i wykorzystać w CV. " +
  "WAŻNE: Używaj ZAWSZE nazwy pola 'substeps' (nie 'sub_steps') dla działań w każdym kroku. " +
  "WAŻNE: Jeśli proponujesz certyfikat, ZAWSZE poprzedź go kursem przygotowującym w tej samej umiejętności. " +
  "PRZYKŁAD: Jeśli chcesz certyfikat AWS, najpierw dodaj kurs AWS, potem certyfikat AWS w tej samej umiejętności. " +
  "WAŻNE: Używaj poziomów umiejętności po polsku: 'początkujący', 'średniozaawansowany', 'zaawansowany', 'ekspert'. " +
  "Odpowiadaj WYŁĄCZNIE w postaci czystego, poprawnego JSON-a bez dodatkowych komentarzy, formatowania markdown ani tekstów spoza JSON.";

// Nowe interfejsy dla wstępnej analizy
interface PositionOption {
  id: string;
  title: string;
  description: string;
  match_score: number; // 1-100
  salary_range: string;
  difficulty: number; // 1-5
  timeline: string;
  key_requirements: string[];
  why_good_fit: string;
}

interface InitialAnalysis {
  current_position: {
    title: string;
    level: string; // junior, mid, senior, lead, manager
    industry: string;
    key_strengths: string[];
    years_of_experience: number;
  };
  target_analysis: {
    most_applied_positions: string[];
    target_industries: string[];
    salary_expectations: string;
    common_requirements: string[];
  };
  gap_analysis: {
    missing_skills_critical: string[];
    missing_skills_nice_to_have: string[];
    experience_gaps: string[];
    education_gaps: string[];
  };
  position_options: PositionOption[];
}

// Interfejsy dla szczegółowego planu
interface DetailedAction {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'certification' | 'networking' | 'practice' | 'book' | 'linkedin' | 'social';
  estimated_weeks: number;
  cost_range: string;
  priority: 'high' | 'medium' | 'low';
  measurable_outcome: string;
}

interface DetailedSkillGap {
  skill_name: string;
  current_level: string;
  required_level: string;
  gap_size: 'small' | 'medium' | 'large';
  actions: DetailedAction[];
}

interface DetailedPlan {
  target_position: string;
  estimated_timeline: string;
  success_probability: number;
  total_estimated_cost: string;
  preparation_phase: {
    title: string;
    duration_months: number;
    skill_gaps: DetailedSkillGap[];
  };
  application_phase: {
    title: string;
    duration_months: number;
    strategy: DetailedAction[];
  };
  future_development: {
    id: string;
    title: string;
    next_position: string;
    timeline_months: number;
    description: string;
  }[];
}

// Zaktualizowane interfejsy
interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'certification' | 'networking' | 'practice' | 'book' | 'linkedin' | 'social';
  estimated_weeks: number;
  cost_range: string;
  resources?: string[];
  priority: 'high' | 'medium' | 'low';
  measurable_outcome: string; // Co konkretnie osiągniemy
}

interface SkillGap {
  skill_name: string;
  current_level: string; // początkujący, średniozaawansowany, zaawansowany, ekspert
  required_level: string;
  gap_size: 'small' | 'medium' | 'large';
  actions: ActionItem[];
}

interface CareerStep {
  id: string;
  title: string;
  description?: string;
  goal?: string;
  timeframe?: string;
  skills_required?: string[];
  estimated_months?: number;
  substeps: ActionItem[];
}

interface NextStepPlan {
  target_position: string;
  target_company_type: string;
  estimated_timeline: string; // "3-6 miesięcy"
  skill_gaps: SkillGap[];
  total_estimated_cost: string;
  success_probability: number; // 1-10
  key_milestones: string[];
}

interface FutureCareerPath {
  title: string;
  description: string;
  prerequisite: string; // Co musi być spełnione żeby wejść w tę ścieżkę
  timeline: number; // miesięcy
  steps: CareerStep[];
  target_salary_range: string;
  difficulty: number; // 1-5
  market_demand: number; // 1-5
  career_branches: {
    id: string;
    title: string;
    description: string;
    next_position: string;
    timeline_months: number;
  }[];
}

interface CareerAnalysisResult {
  current_position: {
    title: string;
    level: string; // junior, mid, senior, lead, manager
    industry: string;
    key_strengths: string[];
    years_of_experience: number;
  };
  target_analysis: {
    most_applied_positions: string[];
    target_industries: string[];
    salary_expectations: string;
    common_requirements: string[];
  };
  gap_analysis: {
    missing_skills_critical: string[];
    missing_skills_nice_to_have: string[];
    experience_gaps: string[];
    education_gaps: string[];
  };
  next_step_plan: NextStepPlan;
  future_paths: {
    path1: FutureCareerPath;
    path2: FutureCareerPath;
  };
}

export async function POST(req: NextRequest) {
  console.log("🔍 API: Rozpoczęcie analizy ścieżki kariery - nowa struktura");
  
  try {
    const supabase = await createClient();
    
    // Pobranie parametrów z requesta
    const body = await req.json().catch(() => ({}));
    const { step = 'initial', selectedPosition } = body;
    
    console.log(`📋 API: Krok analizy: ${step}`, selectedPosition ? `Wybrana pozycja: ${selectedPosition}` : '');
    
    // Sprawdzenie autoryzacji użytkownika
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log("❌ API: Brak autoryzacji");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`✅ API: Użytkownik zalogowany: ${user.id}`);

    // Pobieranie najnowszego CV użytkownika z bazy danych
    const { data: latestCV, error: cvError } = await supabase
      .from("user_cvs")
      .select("cv_data, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cvError || !latestCV) {
      console.log("❌ API: Brak CV użytkownika:", cvError);
      return NextResponse.json(
        { error: "Nie znaleziono CV użytkownika" },
        { status: 404 }
      );
    }

    // Pobieranie ofert pracy z różnymi statusami dla analizy celów
    const { data: allOffers, error: offersError } = await supabase
      .from("job_offers")
      .select("id, title, company, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20); // Pobieramy więcej ofert dla lepszej analizy celów

    if (offersError) {
      console.log("❌ API: Błąd pobierania ofert:", offersError);
      return NextResponse.json(
        { error: "Błąd pobierania danych ofert" },
        { status: 500 }
      );
    }

    // Sprawdzenie czy użytkownik ma wystarczającą liczbę ofert (minimum 20)
    const offersCount = allOffers?.length || 0;
    if (step === 'initial' && offersCount < 20) {
      console.log(`❌ API: Niewystarczająca liczba ofert: ${offersCount}/20`);
      return NextResponse.json(
        { 
          error: `Potrzebujesz co najmniej 20 analizowanych ofert do przeprowadzenia analizy ścieżki kariery. Obecnie masz ${offersCount} ofert.`,
          offersCount: offersCount
        },
        { status: 400 }
      );
    }

    // Segregacja ofert według statusu
    const sentOffers = allOffers?.filter(offer => offer.status === 'send') || [];
    const interestedOffers = allOffers?.filter(offer => offer.status === 'interested') || [];
    const savedOffers = allOffers?.filter(offer => offer.status === 'saved') || [];

    // Pobieranie szczegółowych analiz ofert
    const allOfferIds = allOffers?.map(offer => offer.id) || [];
    
    console.log(`📊 API: Pobieram analizy dla ${allOfferIds.length} ofert`);

    const { data: jobAnalyses, error: analysisError } = await supabase
      .from("job_analysis_results")
      .select(`
        job_offer_id,
        skills,
        technologies,
        experience,
        education,
        languages,
        other_requirements
      `)
      .in("job_offer_id", allOfferIds);

    if (analysisError) {
      console.log("⚠️ API: Błąd pobierania analiz ofert:", analysisError);
    }

    // Łączenie danych ofert z analizami
    const enrichedOffers = allOffers?.map(offer => {
      const analysis = jobAnalyses?.find(a => a.job_offer_id === offer.id);
      return {
        ...offer,
        analysis
      };
    }) || [];

    console.log(`✅ API: Pobrano dane - CV: ${latestCV.name}, Wszystkie oferty: ${allOffers?.length || 0}, Wysłane: ${sentOffers.length}, Zainteresowane: ${interestedOffers.length}, Analizy: ${jobAnalyses?.length || 0}`);

    // Przygotowanie profilu użytkownika
    const cvData = latestCV.cv_data as any;
    const userProfile = {
      personalInfo: cvData.personalInfo || {},
      experience: cvData.experience || [],
      education: cvData.education || [],
      skills: cvData.skills || [],
      languages: cvData.languages || []
    };

    // Agregacja danych rynkowych z naciskiem na aplikowane oferty
    const aggregateMarketData = () => {
      const skillsCounter: Record<string, number> = {};
      const techCounter: Record<string, number> = {};
      const positionCounter: Record<string, number> = {};
      const experienceReqs: string[] = [];

      // Funkcja pomocnicza do filtrowania niepożądanych wartości
      const isValidValue = (value: string) => {
        const trimmedValue = value.trim().toLowerCase();
        return trimmedValue !== 'brak' && 
               trimmedValue !== 'brak informacji' && 
               trimmedValue !== 'n/a' &&
               trimmedValue !== '' &&
               trimmedValue.length > 1;
      };

      // Priorytet dla wysłanych aplikacji (waga x3), potem zainteresowane (waga x2), potem zapisane (waga x1)
      enrichedOffers.forEach(offer => {
        let weight = 1;
        if (offer.status === 'send') weight = 3;
        else if (offer.status === 'saved') weight = 2;

        // Zliczanie stanowisk z wagą
        positionCounter[offer.title] = (positionCounter[offer.title] || 0) + weight;

        if (offer.analysis) {
          // Zliczanie umiejętności z wagą
          offer.analysis.skills?.forEach((skill: string) => {
          if (isValidValue(skill)) {
              skillsCounter[skill] = (skillsCounter[skill] || 0) + weight;
          }
        });

          // Zliczanie technologii z wagą
          offer.analysis.technologies?.forEach((tech: string) => {
          if (isValidValue(tech)) {
              techCounter[tech] = (techCounter[tech] || 0) + weight;
          }
        });

          // Dodanie wymagań doświadczeniowych
          offer.analysis.experience?.forEach((exp: string) => {
          if (isValidValue(exp)) {
              for (let i = 0; i < weight; i++) {
                experienceReqs.push(exp);
              }
            }
          });
        }
      });

      return {
        target_positions: Object.entries(positionCounter)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([position, count]) => ({ position, frequency: count })),
        most_required_skills: Object.entries(skillsCounter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
          .map(([skill]) => skill),
        most_required_technologies: Object.entries(techCounter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
          .map(([tech]) => tech),
        experience_requirements: experienceReqs
      };
    };

    const marketData = aggregateMarketData();

    // Utworzenie modelu Gemini z nową instrukcją
    const model = createModel("gemini-2.5-flash-preview-05-20", SYSTEM_INSTRUCTION);

    // Wybór promptu w zależności od etapu
    let analysisPrompt = '';
    
    if (step === 'initial') {
      // ETAP 1: Wstępna analiza - wybór 2 pozycji
      analysisPrompt = `
PRZEPROWADŹ WSTĘPNĄ ANALIZĘ KARIERY I ZAPROPONUJ 2 POZYCJE DO WYBORU:

DANE UŻYTKOWNIKA:
${JSON.stringify(userProfile, null, 2)}

OFERTY PRACY - ANALIZA CELÓW:
Wysłane aplikacje (${sentOffers.length}): ${sentOffers.map(o => o.title).join(', ')}
Oferty zainteresowane (${interestedOffers.length}): ${interestedOffers.map(o => o.title).join(', ')}
Zapisane oferty (${savedOffers.length}): ${savedOffers.map(o => o.title).join(', ')}

NAJCZĘŚCIEJ APLIKOWANE STANOWISKA:
${marketData.target_positions.map(p => `${p.position} (${p.frequency} razy)`).join('\n')}

WYMAGANIA RYNKOWE:
Najczęściej wymagane umiejętności: ${marketData.most_required_skills.join(', ')}
Najczęściej wymagane technologie: ${marketData.most_required_technologies.join(', ')}

WYGENERUJ WSTĘPNĄ ANALIZĘ Z 2 POZYCJAMI DO WYBORU:

{
  "current_position": {
    "title": "Aktualny tytuł stanowiska na podstawie CV",
    "level": "junior/mid/senior/lead/manager",
    "industry": "Branża",
    "key_strengths": ["lista mocnych stron z CV"],
    "years_of_experience": liczba_lat
  },
  "target_analysis": {
    "most_applied_positions": ["najczęściej aplikowane stanowiska"],
    "target_industries": ["docelowe branże"],
    "salary_expectations": "oczekiwany zakres zarobków",
    "common_requirements": ["wspólne wymagania w ofertach"]
  },
  "gap_analysis": {
    "missing_skills_critical": ["umiejętności kluczowe których brakuje"],
    "missing_skills_nice_to_have": ["umiejętności dodatkowe"],
    "experience_gaps": ["braki w doświadczeniu"],
    "education_gaps": ["braki edukacyjne"]
  },
  "position_options": [
    {
      "id": "option1",
      "title": "Nazwa pierwszej pozycji",
      "description": "Dlaczego ta pozycja jest odpowiednia dla użytkownika",
      "match_score": 85,
      "salary_range": "6000-9000 PLN",
      "difficulty": 3,
      "timeline": "3-6 miesięcy",
      "key_requirements": ["główne wymagania do spełnienia"],
      "why_good_fit": "Uzasadnienie dlaczego to dobry wybór"
    },
    {
      "id": "option2", 
      "title": "Nazwa drugiej pozycji",
      "description": "Dlaczego ta pozycja jest odpowiednia dla użytkownika",
      "match_score": 78,
      "salary_range": "7000-11000 PLN", 
      "difficulty": 4,
      "timeline": "6-9 miesięcy",
      "key_requirements": ["główne wymagania do spełnienia"],
      "why_good_fit": "Uzasadnienie dlaczego to dobry wybór"
    }
  ]
}

ZASADY:
- Pierwsza pozycja powinna być bardziej realistyczna (wyższy match_score)
- Druga pozycja może być bardziej ambitna
- Obydwie muszą być logiczne na podstawie danych użytkownika
- Koniecznie uzasadnij każdy wybór

Zwróć TYLKO poprawny JSON bez dodatkowych tekstów.`;

    } else if (step === 'detailed' && selectedPosition) {
      // ETAP 2: Szczegółowy plan dla wybranej pozycji
      analysisPrompt = `
STWÓRZ SZCZEGÓŁOWY PLAN KARIERY DLA WYBRANEJ POZYCJI: "${selectedPosition}"

DANE UŻYTKOWNIKA:
${JSON.stringify(userProfile, null, 2)}

WYMAGANIA RYNKOWE:
Najczęściej wymagane umiejętności: ${marketData.most_required_skills.join(', ')}
Najczęściej wymagane technologie: ${marketData.most_required_technologies.join(', ')}

WYGENERUJ SZCZEGÓŁOWY PLAN W FORMACIE:

{
  "selected_position": "${selectedPosition}",
  "detailed_plan": {
    "target_position": "${selectedPosition}",
    "estimated_timeline": "6-9 miesięcy",
    "success_probability": 8,
    "total_estimated_cost": "2000-4000 PLN",
    "preparation_phase": {
      "title": "Przygotowanie do stanowiska ${selectedPosition}",
      "duration_months": 4,
      "skill_gaps": [
        {
          "skill_name": "Nazwa umiejętności",
          "current_level": "początkujący/średniozaawansowany/zaawansowany/ekspert",
          "required_level": "średniozaawansowany/zaawansowany/ekspert",
          "gap_size": "small/medium/large",
          "actions": [
            {
              "id": "action1",
              "title": "Konkretny kurs/certyfikat/projekt",
              "description": "Szczegółowy opis co i jak zrobić",
              "type": "course/certification/project/book/linkedin/social",
              "estimated_weeks": 4,
              "cost_range": "200-800 PLN",
              "priority": "high/medium/low",
              "measurable_outcome": "Co konkretnie osiągniemy"
            }
          ]
        }
      ]
    },
    "application_phase": {
      "title": "Zdobycie stanowiska ${selectedPosition}",
      "duration_months": 2,
      "strategy": [
        {
          "id": "strategy1",
          "title": "Strategia aplikacji",
          "description": "Jak i gdzie aplikować",
          "type": "networking",
          "estimated_weeks": 2,
          "cost_range": "0-300 PLN",
          "priority": "high",
          "measurable_outcome": "Zdobycie stanowiska"
        }
      ]
    },
    "future_development": [
      {
        "id": "path1",
        "title": "Opcja rozwoju 1",
        "next_position": "Wyższe stanowisko A",
        "timeline_months": 12,
        "description": "Opis pierwszej opcji rozwoju"
      },
      {
        "id": "path2", 
        "title": "Opcja rozwoju 2",
        "next_position": "Wyższe stanowisko B",
        "timeline_months": 15,
        "description": "Opis drugiej opcji rozwoju"
      }
    ]
  }
}

ZASADY:
- Koncentruj się na konkretnej wybranej pozycji
- Wszystkie działania muszą prowadzić do tego celu
- Plan musi być realistyczny i wykonalny
- Każde działanie z konkretnym rezultatem
- JEŚLI proponujesz certyfikat, ZAWSZE poprzedź go kursem tej samej umiejętności
- Używaj polskich poziomów umiejętności: początkujący, średniozaawansowany, zaawansowany, ekspert

Zwróć TYLKO poprawny JSON bez dodatkowych tekstów.`;

    } else {
      return NextResponse.json(
        { error: "Nieprawidłowy krok analizy lub brak wybranej pozycji" },
        { status: 400 }
      );
    }

    console.log(`🔄 API: Wysyłanie zapytania do Gemini - etap ${step}...`);
    const startTime = Date.now();
    
    let response;
    let analysisResult;
    let attempts = 0;
    const maxAttempts = 3;
    
    // Pętla retry z obsługą JSON
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 API: Próba ${attempts}/${maxAttempts} generowania analizy`);
      
      try {
        response = await model.generateContent(analysisPrompt);
        const result = response.response.text();
        
        if (!result || result.trim().length === 0) {
          throw new Error("Model zwrócił pustą odpowiedź");
        }

        // Parsowanie JSON z odpowiedzi
        let jsonText = result.trim();
        
        try {
          // Obsługa markdown z blokiem JSON
          const markdownJsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
          if (markdownJsonMatch) {
            jsonText = markdownJsonMatch[1].trim();
          } else {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonText = jsonMatch[0];
            } else {
              const firstBrace = result.indexOf('{');
              const lastBrace = result.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonText = result.substring(firstBrace, lastBrace + 1);
              } else {
                throw new Error("Nie znaleziono JSON w odpowiedzi");
              }
            }
          }
          
          analysisResult = JSON.parse(jsonText);
          
          // Walidacja struktury odpowiedzi w zależności od etapu
          if (step === 'initial') {
            if (!analysisResult.current_position || !analysisResult.target_analysis || 
                !analysisResult.gap_analysis || !analysisResult.position_options) {
              throw new Error("Niepoprawna struktura JSON dla etapu initial");
            }
          } else if (step === 'detailed') {
            if (!analysisResult.selected_position || !analysisResult.detailed_plan) {
              throw new Error("Niepoprawna struktura JSON dla etapu detailed");
            }
          }
          
          console.log(`✅ API: Walidacja struktury przeszła pomyślnie dla etapu ${step}`);
          break; // Sukces - wychodzimy z pętli
          
        } catch (parseError) {
          console.error(`❌ API: Błąd parsowania JSON w próbie ${attempts}:`, parseError);
          
          if (attempts === maxAttempts) {
            console.log("📝 API: Pełna odpowiedź modelu:", result.substring(0, 2000));
            console.log("📝 API: Wyekstrahowany JSON (pierwsze 2000 znaków):", jsonText.substring(0, 2000));
            throw new Error("Błąd parsowania odpowiedzi modelu po wszystkich próbach");
          }
          
          // Modyfikacja promptu dla kolejnej próby
          if (attempts === 1) {
            analysisPrompt += `\n\nUWAGA: Poprzednia odpowiedź miała błąd JSON. MUSISZ zwrócić POPRAWNY JSON bez błędów składni.`;
          } else if (attempts === 2) {
            analysisPrompt += `\n\nOSTATNIA SZANSA: Zwróć TYLKO poprawny JSON. Każdy string w cudzysłowach.`;
          }
        }
        
      } catch (error) {
        if (attempts === maxAttempts) {
          throw error;
        }
        console.log(`⚠️ API: Błąd w próbie ${attempts}, spróbuję ponownie...`);
      }
    }
    
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000;
    
    console.log(`✅ API: Otrzymano odpowiedź z Gemini (czas: ${elapsedTime}s) - etap ${step}`);
    
    // Sprawdzenie czy mamy response przed logowaniem tokenów
    if (!response) {
      throw new Error("Brak odpowiedzi z modelu po wszystkich próbach");
    }
    
    // Logowanie tokenów
    const tokenStats = logTokenUsage(response.response);

    console.log(`✅ API: Analiza ścieżki kariery zakończona pomyślnie - etap ${step}`);

    // Zwracanie różnych struktur w zależności od etapu
    if (step === 'initial') {
      return NextResponse.json({
        success: true,
        step: 'initial',
        analysis: analysisResult,
        tokenStats,
        userProfile: {
          cvName: latestCV.name,
          totalOffersCount: allOffers?.length || 0,
          sentOffersCount: sentOffers.length,
          interestedOffersCount: interestedOffers.length,
          savedOffersCount: savedOffers.length,
          analysedOffersCount: jobAnalyses?.length || 0
        },
        marketInsights: marketData
      });
    } else {
      // Etap detailed - zwracamy szczegółowy plan
      return NextResponse.json({
        success: true,
        step: 'detailed',
        selectedPosition,
        detailedPlan: analysisResult.detailed_plan,
        tokenStats
      });
    }

  } catch (error) {
    console.error("❌ API: Błąd analizy ścieżki kariery:", error);
    return NextResponse.json(
      { 
        error: "Wystąpił błąd podczas analizy ścieżki kariery",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 