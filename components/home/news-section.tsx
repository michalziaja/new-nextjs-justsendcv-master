"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NewsSection() {
  return (
    <Card className="h-full border-1 rounded-sm border-gray-200 dark:border-gray-800
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
      dark:shadow-slate-900/20
      bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-transparent bg-clip-text bg-blue-500 dark:bg-blue-500" />
          <CardTitle>Aktualności</CardTitle>
        </div>
        <Tabs defaultValue="market" className="w-[250px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-500 data-[state=active]:text-white">Rynek pracy</TabsTrigger>
            <TabsTrigger value="app" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-500 data-[state=active]:text-white">Aplikacja</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Nowe trendy w rekrutacji IT</h4>
            <p className="text-sm text-muted-foreground">Dowiedz się, jak zmieniają się procesy rekrutacyjne w branży IT</p>
          </div>
          <div>
            <h4 className="font-medium">Jakich umiejętności szukają pracodawcy?</h4>
            <p className="text-sm text-muted-foreground">Analiza najpopularniejszych wymagań w ofertach pracy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 