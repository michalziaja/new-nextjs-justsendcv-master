"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Brain } from "lucide-react"

// Struktura danych dla umiejętności
interface SkillItem {
  name: string;
  count: number;
  color: string;
  gradientColor: string;
}

export function SkillsCard({ skills, isLoading }: { skills: SkillItem[], isLoading: boolean }) {
  return (
    <Card className="h-full overflow-hidden bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardHeader className="flex flex-row items-center justify-between -mt-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-md font-medium">Popularne umiejętności</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[170px] w-full">
            <div className="w-[90%] h-[90%]">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        ) : skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                style={{ 
                  backgroundColor: `${skill.color}20`, 
                  borderColor: skill.color,
                  fontSize: `${Math.min(6 + skill.count * 1.5, (skill.count >= 4 ? 17 : 15))}px`,
                  padding: '0.25rem 0.4rem'
                }}
                className="text-foreground font-medium"
              >
                {skill.name} ({skill.count})
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Brak danych o wymaganych umiejętnościach</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 