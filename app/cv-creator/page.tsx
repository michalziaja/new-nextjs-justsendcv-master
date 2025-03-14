"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, User, Briefcase, GraduationCap, Languages, Award, Code, Send, Layout, PaintBucket } from "lucide-react"
import { PersonalForm } from "@/components/cv-creator/personal-form"
import { ExperienceForm } from "@/components/cv-creator/experience-form"
import { CVTemplate } from "@/components/cv-creator/cv-template"
import { useState } from "react"

export default function CVCreator() {
  const [selectedTemplate, setSelectedTemplate] = useState("professional")
  const [selectedColor, setSelectedColor] = useState("blue")

  // Dummy data
  const cvData = {
    personal: {
      firstName: "Jan",
      lastName: "Kowalski",
      position: "Senior Frontend Developer",
      email: "jan.kowalski@example.com",
      phone: "+48 123 456 789",
      city: "Warszawa",
      country: "Polska",
      summary: "Doświadczony Frontend Developer z 5-letnim doświadczeniem w tworzeniu responsywnych interfejsów użytkownika. Specjalizuję się w React, TypeScript i nowoczesnych frameworkach CSS."
    },
    experience: [
      {
        title: "Senior Frontend Developer",
        company: "Tech Solutions Sp. z o.o.",
        startDate: "2021",
        endDate: "obecnie",
        description: "Projektowanie i implementacja interfejsów użytkownika dla aplikacji webowych, optymalizacja wydajności frontendu, współpraca z zespołem backendowym."
      },
      {
        title: "Frontend Developer",
        company: "Software House",
        startDate: "2019",
        endDate: "2021",
        description: "Rozwój aplikacji React, optymalizacja wydajności, współpraca z designerami w celu tworzenia intuicyjnych UI."
      }
    ]
  }

  const colors = ["blue", "green", "purple", "red", "amber", "teal"]

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col md:flex-row gap-6 p-4 transition-all duration-200">
              {/* Lewa kolumna - kreator */}
              <div className="w-full md:w-1/2">
                <Card className="h-full border-2 border-gray-300 dark:border-gray-800 shadow-[3px_6px_15px_rgba(1,0,0,0.3)] dark:shadow-gray-800/50 bg-white dark:bg-slate-900">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      <CardTitle>Kreator CV</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Wyślij CV
                    </Button>
                  </CardHeader>
                  <CardContent className="overflow-auto max-h-[calc(100vh-220px)]">
                    {/* Wybór oferty */}
                    <div className="mb-6">
                      <label className="text-sm font-medium mb-2 block">Oferta pracy</label>
                      <select className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-slate-800">
                        <option>Senior Frontend Developer - Tech Solutions</option>
                        <option>React Developer - Software House</option>
                        <option>Full Stack Developer - Digital Innovation</option>
                      </select>
                    </div>

                    {/* Wybór szablonu */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Layout className="h-4 w-4 text-blue-500" />
                        <label className="text-sm font-medium">Szablon CV</label>
                      </div>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-slate-800"
                      >
                        <option value="professional">Profesjonalny</option>
                        <option value="modern">Nowoczesny</option>
                        <option value="minimal">Minimalistyczny</option>
                        <option value="photo">Ze zdjęciem</option>
                      </select>
                    </div>

                    {/* Wybór kolorystyki */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <PaintBucket className="h-4 w-4 text-blue-500" />
                        <label className="text-sm font-medium">Kolorystyka</label>
                      </div>
                      <div className="flex gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-full bg-${color}-500 border-2 border-white ${selectedColor === color ? `ring-2 ring-${color}-500` : ""}`}
                            onClick={() => setSelectedColor(color)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Zakładki sekcji */}
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid grid-cols-3 gap-2 mb-4">
                        <TabsTrigger value="personal">
                          <User className="h-4 w-4 mr-2" />
                          Dane osobowe
                        </TabsTrigger>
                        <TabsTrigger value="experience">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Doświadczenie
                        </TabsTrigger>
                        <TabsTrigger value="education">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Edukacja
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="personal">
                        <PersonalForm />
                      </TabsContent>
                      <TabsContent value="experience">
                        <ExperienceForm />
                      </TabsContent>
                      <TabsContent value="education">
                        <div className="space-y-4">Edukacja - do zaimplementowania</div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Prawa kolumna - podgląd CV */}
              <div className="w-full md:w-1/2">
                <Card className="h-full border-2 border-gray-300 dark:border-gray-800 shadow-[3px_6px_15px_rgba(1,0,0,0.3)] dark:shadow-gray-800/50 bg-white dark:bg-slate-900">
                  {/* <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      <CardTitle>Podgląd CV</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Pobierz PDF
                    </Button>
                  </CardHeader> */}
                  <CardContent className="flex justify-center overflow-auto max-h-[calc(100vh-220px)]">
                    <CVTemplate cvData={cvData} selectedTemplate={selectedTemplate} selectedColor={selectedColor} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}