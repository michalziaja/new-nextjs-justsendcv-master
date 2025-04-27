//components/creator/CVContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from "@/utils/supabase/client";
import { mockUserProfile } from './mockData';
import { JobOffer } from '../saved/ApplicationDetailsDrawer';
import { spacing, fontSizes } from './templates/TemplateStyles'; // Importujemy domyślne style

// Definicja interfejsu dla zapisanego CV
export interface SavedCV {
  id: string;
  name: string;
  selected_template: string;
  job_offer_id: string | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

// Definicja interfejsu dla analizy oferty pracy
export interface JobAnalysis {
  id: string;
  job_offer_id: string;
  skills: string[];
  technologies: string[];
  experience: string[];
  education: string[];
  languages: string[];
  other_requirements: string[];
  analyzed_at: string;
}

// Definicja interfejsu danych CV
export interface CVData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  description: string;
  profilePosition?: 'top' | 'bottom'; // Dodane pole określające pozycję opisu w CV
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    type?: 'job' | 'project';
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  courses?: Array<{
    name: string;
    organizer: string;
    date: string;
    certificateNumber: string;
    description?: string; // Dodajemy opcjonalny opis kursu
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: Array<{
      language: string;
      level: string;
    }>;
  };
  rodoClause?: string;
  showRodoClause?: boolean;
  customStyles?: CustomStyles; // Dodajemy pole na niestandardowe style
}

// Nowy interfejs dla niestandardowych stylów, odzwierciedlający strukturę z TemplateStyles
// Używamy Partial<T>, aby wszystkie pola były opcjonalne
interface CustomStyles {
  spacing?: Partial<typeof spacing>;
  fontSizes?: Partial<typeof fontSizes>;
}

// Interfejs kontekstu CV
interface CVContextProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  selectedJob: JobOffer | null;
  setSelectedJob: React.Dispatch<React.SetStateAction<JobOffer | null>>;
  selectedTemplate: string;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>;
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
  showProjectsInPreview: boolean;
  setShowProjectsInPreview: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Nowe funkcje do zarządzania CV
  currentCVId: string | null;
  setCurrentCVId: React.Dispatch<React.SetStateAction<string | null>>;
  cvName: string;
  setCVName: React.Dispatch<React.SetStateAction<string>>;
  savedCVs: SavedCV[];
  setSavedCVs: React.Dispatch<React.SetStateAction<SavedCV[]>>;
  isLoading: boolean;
  saveCV: (asDraft?: boolean) => Promise<string | null>;
  loadCV: (cvId: string) => Promise<boolean>;
  createNewCV: () => void;
  deleteSavedCV: (cvId: string) => Promise<boolean>;
  lastSaved: Date | null;
  isSaving: boolean;
  jobAnalysis: JobAnalysis | null;
}

