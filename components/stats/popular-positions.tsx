"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useStats } from "@/components/stats/StatsContext"

export function PopularPositions() {
  // Pobieranie danych z kontekstu statystyk
  const { positions, positionsLoading } = useStats();

  return (
    <Card className="h-full overflow-hidden bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardHeader className="flex flex-row items-center justify-between -mt-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-green-500" />
          <CardTitle className="text-md font-medium">Popularne stanowiska</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {positionsLoading ? (
          <div className="flex items-center justify-center h-[170px] w-full">
            <div className="w-[90%] h-[90%]">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        ) : positions.length > 0 ? (
          <div className="flex flex-wrap justify-center items-center p-2">
            {positions.map((position, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                style={{ 
                  backgroundColor: `${position.color}20`, 
                  borderColor: position.color,
                  fontSize: `${Math.min(9 + position.count * 2, (position.count >= 4 ? 17 : 15))}px`,
                  padding: '0.25rem 0.4rem',
                  margin: '0.25rem'
                }}
                className="text-foreground font-medium capitalize"
              >
                {position.title}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Brak danych o stanowiskach</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 