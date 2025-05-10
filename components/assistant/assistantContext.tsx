"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

// Typy danych
type TemplateType = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
};

type JobOffer = {
  id: string;
  title: string;
  company: string;
  status?: string;
};

type UserCV = {
  id: string;
  name: string;
  job_offer_id?: string;
};

type SavedTemplate = {
  id: string;
  name: string;
  content: string;
};

// Przykładowe dane do testowania
const exampleJobOffers: JobOffer[] = [
  { id: 'job-1', title: 'Programista Frontend', company: 'Tech Solutions' },
  { id: 'job-2', title: 'UX/UI Designer', company: 'Creative Studio' },
  { id: 'job-3', title: 'DevOps Engineer', company: 'Cloud Systems' },
];

const exampleUserCVs: UserCV[] = [
  { id: 'cv-1', name: 'CV Techniczne' },
  { id: 'cv-2', name: 'CV Kreatywne', job_offer_id: 'job-1' },
  { id: 'cv-3', name: 'CV Ogólne' },
];

type AssistantContextType = {
  isGenerating: boolean;
  generatedText: string;
  selectedTemplate: string;
  savedTemplates: SavedTemplate[];
  jobOffers: JobOffer[];
  userCVs: UserCV[];
  selectedJobOffer: string | null;
  selectedUserCV: string | null;
  additionalInfo: string;
  setIsGenerating: (value: boolean) => void;
  setGeneratedText: (text: string) => void;
  setSelectedTemplate: (templateId: string) => void;
  saveTemplate: (name: string, content: string) => void;
  loadTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
  setSelectedJobOffer: (offerId: string | null) => void;
  setSelectedUserCV: (cvId: string | null) => void;
  setAdditionalInfo: (value: string) => void;
  generateText: () => void;
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('greeting');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>(exampleJobOffers);
  const [userCVs, setUserCVs] = useState<UserCV[]>(exampleUserCVs);
  const [selectedJobOffer, setSelectedJobOffer] = useState<string | null>(null);
  const [selectedUserCV, setSelectedUserCV] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Pobieranie ofert pracy i CV z Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        
        // Pobieranie ofert pracy - wszystkie oferty, nie tylko zapisane
        const { data: jobOffersData, error: jobOffersError } = await supabase
          .from('job_offers')
          .select('id, title, company, status')
          .order('created_at', { ascending: false });
          
        if (!jobOffersError && jobOffersData && jobOffersData.length > 0) {
          setJobOffers(jobOffersData);
        }
        
        // Pobieranie CV użytkownika
        const { data: userCVsData, error: userCVsError } = await supabase
          .from('user_cvs')
          .select('id, name, job_offer_id');
          
        if (!userCVsError && userCVsData && userCVsData.length > 0) {
          setUserCVs(userCVsData);
        }
      } catch (error) {
        console.log('Błąd pobierania danych z Supabase, używanie przykładowych danych');
      }
    };
    
    fetchUserData();
  }, []);

  // Funkcja do zapisywania szablonu
  const saveTemplate = (name: string, content: string) => {
    if (!name.trim()) return;
    
    const newTemplate: SavedTemplate = {
      id: `template-${Date.now()}`,
      name: name.trim(),
      content
    };
    
    setSavedTemplates(prev => [...prev, newTemplate]);
  };

  // Funkcja do ładowania szablonu
  const loadTemplate = (templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId);
    if (template) {
      setGeneratedText(template.content);
    }
  };

  // Funkcja do usuwania szablonu
  const deleteTemplate = (templateId: string) => {
    setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  // Funkcja do generowania tekstu na podstawie wybranego szablonu
  const generateText = () => {
    setIsGenerating(true);
    
    // Pobieranie szczegółów wybranej oferty i CV
    const selectedOffer = jobOffers.find(offer => offer.id === selectedJobOffer);
    const selectedCV = userCVs.find(cv => cv.id === selectedUserCV);
    
    // Symulacja generowania - w rzeczywistej aplikacji tutaj byłoby API call do LLM
    setTimeout(() => {
      const templateType = documentTemplates.find(t => t.id === selectedTemplate)?.name || '';
      
      let baseText = '';
      
      switch(selectedTemplate) {
        case 'greeting':
          baseText = `Szanowni Państwo,\n\nW nawiązaniu do ogłoszenia o pracę na stanowisko ${selectedOffer?.title || '[stanowisko]'} w ${selectedOffer?.company || '[nazwa firmy]'}, chciałbym wyrazić moje zainteresowanie tą pozycją.\n\nMoje doświadczenie w ${additionalInfo || '[branża/technologia]'} sprawia, że jestem idealnym kandydatem dla Państwa firmy.\n\nZ poważaniem,\n[Twoje imię i nazwisko]`;
          break;
        case 'followup':
          baseText = `Szanowni Państwo,\n\nChciałbym zapytać o status mojej aplikacji na stanowisko ${selectedOffer?.title || '[stanowisko]'} w ${selectedOffer?.company || '[nazwa firmy]'}.\n\nAplikację złożyłem [data] i jestem nadal bardzo zainteresowany dołączeniem do Państwa zespołu.\n\n${additionalInfo ? additionalInfo + '\n\n' : ''}Z poważaniem,\n[Twoje imię i nazwisko]`;
          break;
        case 'thank-you':
          baseText = `Szanowni Państwo,\n\nDziękuję za możliwość rozmowy na temat stanowiska ${selectedOffer?.title || '[stanowisko]'} w ${selectedOffer?.company || '[nazwa firmy]'}.\n\nRozmowa była dla mnie bardzo cenna i utwierdziła mnie w przekonaniu, że moje umiejętności i doświadczenie doskonale pasują do Państwa oczekiwań.\n\n${additionalInfo ? additionalInfo + '\n\n' : ''}Z poważaniem,\n[Twoje imię i nazwisko]`;
          break;
        case 'feedback':
          baseText = `Szanowni Państwo,\n\nW związku z zakończeniem procesu rekrutacji na stanowisko ${selectedOffer?.title || '[stanowisko]'} w ${selectedOffer?.company || '[nazwa firmy]'}, chciałbym poprosić o krótki feedback dotyczący mojej aplikacji i rozmowy kwalifikacyjnej.\n\nZależy mi na rozwoju zawodowym, dlatego będę wdzięczny za wskazówki, co mogę poprawić w przyszłości.\n\n${additionalInfo ? additionalInfo + '\n\n' : ''}Z poważaniem,\n[Twoje imię i nazwisko]`;
          break;
        case 'clarification':
          baseText = `Szanowni Państwo,\n\nW związku z ogłoszeniem na stanowisko ${selectedOffer?.title || '[stanowisko]'}, chciałbym prosić o dodatkowe informacje dotyczące wymagań i zakresu obowiązków.\n\n${additionalInfo ? 'Interesują mnie szczególnie: ' + additionalInfo + '\n\n' : ''}Będę wdzięczny za doprecyzowanie tych kwestii, co pozwoli mi lepiej przygotować moją aplikację.\n\nZ poważaniem,\n[Twoje imię i nazwisko]`;
          break;
        case 'welcome':
          baseText = `Drodzy Przyszli Współpracownicy,\n\nZ radością przyjąłem ofertę pracy na stanowisko ${selectedOffer?.title || '[stanowisko]'} w ${selectedOffer?.company || '[nazwa firmy]'}.\n\nNie mogę się doczekać rozpoczęcia współpracy z Państwem i wniesienia mojego wkładu w rozwój firmy.\n\n${additionalInfo ? additionalInfo + '\n\n' : ''}Z wyrazami szacunku,\n[Twoje imię i nazwisko]`;
          break;
        case 'linkedin-footer':
          baseText = `🔹 ${additionalInfo || 'Specjalista w dziedzinie [Twoja dziedzina]'}\n🔹 ${selectedOffer?.title || '[Twoje stanowisko]'} w ${selectedOffer?.company || '[Twoja firma]'}\n🔹 [Twoje osiągnięcia/certyfikaty]\n\n💼 Otwarty na nowe możliwości zawodowe\n📧 [Twój email]\n🔗 [Link do portfolio/CV]\n\n#kariera #rozwój #${additionalInfo ? additionalInfo.toLowerCase().replace(/\s+/g, '') : 'praca'}`;
          break;
        case 'direct-recruiter':
          baseText = `Cześć [Imię rekrutera],\n\nZnalazłem/am ogłoszenie na stanowisko ${selectedOffer?.title || '[stanowisko]'} w ${selectedOffer?.company || '[nazwa firmy]'} i jestem tym bardzo zainteresowany/a.\n\nMam ${additionalInfo || '[X lat] doświadczenia'} w branży i mój profil doskonale pasuje do wymagań tej roli. Szczególnie moje umiejętności w zakresie [kluczowe umiejętności] mogą być wartościowe dla Waszego zespołu.\n\nCzy możemy porozmawiać o tej możliwości? Jestem dostępny/a [terminy dostępności].\n\nPozdrawiam,\n[Twoje imię i nazwisko]\n[Numer telefonu]`;
          break;
      }
      
      setGeneratedText(baseText);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <AssistantContext.Provider
      value={{
        isGenerating,
        generatedText,
        selectedTemplate,
        savedTemplates,
        jobOffers,
        userCVs,
        selectedJobOffer,
        selectedUserCV,
        additionalInfo,
        setIsGenerating,
        setGeneratedText,
        setSelectedTemplate,
        saveTemplate,
        loadTemplate,
        deleteTemplate,
        setSelectedJobOffer,
        setSelectedUserCV,
        setAdditionalInfo,
        generateText
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

// Hook do używania kontekstu asystenta
export function useAssistant() {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}

// Dane szablonów dokumentów
export const documentTemplates: TemplateType[] = [
  { 
    id: 'greeting', 
    name: 'Wiadomość powitalna', 
    description: 'Wiadomość wyjaśniająca powody aplikacji na dane stanowisko',
    icon: '📄',
    color: 'border-blue-400'
  },
  { 
    id: 'followup', 
    name: 'Status rekrutacji', 
    description: 'Zapytanie o aktualny status procesu rekrutacyjnego',
    icon: '⏱️',
    color: 'border-amber-400'
  },
  { 
    id: 'thank-you', 
    name: 'Podziękowanie', 
    description: 'Podziękowanie po rozmowie kwalifikacyjnej',
    icon: '🙏',
    color: 'border-green-400'
  },
  { 
    id: 'feedback', 
    name: 'Prośba o feedback', 
    description: 'Prośba o informację zwrotną po procesie rekrutacyjnym',
    icon: '💬',
    color: 'border-orange-400'
  },
  { 
    id: 'clarification', 
    name: 'Doprecyzowanie', 
    description: 'Prośba o wyjaśnienie szczegółów oferty lub stanowiska',
    icon: '❓',
    color: 'border-purple-400'
  },
  { 
    id: 'welcome', 
    name: 'Do zespołu', 
    description: 'Wiadomość powitalna do przyszłych współpracowników',
    icon: '👋',
    color: 'border-teal-400'
  },
  { 
    id: 'linkedin-footer', 
    name: 'Stopka LinkedIn', 
    description: 'Profesjonalna stopka do profilu LinkedIn',
    icon: '🔗',
    color: 'border-blue-600'
  },
  { 
    id: 'direct-recruiter', 
    name: 'Wiadomość bezpośrednia', 
    description: 'Bezpośrednia wiadomość do rekrutera',
    icon: '✉️',
    color: 'border-rose-500'
  },
]; 