// Początkowy stan danych CV
const initialCVData: CVData = {
  personalData: {
    firstName: mockUserProfile.firstName,
    lastName: mockUserProfile.lastName,
    email: mockUserProfile.email,
    phone: mockUserProfile.phone,
    address: mockUserProfile.address,
  },
  description: '',
  experience: [
    {
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  education: [
    {
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  courses: [
    {
      name: '',
      organizer: '',
      date: '',
      certificateNumber: ''
    }
  ],
  skills: {
    technical: [],
    soft: [],
    languages: [
      { language: '', level: '' },
    ],
  },
  rodoClause: 'Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z Ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych oraz Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r.).',
  showRodoClause: false, // Domyślnie pokazujemy RODO
  customStyles: {}, // Inicjalizujemy puste niestandardowe style
};

// Utworzenie kontekstu
const CVContext = createContext<CVContextProps | undefined>(undefined);

// Provider kontekstu
export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('nowoczesny');
  const [activeSection, setActiveSection] = useState<string>('start');
  const [showProjectsInPreview, setShowProjectsInPreview] = useState<boolean>(false);
  
  // Nowe stany
  const [currentCVId, setCurrentCVId] = useState<string | null>(null);
  const [cvName, setCVName] = useState<string>('Moje CV');
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  
  // Supabase client
  const supabase = createClient();

  // Pobieranie zapisanych CV użytkownika po załadowaniu
  useEffect(() => {
    async function fetchSavedCVs() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setSavedCVs([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_cvs')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error("Błąd podczas pobierania CV:", error);
          setSavedCVs([]);
        } else {
          setSavedCVs(data || []);
          
          // Jeśli istnieje wersja robocza, załaduj ją automatycznie
          const draftCV = data?.find(cv => cv.is_draft);
          if (draftCV) {
            await loadCV(draftCV.id);
          }
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
        setSavedCVs([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedCVs();
  }, []);

  // Pobieranie analizy oferty pracy
  useEffect(() => {
    const fetchJobAnalysis = async () => {
      if (!selectedJob?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('job_analysis_results')
          .select('*')
          .eq('job_offer_id', selectedJob.id)
          .maybeSingle();
          
        if (error) {
          console.error("Błąd podczas pobierania analizy oferty:", error);
          setJobAnalysis(null);
          return;
        }
        
        if (data) {
          setJobAnalysis(data as JobAnalysis);
        } else {
          setJobAnalysis(null);
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
        setJobAnalysis(null);
      }
    };
    
    fetchJobAnalysis();
  }, [selectedJob]);

  // Automatyczne zapisywanie CV po każdej zmianie danych
  useEffect(() => {
    // Tylko jeśli aktywna sekcja nie jest 'start' i mamy currentCVId
    if (activeSection !== 'start') {
      const autosaveTimeout = setTimeout(async () => {
        await saveCV(true); // Zawsze zapisujemy jako kopię roboczą
      }, 3000); // opóźnienie 3 sekundy po ostatniej zmianie

      return () => clearTimeout(autosaveTimeout);
    }
  }, [cvData, selectedTemplate, activeSection]);

  // Funkcja do zapisywania CV
  const saveCV = async (asDraft = true): Promise<string | null> => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Użytkownik nie jest zalogowany");
        return null;
      }

      // Jeśli to autozapis, używamy nazwy "Kopia robocza"
      // Jeśli to ręczny zapis (asDraft = false), dodajemy datę do nazwy
      let nameToSave = cvName;
      if (asDraft) {
        nameToSave = "Kopia robocza";
      } else {
        // Dodajemy datę do nazwy przy ręcznym zapisie
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`;
        nameToSave = `${cvName} - ${formattedDate}`;
      }

      const cvDataToSave = {
        user_id: user.id,
        name: nameToSave,
        cv_data: cvData,
        custom_styles: cvData.customStyles || {},
        selected_template: selectedTemplate,
        job_offer_id: selectedJob?.id || null,
        is_draft: asDraft
      };

      let response;
      
      // Jeśli to autozapis, znajdź istniejącą kopię roboczą
      if (asDraft) {
        // Sprawdzamy, czy istnieje już kopia robocza
        const { data: existingDrafts } = await supabase
          .from('user_cvs')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_draft', true);
          
        if (existingDrafts && existingDrafts.length > 0) {
          // Aktualizuj istniejącą kopię roboczą
          response = await supabase
            .from('user_cvs')
            .update(cvDataToSave)
            .eq('id', existingDrafts[0].id)
            .select()
            .single();
            
          // Aktualizuj currentCVId na ID istniejącej kopii roboczej
          if (!currentCVId) {
            setCurrentCVId(existingDrafts[0].id);
          }
        } else {
          // Utwórz nową kopię roboczą
          response = await supabase
            .from('user_cvs')
            .insert(cvDataToSave)
            .select()
            .single();
            
          // Aktualizuj currentCVId na ID nowej kopii roboczej
          if (response.data) {
            setCurrentCVId(response.data.id);
          }
        }
      } else {
        // Jeśli to ręczny zapis, zawsze tworzymy nowy rekord
        response = await supabase
          .from('user_cvs')
          .insert(cvDataToSave)
          .select()
          .single();
          
        // Aktualizuj currentCVId na ID nowego zapisu
        if (response.data) {
          setCurrentCVId(response.data.id);
        }
      }

      if (response.error) {
        console.error("Błąd podczas zapisywania CV:", response.error);
        return null;
      }

      // Aktualizacja listy zapisanych CV
      const { data: updatedCVs, error } = await supabase
        .from('user_cvs')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && updatedCVs) {
        setSavedCVs(updatedCVs);
      }

      setLastSaved(new Date());
      return response.data?.id || null;
    } catch (error) {
      console.error("Wystąpił błąd podczas zapisywania CV:", error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Funkcja do ładowania CV
  const loadCV = async (cvId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_cvs')
        .select('*')
        .eq('id', cvId)
        .single();

      if (error) {
        console.error("Błąd podczas ładowania CV:", error);
        return false;
      }

      if (data) {
        setCvData(data.cv_data as CVData);
        setSelectedTemplate(data.selected_template);
        setCVName(data.name);
        setCurrentCVId(data.id);
        
        // Jeśli CV jest powiązane z ofertą pracy, załaduj ją również
        if (data.job_offer_id) {
          const { data: jobData, error: jobError } = await supabase
            .from('job_offers')
            .select('*')
            .eq('id', data.job_offer_id)
            .single();
            
          if (!jobError && jobData) {
            setSelectedJob(jobData as JobOffer);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Wystąpił błąd podczas ładowania CV:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja do tworzenia nowego CV
  const createNewCV = () => {
    setCvData(initialCVData);
    setSelectedTemplate('nowoczesny');
    setSelectedJob(null);
    setCVName('Moje CV');
    setCurrentCVId(null);
    setActiveSection('personalData');
  };

  // Funkcja do usuwania zapisanego CV
  const deleteSavedCV = async (cvId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_cvs')
        .delete()
        .eq('id', cvId);

      if (error) {
        console.error("Błąd podczas usuwania CV:", error);
        return false;
      }

      // Aktualizacja listy CV
      setSavedCVs(savedCVs.filter(cv => cv.id !== cvId));
      
      // Jeśli usunięto aktualnie załadowane CV, zresetuj stan
      if (currentCVId === cvId) {
        createNewCV();
      }
      
      return true;
    } catch (error) {
      console.error("Wystąpił błąd podczas usuwania CV:", error);
      return false;
    }
  };

  return (
    <CVContext.Provider
      value={{
        cvData,
        setCvData,
        selectedJob,
        setSelectedJob,
        selectedTemplate,
        setSelectedTemplate,
        activeSection,
        setActiveSection,
        showProjectsInPreview,
        setShowProjectsInPreview,
        currentCVId,
        setCurrentCVId,
        cvName,
        setCVName,
        savedCVs,
        setSavedCVs,
        isLoading,
        saveCV,
        loadCV,
        createNewCV,
        deleteSavedCV,
        lastSaved,
        isSaving,
        jobAnalysis
      }}
    >
      {children}
    </CVContext.Provider>
  );
}

// Hook do używania kontekstu CV
export function useCV() {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
} 