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

  return (
    <Card className="overflow-hidden h-[268px] bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
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
          <div className="px-6 py-2">
            <Skeleton className="h-[230px] w-full" />
          </div>
        ) : (
          <>
            {/* Zawartość zakładki Portale */}
            {activeTab === "portals" && (
              portals.length > 0 ? (
                <div className="flex flex-row h-[230px]">
                  {/* Wykres po lewej stronie */}
                  <div className="w-full flex items-center justify-center -mt-5">
                    <div className="w-full h-full">
                      <PieChart 
                        data={portals.map((portal, i) => ({
                          ...portal,
                          name: portal.name
                        }))}
                        colors={portals.map(portal => portal.color)}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={-270}
                        tooltipFormatter={(value) => `${value} ofert`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[230px] px-6">
                  <p className="text-muted-foreground">Brak danych o portalach</p>
                </div>
              )
            )}

            {/* Zawartość zakładki Statusy */}
            {activeTab === "statuses" && (
              statuses.length > 0 ? (
                <div className="flex flex-row h-[230px]">
                  {/* Wykres po lewej stronie */}
                  <div className="w-full flex items-center justify-center -mt-5">
                    <div className="w-full h-full">
                      <PieChart 
                        data={statuses.map((status, i) => ({
                          ...status,
                          name: status.name
                        }))}
                        colors={statuses.map(status => status.color)}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={-270}
                        tooltipFormatter={(value) => `${value} ofert`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[230px] px-6">
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