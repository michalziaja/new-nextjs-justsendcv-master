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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Mail, MessageSquare, Phone, Send, Copy, Edit, Download, Clock, Star, Briefcase, Building2, MapPin } from "lucide-react"

export const iframeHeight = "800px"

export const description = "Asystent do generowania dokumentów i wiadomości"

export default function Assist() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-6 transition-all duration-200">
              {/* Nagłówek z wyborem oferty */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Asystent</h1>
                  <p className="text-muted-foreground">
                    Generuj dokumenty i wiadomości dla wybranej oferty
                  </p>
                </div>
                <Select>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Wybierz zapisaną ofertę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job1">
                      <div className="flex flex-col">
                        <span className="font-medium">Frontend Developer</span>
                        <span className="text-sm text-muted-foreground">TechCorp</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="job2">
                      <div className="flex flex-col">
                        <span className="font-medium">UX Designer</span>
                        <span className="text-sm text-muted-foreground">CreativeStudio</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="job3">
                      <div className="flex flex-col">
                        <span className="font-medium">React Developer</span>
                        <span className="text-sm text-muted-foreground">WebAgency</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Szczegóły wybranej oferty */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Frontend Developer</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4" />
                        TechCorp
                        <MapPin className="h-4 w-4 ml-2" />
                        Warszawa (Hybrydowo)
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Zapisana
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      B2B / UoP
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Pełny etat
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Zakładki z szablonami */}
              <Tabs defaultValue="cv" className="flex-1">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cv" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CV i LM
                  </TabsTrigger>
                  <TabsTrigger value="emails" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Emaile
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Wiadomości
                  </TabsTrigger>
                  <TabsTrigger value="followup" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Follow-up
                  </TabsTrigger>
                </TabsList>

                {/* Zakładka CV i List Motywacyjny */}
                <TabsContent value="cv" className="flex-1">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>CV</CardTitle>
                        <CardDescription>Dostosuj swoje CV do wybranej oferty</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <DocumentTemplate
                          title="CV - Wersja techniczna"
                          description="Podkreśla umiejętności techniczne i projekty"
                          tags={["Technical", "Projects", "Skills"]}
                        />
                        <DocumentTemplate
                          title="CV - Wersja biznesowa"
                          description="Skupia się na osiągnięciach i wynikach biznesowych"
                          tags={["Business", "Results", "Leadership"]}
                        />
                        <DocumentTemplate
                          title="CV - Wersja kreatywna"
                          description="Pokazuje kreatywność i projekty wizualne"
                          tags={["Creative", "Portfolio", "Design"]}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>List Motywacyjny</CardTitle>
                        <CardDescription>Wybierz szablon listu motywacyjnego</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <DocumentTemplate
                          title="List - Standardowy"
                          description="Klasyczny format listu motywacyjnego"
                          tags={["Professional", "Standard"]}
                        />
                        <DocumentTemplate
                          title="List - Storytelling"
                          description="Opowiada historię Twojej kariery"
                          tags={["Story", "Personal"]}
                        />
                        <DocumentTemplate
                          title="List - Problem-Solution"
                          description="Pokazuje jak możesz rozwiązać problemy firmy"
                          tags={["Solution", "Value"]}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Zakładka Emaile */}
                <TabsContent value="emails" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Szablony emaili</CardTitle>
                      <CardDescription>Gotowe szablony wiadomości email</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MessageTemplate
                        title="Email aplikacyjny"
                        description="Formalny email z aplikacją o pracę"
                        preview="Szanowni Państwo, W odpowiedzi na ogłoszenie..."
                      />
                      <MessageTemplate
                        title="Podziękowanie po rozmowie"
                        description="Podziękowanie po spotkaniu rekrutacyjnym"
                        preview="Dzień dobry, Chciałbym podziękować za możliwość..."
                      />
                      <MessageTemplate
                        title="Prośba o feedback"
                        description="Zapytanie o status aplikacji"
                        preview="Szanowni Państwo, Chciałbym zapytać o status..."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Zakładka Wiadomości */}
                <TabsContent value="messages" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Szablony wiadomości</CardTitle>
                      <CardDescription>Gotowe szablony do komunikacji</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MessageTemplate
                        title="LinkedIn - Pierwsza wiadomość"
                        description="Nawiązanie kontaktu na LinkedIn"
                        preview="Dzień dobry, Zauważyłem ofertę pracy..."
                      />
                      <MessageTemplate
                        title="LinkedIn - Follow-up"
                        description="Przypomnienie o aplikacji"
                        preview="Dzień dobry, Chciałbym nawiązać do..."
                      />
                      <MessageTemplate
                        title="Wiadomość do rekrutera"
                        description="Bezpośrednia wiadomość do rekrutera"
                        preview="Dzień dobry, Jestem zainteresowany..."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Zakładka Follow-up */}
                <TabsContent value="followup" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Follow-up</CardTitle>
                      <CardDescription>Szablony do kontynuacji kontaktu</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MessageTemplate
                        title="Follow-up po tygodniu"
                        description="Przypomnienie po 7 dniach"
                        preview="Dzień dobry, Minął tydzień od..."
                      />
                      <MessageTemplate
                        title="Follow-up po rozmowie"
                        description="Kontynuacja po spotkaniu"
                        preview="Dzień dobry, W nawiązaniu do naszej rozmowy..."
                      />
                      <MessageTemplate
                        title="Follow-up - ostateczne przypomnienie"
                        description="Ostatnia próba kontaktu"
                        preview="Dzień dobry, Chciałbym po raz ostatni..."
                      />
                    </CardContent>
                  </Card>
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

interface DocumentTemplateProps {
  title: string;
  description: string;
  tags: string[];
}

function DocumentTemplate({ title, description, tags }: DocumentTemplateProps) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost">
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface MessageTemplateProps {
  title: string;
  description: string;
  preview: string;
}

function MessageTemplate({ title, description, preview }: MessageTemplateProps) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{preview}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost">
          <Copy className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
