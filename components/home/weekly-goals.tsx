"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WeeklyGoals() {
  // Przykładowe dane - w przyszłości do podłączenia z backendem
  const weeklyGoal = 10
  const currentApplications = 7
  const progress = (currentApplications / weeklyGoal) * 100

  // Funkcja zwracająca kolor paska postępu w zależności od procentu
  const getProgressColor = (percent: number) => {
    if (percent <= 25) return 'bg-red-500 dark:bg-red-400'
    if (percent <= 60) return 'bg-yellow-500 dark:bg-yellow-400'
    if (percent >= 61) return 'bg-green-500 dark:bg-green-400'
    return 'bg-green-500 dark:bg-green-400'
  }

  // Pobierz aktualny dzień tygodnia (0 = niedziela, 1 = poniedziałek, itd.)
  const currentDay = new Date().getDay()
  // Przekształć na format gdzie poniedziałek = 0
  const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1

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
        <Button 
          variant="link" 
          size="icon" 
          className="h-8 w-8 transition-transform duration-200 hover:scale-155 active:scale-90">
          <Settings />
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          
          {/* Pasek postępu */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{currentApplications} z {weeklyGoal} aplikacji</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Statystyki */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Średnio
              </p>
              <p className="text-2xl font-bold">1.2</p>
         
            </div>
            <div>
              <p className="text-sm font-medium">Pozostało</p>
              <p className="text-2xl font-bold">{weeklyGoal - currentApplications}</p>
           
            </div>
          </div>

          {/* Dni tygodnia */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground">{day}</div>
                <div className={`h-1.5 mt-1 rounded-full ${
                  index <= adjustedCurrentDay 
                    ? 'bg-blue-500 dark:bg-blue-400' 
                    : 'bg-gray-200 dark:bg-gray-800'
                }`} />
                <div className="text-xs font-medium mt-1">
                  {index <= adjustedCurrentDay ? '1' : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 