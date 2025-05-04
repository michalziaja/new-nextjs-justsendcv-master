"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { Loader2, FileText, MessageCircle, CheckCircle, Clock, HelpCircle, MessageSquareQuoteIcon, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Typy dla dokumentów
type DocumentType = 
  | "hr_message"
  | "welcome_message"
  | "status_inquiry"
  | "thank_you"
  | "feedback_request"
  | "clarification_request"
  | "team_welcome";

// Typy dla ofert pracy i CV
interface JobOffer {
  id: string;
  title: string;
  company: string;
  site?: string | null;
  full_description?: string | null;
  created_at: string;
}

interface CV {
  id: string;
  name: string;
  created_at: string;
  job_offer_id?: string | null;
  template?: string;
}

// Konfiguracja dokumentów
const documentConfig = [
  { 
    id: "hr_message", 
    title: "Wiadomość do HR", 
    description: "Wiadomość do rekrutera/działu HR",
    icon: <MessageCircle className="h-6 w-6" />,
    color: "border-blue-500 bg-blue-50 hover:bg-blue-100"
  },
  { 
    id: "welcome_message", 
    title: "Wiadomość powitalna", 
    description: "Spersonalizowana wiadomość powitalna",
    icon: <FileText className="h-6 w-6" />,
    color: "border-green-500 bg-green-50 hover:bg-green-100"
  },
  { 
    id: "status_inquiry", 
    title: "Pytanie o status", 
    description: "Zapytanie o status rekrutacji",
    icon: <Clock className="h-6 w-6" />,
    color: "border-yellow-500 bg-yellow-50 hover:bg-yellow-100"
  },
  { 
    id: "thank_you", 
    title: "Podziękowanie", 
    description: "Podziękowanie po rozmowie kwalifikacyjnej",
    icon: <Heart className="h-6 w-6" />,
    color: "border-pink-500 bg-pink-50 hover:bg-pink-100"
  },
  { 
    id: "feedback_request", 
    title: "Prośba o feedback", 
    description: "Prośba o feedback po procesie rekrutacyjnym",
    icon: <MessageSquareQuoteIcon className="h-6 w-6" />,
    color: "border-purple-500 bg-purple-50 hover:bg-purple-100"
  },
  { 
    id: "clarification_request", 
    title: "Prośba o doprecyzowanie", 
    description: "Prośba o więcej informacji o ofercie",
    icon: <HelpCircle className="h-6 w-6" />,
    color: "border-indigo-500 bg-indigo-50 hover:bg-indigo-100"
  },
  { 
    id: "team_welcome", 
    title: "Wiadomość do zespołu", 
    description: "Wiadomość powitalna do przyszłego zespołu",
    icon: <CheckCircle className="h-6 w-6" />,
    color: "border-teal-500 bg-teal-50 hover:bg-teal-100"
  }
];

