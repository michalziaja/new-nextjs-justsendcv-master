"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Wrench } from "lucide-react"

// Struktura danych dla technologii
interface SkillItem {
  name: string;
  count: number;
  color: string;
  gradientColor: string;
}

export function TechnologiesCard({ technologies, isLoading }: { technologies: SkillItem[], isLoading: boolean }) {
  return (
    <Card className="overflow-hidden h-[250px] bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardHeader className="flex flex-row items-center justify-between -mt-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-md font-medium">Popularne technologie i narzędzia</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[170px] w-full">
            <div className="w-[90%] h-[90%]">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        ) : technologies.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {technologies.map((tech, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                style={{ 
                  backgroundColor: `${tech.color}20`, 
                  borderColor: tech.color,
                  fontSize: `${Math.min(9 + tech.count * 2, (tech.count >= 4 ? 17 : 15))}px`,
                  padding: '0.25rem 0.4rem'
                }}
                className="text-foreground font-medium"
              >
                {tech.name} ({tech.count})
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Brak danych o wymaganych technologiach</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 