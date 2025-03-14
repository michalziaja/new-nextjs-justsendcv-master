"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, PieChart, LineChart, ArrowUpRight, Users, BriefcaseBusiness, FileSearch, FileCheck, BadgeCheck, Timer, ArrowDown, ArrowUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricCards } from "@/components/stats/metric-card"

export const iframeHeight = "800px"

export const description = "Statystyki aplikacji o pracę"

export default function Stats() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-6 transition-all duration-200">
              {/* Nagłówek strony z filtrem */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        
                <div className="flex items-center gap-2">
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Wybierz okres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Ostatnie 7 dni</SelectItem>
                      <SelectItem value="30days">Ostatnie 30 dni</SelectItem>
                      <SelectItem value="90days">Ostatnie 90 dni</SelectItem>
                      <SelectItem value="year">Ostatni rok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Karty kluczowych metryk */}
              <MetricCards />

              {/* Zakładki z różnymi widokami */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Przegląd
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Aplikacje
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Porównanie
                  </TabsTrigger>
                </TabsList>
                
                {/* Zakładka Przegląd */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Wykres aplikacji */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Aplikacje w czasie</CardTitle>
                      <CardDescription>Liczba aplikacji wysłanych w ostatnim okresie</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <div className="h-full w-full bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 rounded-md relative">
                          {/* Wykres słupkowy - z ustalonymi wartościami */}
                          <div className="absolute bottom-0 inset-x-0 flex items-end justify-between h-[70%] px-4 pb-6">
                            {[65, 40, 75, 55, 80, 45, 60, 35, 70, 50].map((height, i) => (
                              <div 
                                key={i}
                                className="w-6 bg-blue-500 dark:bg-blue-600 rounded-t"
                                style={{ height: `${height}%` }}
                              >
                                <div className="w-full h-full hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors duration-200 rounded-t"></div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Osie */}
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-border"></div>
                          <div className="absolute bottom-0 left-0 h-full w-0.5 bg-border"></div>
                          
                          {/* Etykiety osi X */}
                          <div className="absolute bottom-2 inset-x-0 flex justify-between px-3 text-xs text-muted-foreground">
                            <span>1 Lip</span>
                            <span>10 Lip</span>
                            <span>20 Lip</span>
                            <span>30 Lip</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {/* Wykres skuteczności */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Skuteczność aplikacji</CardTitle>
                        <CardDescription>Podział aplikacji wg statusu</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] flex items-center justify-center">
                          {/* Wykres kołowy - imitacja */}
                          <div className="relative h-40 w-40">
                            <div className="absolute inset-0 rounded-full border-8 border-l-blue-500 border-t-red-500 border-r-amber-500 border-b-green-500 transform -rotate-45"></div>
                            <div className="absolute inset-3 bg-background rounded-full flex items-center justify-center text-lg font-bold">
                              42
                            </div>
                          </div>
                          
                          {/* Legenda */}
                          <div className="pl-8 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm">Oczekujące (18)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-green-500"></div>
                              <span className="text-sm">Akceptowane (8)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                              <span className="text-sm">W trakcie (10)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-red-500"></div>
                              <span className="text-sm">Odrzucone (6)</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Statystyki branżowe */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Skuteczność wg branży</CardTitle>
                        <CardDescription>Odsetek pozytywnych odpowiedzi</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <ProgressItem 
                            label="IT / Rozwój oprogramowania" 
                            value={35} 
                            average={25} 
                          />
                          <ProgressItem 
                            label="Marketing / Media społecznościowe" 
                            value={28} 
                            average={22} 
                          />
                          <ProgressItem 
                            label="UX / Design" 
                            value={42} 
                            average={30} 
                          />
                          <ProgressItem 
                            label="Zarządzanie produktem" 
                            value={18} 
                            average={20} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Zakładka Aplikacje */}
                <TabsContent value="applications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Historia aplikacji</CardTitle>
                      <CardDescription>Szczegółowe informacje o Twoich aplikacjach</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Przykładowe aplikacje */}
                        <ApplicationItem 
                          title="Frontend Developer"
                          company="TechCorp"
                          date="12 Lip 2023"
                          status="Zaakceptowana"
                          days={4}
                          variant="green"
                        />
                        <ApplicationItem 
                          title="UX Designer"
                          company="CreativeStudio"
                          date="5 Lip 2023"
                          status="W trakcie"
                          days={11}
                          variant="amber"
                        />
                        <ApplicationItem 
                          title="Product Manager"
                          company="SoftwareSolutions"
                          date="28 Cze 2023"
                          status="Odrzucona"
                          days={8}
                          variant="red"
                        />
                        <ApplicationItem 
                          title="React Developer"
                          company="WebAgency"
                          date="15 Cze 2023"
                          status="Oczekująca"
                          days={27}
                          variant="blue"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Zakładka Porównanie */}
                <TabsContent value="comparison" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Porównanie z użytkownikami</CardTitle>
                      <CardDescription>Twoje statystyki na tle innych użytkowników</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <ComparisonItem 
                          label="Liczba aplikacji" 
                          value={42} 
                          average={35} 
                          status="above"
                        />
                        <ComparisonItem 
                          label="Wskaźnik odpowiedzi" 
                          value={28} 
                          average={22} 
                          status="above"
                        />
                        <ComparisonItem 
                          label="Czas do odpowiedzi" 
                          value={5.2} 
                          average={7.4} 
                          status="above"
                          reverseScale={true}
                        />
                        <ComparisonItem 
                          label="Wskaźnik zatrudnienia" 
                          value={18} 
                          average={12} 
                          status="above"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Porady</CardTitle>
                        <CardDescription>Jak poprawić swoje wyniki</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Dostosuj swoje CV</h4>
                            <p className="text-sm text-muted-foreground">Użytkownicy z dostosowanym CV mają o 35% więcej zaproszeń na rozmowy</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Szybka odpowiedź</h4>
                            <p className="text-sm text-muted-foreground">Aplikuj w ciągu 48h od publikacji oferty, aby zwiększyć szanse o 27%</p>
                          </div>
                          <div>
                            <h4 className="font-medium">List motywacyjny</h4>
                            <p className="text-sm text-muted-foreground">Spersonalizowany list motywacyjny zwiększa wskaźnik odpowiedzi o 22%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Trendy branżowe</CardTitle>
                        <CardDescription>Popularne wymagania w ofertach pracy</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 mr-2 mb-2">React</Badge>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 mr-2 mb-2">TypeScript</Badge>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 mr-2 mb-2">Agile</Badge>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 mr-2 mb-2">Remote</Badge>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 mr-2 mb-2">UX Design</Badge>
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800 mr-2 mb-2">Leadership</Badge>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 mr-2 mb-2">Node.js</Badge>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 mr-2 mb-2">Product Design</Badge>
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 mr-2 mb-2">Figma</Badge>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 mr-2 mb-2">Komunikacja</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

// Komponenty pomocnicze

interface ProgressItemProps {
  label: string;
  value: number;
  average: number;
}

function ProgressItem({ label, value, average }: ProgressItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
          style={{ width: `${value}%` }}
        ></div>
        <div 
          className="absolute top-0 left-0 h-full w-0.5 bg-amber-500"
          style={{ left: `${average}%` }}
        ></div>
      </div>
      <div className="text-xs text-muted-foreground flex justify-between">
        <span>Średnia: {average}%</span>
        <span className="text-blue-500">+{value - average}%</span>
      </div>
    </div>
  )
}

