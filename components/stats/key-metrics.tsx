"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Send, Clock, Percent, FileText, BookOpen, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useStats } from "@/components/stats/StatsContext"

export function KeyMetricsSection() {
  // Debugowanie - pokaż ile razy komponent jest renderowany
  const [renderCount, setRenderCount] = useState(0);
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []);
  
  // Pobieranie metryk z kontekstu statystyk
  const { metrics, metricsLoading } = useStats();
  
  // Dodajemy logi do debugowania
  useEffect(() => {
    console.log(`KeyMetricsSection (render #${renderCount}) - metricsLoading:`, metricsLoading);
    console.log(`KeyMetricsSection (render #${renderCount}) - metrics:`, metrics);
  }, [metrics, metricsLoading, renderCount]);

  // Zabezpieczamy się przed brakiem danych i dodajemy fallback values
  const safeMetrics = metrics || {
    sentPercentage: 0,
    responsePercentage: 0,
    responseTime: "Ładowanie...",
    responseRate: 0,
    averageSavedPerMonth: 0,
    customCVCount: 0,
    trainingCount: 0
  };

  return (
    <Card className="h-full overflow-hidden bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardHeader className="flex flex-row items-center justify-between -mt-2 pb-1">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-md font-medium">Kluczowe wskaźniki</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-full">
        {metricsLoading ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-2 p-2 -mt-4 mr-2 ml-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center p-1.5 rounded-md border bg-card text-card-foreground shadow-sm">
                <div className="mb-0.5">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-3 w-14 mb-0.5" />
                <Skeleton className="h-6 w-8 mb-0.5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-2 gap-y-2 p-2 -mt-4 mr-2 ml-2">
            {/* Procent wysłanych ofert */}
            <div className="flex flex-col items-center p-1.5 rounded-md border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
              <Send className="h-4 w-4 text-blue-500 mb-0.5" />
              <span className="text-xs font-medium text-center">Wysłane</span>
              <span className="text-lg font-bold text-blue-500">
                {metricsLoading ? "-" : `${safeMetrics.sentPercentage}%`}
              </span>
            </div>
            
            {/* Procent odpowiedzi na wysłane oferty (skuteczność) */}
            <div className="flex flex-col items-center p-1.5 rounded-md border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
              <Percent className="h-4 w-4 text-purple-500 mb-0.5" />
              <span className="text-xs font-medium text-center">Skuteczność</span>
              <span className="text-lg font-bold text-purple-500">
                {metricsLoading ? "-" : `${safeMetrics.responseRate}%`}
              </span>
            </div>
            
            {/* Liczba treningów */}
            <div className="flex flex-col items-center p-1.5 rounded-md border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
              <BookOpen className="h-4 w-4 text-green-500 mb-0.5" />
              <span className="text-xs font-medium text-center">Treningi</span>
              <span className="text-lg font-bold text-green-500">
                {metricsLoading ? "-" : safeMetrics.trainingCount}
              </span>
            </div>
            
            {/* Średni czas odpowiedzi */}
            <div className="flex flex-col items-center p-1.5 rounded-md border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
              <Clock className="h-4 w-4 text-orange-500 mb-0.5" />
              <span className="text-xs font-medium text-center">Czas odpowiedzi</span>
              <span className="text-lg font-bold text-orange-500">
                {metricsLoading ? "-" : safeMetrics.responseTime}
              </span>
            </div>
            
            {/* Średnia ilość zapisanych ofert miesięcznie */}
            <div className="flex flex-col items-center p-1.5 rounded-md border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
              <BarChart className="h-4 w-4 text-cyan-500 mb-0.5" />
              <span className="text-xs font-medium text-center">Oferty/mies.</span>
              <span className="text-lg font-bold text-cyan-500">
                {metricsLoading ? "-" : safeMetrics.averageSavedPerMonth}
              </span>
            </div>
            
            {/* Liczba specjalnych CV */}
            <div className="flex flex-col items-center p-1.5 rounded-md border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
              <FileText className="h-4 w-4 text-amber-500 mb-0.5" />
              <span className="text-xs font-medium text-center">Specjalne CV</span>
              <span className="text-lg font-bold text-amber-500">
                {metricsLoading ? "-" : safeMetrics.customCVCount}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 