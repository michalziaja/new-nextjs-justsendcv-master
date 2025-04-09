"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Settings, Save } from "lucide-react"
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

  // Funkcja zwracająca kolor paska postępu w zależności od procentu
  const getProgressColor = (percent: number) => {
    if (percent <= 25) return 'bg-red-500 dark:bg-red-400';
    if (percent <= 60) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-green-500 dark:bg-green-400';
  };

  // Pobierz liczbę aplikacji dla danego dnia
  const getApplicationsForDay = (dayIndex: number): number => {
    const dayData = dayApplications.find(d => d.dayOfWeek === dayIndex);
    return dayData ? dayData.count : 0;
  };

  return (
    <Card className="h-full rounded-md border-1 border-gray-200 dark:border-gray-800
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
      dark:shadow-slate-900/20
      bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          <CardTitle>Cel tygodniowy</CardTitle>
        </div>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 transition-all duration-200 hover:scale-105 active:scale-95">
              <Settings className="h-4 w-4" />
              Ustaw
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Cel tygodniowy</h4>
                <p className="text-sm text-muted-foreground">
                  Ustaw liczbę aplikacji, które chcesz wysłać w tym tygodniu.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal">Liczba aplikacji</Label>
                <Input
                  id="goal"
                  type="number"
                  min="0"
                  placeholder="Np. 10"
                  value={newGoalValue}
                  onChange={(e) => setNewGoalValue(e.target.value)}
                />
              </div>
              <Button 
                onClick={saveNewGoal} 
                disabled={isSavingGoal} 
                className="w-full"
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
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Średnio dziennie
                </div>
                <Skeleton className="h-8 w-12 mt-1" />
              </div>
              <div>
                <p className="text-sm font-medium">Pozostało</p>
                <Skeleton className="h-8 w-12 mt-1" />
              </div>
            </div>

            {/* Skeleton dla dni tygodnia */}
            <div className="grid grid-cols-7 gap-1 pt-2">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day, index) => (
                <div key={day} className="text-center">
                  <div className="text-xs text-muted-foreground">{day}</div>
                  <Skeleton className="h-1.5 mt-1 rounded-full mx-auto w-full" />
                  <Skeleton className="h-4 w-4 mt-1 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : !weeklyGoal ? (
          <div className="flex justify-center items-center h-40 text-muted-foreground flex-col">
            <p>Nie ustawiono celu tygodniowego</p>
            <p className="text-sm mt-2">Kliknij "Ustaw", aby zdefiniować swój cel</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pasek postępu */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{weeklyApplications} z {weeklyGoal} wysłanych aplikacji</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>

            {/* Statystyki */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Średnio dziennie
                </p>
                <p className="text-2xl font-bold">{dailyAverage}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Pozostało</p>
                <p className="text-2xl font-bold">{Math.max(0, weeklyGoal - weeklyApplications)}</p>
              </div>
            </div>

            {/* Dni tygodnia */}
            <div className="grid grid-cols-7 gap-1 pt-2">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day, index) => {
                const appCount = getApplicationsForDay(index);
                return (
                  <div key={day} className="text-center">
                    <div className="text-xs text-muted-foreground">{day}</div>
                    <div className={`h-1.5 mt-1 rounded-full ${
                      index <= adjustedCurrentDay 
                        ? 'bg-blue-500 dark:bg-blue-400' 
                        : 'bg-gray-200 dark:bg-gray-800'
                    }`} />
                    <div className="text-xs font-medium mt-1">
                      {index <= adjustedCurrentDay ? appCount : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 