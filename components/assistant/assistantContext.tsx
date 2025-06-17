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

// Typ CVProfileData (zgodny z app/api/generate-message/route.ts)
interface CVProfileData {
  personalData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  description?: string;
  experience?: Array<{
    position?: string;
    company?: string;
    description?: string;
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
  };
}

type JobOffer = {
  id: string;
  title: string;
  company: string;
  status?: string;
  full_description?: string; // Dodane dla potencjalnego użycia
};

type UserCV = {
  id: string;
  name: string;
  job_offer_id?: string;
  cv_data?: CVProfileData | any; // Przechowuje przeanalizowane dane CV (JSON)
};

type SavedTemplate = {
  id: string;
  name: string;
  content: string;
};

// Przykładowe dane do testowania (usunięte, bo dane będą z Supabase)
// const exampleJobOffers: JobOffer[] = [...];
// const exampleUserCVs: UserCV[] = [...];

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
  error: string | null; // Dodane pole do obsługi błędów
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
  setError: (message: string | null) => void; // Dodane
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('greeting'); // Domyślny typ wiadomości
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]); // Inicjalizacja pustą tablicą
  const [userCVs, setUserCVs] = useState<UserCV[]>([]); // Inicjalizacja pustą tablicą
  const [selectedJobOffer, setSelectedJobOffer] = useState<string | null>(null);
  const [selectedUserCV, setSelectedUserCV] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [error, setError] = useState<string | null>(null); // Stan dla błędów

  // Pobieranie ofert pracy i CV z Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      setError(null); // Resetuj błąd przy nowym pobieraniu
      try {
        const supabase = createClient();
        
        // Pobieranie ofert pracy - w tym full_description
        const { data: jobOffersData, error: jobOffersError } = await supabase
          .from('job_offers')
          .select('id, title, company, status, full_description') // Dodano full_description
          .order('created_at', { ascending: false });
          
        if (jobOffersError) throw jobOffersError;
        if (jobOffersData) {
          setJobOffers(jobOffersData);
        }
        
        // Pobieranie CV użytkownika - w tym cv_data
        const { data: userCVsData, error: userCVsError } = await supabase
          .from('user_cvs')
          .select('id, name, job_offer_id, cv_data'); // Dodano cv_data
          
        if (userCVsError) throw userCVsError;
        if (userCVsData) {
          setUserCVs(userCVsData);
        }
      } catch (err: any) {
        console.error('Błąd pobierania danych z Supabase:', err);
        setError('Nie udało się załadować danych. Spróbuj odświeżyć stronę.');
        // Można zostawić przykładowe dane w razie błędu, jeśli jest taka potrzeba
        // setJobOffers(exampleJobOffers); 
        // setUserCVs(exampleUserCVs);
      }
    };
    
    fetchUserData();
  }, []);

  // Funkcja do zapisywania szablonu (jeśli nadal potrzebna)
  const saveTemplate = (name: string, content: string) => {
    if (!name.trim()) return;
    const newTemplate: SavedTemplate = { id: `template-${Date.now()}`, name: name.trim(), content };
    setSavedTemplates(prev => [...prev, newTemplate]);
  };

  // Funkcja do ładowania szablonu (jeśli nadal potrzebna, np. do ręcznego wklejania)
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

  // Nowa funkcja generowania tekstu z użyciem API
  const generateText = async () => {
    // Typy wiadomości, które nie wymagają zaznaczonej oferty pracy
    const independentMessageTypes = ['welcome', 'direct-recruiter']; // wniosek urlopowy, wiadomość bezpośrednia
    const requiresJobOffer = !independentMessageTypes.includes(selectedTemplate);
    
    // Walidacja podstawowa - zawsze wymagany typ wiadomości
    if (!selectedTemplate) {
      setError("Proszę wybrać typ wiadomości.");
      return;
    }
    
    // Walidacja dla typów wymagających oferty pracy
    if (requiresJobOffer && !selectedJobOffer) {
      setError("Proszę wybrać ofertę pracy dla tego typu wiadomości.");
      return;
    }
    
    // Walidacja CV - zawsze wymagane (może zawierać dane osobowe użytkownika)
    if (!selectedUserCV) {
      setError("Proszę wybrać CV.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedText(''); // Wyczyść poprzedni tekst

    // Pobierz dane oferty (jeśli wymagane)
    const currentOffer = requiresJobOffer ? jobOffers.find(offer => offer.id === selectedJobOffer) : null;
    const currentCV = userCVs.find(cv => cv.id === selectedUserCV);

    // Sprawdź czy oferta została znaleziona (jeśli jest wymagana)
    if (requiresJobOffer && !currentOffer) {
      setError("Nie znaleziono wybranej oferty pracy.");
      setIsGenerating(false);
      return;
    }
    
    if (!currentCV) {
      setError("Nie znaleziono wybranego CV.");
      setIsGenerating(false);
      return;
    }

    const requestBody = {
      // Przekazuj dane oferty tylko jeśli są dostępne i wymagane
      jobOffer: currentOffer ? {
        id: currentOffer.id,
        title: currentOffer.title,
        company: currentOffer.company,
        full_description: currentOffer.full_description || undefined,
      } : {
        id: 'no-offer',
        title: 'Brak określonego stanowiska',
        company: 'Brak określonej firmy',
      },
      // Przekazuj cvData tylko jeśli jest dostępne i relevantne dla typu wiadomości
      // Endpoint API sam decyduje czy go użyć na podstawie messageType, ale możemy tu wstępnie filtrować
      cvData: currentCV?.cv_data || undefined, 
      additionalInfo: additionalInfo,
      messageType: selectedTemplate, // selectedTemplate to teraz typ wiadomości, np. 'greeting'
    };

    try {
      console.log("Wysyłanie żądania do /api/generate-message z danymi:", requestBody);
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Błąd odpowiedzi API:", data);
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.message) {
        setGeneratedText(data.message);
      } else {
        console.error("Odpowiedź API nie zawiera sukcesu lub wiadomości:", data);
        throw new Error(data.error || "Nie udało się wygenerować wiadomości. Odpowiedź API była niekompletna.");
      }
    } catch (err: any) {
      console.error('Błąd podczas generowania tekstu przez API:', err);
      setError(err.message || 'Wystąpił nieoczekiwany błąd podczas generowania wiadomości.');
      setGeneratedText(''); // Wyczyść tekst w razie błędu
    } finally {
      setIsGenerating(false);
    }
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
        error, // Udostępnij błąd
        setIsGenerating,
        setGeneratedText,
        setSelectedTemplate,
        saveTemplate,
        loadTemplate,
        deleteTemplate,
        setSelectedJobOffer,
        setSelectedUserCV,
        setAdditionalInfo,
        generateText,
        setError, // Udostępnij funkcję ustawiania błędu
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

// Dane szablonów dokumentów (typy wiadomości)
// Należy upewnić się, że ID szablonów odpowiadają wartościom 'messageType' oczekiwanym przez API
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
    name: 'Wniosek urlopowy', // Zmieniono z "Do zespołu"
    description: 'Formalny wniosek o udzielenie urlopu na żądanie skierowany do przełożonego. Nie wymaga wybrania oferty pracy.',
    icon: '🏖️',
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
    description: 'Bezpośrednia wiadomość do rekrutera. Nie wymaga wybrania konkretnej oferty pracy.',
    icon: '✉️',
    color: 'border-rose-500'
  },
]; 