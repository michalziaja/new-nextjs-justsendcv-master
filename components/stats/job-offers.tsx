"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Area, ComposedChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { addDays, format, parseISO, subDays } from "date-fns"
import { pl } from "date-fns/locale"

// Dane o trendzie czasowym
interface TimelineDataPoint {
  date: string;
  saved: number;
  sent: number;
}

interface JobOffersSectionProps {
  timelineData: TimelineDataPoint[];
  isLoading: boolean;
}

// Interfejs dla statystyk trendu
interface TrendStats {
  saved: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  sent: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
}

export function JobOffersSection({ timelineData, isLoading }: JobOffersSectionProps) {
  // Stan dla wybranego okresu wyświetlania danych
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 21>(14);
  // Stan dla przefiltrowanych danych
  const [filteredData, setFilteredData] = useState<TimelineDataPoint[]>(timelineData);
  // Stan dla statystyk trendu
  const [trendStats, setTrendStats] = useState<TrendStats>({
    saved: { current: 0, previous: 0, change: 0, changePercent: 0 },
    sent: { current: 0, previous: 0, change: 0, changePercent: 0 }
  });

  // Efekt filtrowania danych po zmianie okresu lub timelineData
  useEffect(() => {
    if (timelineData.length > 0) {
      // Aktualny czas
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Koniec dnia dzisiejszego
      
      // Data graniczna dla wybranego okresu
      const cutoffDate = subDays(today, selectedPeriod - 1); // -1 bo chcemy włączyć dzisiejszy dzień
      cutoffDate.setHours(0, 0, 0, 0); // Początek dnia granicznego
      
      // Formatowanie daty dla porównania
      const cutoffString = format(cutoffDate, 'yyyy-MM-dd');
      
      // Data graniczna dla poprzedniego okresu (dla porównania)
      const previousPeriodStartDate = subDays(cutoffDate, selectedPeriod);
      previousPeriodStartDate.setHours(0, 0, 0, 0); // Początek dnia
      
      const previousPeriodStartString = format(previousPeriodStartDate, 'yyyy-MM-dd');
      
      // Generujemy pełną listę dat dla wybranego okresu
      const allDates: string[] = [];
      for (let i = 0; i < selectedPeriod; i++) {
        const date = subDays(today, i);
        allDates.unshift(format(date, 'yyyy-MM-dd'));
      }
      
      // Tworzymy mapę istniejących danych
      const dataMap: Record<string, { saved: number; sent: number }> = {};
      timelineData.forEach(item => {
        dataMap[item.date] = { saved: item.saved, sent: item.sent };
      });
      
      // Tworzymy pełny zestaw danych z uzupełnionymi zerami dla brakujących dni
      const completeData = allDates.map(date => ({
        date,
        saved: (dataMap[date]?.saved || 0),
        sent: (dataMap[date]?.sent || 0)
      }));
      
      // Filtrowanie danych dla poprzedniego okresu (również z pełnym zestawem dat)
      const previousPeriodDates: string[] = [];
      for (let i = 0; i < selectedPeriod; i++) {
        const date = subDays(previousPeriodStartDate, -(i)); // Minus przed i, aby dodać dni
        previousPeriodDates.push(format(date, 'yyyy-MM-dd'));
      }
      
      const previousPeriodData = previousPeriodDates.map(date => ({
        date,
        saved: (dataMap[date]?.saved || 0),
        sent: (dataMap[date]?.sent || 0)
      }));
      
      setFilteredData(completeData);
      
      // Obliczanie sum dla obu okresów
      const currentSaved = completeData.reduce((sum, item) => sum + item.saved, 0);
      const currentSent = completeData.reduce((sum, item) => sum + item.sent, 0);
      const previousSaved = previousPeriodData.reduce((sum, item) => sum + item.saved, 0);
      const previousSent = previousPeriodData.reduce((sum, item) => sum + item.sent, 0);
      
      // Obliczanie zmian procentowych
      const savedChange = currentSaved - previousSaved;
      const sentChange = currentSent - previousSent;
      const savedChangePercent = previousSaved !== 0 ? Math.round((savedChange / previousSaved) * 100) : 0;
      const sentChangePercent = previousSent !== 0 ? Math.round((sentChange / previousSent) * 100) : 0;
      
      // Aktualizacja statystyk
      setTrendStats({
        saved: {
          current: currentSaved,
          previous: previousSaved,
          change: savedChange,
          changePercent: savedChangePercent
        },
        sent: {
          current: currentSent,
          previous: previousSent,
          change: sentChange,
          changePercent: sentChangePercent
        }
      });
      
    } else {
      setFilteredData([]);
      setTrendStats({
        saved: { current: 0, previous: 0, change: 0, changePercent: 0 },
        sent: { current: 0, previous: 0, change: 0, changePercent: 0 }
      });
    }
  }, [timelineData, selectedPeriod]);

  // Formatowanie daty dla wykresu
  const formatDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'd MMM', { locale: pl });
    } catch {
      return dateStr;
    }
  };
  
  // Funkcja określająca, czy pokazać etykietę daty
  const shouldShowTick = (index: number) => {
    if (selectedPeriod <= 14) {
      // Dla 7 i 14 dni pokazuj wszystkie etykiety
      return true;
    } else {
      // Dla 21 dni pokazuj co drugi dzień
      return index % 2 === 0;
    }
  };

  // Komponent wskaźnika trendu
  const TrendIndicator = ({ change }: { change: number }) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="overflow-hidden h-[268px] bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      {/* <CardHeader className="flex flex-row items-center justify-between py-0">
        <div className="flex items-center gap-2">
          <AreaChart className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-md font-medium">Trend dodawania ofert</CardTitle>
        </div>
      </CardHeader> */}
      <CardContent className="mt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px] w-full">
            <div className="w-[90%] h-[90%]">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="flex gap-4">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart
                  data={filteredData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 12 }}
                    interval={selectedPeriod > 14 ? 1 : 0}
                    tickMargin={5}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      const label = name === 'saved' ? 'Zapisane' : 'Wysłane';
                      return [`${value} ofert`, label];
                    }}
                    labelFormatter={(dateStr) => formatDateLabel(dateStr)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saved" 
                    name="saved"
                    stroke="#3b82f6" 
                    fillOpacity={1}
                    fill="url(#colorSaved)"
                    activeDot={{ r: 8 }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sent" 
                    name="sent"
                    stroke="#8b5cf6" 
                    fillOpacity={1}
                    fill="url(#colorSent)"
                    activeDot={{ r: 8 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[180px] flex flex-col gap-4 mt-1">
              {/* Przyciski wyboru okresu */}
              <div className="flex flex-col space-y-1">
                <Button 
                  variant={selectedPeriod === 7 ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedPeriod(7)}
                  className="text-xs h-6 w-[75%] mx-auto"
                >
                  7 dni
                </Button>
                <Button 
                  variant={selectedPeriod === 14 ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedPeriod(14)}
                  className="text-xs h-6 w-[75%] mx-auto"
                >
                  14 dni
                </Button>
                <Button 
                  variant={selectedPeriod === 21 ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedPeriod(21)}
                  className="text-xs h-6 w-[75%] mx-auto"
                >
                  21 dni
                </Button>
              </div>

              {/* Statystyki */}
              <div className="ml-12 -mt-1 flex flex-col gap-2 text-md w-[75%] mx-auto">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-500">Zapisane:</span>
                    <span>{trendStats.saved.current}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIndicator change={trendStats.saved.change} />
                    <span className={`${
                      trendStats.saved.change > 0 ? 'text-green-500' : 
                      trendStats.saved.change < 0 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {trendStats.saved.change > 0 ? '+' : ''}{trendStats.saved.change} ({trendStats.saved.changePercent}%)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-purple-500">Wysłane:</span>
                    <span>{trendStats.sent.current}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIndicator change={trendStats.sent.change} />
                    <span className={`${
                      trendStats.sent.change > 0 ? 'text-green-500' : 
                      trendStats.sent.change < 0 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {trendStats.sent.change > 0 ? '+' : ''}{trendStats.sent.change} ({trendStats.sent.changePercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Brak danych do wyświetlenia</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 