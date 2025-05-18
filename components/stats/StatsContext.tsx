"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
// import { createModel, logTokenUsage } from "@/lib/gemini-client";

// Definicje typów
export interface PortalData {
  name: string;
  value: number;
  color: string;
  gradientColor: string;
}

export interface SalaryRange {
  range: string;
  count: number;
}

export interface StatusData {
  name: string;
  value: number;
  color: string;
  gradientColor: string;
}

export interface SkillItem {
  name: string;
  count: number;
  color: string;
  gradientColor: string;
}

export interface TimelineDataPoint {
  date: string;
  saved: number;
  sent: number;
}

export interface TimelineTrend {
  date: string;
  count: number;
}

export interface ColumnStat {
  id: string;
  title: string;
  taskCount: number;
  color: string;
}

export interface TaskCompletionStats {
  completed: number;
  inProgress: number;
  todo: number;
  completionPercentage: number;
}

// Dodanie typu dla stanowisk
export interface JobPosition {
  title: string;
  count: number;
  color: string;
  originalTitles?: string[];
}

// Dodanie typu dla metryk aplikacyjnych
export interface ApplicationMetrics {
  sentPercentage: number;
  responsePercentage: number;
  responseTime: string;
  responseRate: number;
  totalOffers: number;
  averageSavedPerMonth: number;
  customCVCount: number;
  customCVPercentage: number;
  trainingCount: number;
}

// Interfejs kontekstu
interface StatsContextType {
  // Dane
  portals: PortalData[];
  salaryRanges: SalaryRange[];
  statuses: StatusData[];
  timelineData: TimelineDataPoint[];
  skills: SkillItem[];
  technologies: SkillItem[];
  positions: JobPosition[]; // Dodana nowa wartość dla stanowisk
  metrics: ApplicationMetrics; // Nowe metryki aplikacyjne
  
  // Stany ładowania
  isLoading: boolean;
  jobsLoading: boolean;
  skillsLoading: boolean;
  positionsLoading: boolean; // Dodany nowy stan ładowania
  metricsLoading: boolean; // Nowy stan ładowania dla metryk
}

// Domyślne wartości kontekstu
const defaultContextValue: StatsContextType = {
  portals: [],
  salaryRanges: [],
  statuses: [],
  timelineData: [],
  skills: [],
  technologies: [],
  positions: [], // Nowe puste stanowiska
  metrics: {
    sentPercentage: 0,
    responsePercentage: 0,
    responseTime: "-",
    responseRate: 0,
    totalOffers: 0,
    averageSavedPerMonth: 0,
    customCVCount: 0,
    customCVPercentage: 0,
    trainingCount: 0,
  },
  
  isLoading: true,
  jobsLoading: true,
  skillsLoading: true,
  positionsLoading: true, // Nowy stan ładowania
  metricsLoading: true, // Nowy stan ładowania
};

// Tworzenie kontekstu
const StatsContext = createContext<StatsContextType>(defaultContextValue);

// Hook do łatwego używania kontekstu
export const useStats = () => useContext(StatsContext);

