"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart } from "./recharts/pie-chart"

// Interfejsy danych
interface CombinedStatsProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  title: string;
  isLoading: boolean;
}

export function CombinedStatsSection({ data, title, isLoading }: CombinedStatsProps) {
  // Formatowanie liczb
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pl-PL').format(value);
  };

  return (
    <Card className="h-[268px] bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[180px] w-full">
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </div>
        ) : data.length > 0 ? (
          <div className="h-[200px] mt-2">
            <PieChart 
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={70}
              tooltipFormatter={(value) => formatNumber(value)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[180px] w-full">
            <p className="text-sm text-muted-foreground text-center">
              Brak danych do wyświetlenia
            </p>
          </div>
        )}

        {!isLoading && data.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {data.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color || '#4ade80' }}
                  />
                  <span className="text-xs">{item.name}</span>
                </div>
                <span className="text-xs font-medium">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 