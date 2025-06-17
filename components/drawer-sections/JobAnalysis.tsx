"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { JobOffer } from "../saved/ApplicationDetailsDrawer"
import { Loader2, AlertTriangle, LogIn, Search, Sparkles } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Typ dla etapów analizy
type AnalysisStage = 'idle' | 'sending' | 'analyzing' | 'preparing';

// Mapowanie etapów na tekst
const stageMessages: Record<AnalysisStage, string> = {
  idle: '',
  sending: 'Wysyłanie zapytania...', 
  analyzing: 'Analizowanie oferty...', 
  preparing: 'Przygotowywanie wyników...'
};

interface JobAnalysisResult {
  id: string
  job_offer_id: string
  skills: string[]
  technologies: string[]
  experience: string[]
  education: string[]
  languages: string[]
  other_requirements: string[]
  responsibilities: string[]
  analyzed_at: string
}

interface JobAnalysisProps {
  application: JobOffer
  isDesktop: boolean
  onKeywordsFound?: (keywords: Array<{ keyword: string, category: string }>) => void
}

export function JobAnalysis({ application, isDesktop, onKeywordsFound }: JobAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  // Dodajemy stan dla etapu analizy
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [isLoading, setIsLoading] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Sprawdzenie czy użytkownik jest zalogowany
  useEffect(() => {
    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("❌ JobAnalysis: Błąd autoryzacji:", error);
        // Nie ustawiamy tu isLoading na false, pozwalamy drugiemu useEffect działać
      } else {
        setAuthError(false); // Resetuj błąd autoryzacji jeśli user jest
      }
    }
    
    checkAuth();
  }, [supabase.auth]); // Zależność od supabase.auth

  // Sprawdzenie czy analiza istnieje przy ładowaniu komponentu
  useEffect(() => {
    // Czekaj na sprawdzenie autoryzacji zanim zaczniesz ładować analizę
    // To zapobiega próbie ładowania gdy użytkownik nie jest zalogowany
    async function checkExistingAnalysis() {
      // Sprawdź najpierw, czy jest użytkownik
      const { data: authData, error: authCheckError } = await supabase.auth.getUser();
      if (authCheckError || !authData.user) {
        setAuthError(true);
        setIsLoading(false); // Kończymy ładowanie, bo nie ma usera
        return;
      }

      if (!application?.id) {
        setIsLoading(false);
        return;
      }
      
      console.log("🔍 JobAnalysis: Sprawdzanie istniejącej analizy dla oferty ID:", application.id);
      
      try {
        // Resetuj błąd i wynik przed sprawdzeniem
        setErrorMessage(null);
        setAnalysisResult(null);
        
        const { data, error } = await supabase
          .from("job_analysis_results")
          .select("*")
          .eq("job_offer_id", application.id)
          .single();
        
        if (data && !error) {
          console.log("✅ JobAnalysis: Znaleziono istniejącą analizę");
          setAnalysisResult(data);
          
          if (onKeywordsFound) {
            const keywords = [
              ...(data.skills || []).map((k: string) => ({ keyword: k, category: 'skills' })),
              ...(data.technologies || []).map((k: string) => ({ keyword: k, category: 'technologies' })),
              ...(data.experience || []).map((k: string) => ({ keyword: k, category: 'experience' })),
            ];
            console.log(`✅ JobAnalysis: Przekazywanie ${keywords.length} słów kluczowych do komponentu nadrzędnego`);
            onKeywordsFound(keywords);
          }
        } else if (error && error.code !== 'PGRST116') {
          console.error("❌ JobAnalysis: Błąd pobierania analizy:", error);
          setErrorMessage("Problem z pobraniem analizy. Spróbuj odświeżyć stronę.");
        } else {
          console.log("ℹ️ JobAnalysis: Brak istniejącej analizy dla tej oferty");
        }
      } catch (err) {
        console.error("❌ JobAnalysis: Błąd podczas sprawdzania analizy:", err);
        setErrorMessage("Wystąpił problem z połączeniem z bazą danych.");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkExistingAnalysis();
  // Zależności: application.id, onKeywordsFound, supabase
  }, [application?.id, onKeywordsFound, supabase]);

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const handleAnalyzeJob = async () => {
    if (!application?.id || !application?.full_description) {
      setErrorMessage("Oferta nie zawiera opisu, który można przeanalizować.");
      return;
    }
    
    const { data: authData, error: authCheckError } = await supabase.auth.getUser();
    if (authCheckError || !authData.user) {
      setAuthError(true);
      setErrorMessage("Musisz być zalogowany, aby analizować oferty.");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisStage('sending'); // Ustawiamy etap: wysyłanie
    setErrorMessage(null);
    // Czyścimy poprzedni wynik na czas nowej analizy
    setAnalysisResult(null); 
    
    console.log("🔄 JobAnalysis: Rozpoczęcie analizy oferty ID:", application.id);
    console.log(`🔤 JobAnalysis: Długość opisu: ${application.full_description.length} znaków`);
    
    try {
      // Symulacja krótkiego opóźnienia dla etapu 'analyzing'
      await new Promise(resolve => setTimeout(resolve, 300)); 
      setAnalysisStage('analyzing'); // Ustawiamy etap: analiza

      const response = await fetch("/api/job-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jobOfferId: application.id,
          jobDescription: application.full_description
        })
      });
      
      if (response.status === 401) {
        setAuthError(true);
        throw new Error("Musisz być zalogowany, aby analizować oferty.");
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Nieznany błąd serwera" }));
        console.error("❌ JobAnalysis: Błąd HTTP:", response.status, errorData);
        throw new Error(errorData.error || `Błąd serwera: ${response.status}`);
      }
      
      setAnalysisStage('preparing'); // Ustawiamy etap: przygotowanie
      const data = await response.json();
      console.log("✅ JobAnalysis: Otrzymano odpowiedź z API, status:", response.status);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.analysis) {
        console.error("❌ JobAnalysis: Brak danych analizy w odpowiedzi");
        throw new Error("Otrzymano nieprawidłową odpowiedź z serwera");
      }
      
      // Krótkie opóźnienie przed pokazaniem wyników dla lepszego UX
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      setAnalysisResult(data.analysis);
      console.log("✅ JobAnalysis: Ustawiono wynik analizy w komponencie");
      
      if (onKeywordsFound && data.analysis) {
        const keywords = [
          ...(data.analysis.skills || []).map((k: string) => ({ keyword: k, category: 'skills' })),
          ...(data.analysis.technologies || []).map((k: string) => ({ keyword: k, category: 'technologies' })),
          ...(data.analysis.experience || []).map((k: string) => ({ keyword: k, category: 'experience' })),
        ];
        console.log(`✅ JobAnalysis: Przekazywanie ${keywords.length} słów kluczowych`);
        onKeywordsFound(keywords);
      }
      
      if (data.tokenStats) {
        console.log("🔢 JobAnalysis: Statystyki tokenów:");
        console.log(`  Tokeny IN (prompt): ${data.tokenStats.promptTokens}`);
        console.log(`  Tokeny OUT (completion): ${data.tokenStats.outputTokens}`);
        console.log(`  Tokeny Łącznie: ${data.tokenStats.totalTokens}`);
      }
      
    } catch (error) {
      console.error("❌ JobAnalysis: Błąd analizy:", error);
      setErrorMessage(error instanceof Error ? error.message : "Nie udało się przeanalizować oferty. Spróbuj ponownie później.");
      // Resetujemy wynik jeśli był błąd
      setAnalysisResult(null); 
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('idle'); // Resetujemy etap po zakończeniu
    }
  };

  const renderAnalysisSection = (title: string, items: string[]) => {
    if (!items || items.length === 0) return null;
    
    // Funkcja zwracająca kolor plakietki w zależności od tytułu sekcji
    const getBadgeColor = (sectionTitle: string) => {
      switch(sectionTitle) {
        case "OBOWIĄZKI I ZADANIA":
          return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
        case "UMIEJĘTNOŚCI":
          return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
        case "TECHNOLOGIE / NARZĘDZIA":
          return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
        case "DOŚWIADCZENIE":
          return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
        case "WYKSZTAŁCENIE / CERTYFIKATY":
          return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800";
        case "JĘZYKI OBCE":
          return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800";
        case "INNE WYMAGANIA":
          return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
      }
    };
    
    if (items.length === 1 && (items[0].toLowerCase().includes("brak informacji") || items[0].toLowerCase().includes("błąd analizy"))) {
      return (
        <div className="space-y-2 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${getBadgeColor(title)}`}>
            {title}
          </span>
          <p className="text-sm text-muted-foreground pl-3 italic">{items[0]}</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2 mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${getBadgeColor(title)}`}>
          {title}
        </span>
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-sm">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (isLoading) {
    return (
      // Kontener centrujący dla stanu ładowania
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authError && !isLoading) {
    return (
      // Kontener centrujący dla błędu autoryzacji
      <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription className="text-sm">
            Musisz być zalogowany, aby przeglądać i analizować oferty pracy.
          </AlertDescription>
        </Alert>
        <Button onClick={handleLoginRedirect} className="gap-2">
          <LogIn className="h-4 w-4" />
          Zaloguj się
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col"> {/* Użyj flex-col dla rozciągnięcia ScrollArea */}
      <ScrollArea className="p-0 flex-grow border-r-2 border-gray-300"> {/* flex-grow zajmie dostępną przestrzeń */}
        {/* Kontener dla zawartości ScrollArea, aby centrowanie działało poprawnie */} 
        <div className={`min-h-full flex flex-col ml-2 ${!analysisResult ? 'items-center justify-center' : ''}`}> 
          {/* Renderowanie stanu ładowania lub przycisku analizy */}
          {!analysisResult && (
            // Zmieniony główny kontener z lepszym designem
            <div className="flex flex-col items-center justify-center w-full px-6 min-h-full">
              {isAnalyzing ? (
                // Stan ładowania z nowoczesnym spinnerem
                <div className="flex flex-col items-center text-center w-full">
                  {/* Nowoczesny spinner jak w komponencie treningu */}
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4 mt-10"></div>
                  
                  {/* Tekst postępu */}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Analizuję ofertę pracy
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4"> 
                     {stageMessages[analysisStage]}
                  </p>

                  {/* Pasek postępu */}
                  <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: analysisStage === 'sending' ? '25%' : analysisStage === 'analyzing' ? '70%' : '95%' }}
                    ></div>
                  </div>

                  {/* Lista tego co AI analizuje */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 text-sm">AI analizuje:</h4>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 text-sm space-y-1">
                      <li>Wymagane umiejętności techniczne</li>
                      <li>Potrzebne doświadczenie zawodowe</li>
                      <li>Obowiązki i zadania na stanowisku</li>
                      <li>Wymagania językowe i certyfikaty</li>
                      <li>Dodatkowe kwalifikacje</li>
                    </ul>
                  </div>
                </div>
              ) : (
                // Stan spoczynku z lepszym designem
                <div className="flex flex-col items-center text-center w-full max-w-lg mt-10">
                  {/* Ikona i nagłówek */}
                  {/* <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full p-6 mb-6">
                    <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div> */}
                  
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Analiza AI
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Skorzystaj z zaawansowanej analizy AI, aby dokładnie poznać wymagania tej oferty pracy
                  </p>

                  {/* Błędy */}
                  {errorMessage && (
                    <Alert variant="destructive" className="mb-4 w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <AlertDescription className="text-sm">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!application?.full_description && (
                    <Alert className="mb-6 w-full bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      <AlertDescription className="text-sm">
                        Ta oferta nie zawiera pełnego opisu do analizy.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Korzyści z analizy */}
                  <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 w-full">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                      <Search className="h-4 w-4 mr-2 text-purple-600" />
                      Co otrzymasz z analizy:
                    </h3>
                    <ul className="list-disc list-inside text-left text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li>Szczegółową listę wymaganych umiejętności technicznych</li>
                      <li>Analizę potrzebnego doświadczenia zawodowego</li>
                      <li>Zestawienie obowiązków i zadań na stanowisku</li>
                      <li>Wymagania dotyczące wykształcenia i certyfikatów</li>
                      <li>Dodatkowe kwalifikacje i wymagania językowe</li>
                    </ul>
                  </div>

                  {/* Przycisk analizy */}
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleAnalyzeJob} 
                          disabled={!application?.full_description}
                          size="lg"
                          className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                                     text-white border-0 shadow-lg hover:shadow-xl
                                     transition-all duration-300 ease-in-out hover:scale-105 focus:scale-105 active:scale-95
                                     px-8 py-4 rounded-xl text-base font-semibold"
                        >
                          <Sparkles className="h-5 w-5 mr-2" />
                          Rozpocznij analizę AI
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Analizuj ofertę za pomocą sztucznej inteligencji</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Dodatkowe info */}
                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 w-full">
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      <span className="font-medium">💡 Wskazówka:</span> 
                      Wyniki analizy pomogą Ci stworzyć CV idealnie dopasowane do tej oferty oraz przygotować się do rozmowy rekrutacyjnej.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Renderowanie wyników analizy */}
          {analysisResult && (
            <div 
              className="p-2 w-full max-h-[calc(100vh-200px)] h-full overflow-y-auto grid md:grid-cols-2 gap-x-10"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Lewa kolumna: Obowiązki, Doświadczenie, Wykształcenie */} 
              <div className="h-full flex flex-col">
                {renderAnalysisSection("OBOWIĄZKI I ZADANIA", analysisResult.responsibilities)}
                {renderAnalysisSection("DOŚWIADCZENIE", analysisResult.experience)}
                {renderAnalysisSection("WYKSZTAŁCENIE / CERTYFIKATY", analysisResult.education)}
              </div>
              {/* Prawa kolumna: Umiejętności, Technologie, Języki, Inne */} 
              <div className="h-full flex flex-col">
                {renderAnalysisSection("UMIEJĘTNOŚCI", analysisResult.skills)}
                {renderAnalysisSection("TECHNOLOGIE / NARZĘDZIA", analysisResult.technologies)}
                {renderAnalysisSection("JĘZYKI OBCE", analysisResult.languages)}
                {renderAnalysisSection("INNE WYMAGANIA", analysisResult.other_requirements)}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}