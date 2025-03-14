"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NewsSection() {
  return (
    <Card className="h-full border-2 border-gray-300 dark:border-gray-800
      shadow-[3px_6px_15px_rgba(1,0,0,0.3)] 
      dark:shadow-gray-800/50
      bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          <CardTitle>Aktualności</CardTitle>
        </div>
        <Tabs defaultValue="market" className="w-[250px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Rynek pracy</TabsTrigger>
            <TabsTrigger value="app">Aplikacja</TabsTrigger>
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