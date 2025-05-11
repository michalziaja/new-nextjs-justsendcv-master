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
  
  // Nowe wartości dostępne w kontekście, ale bez powiadomień
  savedJobs: JobOffer[];
  isLoadingJobs: boolean;
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
  
  // Dodajemy stan dla ofert pracy, aby uniknąć pobierania ich w wielu miejscach
  const [savedJobs, setSavedJobs] = useState<JobOffer[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  
  // Flaga wskazująca, czy dane zostały już pobrane
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  
  // Supabase client
  const supabase = createClient();

  // Pobieranie wszystkich potrzebnych danych w jednym useEffect
  useEffect(() => {
    // Funkcja do pobierania wszystkich danych
    const fetchAllData = async () => {
      if (dataFetched) return; // Unikamy ponownego pobierania, jeśli dane już zostały pobrane
      
      // Sprawdzenie, czy zapytanie jest już w trakcie wykonywania
      const isRequestInProgress = sessionStorage.getItem('creator_data_request_in_progress');
      const lastRequestTime = sessionStorage.getItem('creator_data_last_request_time');
      
      // Jeśli zapytanie jest w trakcie lub zostało wykonane w ciągu ostatnich 5 sekund, pomijamy
      if (isRequestInProgress === 'true' || 
          (lastRequestTime && Date.now() - parseInt(lastRequestTime) < 5000)) {
        console.log('Zapytanie zostało już wykonane lub jest w trakcie - pomijam');
        
        // Sprawdzamy, czy dane są dostępne w sessionStorage
        const cachedData = sessionStorage.getItem('creator_cached_data');
        if (cachedData) {
          try {
            const { cvs, jobs } = JSON.parse(cachedData);
            if (cvs) setSavedCVs(cvs);
            if (jobs) setSavedJobs(jobs);
            setDataFetched(true);
            setIsLoading(false);
            setIsLoadingJobs(false);
          } catch (e) {
            console.error('Błąd podczas parsowania danych z cache:', e);
          }
        }
        
        return;
      }
      
      // Oznaczamy, że zapytanie jest w trakcie
      sessionStorage.setItem('creator_data_request_in_progress', 'true');
      sessionStorage.setItem('creator_data_last_request_time', Date.now().toString());
      
      setIsLoading(true);
      setIsLoadingJobs(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setIsLoading(false);
          setIsLoadingJobs(false);
          sessionStorage.removeItem('creator_data_request_in_progress');
          return;
        }
        
        // Wykonujemy wszystkie zapytania równolegle dla lepszej wydajności
        const [cvsResponse, jobsResponse] = await Promise.all([
          // Pobieranie zapisanych CV
          supabase
            .from('user_cvs')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false }),
            
          // Pobieranie ofert pracy
          supabase
            .from('job_offers')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'saved')
            .order('created_at', { ascending: false })
        ]);
        
        // Cache dla wyników
        const cacheData: { cvs?: any[]; jobs?: any[] } = {};
        
        // Obsługa błędów
        if (cvsResponse.error) {
          console.error("Błąd podczas pobierania zapisanych CV:", cvsResponse.error);
        } else if (cvsResponse.data) {
          setSavedCVs(cvsResponse.data);
          cacheData.cvs = cvsResponse.data;
        }
        
        if (jobsResponse.error) {
          console.error("Błąd podczas pobierania ofert pracy:", jobsResponse.error);
        } else if (jobsResponse.data) {
          setSavedJobs(jobsResponse.data);
          cacheData.jobs = jobsResponse.data;
        }
        
        // Zapisz dane w sessionStorage
        sessionStorage.setItem('creator_cached_data', JSON.stringify(cacheData));
        
        // Ustawiamy flagę, że dane zostały pobrane
        setDataFetched(true);
      } catch (error) {
        console.error("Wystąpił błąd podczas pobierania danych:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingJobs(false);
        // Oznaczamy, że zapytanie zostało zakończone
        sessionStorage.removeItem('creator_data_request_in_progress');
      }
    };
    
    fetchAllData();
    
    // Czyszczenie przy odmontowaniu komponentu
    return () => {
      // Przy opuszczaniu komponentu, usuwamy blokadę
      sessionStorage.removeItem('creator_data_request_in_progress');
    };
  }, []); // Pusta tablica zależności - wykonuje się tylko raz

  // Przechowywanie ostatnich zapisanych danych jako referencja
  const lastSavedDataRef = React.useRef({
    cvData: null as CVData | null,
    template: ''
  });

  // Funkcja do zapisywania CV - użycie useCallback, aby zapobiec tworzeniu nowych instancji
  const saveCV = React.useCallback(async (asDraft = true): Promise<string | null> => {
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
  }, [cvData, cvName, currentCVId, selectedJob?.id, selectedTemplate, supabase]);

  // Funkcja do ładowania CV
  const loadCV = React.useCallback(async (cvId: string): Promise<boolean> => {
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
        
        // Jeśli CV jest powiązane z ofertą pracy, sprawdź najpierw w savedJobs
        if (data.job_offer_id) {
          // Szukamy oferty w już pobranych ofertach
          const jobFromCache = savedJobs.find(job => job.id === data.job_offer_id);
          
          if (jobFromCache) {
            // Jeśli oferta znajduje się już w naszych danych, nie musimy wykonywać zapytania
            setSelectedJob(jobFromCache as JobOffer);
          } else {
            // Jeśli nie znaleziono w cache, pobieramy z bazy
            const { data: jobData, error: jobError } = await supabase
              .from('job_offers')
              .select('*')
              .eq('id', data.job_offer_id)
              .single();
              
            if (!jobError && jobData) {
              setSelectedJob(jobData as JobOffer);
            }
          }
        } else {
          // Jeśli CV nie jest powiązane z ofertą, resetujemy wybraną ofertę
          setSelectedJob(null);
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
  }, [supabase, setCvData, setSelectedTemplate, setCVName, setCurrentCVId, setSelectedJob, savedJobs]);

  // Pobieranie analizy oferty pracy
  useEffect(() => {
    const fetchJobAnalysis = async () => {
      if (!selectedJob?.id) {
        setJobAnalysis(null);
        return;
      }
      
      // Sprawdzenie, czy zapytanie jest już w trakcie wykonywania
      const analysisRequestKey = `job_analysis_request_${selectedJob.id}`;
      const isAnalysisRequestInProgress = sessionStorage.getItem(analysisRequestKey);
      
      // Jeśli zapytanie jest w trakcie, pomijamy
      if (isAnalysisRequestInProgress === 'true') {
        console.log('Zapytanie o analizę oferty jest już w trakcie - pomijam');
        return;
      }
      
      // Oznaczamy, że zapytanie jest w trakcie
      sessionStorage.setItem(analysisRequestKey, 'true');
      
      // Tworzymy klucz cache dla analizy oferty
      const cacheKey = `job_analysis_${selectedJob.id}`;
      
      // Sprawdzamy, czy analiza jest już w lokalnym storage
      const cachedAnalysis = localStorage.getItem(cacheKey);
      if (cachedAnalysis) {
        try {
          const parsedAnalysis = JSON.parse(cachedAnalysis);
          // Sprawdzamy, czy dane nie są przestarzałe (np. starsze niż 24h)
          const cacheTime = parsedAnalysis.cachedAt || 0;
          const now = Date.now();
          const cacheAge = now - cacheTime;
          
          // Jeśli cache jest ważny (mniej niż 24 godziny), używamy go
          if (cacheAge < 24 * 60 * 60 * 1000) {
            setJobAnalysis(parsedAnalysis.data);
            sessionStorage.removeItem(analysisRequestKey);
            return;
          }
        } catch (e) {
          // Ignorujemy błędy parsowania
          console.error("Błąd parsowania cache analizy oferty:", e);
        }
      }
      
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
          
          // Zapisujemy do localStorage z timestampem
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            cachedAt: Date.now()
          }));
        } else {
          setJobAnalysis(null);
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
        setJobAnalysis(null);
      } finally {
        // Oznaczamy, że zapytanie zostało zakończone
        sessionStorage.removeItem(analysisRequestKey);
      }
    };
    
    fetchJobAnalysis();
    
    // Czyszczenie przy zmianie oferty pracy
    return () => {
      if (selectedJob?.id) {
        sessionStorage.removeItem(`job_analysis_request_${selectedJob.id}`);
      }
    };
  }, [selectedJob?.id]);

  // Automatyczne zapisywanie CV po każdej zmianie danych
  useEffect(() => {
    // Tylko jeśli aktywna sekcja nie jest 'start' i mamy dane do zapisania
    if (activeSection !== 'start') {
      // Sprawdzamy, czy dane faktycznie się zmieniły
      const hasDataChanged = JSON.stringify(cvData) !== JSON.stringify(lastSavedDataRef.current.cvData) || 
                             selectedTemplate !== lastSavedDataRef.current.template;
      
      if (hasDataChanged) {
        const autosaveTimeout = setTimeout(async () => {
          // Aktualizujemy referencję do ostatnio zapisanych danych
          lastSavedDataRef.current = {
            cvData: JSON.parse(JSON.stringify(cvData)),
            template: selectedTemplate
          };
          
          await saveCV(true); // Zawsze zapisujemy jako kopię roboczą
        }, 5000); // zwiększono opóźnienie do 5 sekund

        return () => clearTimeout(autosaveTimeout);
      }
    }
  }, [cvData, selectedTemplate, activeSection, saveCV]);

  // Funkcja do tworzenia nowego CV
  const createNewCV = React.useCallback(() => {
    setCvData(initialCVData);
    setSelectedTemplate('nowoczesny');
    setSelectedJob(null);
    setCVName('Moje CV');
    setCurrentCVId(null);
    setActiveSection('personalData');
  }, []);

  // Funkcja do usuwania zapisanego CV
  const deleteSavedCV = React.useCallback(async (cvId: string): Promise<boolean> => {
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
      setSavedCVs(prevCVs => prevCVs.filter(cv => cv.id !== cvId));
      
      // Jeśli usunięto aktualnie załadowane CV, zresetuj stan
      if (currentCVId === cvId) {
        setCvData(initialCVData);
        setSelectedTemplate('nowoczesny');
        setSelectedJob(null);
        setCVName('Moje CV');
        setCurrentCVId(null);
        setActiveSection('personalData');
      }
      
      return true;
    } catch (error) {
      console.error("Wystąpił błąd podczas usuwania CV:", error);
      return false;
    }
  }, [supabase, currentCVId]);

  // Inicjalizacja lastSavedDataRef po pierwszym załadowaniu danych
  useEffect(() => {
    if (cvData) {
      lastSavedDataRef.current = {
        cvData: JSON.parse(JSON.stringify(cvData)),
        template: selectedTemplate
      };
    }
  }, []); // Tylko przy pierwszym renderowaniu

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
        jobAnalysis,
        // Dodajemy nowe wartości do kontekstu, ale bez powiadomień
        savedJobs,
        isLoadingJobs
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