export default function AssistantPage() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>("hr_message");
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(null);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [cvs, setCVs] = useState<CV[]>([]);
  const [isLoadingJobOffers, setIsLoadingJobOffers] = useState(true);
  const [isLoadingCVs, setIsLoadingCVs] = useState(true);
  const [generatedDocument, setGeneratedDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Pobieranie ofert pracy
  useEffect(() => {
    const fetchJobOffers = async () => {
      setIsLoadingJobOffers(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setIsLoadingJobOffers(false);
          return;
        }

        const { data: offers, error } = await supabase
          .from('job_offers')
          .select('id, title, company, site, full_description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Błąd podczas pobierania ofert pracy:", error);
        } else {
          setJobOffers(offers || []);
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
      } finally {
        setIsLoadingJobOffers(false);
      }
    };

    fetchJobOffers();
  }, []);

  // Pobieranie CV
  useEffect(() => {
    const fetchCVs = async () => {
      setIsLoadingCVs(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setIsLoadingCVs(false);
          return;
        }

        const { data: userCVs, error } = await supabase
          .from('cvs')
          .select('id, name, created_at, job_offer_id, template')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Błąd podczas pobierania CV:", error);
        } else {
          setCVs(userCVs || []);
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
      } finally {
        setIsLoadingCVs(false);
      }
    };

    fetchCVs();
  }, []);

  // Funkcja do generowania dokumentu
  const generateDocument = async () => {
    if (!selectedJobOffer) {
      alert("Proszę wybrać ofertę pracy");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // W rzeczywistej aplikacji tutaj byłoby połączenie z API generującym dokument
      // Symulacja opóźnienia
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Przykładowy wygenerowany dokument
      const jobTitle = selectedJobOffer.title;
      const company = selectedJobOffer.company;
      
      let documentText = "";
      
      switch (selectedDocument) {
        case "hr_message":
          documentText = `Szanowny Dziale HR ${company},\n\nPiszę w sprawie ogłoszenia na stanowisko ${jobTitle}. Jestem zainteresowany/a dołączeniem do Państwa zespołu i chciałbym/chciałabym aplikować na to stanowisko.\n\nZ wyrazami szacunku,\n[Twoje imię i nazwisko]`;
          break;
        case "welcome_message":
          documentText = `Dzień dobry,\n\nZ przyjemnością aplikuję na stanowisko ${jobTitle} w ${company}. Jestem przekonany/a, że moje doświadczenie i umiejętności czynią mnie odpowiednim kandydatem na to stanowisko.\n\nZ poważaniem,\n[Twoje imię i nazwisko]`;
          break;
        case "status_inquiry":
          documentText = `Szanowny Dziale HR ${company},\n\nChciałbym/chciałabym zapytać o status mojej aplikacji na stanowisko ${jobTitle}. Aplikowałem/am w dniu [data aplikacji].\n\nZ wyrazami szacunku,\n[Twoje imię i nazwisko]`;
          break;
        case "thank_you":
          documentText = `Dzień dobry,\n\nChciałbym/chciałabym podziękować za możliwość rozmowy o stanowisku ${jobTitle} w ${company}. Spotkanie było bardzo interesujące i informatywne.\n\nZ wyrazami szacunku,\n[Twoje imię i nazwisko]`;
          break;
        case "feedback_request":
          documentText = `Szanowny Dziale HR ${company},\n\nChciałbym/chciałabym prosić o feedback dotyczący mojej aplikacji na stanowisko ${jobTitle}. Bardzo cenię sobie konstruktywną krytykę, która pomoże mi w rozwoju zawodowym.\n\nZ poważaniem,\n[Twoje imię i nazwisko]`;
          break;
        case "clarification_request":
          documentText = `Dzień dobry,\n\nZainteresowało mnie ogłoszenie na stanowisko ${jobTitle} w ${company}. Chciałbym/chciałabym prosić o dodatkowe informacje dotyczące zakresu obowiązków oraz wymaganych umiejętności.\n\nZ wyrazami szacunku,\n[Twoje imię i nazwisko]`;
          break;
        case "team_welcome":
          documentText = `Witajcie Zespole ${company},\n\nZ wielką radością dołączam do Was jako ${jobTitle}. Nie mogę się doczekać współpracy z Wami i wspólnego osiągania sukcesów.\n\nPozdrawiam,\n[Twoje imię i nazwisko]`;
          break;
      }
      
      setGeneratedDocument(documentText);
    } catch (error) {
      console.error("Błąd podczas generowania dokumentu:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold my-6">Asystent Dokumentów</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel wyboru dokumentu */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Rodzaj dokumentu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {documentConfig.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedDocument === doc.id 
                        ? doc.color + " border-opacity-100" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => setSelectedDocument(doc.id as DocumentType)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${selectedDocument === doc.id ? "text-gray-800" : "text-gray-500"}`}>
                        {doc.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Panel wyboru oferty i CV */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Wybór oferty i CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Lista ofert pracy */}
              <div className="space-y-2">
                <Label>Oferta pracy</Label>
                <div className="border rounded-md bg-white">
                  {isLoadingJobOffers ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : jobOffers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Brak zapisanych ofert pracy
                    </div>
                  ) : (
                    <div className="max-h-[200px] overflow-y-auto">
                      {jobOffers.map((job) => (
                        <div
                          key={job.id}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                            selectedJobOffer?.id === job.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => setSelectedJobOffer(job)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-sm text-gray-500">{job.company}</p>
                            </div>
                            {job.site && (
                              <Badge variant="outline" className="text-xs">
                                {job.site}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista CV (opcjonalne) */}
              <div className="space-y-2">
                <Label>CV (opcjonalne)</Label>
                <div className="border rounded-md bg-white">
                  {isLoadingCVs ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : cvs.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Brak zapisanych CV
                    </div>
                  ) : (
                    <div className="max-h-[200px] overflow-y-auto">
                      {cvs.map((cv) => (
                        <div
                          key={cv.id}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                            selectedCV?.id === cv.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                          }`}
                          onClick={() => setSelectedCV(cv)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{cv.name}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(cv.created_at).toLocaleDateString('pl-PL')}
                              </p>
                            </div>
                            {cv.template && (
                              <Badge variant="outline" className="text-xs">
                                {cv.template}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={generateDocument} 
                className="w-full mt-4"
                disabled={!selectedJobOffer || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generowanie...
                  </>
                ) : (
                  "Generuj Dokument"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Podgląd wygenerowanego dokumentu */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Podgląd dokumentu</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generatedDocument}
                onChange={(e) => setGeneratedDocument(e.target.value)}
                className="min-h-[400px] p-4 font-mono text-sm whitespace-pre-wrap bg-white"
                placeholder="Tutaj pojawi się wygenerowany dokument..."
              />
              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  variant="outline"
                  disabled={!generatedDocument}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDocument);
                  }}
                >
                  Kopiuj do schowka
                </Button>
                <Button
                  disabled={!generatedDocument}
                >
                  Zapisz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
