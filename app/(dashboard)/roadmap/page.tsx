"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, ArrowLeft, Target, TrendingUp, BarChart3, CheckCircle, Book, FileText, Search, Users, Calculator, Star, Award, Zap, Crown, Info, AlertCircle, Lightbulb } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CareerRoadmapFlow } from "@/components/roadmap/CareerRoadmapFlow"
import Link from "next/link"

// Nowe interfejsy dla dwuetapowego procesu
interface PositionOption {
  id: string;
  title: string;
  description: string;
  match_score: number;
  salary_range: string;
  difficulty: number;
  timeline: string;
  key_requirements: string[];
  why_good_fit: string;
}

interface InitialAnalysis {
  current_position: {
    title: string;
    level: string;
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

interface InitialAnalysisResponse {
  success: boolean;
  step: 'initial';
  analysis: InitialAnalysis;
  tokenStats: any;
  userProfile: any;
  marketInsights: any;
}

interface DetailedAnalysisResponse {
  success: boolean;
  step: 'detailed';
  selectedPosition: string;
  detailedPlan: DetailedPlan;
  tokenStats: any;
}

// Interfejsy dla przebiegu analizy
interface AnalysisProgressStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

// Kroki analizy z opisami
const ANALYSIS_STEPS: Omit<AnalysisProgressStep, 'completed' | 'active'>[] = [
  {
    id: 'cv',
    title: 'Analiza CV',
    description: 'Analizuję Twoje doświadczenie, umiejętności i wykształcenie',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'offers',
    title: 'Przegląd aplikacji',
    description: 'Sprawdzam oferty do których aplikowałeś i ich wymagania',
    icon: <Search className="h-5 w-5" />
  },
  {
    id: 'market',
    title: 'Analiza rynku',
    description: 'Porównuję z aktualnymi trendami i wymaganiami rynkowymi',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    id: 'matching',
    title: 'Dopasowanie pozycji',
    description: 'Szukam najlepszych opcji rozwoju dostosowanych do Twojego profilu',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'calculation',
    title: 'Obliczanie planów',
    description: 'Tworzę szczegółowe plany rozwoju z kosztami i timelineami',
    icon: <Calculator className="h-5 w-5" />
  }
];

// Kroki analizy dla etapu 2 (detailed)
const DETAILED_ANALYSIS_STEPS: Omit<AnalysisProgressStep, 'completed' | 'active'>[] = [
  {
    id: 'position',
    title: 'Analiza wybranej pozycji',
    description: 'Szczegółowo analizuję wymagania i możliwości rozwoju dla wybranego stanowiska',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'gaps',
    title: 'Identyfikacja luk',
    description: 'Porównuję Twoje obecne umiejętności z wymaganiami docelowej pozycji',
    icon: <Search className="h-5 w-5" />
  },
  {
    id: 'actions',
    title: 'Planowanie działań',
    description: 'Tworzę konkretne działania: kursy, projekty, certyfikaty z kosztami i czasem',
    icon: <Calculator className="h-5 w-5" />
  },
  {
    id: 'timeline',
    title: 'Optymalizacja timelines',
    description: 'Układam optymalną kolejność działań i szacuję prawdopodobieństwo sukcesu',
    icon: <BarChart3 className="h-5 w-5" />
  }
];

type AnalysisStep = 'none' | 'initial' | 'position-selection' | 'detailed' | 'complete';

export default function RoadmapPage() {
  // Stany komponentu
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('none')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressStep[]>([])
  const [currentAnalysisStepIndex, setCurrentAnalysisStepIndex] = useState(0)
  const [initialAnalysis, setInitialAnalysis] = useState<InitialAnalysis | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<PositionOption | null>(null)
  const [detailedPlan, setDetailedPlan] = useState<DetailedPlan | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [missingCV, setMissingCV] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [marketInsights, setMarketInsights] = useState<any>(null)
  const [offersCount, setOffersCount] = useState<number>(0)
  const [hasMinimumOffers, setHasMinimumOffers] = useState<boolean>(true)

  // Pobranie liczby ofert na początku
  useEffect(() => {
    const fetchOffersCount = async () => {
      try {
        const response = await fetch('/api/job-offers/count');
        if (response.ok) {
          const data = await response.json();
          setOffersCount(data.count || 0);
          // Automatycznie ustaw hasMinimumOffers na podstawie liczby ofert
          setHasMinimumOffers(data.count >= 20);
        }
      } catch (error) {
        console.error('Błąd pobierania liczby ofert:', error);
      }
    };
    
    fetchOffersCount();
  }, [currentStep]); // Odśwież przy zmianie kroku

  // Funkcja symulująca progres analizy
  const simulateAnalysisProgress = (): Promise<void> => {
    return new Promise((resolve) => {
      // Inicjalizuj kroki analizy
      const steps: AnalysisProgressStep[] = ANALYSIS_STEPS.map((step, index) => ({
        ...step,
        completed: false,
        active: index === 0
      }));
      
      setAnalysisProgress(steps);
      setCurrentAnalysisStepIndex(0);
      
      let currentIndex = 0;
      
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prevSteps => {
          const newSteps = [...prevSteps];
          
          // Zakończ obecny krok
          if (newSteps[currentIndex]) {
            newSteps[currentIndex].completed = true;
            newSteps[currentIndex].active = false;
          }
          
          currentIndex++;
          
          // Aktywuj następny krok jeśli istnieje
          if (currentIndex < newSteps.length) {
            newSteps[currentIndex].active = true;
            setCurrentAnalysisStepIndex(currentIndex);
          } else {
            // Wszystkie kroki zakończone
            clearInterval(progressInterval);
            setTimeout(() => resolve(), 4000);
          }
          
          return newSteps;
        });
      }, 4000); // Każdy krok analizy trwa 2 sekundy - łącznie 5 kroków × 2s = 10s
    });
  };

  // Funkcja symulująca progres analizy szczegółowej (etap 2)
  const simulateDetailedAnalysisProgress = (): Promise<void> => {
    return new Promise((resolve) => {
      // Inicjalizuj kroki analizy szczegółowej
      const steps: AnalysisProgressStep[] = DETAILED_ANALYSIS_STEPS.map((step, index) => ({
        ...step,
        completed: false,
        active: index === 0
      }));
      
      setAnalysisProgress(steps);
      setCurrentAnalysisStepIndex(0);
      
      let currentIndex = 0;
      
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prevSteps => {
          const newSteps = [...prevSteps];
          
          // Zakończ obecny krok
          if (newSteps[currentIndex]) {
            newSteps[currentIndex].completed = true;
            newSteps[currentIndex].active = false;
          }
          
          currentIndex++;
          
          // Aktywuj następny krok jeśli istnieje
          if (currentIndex < newSteps.length) {
            newSteps[currentIndex].active = true;
            setCurrentAnalysisStepIndex(currentIndex);
          } else {
            // Wszystkie kroki zakończone
            clearInterval(progressInterval);
            setTimeout(() => resolve(), 2500);
          }
          
          return newSteps;
        });
      }, 4000); // Nieco dłuższe interwały dla etapu 2: 4 kroki × 1.8s + 1s = 8.2s
    });
  };

  // Funkcja wykonująca analizę ścieżki kariery
  const handleAnalyzeCareer = async () => {
    setIsAnalyzing(true)
    setErrorMessage(null)
    setMissingCV(false)
    setInitialAnalysis(null)
    setCurrentStep('initial')
    
    console.log("🔄 Rozpoczęcie wstępnej analizy ścieżki kariery")
    
    try {
      // Uruchomienie API call i symulacji progresów równolegle
      const [apiResult] = await Promise.all([
        // API call
        fetch("/api/career-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ step: 'initial' })
        }),
        // Symulacja progresów równolegle
        simulateAnalysisProgress()
      ]);
      
      // Sprawdzenie autoryzacji
      if (apiResult.status === 401) {
        throw new Error("Musisz być zalogowany, aby analizować ścieżkę kariery.")
      }
      
      if (apiResult.status === 404) {
        setMissingCV(true)
        setCurrentStep('none')
        return // Wyjdź wcześnie, nie rzucaj błędu
      }

      // Sprawdzenie czy błąd dotyczy niewystarczającej liczby ofert
      if (apiResult.status === 400) {
        const errorData = await apiResult.json().catch(() => ({ error: "Nieznany błąd serwera" }))
        if (errorData.error.includes("ofert")) {
          setHasMinimumOffers(false)
          setOffersCount(errorData.offersCount || 0)
          setCurrentStep('none')
          return
        }
        throw new Error(errorData.error || `Błąd serwera: ${apiResult.status}`)
      }
      
      if (!apiResult.ok) {
        const errorData = await apiResult.json().catch(() => ({ error: "Nieznany błąd serwera" }))
        throw new Error(errorData.error || `Błąd serwera: ${apiResult.status}`)
      }
      
      const data: InitialAnalysisResponse = await apiResult.json()
      
      // Sprawdzenie poprawności odpowiedzi
      if (!data.success || !data.analysis) {
        throw new Error("Otrzymano nieprawidłową odpowiedź z serwera")
      }
      
      setInitialAnalysis(data.analysis)
      setUserProfile(data.userProfile)
      setMarketInsights(data.marketInsights)
      setOffersCount(data.userProfile?.totalOffersCount || 0)
      setHasMinimumOffers(true)
      setCurrentStep('position-selection')
      
      console.log("✅ Wstępna analiza ścieżki kariery zakończona pomyślnie")
      
    } catch (error) {
      console.error("❌ Błąd analizy ścieżki kariery:", error)
      const errorMsg = error instanceof Error ? error.message : "Nie udało się przeanalizować ścieżki kariery. Spróbuj ponownie później."
      setErrorMessage(errorMsg)
      setCurrentStep('none')
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress([])
      setCurrentAnalysisStepIndex(0)
    }
  }

  // Funkcja generująca szczegółowy plan dla wybranej pozycji
  const handleGenerateDetailedPlan = async (position: PositionOption) => {
    setIsAnalyzing(true)
    setErrorMessage(null)
    setSelectedPosition(position)
    setCurrentStep('detailed')
    
    console.log(`🔄 Generowanie szczegółowego planu dla: ${position.title}`)
    
    try {
      // Uruchomienie API call i symulacji progresów równolegle
      const [apiResult] = await Promise.all([
        // API call
        fetch("/api/career-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            step: 'detailed', 
            selectedPosition: position.title 
          })
        }),
        // Symulacja progresów równolegle
        simulateDetailedAnalysisProgress()
      ]);
      
      if (!apiResult.ok) {
        const errorData = await apiResult.json().catch(() => ({ error: "Nieznany błąd serwera" }))
        throw new Error(errorData.error || `Błąd serwera: ${apiResult.status}`)
      }
      
      const data: DetailedAnalysisResponse = await apiResult.json()
      
      if (!data.success || !data.detailedPlan) {
        throw new Error("Otrzymano nieprawidłową odpowiedź z serwera")
      }
      
      setDetailedPlan(data.detailedPlan)
      setCurrentStep('complete')
      
      console.log("✅ Szczegółowy plan kariery wygenerowany pomyślnie")
      
    } catch (error) {
      console.error("❌ Błąd generowania szczegółowego planu:", error)
      const errorMsg = error instanceof Error ? error.message : "Nie udało się wygenerować szczegółowego planu. Spróbuj ponownie."
      setErrorMessage(errorMsg)
      setCurrentStep('position-selection')
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress([])
      setCurrentAnalysisStepIndex(0)
    }
  }

  // Funkcja wybierająca konkretną pozycję
  const handlePositionSelect = (position: PositionOption) => {
    handleGenerateDetailedPlan(position)
  }

  // Funkcja powrotu do początku
  const handleStartOver = () => {
    setCurrentStep('none')
    setInitialAnalysis(null)
    setSelectedPosition(null)
    setDetailedPlan(null)
    setErrorMessage(null)
    setMissingCV(false)
    setHasMinimumOffers(true)
    setOffersCount(0)
    setAnalysisProgress([])
    setCurrentAnalysisStepIndex(0)
  }

  // Funkcje pomocnicze dla stylistyki trudności
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600'
    if (difficulty <= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return 'Łatwa'
    if (difficulty <= 3) return 'Średnia'
    return 'Trudna'
  }

  // Funkcje pomocnicze dla poziomów umiejętności
  const getSkillLevelIcon = (level: string) => {
    const normalizedLevel = level.toLowerCase().trim();
    switch (normalizedLevel) {
      case 'początkujący':
      case 'beginner':
        return <Star className="h-4 w-4" />;
      case 'średniozaawansowany':
      case 'intermediate':
        return <Zap className="h-4 w-4" />;
      case 'zaawansowany':
      case 'advanced':
        return <Award className="h-4 w-4" />;
      case 'ekspert':
      case 'expert':
        return <Crown className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  }

  const getSkillLevelColor = (level: string) => {
    const normalizedLevel = level.toLowerCase().trim();
    switch (normalizedLevel) {
      case 'początkujący':
      case 'beginner':
        return 'text-blue-600 bg-blue-100';
      case 'średniozaawansowany':
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'zaawansowany':
      case 'advanced':
        return 'text-green-600 bg-green-100';
      case 'ekspert':
      case 'expert':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  const getSkillLevelText = (level: string) => {
    const normalizedLevel = level.toLowerCase().trim();
    switch (normalizedLevel) {
      case 'początkujący':
      case 'beginner':
        return 'Początkujący';
      case 'średniozaawansowany':
      case 'intermediate':
        return 'Średniozaawansowany';
      case 'zaawansowany':
      case 'advanced':
        return 'Zaawansowany';
      case 'ekspert':
      case 'expert':
        return 'Ekspert';
      default:
        return level;
    }
  }

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Book className="h-4 w-4" />;
      case 'certification':
        return <Award className="h-4 w-4" />;
      case 'project':
        return <Target className="h-4 w-4" />;
      case 'book':
        return <FileText className="h-4 w-4" />;
      case 'linkedin':
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'networking':
        return <Users className="h-4 w-4" />;
      case 'practice':
        return <Zap className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  }

  const getActionTypeText = (type: string) => {
    switch (type) {
      case 'course':
        return 'Kurs';
      case 'certification':
        return 'Certyfikat';
      case 'project':
        return 'Projekt';
      case 'book':
        return 'Książka';
      case 'linkedin':
        return 'LinkedIn';
      case 'social':
        return 'Social Media';
      case 'networking':
        return 'Networking';
      case 'practice':
        return 'Praktyka';
      default:
        return type;
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Przycisk powrotu gdy jesteśmy w widoku wyboru pozycji */}
      {currentStep === 'position-selection' && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleStartOver}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do przeglądu
          </Button>
        </div>
      )}

      {/* Nagłówek w karcie */}
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Analiza Ścieżki Kariery
          </CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Wygeneruj spersonalizowany plan rozwoju kariery na podstawie Twojego CV i analizowanych ofert pracy
          </CardDescription>
          
          {/* Przycisk analizy - widoczny gdy nie ma analizy w toku */}
          {!isAnalyzing && currentStep === 'none' && !missingCV && hasMinimumOffers && (
            <div className="pt-4">
              <Button 
                onClick={handleAnalyzeCareer}
                disabled={isAnalyzing}
                size="lg"
                className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white"
              >
                <Sparkles className="h-5 w-5" />
                Rozpocznij analizę kariery
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Analiza wykorzystuje dane z CV i analizowanych ofert pracy
              </p>
            </div>
          )}

          {/* Status gdy ma błędy */}
          {(missingCV || !hasMinimumOffers) && (
            <div className="pt-4">
              <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {missingCV && "Potrzebujesz CV w systemie"}
                  {!hasMinimumOffers && `Potrzebujesz minimum 20 ofert (masz: ${offersCount})`}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Status podczas analizy */}
          {isAnalyzing && (
            <div className="pt-4">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                <span className="text-sm font-medium">
                  {currentStep === 'detailed' 
                    ? `Tworzę szczegółowy plan dla: ${selectedPosition?.title}`
                    : 'Analizuję Twoją ścieżkę kariery...'
                  }
                </span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Karta z postępem analizy - pokazywana podczas analizy */}
      {isAnalyzing && analysisProgress && analysisProgress.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Przebieg analizy</CardTitle>
            <CardDescription>
              {currentStep === 'detailed'
                ? 'Przygotowuję konkretny plan działania z kosztami i timelineami'
                : 'Przygotowuję spersonalizowane opcje rozwoju na podstawie Twojego profilu'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisProgress.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="flex items-center gap-4">
                  {/* Ikona statusu */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : step.active 
                        ? 'bg-purple-100 border-purple-500 text-purple-700 animate-pulse' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : step.active ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      step.icon
                    )}
                  </div>

                  {/* Treść kroku */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium transition-colors duration-300 ${
                      step.completed 
                        ? 'text-green-700' 
                        : step.active 
                          ? 'text-purple-700' 
                          : 'text-gray-500'
                    }`}>
                      {step.title}
                      {step.completed && (
                        <span className="ml-2 text-green-600 text-sm">✓ Zakończono</span>
                      )}
                      {step.active && (
                        <span className="ml-2 text-purple-600 text-sm">● W trakcie...</span>
                      )}
                    </div>
                    <p className={`text-sm transition-colors duration-300 ${
                      step.completed || step.active ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Linia łącząca (oprócz ostatniego elementu) */}
                {index < analysisProgress.length - 1 && (
                  <div className={`ml-5 w-0.5 h-4 transition-colors duration-300 ${
                    step.completed ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}

            {/* Pasek postępu */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Postęp analizy</span>
                <span>{Math.round((analysisProgress.filter(s => s.completed).length / analysisProgress.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(analysisProgress.filter(s => s.completed).length / analysisProgress.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sekcja informacyjna - pokazywana gdy nie ma analizy */}
      {currentStep === 'none' && !missingCV && hasMinimumOffers && !isAnalyzing && (
        <div className="space-y-6">
          {/* Jak to działa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Jak działa analiza ścieżki kariery?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-purple-700">🔍 Etap 1: Wstępna Analiza</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Analizujemy Twoje CV (doświadczenie, umiejętności, wykształcenie)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Sprawdzamy oferty do których aplikowałeś i ich wymagania</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Porównujemy z aktualnymi trendami rynkowymi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Proponujemy 2 najlepsze opcje rozwoju dopasowane do Twojego profilu</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-purple-700">🎯 Etap 2: Szczegółowy Plan</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Szczegółowa analiza wybranego stanowiska</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Konkretne kursy, certyfikaty i projekty z kosztami</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Timeline z oszacowaniem czasu realizacji</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Strategia aplikacji i opcje dalszego rozwoju</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wymagania */}
          <div className="grid md:grid-cols-2 gap-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Wymagane CV w systemie</div>
                <div className="text-sm">
                  Musisz mieć utworzone i zapisane CV, aby analiza mogła ocenić Twoje obecne umiejętności i doświadczenie.
                </div>
                <Link href="/dashboard/creator" className="inline-block mt-2">
                  <Button size="sm" variant="outline">Stwórz CV teraz</Button>
                </Link>
              </AlertDescription>
            </Alert>

            <Alert>
              <Search className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Minimum 20 analizowanych ofert</div>
                <div className="text-sm">
                  Im więcej ofert przeanalizujesz, tym dokładniejsza będzie analiza Twoich celów kariery i wymagań rynkowych.
                </div>
                {offersCount > 0 && (
                  <div className="text-sm mt-1">
                    Obecnie masz: <strong>{offersCount} ofert</strong>
                    {offersCount < 20 && (
                      <span className="text-amber-600 ml-1">
                        (potrzebujesz jeszcze {20 - offersCount})
                      </span>
                    )}
                    {offersCount >= 20 && (
                      <span className="text-green-600 ml-1">✓ Wystarczająco</span>
                    )}
                  </div>
                )}
                <Link href="/dashboard/analyzer" className="inline-block mt-2">
                  <Button size="sm" variant="outline">Analizuj oferty</Button>
                </Link>
              </AlertDescription>
            </Alert>
          </div>

          {/* Wskazówki */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Info className="h-5 w-5" />
                Wskazówki dla najlepszych rezultatów
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📋 CV</h4>
                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Aktualne doświadczenie zawodowe</li>
                    <li>• Szczegółowe umiejętności techniczne</li>
                    <li>• Ukończone kursy i certyfikaty</li>
                    <li>• Projekty i osiągnięcia</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🔍 Oferty</h4>
                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Różnorodne stanowiska</li>
                    <li>• Różne poziomy zaawansowania</li>
                    <li>• Oferty z Twoich celowych branż</li>
                    <li>• Zarówno wysłane jak i zapisane</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">⚡ Rezultat</h4>
                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Spersonalizowane ścieżki rozwoju</li>
                    <li>• Konkretne kursy z cenami</li>
                    <li>• Realistyczne timelines</li>
                    <li>• Mierzalne cele do osiągnięcia</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stan braku wystarczającej liczby ofert */}
      {!hasMinimumOffers && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Za mało analizowanych ofert
            </CardTitle>
            <CardDescription>
              Do przeprowadzenia dokładnej analizy ścieżki kariery potrzebujesz co najmniej <strong>20 analizowanych ofert pracy</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground">
                Obecnie masz: <strong className="text-lg text-foreground">{offersCount} ofert</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Potrzebujesz jeszcze <strong>{Math.max(0, 20 - offersCount)} ofert</strong> do przeprowadzenia analizy
              </p>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Dlaczego potrzebuję 20 ofert?</div>
                <ul className="text-sm text-left mt-2 space-y-1">
                  <li>• Lepsze rozpoznanie Twoich celów kariery</li>
                  <li>• Analiza trendów rynkowych w Twoich branżach</li>
                  <li>• Dokładniejsze dopasowanie wymagań</li>
                  <li>• Bardziej precyzyjne rekomendacje</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/analyzer">
                <Button className="gap-2">
                  <Search className="h-4 w-4" />
                  Analizuj więcej ofert
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={handleAnalyzeCareer}
                disabled={isAnalyzing}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Sprawdź ponownie
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stan braku CV */}
      {missingCV && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Brak CV w systemie
            </CardTitle>
            <CardDescription>
              Aby móc wygenerować spersonalizowane ścieżki kariery, najpierw musisz stworzyć i zapisać swoje CV w systemie.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                Analiza ścieżki kariery wymaga informacji o Twoim doświadczeniu, umiejętnościach i wykształceniu z CV.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/creator">
                <Button className="gap-2">
                  <Target className="h-4 w-4" />
                  Stwórz CV
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={handleAnalyzeCareer}
                disabled={isAnalyzing}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Spróbuj ponownie
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Po utworzeniu CV będziesz mógł generować szczegółowe ścieżki rozwoju kariery
            </p>
          </CardContent>
        </Card>
      )}

      {/* Wyniki analizy */}
      {currentStep === 'position-selection' && initialAnalysis && (
        <div className="space-y-6">
          {/* Nagłówek z informacją o etapie */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Wybierz pozycję do rozwinięcia</h2>
            <p className="text-muted-foreground">
              Na podstawie analizy Twojego CV i aplikacji znaleźliśmy 2 najlepsze opcje rozwoju
            </p>
          </div>

          {/* Wyświetlanie obecnej pozycji */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Target className="h-5 w-5" />
                Twoja obecna pozycja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">{initialAnalysis.current_position.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {initialAnalysis.current_position.level} • {initialAnalysis.current_position.industry}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {initialAnalysis.current_position.years_of_experience} lat doświadczenia
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Twoje mocne strony:</p>
                  <div className="flex flex-wrap gap-1">
                    {initialAnalysis.current_position.key_strengths?.slice(0, 4).map((strength, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opcje pozycji */}
          <div className="grid md:grid-cols-2 gap-6">
            {initialAnalysis.position_options?.map((position) => (
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow relative" 
                key={position.id} 
                onClick={() => handlePositionSelect(position)}
              >
                {isAnalyzing && selectedPosition?.id === position.id && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center rounded-lg z-10">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      <p className="text-sm font-medium">Generuję plan...</p>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{position.title}</CardTitle>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-medium">
                      {position.match_score}% dopasowanie
                    </span>
                  </div>
                  <CardDescription>{position.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Czas do osiągnięcia:</span>
                      <span className="font-medium">{position.timeline}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Trudność:</span>
                      <span className={`font-medium ${getDifficultyColor(position.difficulty)}`}>
                        {getDifficultyText(position.difficulty)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Przewidywane zarobki:</span>
                      <span className="font-medium text-green-600">{position.salary_range}</span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="font-medium text-sm mb-2">Główne wymagania:</p>
                      <div className="space-y-1">
                        {position.key_requirements?.slice(0, 3).map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="font-medium text-sm mb-1">Dlaczego to dobry wybór:</p>
                      <p className="text-xs text-muted-foreground">{position.why_good_fit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Szczegółowy plan kariery */}
      {currentStep === 'complete' && detailedPlan && selectedPosition && (
        <div className="space-y-6">
          {/* Podsumowanie planu z nagłówkiem */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardHeader>
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-2xl font-bold">Plan kariery: {selectedPosition.title}</h2>
                <p className="text-muted-foreground">
                  Szczegółowy plan działania z konkretnymi krokami i timelineami
                </p>
              </div>
              {/* <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Podsumowanie planu
              </CardTitle> */}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{detailedPlan.estimated_timeline || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Czas realizacji</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{detailedPlan.success_probability || 0}/10</p>
                  <p className="text-sm text-muted-foreground">Prawdopodobieństwo sukcesu</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{detailedPlan.total_estimated_cost || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Szacowany koszt</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{detailedPlan.future_development?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Opcje dalszego rozwoju</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faza przygotowawcza */}
          {detailedPlan.preparation_phase ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-blue-500" />
                  {detailedPlan.preparation_phase.title || 'Faza przygotowawcza'}
                </CardTitle>
                <CardDescription>
                  Czas trwania: {detailedPlan.preparation_phase.duration_months || 0} miesięcy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedPlan.preparation_phase?.skill_gaps?.length > 0 ? (
                    detailedPlan.preparation_phase.skill_gaps.map((gap, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">{gap.skill_name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(gap.current_level)}`}>
                              {getSkillLevelIcon(gap.current_level)}
                              {getSkillLevelText(gap.current_level)}
                            </span>
                            <span className="text-xs text-muted-foreground">→</span>
                            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(gap.required_level)}`}>
                              {getSkillLevelIcon(gap.required_level)}
                              {getSkillLevelText(gap.required_level)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {gap.actions?.length > 0 ? (
                            gap.actions.map((action, actionIndex) => (
                              <div key={actionIndex} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className={`flex items-center gap-1 min-w-24 text-center px-2 py-1 rounded text-xs font-medium ${
                                  action.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {getActionTypeIcon(action.type)}
                                  {getActionTypeText(action.type)}
                                </span>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{action.title}</p>
                                  <p className="text-xs text-muted-foreground">{action.description || 'Brak opisu dostępnego'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-green-600">{action.cost_range}</p>
                                  <p className="text-xs text-muted-foreground">{action.estimated_weeks} tyg.</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Brak dostępnych działań dla tej umiejętności</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Brak danych o lukach umiejętności do wyświetlenia</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Faza aplikacji */}
          {detailedPlan.application_phase ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  {detailedPlan.application_phase.title || 'Faza aplikacji'}
                </CardTitle>
                <CardDescription>
                  Czas trwania: {detailedPlan.application_phase.duration_months || 0} miesięcy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedPlan.application_phase?.strategy?.length > 0 ? (
                    detailedPlan.application_phase.strategy.map((strategy, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <span className={`flex items-center gap-1 min-w-24 text-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium`}>
                          {getActionTypeIcon(strategy.type)}
                          {getActionTypeText(strategy.type)}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{strategy.title}</p>
                          <p className="text-sm text-muted-foreground">{strategy.description || 'Brak opisu dostępnego'}</p>
                          <p className="text-sm font-medium text-purple-600 mt-1">{strategy.measurable_outcome}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">{strategy.cost_range}</p>
                          <p className="text-xs text-muted-foreground">{strategy.estimated_weeks} tyg.</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Brak strategii aplikacji do wyświetlenia</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Przyszły rozwój */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Dalszy rozwój kariery
              </CardTitle>
              <CardDescription>
                Opcje rozwoju po osiągnięciu pozycji {selectedPosition.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {detailedPlan.future_development?.length > 0 ? (
                  detailedPlan.future_development.map((option, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{option.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{option.description || 'Brak opisu dostępnego'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-600">{option.next_position}</span>
                        <span className="text-xs text-muted-foreground">{option.timeline_months} miesięcy</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 col-span-2">
                    <p className="text-muted-foreground">Brak opcji dalszego rozwoju do wyświetlenia</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Przycisk nowej analizy */}
      {(currentStep === 'position-selection' || currentStep === 'complete') && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={handleStartOver}
            variant="outline"
            disabled={isAnalyzing}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Rozpocznij nową analizę
          </Button>
        </div>
      )}

      {/* Wyświetlanie błędów */}
      {errorMessage && currentStep === 'none' && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="flex justify-center mt-4">
              <Button 
                onClick={handleAnalyzeCareer}
                disabled={isAnalyzing}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Spróbuj ponownie
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
