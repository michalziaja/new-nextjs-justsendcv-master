"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ArrowRight, Calendar, Rocket } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"

export function NewsSection() {
  return (
    <Card className="h-full border-1 rounded-sm border-gray-200 dark:border-gray-800
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
      dark:shadow-slate-900/20
      bg-white dark:bg-slate-900">
      <Tabs defaultValue="market">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#00B2FF] stroke-2 transform transition-transform hover:scale-110" />
            <CardTitle>Aktualności</CardTitle>
          </div>
          <TabsList className="w-[250px] grid grid-cols-2">
            <TabsTrigger value="market" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-500 data-[state=active]:text-white">Rynek pracy</TabsTrigger>
            <TabsTrigger value="app" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-500 data-[state=active]:text-white">Aplikacja</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="market" className="mt-2">
            <div className="space-y-4">
              <Link href="/article/art1" className="block group">
                <div className="group-hover:bg-gray-50 dark:group-hover:bg-slate-800/50 p-2 rounded-md transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium group-hover:text-[#00B2FF] transition-colors">Nowe trendy w rekrutacji IT</h4>
                      <p className="text-sm text-muted-foreground">Dowiedz się, jak zmieniają się procesy rekrutacyjne w branży IT</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#00B2FF] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
              <Link href="/article/art2" className="block group">
                <div className="group-hover:bg-gray-50 dark:group-hover:bg-slate-800/50 p-2 rounded-md transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium group-hover:text-[#00B2FF] transition-colors">Jak ułatwić sobie szukanie pracy</h4>
                      <p className="text-sm text-muted-foreground">Nowoczesne narzędzia dla każdego kandydata</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#00B2FF] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </div>
          </TabsContent>
          <TabsContent value="app" className="mt-8">
            <div className="space-y-4">
              <div className="p-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Rocket className="h-4 w-4 text-[#00B2FF]" />
                      <h4 className="font-medium">Uruchomienie aplikacji</h4>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>10.05.2025</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Oficjalne uruchomienie aplikacji JustSend.cv</p>
                  </div>
                </div>
              </div>
              
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
} 