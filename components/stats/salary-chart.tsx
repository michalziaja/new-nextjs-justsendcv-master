"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { XAxis, YAxis, CartesianGrid, Tooltip, BarChart as RechartBarChart, Bar, Cell, ResponsiveContainer } from "recharts"

// Interfejsy dla danych
interface SalaryRange {
  range: string;
  count: number;
}

interface SalaryChartProps {
  salaryRanges: SalaryRange[];
  isLoading: boolean;
}

export function SalaryChartSection({ salaryRanges, isLoading }: SalaryChartProps) {
  // Stan dla aktywnego elementu na wykresie
  const [activeSalaryIndex, setActiveSalaryIndex] = useState<number | null>(null);

  // Obsługa zdarzeń dla wykresu wynagrodzeń
  const handleSalaryMouseEnter = (_: any, index: number) => {
    setActiveSalaryIndex(index);
  };

  const handleSalaryMouseLeave = () => {
    setActiveSalaryIndex(null);
  };

  // Niestandardowy komponent Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 p-2 border border-gray-200 dark:border-gray-800 rounded shadow-md text-sm">
          <p className="font-medium">{payload[0].name || label}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden h-[268px] bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardHeader className="flex flex-row items-center justify-between -mt-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-500" />
          <CardTitle className="text-md font-medium">Wynagrodzenia w ofertach</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-6 py-2">
            <Skeleton className="h-[230px] w-full" />
          </div>
        ) : salaryRanges.length > 0 ? (
          <div className="h-[230px] px-3 -mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <RechartBarChart
                data={salaryRanges}
                margin={{ top: 15, right: 15, left: 5, bottom: 15 }}
                layout="vertical"
                barSize={18}
              >
                <defs>
                  <linearGradient 
                    id="barGradient" 
                    x1="0" y1="0" 
                    x2="0" y2="1"
                  >
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient 
                    id="barGradientHover" 
                    x1="0" y1="0" 
                    x2="0" y2="1"
                  >
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false}
                  tickCount={5}
                  tickFormatter={(value) => value.toString()}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="range" 
                  width={75} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar 
                  dataKey="count" 
                  name="Liczba ofert" 
                  radius={[0, 4, 4, 0]}
                  fill="url(#barGradient)"
                  onMouseEnter={handleSalaryMouseEnter}
                  onMouseLeave={handleSalaryMouseLeave}
                >
                  {salaryRanges.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={activeSalaryIndex === index ? 'url(#barGradientHover)' : 'url(#barGradient)'} 
                    />
                  ))}
                </Bar>
              </RechartBarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[230px] px-6">
            <p className="text-muted-foreground">Brak danych o wynagrodzeniach</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 