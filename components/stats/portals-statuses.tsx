"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PieChart as PieChartIcon, CheckCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart } from "./recharts/pie-chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Interfejsy dla danych
interface PortalData {
  name: string;
  value: number;
  color: string;
  gradientColor: string;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
  gradientColor: string;
}

interface PortalsStatusesProps {
  portals: PortalData[];
  statuses: StatusData[];
  isLoading: boolean;
}

export function PortalsStatusesSection({ portals, statuses, isLoading }: PortalsStatusesProps) {
  // Stan dla aktywnej zakładki
  const [activeTab, setActiveTab] = useState<"portals" | "statuses">("portals");
  
  // Oddzielne stany dla śledzenia aktywnych elementów w każdym wykresie
  const [activePortalIndex, setActivePortalIndex] = useState<number | null>(null);
  const [activeStatusIndex, setActiveStatusIndex] = useState<number | null>(null);

  // Obsługa zdarzeń dla wykresu portali
  const handlePortalMouseEnter = (data: any, index: number) => {
    setActivePortalIndex(index);
  };

  const handlePortalMouseLeave = () => {
    setActivePortalIndex(null);
  };

  // Obsługa zdarzeń dla wykresu statusów
  const handleStatusMouseEnter = (data: any, index: number) => {
    setActiveStatusIndex(index);
  };

  const handleStatusMouseLeave = () => {
    setActiveStatusIndex(null);
  };

  // Niestandardowy komponent formatujący dane dla tooltipa
  const formatValue = (value: number) => {
    return value.toString();
  };

  // Komponent legendy dla wykresów
  const ChartLegend = ({ items }: { items: (PortalData | StatusData)[] }) => {
    // Sortujemy dane według wartości (od największej)
    const sortedItems = [...items].sort((a, b) => b.value - a.value);
    
    // Suma wszystkich wartości dla obliczenia procentów
    const total = sortedItems.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="flex flex-col px-2 h-full justify-center overflow-y-auto">
        {sortedItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-1 mb-1 text-xs transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 p-0.5 rounded"
            onMouseEnter={() => activeTab === "portals" ? handlePortalMouseEnter(item, index) : handleStatusMouseEnter(item, index)}
            onMouseLeave={() => activeTab === "portals" ? handlePortalMouseLeave() : handleStatusMouseLeave()}
          >
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium truncate max-w-[80px]" title={item.name}>
              {item.name}
            </span>
            <span className="ml-auto font-semibold">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="h-full overflow-hidden bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardHeader className="flex flex-row items-center justify-between -mt-4 px-2">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "portals" | "statuses")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portals" className="text-xs">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-purple-500" />
                <span>Portale z ofertami</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="statuses" className="text-xs">
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-blue-500" />
                <span>Statusy ofert</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[170px] w-full">
            <div className="w-[90%] h-[90%]">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Zawartość zakładki Portale */}
            {activeTab === "portals" && (
              portals.length > 0 ? (
                <div className="flex flex-row h-[170px]">
                  {/* Wykres po lewej stronie */}
                  <div className="w-[60%] flex items-center justify-center -mt-1">
                    <div className="w-full h-full">
                      <PieChart 
                        data={portals.map((portal, i) => ({
                          ...portal,
                          name: portal.name
                        }))}
                        colors={portals.map(portal => portal.color)}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={-270}
                        tooltipFormatter={(value) => `${value} ofert`}
                      />
                    </div>
                  </div>
                  
                  {/* Legenda po prawej stronie */}
                  <div className="w-[40%] flex items-center">
                    <ChartLegend items={portals} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[170px] px-6">
                  <p className="text-muted-foreground">Brak danych o portalach</p>
                </div>
              )
            )}

            {/* Zawartość zakładki Statusy */}
            {activeTab === "statuses" && (
              statuses.length > 0 ? (
                <div className="flex flex-row h-[170px]">
                  {/* Wykres po lewej stronie */}
                  <div className="w-[60%] flex items-center justify-center -mt-1">
                    <div className="w-full h-full">
                      <PieChart 
                        data={statuses.map((status, i) => ({
                          ...status,
                          name: status.name
                        }))}
                        colors={statuses.map(status => status.color)}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={-270}
                        tooltipFormatter={(value) => `${value} ofert`}
                      />
                    </div>
                  </div>
                  
                  {/* Legenda po prawej stronie */}
                  <div className="w-[40%] mb-6 flex items-center">
                    <ChartLegend items={statuses} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[170px] px-6">
                  <p className="text-muted-foreground">Brak danych o statusach</p>
                </div>
              )
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 