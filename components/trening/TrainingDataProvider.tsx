import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { JobOffer, SavedCV, SearchResults, Question } from '@/types/database.types';

// Interfejsy
interface TrainingDataContextType {
  // Stany
  savedCVs: SavedCV[];
  jobOffers: JobOffer[];
  searchResults: SearchResults;
  questions: Question[];
  isGeneratingQuestions: boolean;
  isLoading: boolean;
  
  // Metody
  checkExistingCompanyData: (jobOffer: JobOffer) => Promise<void>;
  searchCompanyInfo: (jobOffer: JobOffer) => Promise<void>;
  checkExistingQuestions: (jobOffer: JobOffer, selectedCV?: SavedCV) => Promise<void>;
  generateJobSpecificQuestions: (jobOffer: JobOffer, selectedCV?: SavedCV) => Promise<void>;
}

const TrainingDataContext = createContext<TrainingDataContextType | null>(null);

export const useTrainingData = () => {
  const context = useContext(TrainingDataContext);
  if (!context) {
    throw new Error('useTrainingData must be used within a TrainingDataProvider');
  }
  return context;
};

export function TrainingDataProvider({ children }: { children: React.ReactNode }) {
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResults>({
    companyInfo: "",
    employeeReviews: "",
    salaryInfo: "",
    isLoading: false,
    saved: false
  });

  const supabase = createClient();

  // Pobieranie początkowych danych
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Pobieranie CV
        const { data: cvsData, error: cvsError } = await supabase
          .from('user_cvs')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (cvsError) {
          console.error("Błąd podczas pobierania CV:", cvsError);
        } else if (cvsData) {
          setSavedCVs(cvsData);
        }

        // Pobieranie ofert pracy
        const { data: offersData, error: offersError } = await supabase
          .from('job_offers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (offersError) {
          console.error("Błąd podczas pobierania ofert pracy:", offersError);
        } else if (offersData) {
          setJobOffers(offersData);
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // Sprawdzanie istniejących danych firmy
  const checkExistingCompanyData = async (jobOffer: JobOffer) => {
    if (!jobOffer) return;
    
    setSearchResults(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase
        .from('training_data')
        .select('*')
        .eq('job_offer_id', jobOffer.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Błąd podczas sprawdzania danych w bazie:", error);
        throw error;
      }
      
      if (data) {
        setSearchResults({
          companyInfo: data.company_info || "Nie znaleziono informacji o firmie.",
          employeeReviews: data.employee_reviews || "Nie znaleziono opinii pracowników.",
          salaryInfo: data.salary_info || "Nie znaleziono informacji o wynagrodzeniach.",
          competitorsSimilarities: data.competitors_info || "Nie znaleziono informacji o konkurencji.",
          isLoading: false,
          groundingLinks: data.grounding_links || [],
          saved: true
        });
      } else {
        await searchCompanyInfo(jobOffer);
      }
    } catch (error) {
      console.error("Błąd podczas sprawdzania danych w bazie:", error);
      await searchCompanyInfo(jobOffer);
    }
  };

  // Wyszukiwanie informacji o firmie
  const searchCompanyInfo = async (jobOffer: JobOffer) => {
    if (!jobOffer) return;
    
    setSearchResults(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/gemini-search-with-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyName: jobOffer.company,
          position: jobOffer.title
        })
      });
      
      if (!response.ok) {
        throw new Error(`Błąd API: ${response.status}`);
      }
      
      const data = await response.json();
      
      const results = {
        companyInfo: data.companyInfo || "Nie znaleziono informacji o firmie.",
        employeeReviews: data.employeeReviews || "Nie znaleziono opinii pracowników.",
        salaryInfo: data.salaryInfo || "Nie znaleziono informacji o wynagrodzeniach.",
        competitorsSimilarities: data.competitorsSimilarities || "Nie znaleziono informacji o konkurencji.",
        isLoading: false,
        groundingLinks: data.groundingLinks || [],
        saved: false
      };
      
      await saveCompanyData(results, jobOffer);
      setSearchResults(results);
    } catch (error) {
      console.error("Błąd podczas wyszukiwania informacji o firmie:", error);
      setSearchResults({
        ...searchResults,
        companyInfo: "Przepraszamy, wystąpił błąd podczas wyszukiwania informacji. Spróbuj ponownie później.",
        employeeReviews: "",
        salaryInfo: "",
        competitorsSimilarities: "",
        isLoading: false,
        saved: false
      });
    }
  };

  // Zapisywanie danych firmy
  const saveCompanyData = async (results: SearchResults, jobOffer: JobOffer) => {
    if (!jobOffer) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        console.error("Nie można zapisać danych - użytkownik nie jest zalogowany");
        return;
      }
      
      const { error } = await supabase
        .from('training_data')
        .upsert({
          user_id: userId,
          job_offer_id: jobOffer.id,
          company_info: results.companyInfo,
          employee_reviews: results.employeeReviews,
          salary_info: results.salaryInfo,
          competitors_info: results.competitorsSimilarities,
          grounding_links: results.groundingLinks,
          created_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error("Błąd podczas zapisywania danych firmy:", error);
        return;
      }
      
      setSearchResults(prev => ({ ...prev, saved: true }));
    } catch (error) {
      console.error("Błąd podczas zapisywania danych firmy:", error);
    }
  };

  // Sprawdzanie istniejących pytań
  const checkExistingQuestions = async (jobOffer: JobOffer, selectedCV?: SavedCV) => {
    if (!jobOffer) return;
    
    setIsGeneratingQuestions(true);

    try {
      const { data, error } = await supabase
        .from('training_data')
        .select('questions')
        .eq('job_offer_id', jobOffer.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Błąd podczas pobierania pytań z bazy:", error);
        throw error;
      }
      
      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        await generateJobSpecificQuestions(jobOffer, selectedCV);
      }
    } catch (error) {
      console.error("Błąd podczas sprawdzania pytań w bazie:", error);
      await generateJobSpecificQuestions(jobOffer, selectedCV);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Generowanie pytań
  const generateJobSpecificQuestions = async (jobOffer: JobOffer, selectedCV?: SavedCV) => {
    if (!jobOffer) return;
    
    setIsGeneratingQuestions(true);
    setQuestions([]);
    console.log("Generowanie pytań dla oferty:", jobOffer.id, selectedCV ? `z CV: ${selectedCV.id}` : '');
    
    const allQuestions: Question[] = [];
    let totalInputTokensOverall = 0;
    let totalOutputTokensOverall = 0;
    const totalGroups = selectedCV ? 4 : 3;
    
    try {
      for (let groupNum = 1; groupNum <= totalGroups; groupNum++) {
        console.log(`Rozpoczynam generowanie grupy ${groupNum}/${totalGroups}`);
        
        try {
          const requestData: any = {
            company: jobOffer.company,
            title: jobOffer.title,
            full_description: jobOffer.full_description,
            group: groupNum
          };
          
          if (groupNum === 4 && selectedCV) {
            const { data: cvDataRecord, error: cvError } = await supabase
              .from('user_cvs')
              .select('cv_data')
              .eq('id', selectedCV.id)
              .single();
            
            if (cvError) {
              console.error("Błąd podczas pobierania danych CV dla grupy 4:", cvError);
              continue; 
            }
            if (cvDataRecord && cvDataRecord.cv_data) {
              requestData.cv_data = cvDataRecord.cv_data;
            } else {
              console.warn("Brak danych CV (cv_data) dla grupy 4, mimo że selectedCV istnieje.");
              continue;
            }
          }
          
          const response = await fetch('/api/interview-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          });
          
          const data = await response.json();

          if (!response.ok) {
            console.warn(`Odpowiedź API ze statusem błędu (grupa ${groupNum}): ${response.status}. Treść:`, data?.error || 'Brak dodatkowych informacji o błędzie.');
            continue; 
          }
          
          console.log(`Odpowiedź API dla grupy ${groupNum}:`, data);
          
          if (data.success && data.questions && data.questions.length > 0) {
            allQuestions.push(...data.questions);
            setQuestions([...allQuestions]);

            // Agregacja tokenów
            if (data.inputTokens) totalInputTokensOverall += data.inputTokens;
            if (data.outputTokens) totalOutputTokensOverall += data.outputTokens;
            console.log(`Tokeny dla grupy ${groupNum}: IN=${data.inputTokens || 0}, OUT=${data.outputTokens || 0}. Suma dotychczasowa: IN=${totalInputTokensOverall}, OUT=${totalOutputTokensOverall}`);

          } else if (data.error) {
            console.error(`Błąd API (grupa ${groupNum}):`, data.error);
          } else {
            console.warn(`Brak pytań w odpowiedzi API lub odpowiedź nie zawiera sukcesu (grupa ${groupNum})`, data);
          }
          
        } catch (groupError) {
          console.error(`Błąd krytyczny podczas generowania pytań grupy ${groupNum}:`, groupError);
        }
      }
      
      console.log(`Wygenerowano łącznie ${allQuestions.length} pytań.`);
      allQuestions.sort((a, b) => a.id - b.id);
      setQuestions(allQuestions);
      
      if (allQuestions.length > 0) {
        await saveQuestions(allQuestions, jobOffer);
      }

      // Logowanie sumarycznego zużycia tokenów
      console.log("--- PODSUMOWANIE ZUŻYCIA TOKENÓW (CAŁY PROCES) ---");
      console.log(`Całkowite tokeny wejściowe: ${totalInputTokensOverall}`);
      console.log(`Całkowite tokeny wyjściowe: ${totalOutputTokensOverall}`);
      console.log(`SUMA TOKENÓW (IN + OUT): ${totalInputTokensOverall + totalOutputTokensOverall}`);
      console.log("-----------------------------------------------------");
      
    } catch (error) {
      console.error("Błąd krytyczny podczas całego procesu generowania pytań:", error);
      if (allQuestions.length === 0) setQuestions([]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Zapisywanie pytań
  const saveQuestions = async (questionsToSave: Question[], jobOffer: JobOffer) => {
    if (!jobOffer) return;
    
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      
      if (!userId) {
        console.error("Nie można zapisać pytań - użytkownik nie jest zalogowany");
        return;
      }
      
      const { error } = await supabase
        .from('training_data')
        .upsert({
          user_id: userId,
          job_offer_id: jobOffer.id,
          questions: questionsToSave,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,job_offer_id'
        });
      
      if (error) {
        console.error("Błąd podczas zapisywania pytań:", error);
      }
    } catch (error) {
      console.error("Błąd podczas zapisywania pytań:", error);
    }
  };

  const value = {
    savedCVs,
    jobOffers,
    searchResults,
    questions,
    isGeneratingQuestions,
    isLoading,
    checkExistingCompanyData,
    searchCompanyInfo,
    checkExistingQuestions,
    generateJobSpecificQuestions
  };

  return (
    <TrainingDataContext.Provider value={value}>
      {children}
    </TrainingDataContext.Provider>
  );
} 