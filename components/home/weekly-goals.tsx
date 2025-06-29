"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Settings, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

// Typ dla aplikacji z danego dnia
interface DayApplicationsCount {
  dayOfWeek: number; // 0 (poniedziałek) do 6 (niedziela)
  count: number;
}

export function WeeklyGoals() {
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [weeklyApplications, setWeeklyApplications] = useState<number>(0);
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [newGoalValue, setNewGoalValue] = useState<string>("");
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dayApplications, setDayApplications] = useState<DayApplicationsCount[]>([]);

  // Pobierz cel tygodniowy i aplikacje z bieżącego tygodnia
  useEffect(() => {
    const fetchGoalAndApplications = async () => {
      const supabase = createClient();
      setIsLoadingGoal(true);
      setIsLoadingApplications(true);

      try {
        // 1. Pobierz cel z profilu użytkownika
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setIsLoadingGoal(false);
          setIsLoadingApplications(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('goal')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Błąd podczas pobierania profilu:", profileError);
        } else {
          // Ustaw cel - null jeśli nie ma danych lub goal jest null
          setWeeklyGoal(profileData?.goal || null);
          // Ustaw również wartość w polu wejściowym dla nowego celu
          setNewGoalValue(profileData?.goal?.toString() || "");
        }

        // 2. Pobierz aplikacje z bieżącego tygodnia
        // Oblicz daty początku i końca bieżącego tygodnia (poniedziałek-niedziela)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = niedziela, 1 = poniedziałek, itd.
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Dostosuj do formatu poniedziałek = 0
        
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // Pobierz WYSŁANE oferty z bieżącego tygodnia (status = 'send')
        const { data: weekApplicationsData, error: applicationsError } = await supabase
          .from('job_offers')
          .select('id, created_at, status')
          .eq('user_id', user.id)
          .eq('status', 'send') // Pobierz tylko wysłane aplikacje
          .gte('created_at', monday.toISOString())
          .lte('created_at', sunday.toISOString());

        if (applicationsError) {
          console.error("Błąd podczas pobierania aplikacji:", applicationsError);
        } else {
          // Ustaw liczbę aplikacji w tym tygodniu
          setWeeklyApplications(weekApplicationsData?.length || 0);
          
          // Przygotuj licznik aplikacji dla każdego dnia tygodnia
          const dayCountsMap: {[key: number]: number} = {};
          for (let i = 0; i < 7; i++) {
            dayCountsMap[i] = 0;
          }
          
          // Zlicz aplikacje dla każdego dnia tygodnia
          weekApplicationsData?.forEach(app => {
            const appDate = new Date(app.created_at);
            const appDay = appDate.getDay(); // 0 = niedziela, 1 = poniedziałek, itd.
            const adjustedDay = appDay === 0 ? 6 : appDay - 1; // Dostosuj do formatu poniedziałek = 0
            dayCountsMap[adjustedDay] = (dayCountsMap[adjustedDay] || 0) + 1;
          });
          
          // Konwertuj mapę na tablicę obiektów
          const dayCounts: DayApplicationsCount[] = Object.entries(dayCountsMap).map(
            ([dayKey, count]) => ({
              dayOfWeek: parseInt(dayKey),
              count: count,
            })
          );
          
          setDayApplications(dayCounts);
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
      } finally {
        setIsLoadingGoal(false);
        setIsLoadingApplications(false);
      }
    };

    fetchGoalAndApplications();
  }, []);

  // Funkcja do zapisywania nowego celu
  const saveNewGoal = async () => {
    if (!newGoalValue.trim()) return;
    
    const goalNumber = parseInt(newGoalValue);
    if (isNaN(goalNumber) || goalNumber < 0) return;
    
    setIsSavingGoal(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Użytkownik nie jest zalogowany");
        setIsSavingGoal(false);
        return;
      }
      
      // Aktualizuj cel w profilu
      const { error } = await supabase
        .from('profiles')
        .update({ goal: goalNumber })
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Błąd podczas aktualizacji celu:", error);
      } else {
        // Aktualizuj stan lokalnie
        setWeeklyGoal(goalNumber);
        setPopoverOpen(false);
      }
    } catch (error) {
      console.error("Wystąpił błąd podczas zapisywania celu:", error);
    } finally {
      setIsSavingGoal(false);
    }
  };

  // Oblicz postęp jako procent
  const progress = weeklyGoal ? (weeklyApplications / weeklyGoal) * 100 : 0;
  
  // Oblicz średnią dzienną (tylko jeśli cel jest ustawiony)
  const currentDay = new Date().getDay();
  const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1; // Dostosuj do formatu poniedziałek = 0
  const activeDays = Math.max(1, adjustedCurrentDay + 1); // Dodaj 1, aby uwzględnić dzisiejszy dzień
  const dailyAverage = weeklyGoal ? (weeklyApplications / activeDays).toFixed(1) : '-';

  // Funkcja zwracająca kolor kołowego paska postępu w zależności od procentu
  const getProgressColor = (percent: number) => {
    if (percent <= 25) return '#ef4444'; // czerwony
    if (percent <= 60) return '#eab308'; // żółty
    return '#22c55e'; // zielony
  };

  // Komponent kołowego paska postępu
  const CircularProgress = ({ progress, size = 120, strokeWidth = 8 }: { 
    progress: number; 
    size?: number; 
    strokeWidth?: number; 
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const progressColor = getProgressColor(progress);

    return (
      <div className="relative flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Tło koła */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Postęp */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* Tekst w środku */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: progressColor }}>
            {Math.round(progress)}%
          </span>
          <span className="text-xs text-muted-foreground">
            {weeklyApplications}/{weeklyGoal}
          </span>
        </div>
      </div>
    );
  };

  // Pobierz liczbę aplikacji dla danego dnia
  const getApplicationsForDay = (dayIndex: number): number => {
    const dayData = dayApplications.find(d => d.dayOfWeek === dayIndex);
    return dayData ? dayData.count : 0;
  };

  return (
    <Card className="h-full rounded-sm border-1 border-gray-200 dark:border-gray-800
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
      dark:shadow-slate-900/20
      bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-[#00B2FF] stroke-2 transform transition-transform hover:scale-110" />
          <CardTitle className="flex items-center">Cel tygodniowy</CardTitle>
        </div>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-[#00B2FF] to-blue-600 dark:from-[#00B2FF] dark:to-blue-700 
                text-white border-0 hover:from-blue-500 hover:to-blue-700 
                transition-all duration-200 hover:scale-105 active:scale-95 gap-2 h-8 w-24"
            >
              <Settings className="h-4 w-4" />
              Ustaw
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 
            shadow-xl rounded-lg">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg leading-none">Cel tygodniowy</h4>
                <p className="text-sm text-muted-foreground">
                  Ustaw liczbę aplikacji, które chcesz wysłać w tym tygodniu.
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="goal" className="font-medium">Liczba aplikacji</Label>
                <Input
                  id="goal"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Np. 10"
                  value={newGoalValue}
                  onChange={(e) => setNewGoalValue(e.target.value)}
                  className="w-32 text-center font-medium"
                />
        </div>
        <Button 
                onClick={saveNewGoal} 
                disabled={isSavingGoal} 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                  text-white border-0 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isSavingGoal ? (
                  <span className="flex items-center">
                    <Save className="h-4 w-4 mr-2 animate-pulse" />
                    Zapisywanie...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Zapisz cel
                  </span>
                )}
        </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoadingGoal || isLoadingApplications ? (
          <div className="space-y-4">
            {/* Skeleton dla paska postępu */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* Skeleton dla statystyk */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600" />
                  Średnio dziennie
                </div>
                <Skeleton className="h-8 w-12 mt-1" />
              </div>
              <div>
                <p className="text-sm font-medium">Pozostało</p>
                <Skeleton className="h-8 w-12 mt-1" />
              </div>
            </div>
          </div>
        ) : !weeklyGoal ? (
          <div className="flex justify-center items-center h-40 text-muted-foreground flex-col">
            <p>Nie ustawiono celu tygodniowego</p>
            <p className="text-sm mt-2">Kliknij "Ustaw", aby zdefiniować swój cel</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 h-full">
            {/* Lewa strona - Kołowy pasek postępu */}
            <div className="col-span-2 flex items-center justify-center">
              <CircularProgress progress={progress} />
            </div>

            {/* Prawa strona - Statystyki i wskazówki */}
            <div className="col-span-3 flex flex-col justify-center space-y-4">
              {/* Statystyki */}
              <div className="grid grid-cols-2 gap-8 ml-2">
                <div>
                  <p className="-ml-5 text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600" />
                    Średnio dziennie
                  </p>
                  <p className="text-2xl font-bold">{dailyAverage}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Pozostało</p>
                  <p className="text-2xl font-bold">{Math.max(0, weeklyGoal - weeklyApplications)}</p>
                </div>
              </div>
              
              {/* Wskazówki motywacyjne */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-sm border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-[#00B2FF] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Pamiętaj o regularności!
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      Nawet kilka aplikacji wysłanych każdego dnia przybliża Cię do sukcesu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 