interface ApplicationItemProps {
  title: string;
  company: string;
  date: string;
  status: string;
  days: number;
  variant: "blue" | "green" | "amber" | "red";
}

function ApplicationItem({ title, company, date, status, days, variant }: ApplicationItemProps) {
  const getBadgeVariant = () => {
    switch(variant) {
      case "green": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "amber": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "red": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };
  
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
          <Badge className={getBadgeVariant()}>{status}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">{company}</div>
      </div>
      <div className="text-sm text-right">
        <div>{date}</div>
        <div className="text-muted-foreground">{days} dni temu</div>
      </div>
    </div>
  )
}

interface ComparisonItemProps {
  label: string;
  value: number;
  average: number;
  status: "above" | "below" | "equal";
  reverseScale?: boolean;
}

function ComparisonItem({ label, value, average, status, reverseScale = false }: ComparisonItemProps) {
  const getStatusColor = () => {
    if (reverseScale) {
      return status === "above" ? "text-green-500" : "text-red-500";
    }
    return status === "above" ? "text-green-500" : "text-red-500";
  };
  
  const getStatusText = () => {
    if (reverseScale) {
      return status === "above" ? "szybciej" : "wolniej";
    }
    return status === "above" ? "lepiej" : "gorzej";
  };
  
  const getDifference = () => {
    if (reverseScale) {
      return average - value > 0 ? `${(average - value).toFixed(1)}` : `${(value - average).toFixed(1)}`;
    }
    return value - average > 0 ? `+${(value - average).toFixed(1)}` : `${(value - average).toFixed(1)}`;
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span>{value}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="text-muted-foreground">{average}</span>
          <span className={getStatusColor()}>{getDifference()} {getStatusText()}</span>
        </div>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden relative">
        <div className="h-full w-full flex">
          <div 
            className="h-full bg-blue-500 rounded-l-full"
            style={{ width: `${(Math.min(value, average) / Math.max(value, average)) * 100}%` }}
          ></div>
          <div 
            className={`h-full ${value > average ? 'bg-green-500' : 'bg-red-500'} rounded-r-full`}
            style={{ width: `${100 - (Math.min(value, average) / Math.max(value, average)) * 100}%` }}
          ></div>
        </div>
        <div className="absolute top-0 left-0 h-full flex items-center justify-center w-full text-xs text-white font-medium">
          {value > average ? `${((value - average) / average * 100).toFixed(0)}% lepiej` : `${((average - value) / average * 100).toFixed(0)}% gorzej`}
        </div>
      </div>
    </div>
  )
}
