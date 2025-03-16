"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

// Przykładowe dane - do zastąpienia danymi z backendu
const recentJobs = [
  {
    position: "Senior Frontend Developer",
    company: "Tech Solutions Sp. z o.o.",
    portal: "pracuj.pl",
    date: "2024-03-15"
  },
  {
    position: "React Developer",
    company: "Software House",
    portal: "nofluffjobs.com",
    date: "2024-03-14"
  },
  {
    position: "Full Stack Developer",
    company: "Digital Innovation Labs",
    portal: "justjoin.it",
    date: "2024-03-13"
  }
]

export function RecentJobs() {
  return (
    <Card className="h-full rounded-md border-1 border-gray-200 dark:border-gray-800
    shadow-[2px_4px_10px_rgba(0,0,0,0.3)] 
    dark:shadow-slate-900/20
    bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 pt-1">
          <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          Ostatnio zapisane oferty
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 pt-2">
          {/* Nagłówki kolumn */}
          <div className="grid pb-2 border-b border-gray-200 dark:border-gray-800" 
               style={{ gridTemplateColumns: '2fr 1.5fr 0.7fr 0.5fr' }}>
            <div className="text-md font-medium">Stanowisko</div>
            <div className="text-md font-medium">Firma</div>
            <div className="text-md font-medium text-right pr-4">Portal</div>
            <div className="text-md font-medium text-right">Data</div>
          </div>
          
          {/* Lista ofert */}
          <div className="space-y-1">
            {recentJobs.map((job, index) => (
              <div 
                key={index} 
                className="grid hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200 py-3"
                style={{ gridTemplateColumns: '2fr 1.5fr 0.7fr 0.5fr' }}
              >
                <div className="text-sm font-medium truncate">{job.position}</div>
                <div className="text-sm text-muted-foreground truncate">{job.company}</div>
                <div className="text-sm text-muted-foreground truncate text-right pr-4">{job.portal}</div>
                <div className="text-sm text-muted-foreground text-right">
                  {new Date(job.date).toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 