// Provider kontekstu
export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stany dla wszystkich danych (tak jak w oryginalnym page.tsx)
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [salaryRanges, setSalaryRanges] = useState<SalaryRange[]>([]);
  const [statuses, setStatuses] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [technologies, setTechnologies] = useState<SkillItem[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [positions, setPositions] = useState<JobPosition[]>([]); // Nowy stan dla stanowisk
  const [positionsLoading, setPositionsLoading] = useState(true); // Nowy stan ładowania
  const [metrics, setMetrics] = useState<ApplicationMetrics>({
    sentPercentage: 0,
    responsePercentage: 0,
    responseTime: "Ładowanie...",
    responseRate: 0,
    totalOffers: 0,
    averageSavedPerMonth: 0,
    customCVCount: 0,
    customCVPercentage: 0,
    trainingCount: 0,
  }); // Nowy stan dla metryk
  const [metricsLoading, setMetricsLoading] = useState(true); // Nowy stan ładowania dla metryk

  // Kolory dla wykresów - pary kolorów dla gradientów
  const colors = [
    { start: "#3b82f6", end: "#60a5fa" }, // niebieski
    { start: "#8b5cf6", end: "#a78bfa" }, // fioletowy
    { start: "#ec4899", end: "#f472b6" }, // różowy
    { start: "#f59e0b", end: "#fbbf24" }, // pomarańczowy
    { start: "#10b981", end: "#34d399" }, // zielony
    { start: "#06b6d4", end: "#22d3ee" }, // turkusowy
    { start: "#6366f1", end: "#818cf8" }, // indygo
    { start: "#ef4444", end: "#f87171" }  // czerwony
  ];

  // Kolory dla stanowisk
  const positionColors = [
    "#3b82f6", // niebieski
    "#8b5cf6", // fioletowy
    "#ec4899", // różowy
    "#f59e0b", // pomarańczowy
    "#10b981", // zielony
    "#06b6d4", // turkusowy
    "#6366f1", // indygo
    "#ef4444"  // czerwony
  ];

  // Przypisanie koloru do elementu
  const getColorPair = (index: number) => colors[index % colors.length];

  useEffect(() => {
    console.log("StatsContext - useEffect start - pobieranie wszystkich danych");
    
    const fetchAllDataAndProcessStats = async () => {
      // Ustawiamy loading dla wszystkich części na początku
        setIsLoading(true);
      setJobsLoading(true);
      setSkillsLoading(true);
      setPositionsLoading(true);
      setMetricsLoading(true);

      try {
        const supabase = createClient();
        
        // --- Część 1: Pobieranie danych dla fetchCombinedData (portale, statusy, pensje, timeline) ---
        // (Ta logika jest w zasadzie taka sama jak w poprzednim fetchCombinedData)
        const { data: jobOffersForCombined, error: combinedError } = await supabase
          .from('job_offers')
          .select('site, status, salary, created_at'); // Dane potrzebne dla portali, statusów, pensji, timeline

        if (combinedError) {
          console.error("Błąd podczas pobierania danych dla combined stats:", combinedError);
          // Można ustawić błędy lub puste dane dla tych sekcji
          setPortals([]);
          setStatuses([]);
          setSalaryRanges([]);
          setTimelineData([]);
        } else if (jobOffersForCombined && jobOffersForCombined.length > 0) {
          // ... (cała logika przetwarzania dla portalData, statusData, salaryData, combinedTimelineData - jak poprzednio w fetchCombinedData)
          // Skopiuj tutaj całą logikę z oryginalnego fetchCombinedData przetwarzającą jobOffersForCombined
          const siteCountMap: Record<string, number> = {};
          const statusCountMap: Record<string, number> = {
            saved: 0, send: 0, contact: 0, interview: 0, offer: 0, rejected: 0
          };
          const salaryProcessed: Record<string, number> = {
            "Poniżej 5k": 0, "5k - 10k": 0, "10k - 15k": 0, 
            "15k - 20k": 0, "Powyżej 20k": 0
          };
          const trendDataSaved: Record<string, number> = {};
          const trendDataSent: Record<string, number> = {};
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          jobOffersForCombined.forEach(item => {
            const siteName = item.site || "Inne";
            siteCountMap[siteName] = (siteCountMap[siteName] || 0) + 1;
            if (item.status && item.status in statusCountMap) {
              statusCountMap[item.status as keyof typeof statusCountMap]++;
            }
            if (item.salary) {
              const match = item.salary.match(/\d+/g);
              if (match && match.length > 0) {
                const amount = parseInt(match[0]);
                if (amount < 5000) salaryProcessed["Poniżej 5k"]++;
                else if (amount < 10000) salaryProcessed["5k - 10k"]++;
                else if (amount < 15000) salaryProcessed["10k - 15k"]++;
                else if (amount < 20000) salaryProcessed["15k - 20k"]++;
                else salaryProcessed["Powyżej 20k"]++;
              }
            }
            if (item.created_at) {
              const createdDate = new Date(item.created_at);
              if (createdDate >= threeMonthsAgo) {
                const dateStr = createdDate.toISOString().split('T')[0];
                if (item.status === 'saved') trendDataSaved[dateStr] = (trendDataSaved[dateStr] || 0) + 1;
                else if (item.status === 'send') trendDataSent[dateStr] = (trendDataSent[dateStr] || 0) + 1;
              }
            }
          });
          
          const portalData = Object.entries(siteCountMap).map(([name, value], index) => {
            const colorPair = getColorPair(index); return { name, value, color: colorPair.start, gradientColor: colorPair.end };
          }).sort((a, b) => b.value - a.value).slice(0, 5);
          
          const statusMap = { saved: { name: "Zapisane", color: colors[0] }, send: { name: "Wysłane", color: colors[1] }, contact: { name: "Kontakt", color: colors[2] }, interview: { name: "Rozmowa", color: colors[3] }, offer: { name: "Oferta", color: colors[4] }, rejected: { name: "Odmowa", color: colors[7] } };
          const statusData = Object.entries(statusCountMap).filter(([_, count]) => count > 0).map(([status, value]) => {
            const statusInfo = statusMap[status as keyof typeof statusMap]; return { name: statusInfo.name, value, color: statusInfo.color.start, gradientColor: statusInfo.color.end };
            });
          
          const salaryData = Object.entries(salaryProcessed).map(([range, count]) => ({ range, count })).filter(item => item.count > 0);
          const allDates = new Set([...Object.keys(trendDataSaved), ...Object.keys(trendDataSent)]);
          const sortedDates = Array.from(allDates).sort();
          const combinedTimelineData: TimelineDataPoint[] = sortedDates.map(date => ({ date, saved: trendDataSaved[date] || 0, sent: trendDataSent[date] || 0 }));
          
          setPortals(portalData);
          setStatuses(statusData);
          setSalaryRanges(salaryData);
          setTimelineData(combinedTimelineData);
        }
        setJobsLoading(false); // jobsLoading dla combined data

        // --- Część 2: Pobieranie danych dla analizy Gemini (umiejętności, technologie, stanowiska) ---
        // Pobieramy job_analysis_results
        const { data: analysisData, error: analysisError } = await supabase
          .from('job_analysis_results')
          .select('skills, technologies');
        
        // Pobieramy tytuły z job_offers (jeśli nie mamy ich już z jobOffersForCombined w odpowiedniej formie)
        // Możemy reużyć jobOffersForCombined jeśli zawiera tytuły lub zrobić dedykowane zapytanie.
        // Dla bezpieczeństwa i jasności, zróbmy dedykowane, chyba że mamy pewność.
        // Jeśli jobOffersForCombined miało 'title', można zoptymalizować.
        const { data: offersForTitles, error: titlesError } = await supabase
          .from('job_offers')
          .select('title');

        let allSkillsList: string[] = [];
        let allTechnologiesList: string[] = [];
        let allTitles: string[] = [];

        if (analysisError) console.error("Błąd pobierania job_analysis_results:", analysisError);
        if (titlesError) console.error("Błąd pobierania tytułów z job_offers:", titlesError);
        
        if (analysisData && analysisData.length > 0) {
          analysisData.forEach(analysis => {
            if (analysis.skills && Array.isArray(analysis.skills)) {
              allSkillsList.push(...analysis.skills.map(s => String(s).trim()).filter(s => s));
            }
            if (analysis.technologies && Array.isArray(analysis.technologies)) {
              allTechnologiesList.push(...analysis.technologies.map(t => String(t).trim()).filter(t => t));
        }
          });
        }

        if (offersForTitles && offersForTitles.length > 0) {
          allTitles = offersForTitles
            .map(offer => offer.title)
            .filter(title => typeof title === 'string' && title.trim() !== '') as string[];
        }
        
        console.log("StatsContext: Przygotowane listy do wysłania do API:", 
          { skillsCount: allSkillsList.length, techCount: allTechnologiesList.length, titlesCount: allTitles.length }
        );
          
        // --- Część 3: Wywołanie API popular-stats z metodą POST ---
        if (allSkillsList.length > 0 || allTechnologiesList.length > 0 || allTitles.length > 0) {
          try {
            const apiResponse = await fetch('/api/popular-stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ allSkillsList, allTechnologiesList, allTitles }),
            });

            if (!apiResponse.ok) {
              throw new Error(`API popular-stats error! status: ${apiResponse.status}`);
            }
            const processedData = await apiResponse.json();
            setSkills(processedData.skills || []);
            setTechnologies(processedData.technologies || []);
            setPositions(processedData.positions || []);
          } catch (e) {
            console.error("Błąd wywołania API popular-stats lub przetwarzania odpowiedzi:", e);
            setSkills([]);
            setTechnologies([]);
            setPositions([]);
          }
        } else {
          console.log("StatsContext: Brak danych (umiejętności, technologie, tytuły) do wysłania do API popular-stats. Ustawianie pustych statystyk.");
          setSkills([]);
          setTechnologies([]);
          setPositions([]);
        }

      } catch (error) {
        console.error("Główny błąd w fetchAllDataAndProcessStats:", error);
        // Ustawienie domyślnych/pustych wartości dla wszystkich stanów w razie krytycznego błędu
        setPortals([]);
        setStatuses([]);
        setSalaryRanges([]);
        setTimelineData([]);
        setSkills([]);
        setTechnologies([]);
        setPositions([]);
        // Można też ustawić isLoading/jobsLoading etc. na false tutaj
      } finally {
        // Ustawienie stanów ładowania na false
        setIsLoading(false); // Ogólny loading
        // jobsLoading jest już ustawione wyżej
        setSkillsLoading(false);
        setPositionsLoading(false);
        // metricsLoading jest obsługiwane przez fetchMetrics
      }

      // --- Część 4: Pobieranie metryk aplikacyjnych (osobna funkcja, jak poprzednio) ---
      // Ta funkcja powinna być wywołana niezależnie lub po zakończeniu powyższych
      // Dla uproszczenia, zostawiam ją tak, jak była, ale można ją zintegrować z głównym blokiem try/catch/finally
      // lub zapewnić, że setMetricsLoading(false) jest wołane poprawnie.
    const fetchMetrics = async () => {
      try {
        console.log("StatsContext - Rozpoczęcie pobierania metryk");
          // setMetricsLoading(true); // Już ustawione na początku fetchAllDataAndProcessStats
        const supabase = createClient();
          const { data: jobOffersForMetrics, count: totalOffers } = await supabase
          .from('job_offers')
          .select('id, status, status_changes, created_at', { count: 'exact' });
          console.log("StatsContext - Pobrane oferty pracy dla metryk:", jobOffersForMetrics ? jobOffersForMetrics.length : 0);
          const { count: customCVCount } = await supabase.from('user_cvs').select('id', { count: 'exact' }).not('job_offer_id', 'is', null);
          const { count: trainingCount } = await supabase.from('training_data').select('id', { count: 'exact' });
        console.log("StatsContext - Pobrane specjalne CV:", customCVCount || 0);
        console.log("StatsContext - Pobrane treningi:", trainingCount || 0);
        
          if (!jobOffersForMetrics || totalOffers === null) {
            setMetrics({ sentPercentage: 0, responsePercentage: 0, responseTime: "Brak danych", responseRate: 0, totalOffers: 0, averageSavedPerMonth: 0, customCVCount: 0, customCVPercentage: 0, trainingCount: trainingCount || 0 });
            setMetricsLoading(false);
          return;
        }
          // ... (reszta logiki fetchMetrics, jak była)
          let sentCount = 0; 
          let responseCount = 0; 
        const sentStatuses = ['send', 'contact', 'interview', 'offer', 'rejected'];
        const responseStatuses = ['contact', 'interview', 'offer', 'rejected'];
        let firstOfferDate: Date | null = null;
        let lastOfferDate: Date | null = null;
          jobOffersForMetrics.forEach(offer => {
          const status = offer.status || 'saved';
          if (sentStatuses.includes(status)) sentCount++;
          if (responseStatuses.includes(status)) responseCount++;
          if (offer.created_at) {
            const createdDate = new Date(offer.created_at);
              if (firstOfferDate === null || createdDate < firstOfferDate) firstOfferDate = createdDate;
              if (lastOfferDate === null || createdDate > lastOfferDate) lastOfferDate = createdDate;
          }
        });
        let averageSavedPerMonth = 0;
        if (firstOfferDate && lastOfferDate) {
            const monthsDiff = ((lastOfferDate as Date).getFullYear() - (firstOfferDate as Date).getFullYear()) * 12 + ((lastOfferDate as Date).getMonth() - (firstOfferDate as Date).getMonth()) + 1;
          const effectiveMonths = Math.max(1, monthsDiff);
          averageSavedPerMonth = Math.round(totalOffers / effectiveMonths);
        }
        const totalCount = totalOffers || 0;
        const sentPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;
        const responsePercentage = totalCount > 0 ? Math.round((responseCount / totalCount) * 100) : 0;
        const responseRate = sentCount > 0 ? Math.round((responseCount / sentCount) * 100) : 0;
        const customCvs = customCVCount || 0;
        const customCVPercentage = sentCount > 0 ? Math.round((customCvs / sentCount) * 100) : 0;
        let totalResponseTime = 0;
        let responseTimeCount = 0;
          jobOffersForMetrics.forEach(offer => {
          if (Array.isArray(offer.status_changes) && offer.status_changes.length >= 2) {
            let sendIndex = -1;
            for (let i = 0; i < offer.status_changes.length; i++) {
              const statusChange = offer.status_changes[i];
                if (statusChange && typeof statusChange === 'string' && statusChange.includes('send-')) { sendIndex = i; break; }
              }
            if (sendIndex !== -1 && sendIndex < offer.status_changes.length - 1) {
              const sendChangeStr = offer.status_changes[sendIndex];
              const sendTimestampMatch = sendChangeStr.match(/send-(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
              if (sendTimestampMatch && sendTimestampMatch[1]) {
                const sendDate = new Date(sendTimestampMatch[1]);
                let nextStatusChange = null;
                for (let i = sendIndex + 1; i < offer.status_changes.length; i++) {
                  const nextChange = offer.status_changes[i];
                    if (typeof nextChange === 'string' && (nextChange.includes('contact-') || nextChange.includes('interview-') || nextChange.includes('rejected-') || nextChange.includes('offer-'))) { nextStatusChange = nextChange; break; }
                }
                if (nextStatusChange) {
                  const nextStatusMatch = nextStatusChange.match(/[a-z]+-(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
                  if (nextStatusMatch && nextStatusMatch[1]) {
                    const responseDate = new Date(nextStatusMatch[1]);
                    const diffTime = Math.abs(responseDate.getTime() - sendDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      if (diffDays >= 1 && diffDays <= 180) { totalResponseTime += diffDays; responseTimeCount++; }
                  }
                }
              }
            }
          }
        });
          const avgResponseTime = responseTimeCount > 0 ? (totalResponseTime / responseTimeCount).toFixed(1) : "-";
          const formattedResponseTime = avgResponseTime !== "-" ? `${avgResponseTime} dni` : "Brak danych";
          console.log("StatsContext - Przygotowane metryki:", { sentPercentage, responsePercentage, responseTime: formattedResponseTime, responseRate, totalOffers: totalCount, averageSavedPerMonth, customCVCount: customCvs, customCVPercentage, trainingCount: trainingCount || 0 });
          setMetrics({ sentPercentage, responsePercentage, responseTime: formattedResponseTime, responseRate, totalOffers: totalCount, averageSavedPerMonth, customCVCount: customCvs, customCVPercentage, trainingCount: trainingCount || 0 });
      } catch (error) {
        console.error("Błąd podczas pobierania metryk:", error);
          // W przypadku błędu można ustawić domyślne metryki
          setMetrics({ sentPercentage: 0, responsePercentage: 0, responseTime: "Brak danych", responseRate: 0, totalOffers: 0, averageSavedPerMonth: 0, customCVCount: 0, customCVPercentage: 0, trainingCount: 0 });
      } finally {
        console.log("StatsContext - Zakończenie pobierania metryk, ustawienie metricsLoading=false");
        setMetricsLoading(false);
      }
    };

      // Wywołanie połączonej funkcji
      fetchMetrics(); // Wywołaj fetchMetrics po zakończeniu lub równolegle, jeśli to bezpieczne

    }; // Koniec fetchAllDataAndProcessStats
    
    // Wywołanie głównej funkcji pobierającej i przetwarzającej dane
    fetchAllDataAndProcessStats();

    // Usunięto stare wywołania: fetchCombinedData(), fetchPopularStatsFromAPI(), fetchMetrics()
    // Teraz wszystko jest w fetchAllDataAndProcessStats lub jest przez nią koordynowane
  }, []);

  // Wartość kontekstu, która będzie udostępniana
  const contextValue: StatsContextType = {
    portals,
    salaryRanges,
    statuses,
    timelineData,
    skills,
    technologies,
    positions,
    metrics,
    isLoading,
    jobsLoading,
    skillsLoading,
    positionsLoading,
    metricsLoading
  };

//   console.log("StatsContext - contextValue przed renderowaniem:", {
//     metricsLoading,
//     metrics
//   });

  return (
    <StatsContext.Provider value={contextValue}>
      {children}
    </StatsContext.Provider>
  );
}; 