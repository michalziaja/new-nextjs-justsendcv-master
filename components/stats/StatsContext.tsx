"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

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
    
    // Funkcja pobierająca dane dla kombinowanych statystyk
    const fetchCombinedData = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Pobieranie danych o ofertach pracy
        const { data: jobOffers } = await supabase
          .from('job_offers')
          .select('site, status, salary, created_at');
        
        if (jobOffers && jobOffers.length > 0) {
          // 1. Obliczanie danych dla portali
          const siteCountMap: Record<string, number> = {};
          // 2. Obliczanie danych dla statusów
          const statusCountMap: Record<string, number> = {
            saved: 0, send: 0, contact: 0, interview: 0, offer: 0, rejected: 0
          };
          // 3. Analiza wynagrodzeń
          const salaryProcessed: Record<string, number> = {
            "Poniżej 5k": 0, "5k - 10k": 0, "10k - 15k": 0, 
            "15k - 20k": 0, "Powyżej 20k": 0
          };
          // 4. Obliczanie trendu czasowego (ostatnie 3 miesiące)
          const trendDataSaved: Record<string, number> = {};
          const trendDataSent: Record<string, number> = {};
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          jobOffers.forEach(item => {
            // Zliczanie portali
            const siteName = item.site || "Inne";
            siteCountMap[siteName] = (siteCountMap[siteName] || 0) + 1;
            
            // Zliczanie statusów
            if (item.status && item.status in statusCountMap) {
              statusCountMap[item.status as keyof typeof statusCountMap]++;
            }
            
            // Przetwarzanie wynagrodzeń - tylko oferty z podanym wynagrodzeniem
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
            
            // Obliczanie trendu czasowego
            if (item.created_at) {
              const createdDate = new Date(item.created_at);
              if (createdDate >= threeMonthsAgo) {
                const dateStr = createdDate.toISOString().split('T')[0];
                
                // Podział na zapisane i wysłane
                if (item.status === 'saved') {
                  trendDataSaved[dateStr] = (trendDataSaved[dateStr] || 0) + 1;
                } else if (item.status === 'send') {
                  trendDataSent[dateStr] = (trendDataSent[dateStr] || 0) + 1;
                }
              }
            }
          });
          
          // Przygotowanie danych o portalach
          const portalData = Object.entries(siteCountMap)
            .map(([name, value], index) => {
              const colorPair = getColorPair(index);
              return { 
                name, 
                value, 
                color: colorPair.start,
                gradientColor: colorPair.end 
              };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
          
          // Przygotowanie danych o statusach
          const statusMap = {
            saved: { name: "Zapisane", color: colors[0] },
            send: { name: "Wysłane", color: colors[1] },
            contact: { name: "Kontakt", color: colors[2] },
            interview: { name: "Rozmowa", color: colors[3] },
            offer: { name: "Oferta", color: colors[4] },
            rejected: { name: "Odmowa", color: colors[7] }
          };
          
          const statusData = Object.entries(statusCountMap)
            .filter(([_, count]) => count > 0)
            .map(([status, value]) => {
              const statusInfo = statusMap[status as keyof typeof statusMap];
              return {
                name: statusInfo.name,
                value,
                color: statusInfo.color.start,
                gradientColor: statusInfo.color.end
              };
            });
          
          // Przygotowanie danych o wynagrodzeniach
          const salaryData = Object.entries(salaryProcessed)
            .map(([range, count]) => ({ range, count }))
            .filter(item => item.count > 0);
          
          // Przygotowanie danych o trendzie z podziałem na zapisane i wysłane
          // Zbieranie wszystkich dat z obu zbiorów
          const allDates = new Set([
            ...Object.keys(trendDataSaved),
            ...Object.keys(trendDataSent)
          ]);
          
          // Sortowanie dat
          const sortedDates = Array.from(allDates).sort();
          
          // Tworzenie punktów danych z obiema wartościami
          const combinedTimelineData: TimelineDataPoint[] = sortedDates.map(date => ({
            date,
            saved: trendDataSaved[date] || 0,
            sent: trendDataSent[date] || 0
          }));
          
          // Aktualizacja stanów
          setPortals(portalData);
          setStatuses(statusData);
          setSalaryRanges(salaryData);
          setTimelineData(combinedTimelineData);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      } finally {
        setIsLoading(false);
        setJobsLoading(false);
      }
    };

    // Funkcja pobierająca dane dla umiejętności
    const fetchSkillsData = async () => {
      try {
        setSkillsLoading(true);
        const supabase = createClient();
        
        // Pobieranie danych o analizach ofert pracy
        const { data: analysisData } = await supabase
          .from('job_analysis_results')
          .select('skills, technologies');
        
        if (analysisData && analysisData.length > 0) {
          // Zliczanie umiejętności
          const skillsCount: Record<string, number> = {};
          const techCount: Record<string, number> = {};
          
          analysisData.forEach(analysis => {
            // Zliczanie umiejętności
            if (analysis.skills && Array.isArray(analysis.skills)) {
              analysis.skills.forEach((skill: string) => {
                skillsCount[skill] = (skillsCount[skill] || 0) + 1;
              });
            }
            
            // Zliczanie technologii
            if (analysis.technologies && Array.isArray(analysis.technologies)) {
              analysis.technologies.forEach((tech: string) => {
                techCount[tech] = (techCount[tech] || 0) + 1;
              });
            }
          });
          
          // Przygotowanie danych do wykresów
          const skillsData: SkillItem[] = Object.entries(skillsCount)
            .map(([name, count], index) => {
              const colorPair = getColorPair(index);
              return {
                name, 
                count, 
                color: colorPair.start,
                gradientColor: colorPair.end
              };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          
          const techData: SkillItem[] = Object.entries(techCount)
            .map(([name, count], index) => {
              const colorPair = getColorPair(index + 5);
              return { 
                name, 
                count, 
                color: colorPair.start,
                gradientColor: colorPair.end
              };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          
          setSkills(skillsData);
          setTechnologies(techData);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych o umiejętnościach:", error);
      } finally {
        setSkillsLoading(false);
      }
    };

    // Funkcja pobierająca dane o popularnych stanowiskach
    const fetchPositions = async () => {
      try {
        setPositionsLoading(true);
        const supabase = createClient();
        
        // Pobierz oferty pracy - możliwe, że struktura jest inna niż zakładano
        // Najpierw sprawdźmy, jakie kolumny są dostępne
        const { data: jobOffers, error } = await supabase
          .from('job_offers')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error("Błąd podczas pobierania przykładowej oferty:", error);
          return;
        }
        
        // Sprawdź, które kolumny są dostępne
        let titleColumn = 'title';
        if (jobOffers && jobOffers.length > 0) {
          const firstOffer = jobOffers[0];
          // Sprawdź, które pole zawiera tytuł stanowiska
          if ('position' in firstOffer) {
            titleColumn = 'position';
          } else if ('title' in firstOffer) {
            titleColumn = 'title';
          } else if ('job_title' in firstOffer) {
            titleColumn = 'job_title';
          } else if ('name' in firstOffer) {
            titleColumn = 'name';
          }
        }
        
        // Pobierz wszystkie oferty z odpowiednią kolumną
        const { data: allOffers, error: offersError } = await supabase
          .from('job_offers')
          .select(titleColumn);
        
        if (offersError) {
          console.error(`Błąd podczas pobierania danych z kolumny ${titleColumn}:`, offersError);
          return;
        }
        
        if (allOffers && allOffers.length > 0) {
          // Nowe podejście - grupujemy stanowiska w oparciu o ilość powtarzających się słów
          
          // Krok 1: Przygotuj listę tytułów i przekształć na małe litery do porównań
          const allTitles = allOffers
            .map(offer => {
              const title = offer[titleColumn as keyof typeof offer];
              return typeof title === 'string' ? title.toLowerCase().trim() : '';
            })
            .filter(title => title !== ''); // Usuń puste tytuły
          
          // Krok 2: Rozdziel tytuły na grupy na podstawie ilości słów
          const singleWordTitles: Record<string, number> = {};
          const multiWordTitles: string[] = [];
          
          allTitles.forEach(title => {
            const words = title.split(/\s+/).filter(word => word.length > 0);
            if (words.length === 1) {
              // Dla jednoczłonowych - proste zliczanie
              singleWordTitles[words[0]] = (singleWordTitles[words[0]] || 0) + 1;
            } else if (words.length > 1) {
              // Dla wieloczłonowych - zachowaj cały tytuł do dalszej analizy
              multiWordTitles.push(title);
            }
          });
          
          // Krok 3: Przetwarzanie wieloczłonowych tytułów - grupowanie na podstawie co najmniej 2 wspólnych słów
          interface TitleGroup {
            titles: string[];
            count: number;
            commonWords: string[];
          }
          
          const titleGroups: TitleGroup[] = [];
          
          multiWordTitles.forEach(title => {
            const words = title.split(/\s+/).filter(word => word.length > 0);
            
            // Sprawdź, czy ten tytuł pasuje do którejś z istniejących grup
            let foundGroup = false;
            
            for (const group of titleGroups) {
              // Znajdź ilość wspólnych słów między obecnym tytułem a grupą
              const commonWords = words.filter(word => 
                group.titles.some(groupTitle => 
                  groupTitle.split(/\s+/).includes(word)
                )
              );
              
              if (commonWords.length >= 2) {
                // Jeśli co najmniej 2 słowa są wspólne, dodaj do tej grupy
                group.titles.push(title);
                group.count++;
                // Zaktualizuj wspólne słowa dla grupy (tylko te, które występują w nowym tytule)
                group.commonWords = group.commonWords.filter(word => words.includes(word));
                foundGroup = true;
                break;
              }
            }
            
            // Jeśli nie znaleziono pasującej grupy, utwórz nową
            if (!foundGroup) {
              titleGroups.push({
                titles: [title],
                count: 1,
                commonWords: words
              });
            }
          });
          
          // Krok 4: Połącz jednoczłonowe i wieloczłonowe grupy w jeden format
          let positionItems: JobPosition[] = [];
          
          // Dodaj jednoczłonowe stanowiska
          Object.entries(singleWordTitles)
            .filter(([_, count]) => count > 1) // Tylko te, które występują więcej niż raz
            .forEach(([title, count], index) => {
              positionItems.push({
                title: title.charAt(0).toUpperCase() + title.slice(1), // Pierwsza litera duża
                count,
                color: positionColors[index % positionColors.length],
                originalTitles: [title]
              });
            });
          
          // Dodaj wieloczłonowe grupy
          titleGroups
            .filter(group => group.count > 1) // Tylko grupy z więcej niż jednym wystąpieniem
            .forEach((group, index) => {
              // Użyj najpopularniejszego tytułu jako reprezentanta grupy
              const representativeTitle = group.titles[0];
              positionItems.push({
                title: representativeTitle.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' '), // Każde słowo z dużej litery
                count: group.count,
                color: positionColors[(positionItems.length + index) % positionColors.length],
                originalTitles: group.titles
              });
            });
          
          // Sortuj według liczby wystąpień - od najczęstszych do najrzadszych
          positionItems = positionItems.sort((a, b) => b.count - a.count);
          
          // Ogranicz do top 15 stanowisk
          if (positionItems.length > 5) {
            positionItems = positionItems.slice(0, 5);
          }
          
          setPositions(positionItems);
        } else {
          console.log("Brak danych o ofertach pracy do analizy");
        }
      } catch (error) {
        console.error("Błąd podczas przetwarzania danych o stanowiskach:", error);
      } finally {
        setPositionsLoading(false);
      }
    };

    // Funkcja pobierająca dane dla metryk aplikacyjnych
    const fetchMetrics = async () => {
      try {
        console.log("StatsContext - Rozpoczęcie pobierania metryk");
        setMetricsLoading(true);
        const supabase = createClient();
        
        // Pobieranie danych o ofertach pracy i ich statusach
        const { data: jobOffers, count: totalOffers } = await supabase
          .from('job_offers')
          .select('id, status, status_changes, created_at', { count: 'exact' });
        
        console.log("StatsContext - Pobrane oferty pracy:", jobOffers ? jobOffers.length : 0);
        
        // Pobieranie danych o specjalnych CV
        const { data: customCVs, count: customCVCount } = await supabase
          .from('user_cvs')
          .select('id, job_offer_id', { count: 'exact' })
          .not('job_offer_id', 'is', null);
          
        // Pobieranie danych o treningach
        const { count: trainingCount } = await supabase
          .from('training_data')
          .select('id', { count: 'exact' });
          
        console.log("StatsContext - Pobrane specjalne CV:", customCVCount || 0);
        console.log("StatsContext - Pobrane treningi:", trainingCount || 0);
        
        if (!jobOffers || totalOffers === null) {
          // Brak danych - ustawienie domyślnych metryk
          setMetrics({
            sentPercentage: 0,
            responsePercentage: 0,
            responseTime: "Brak danych",
            responseRate: 0,
            totalOffers: 0,
            averageSavedPerMonth: 0,
            customCVCount: 0,
            customCVPercentage: 0,
            trainingCount: trainingCount || 0,
          });
          return;
        }
        
        // Liczenie statusów ofert zgodnie z nową logiką
        let sentCount = 0; // wysłane lub wyższy
        let responseCount = 0; // contact lub wyższy
        const sentStatuses = ['send', 'contact', 'interview', 'offer', 'rejected'];
        const responseStatuses = ['contact', 'interview', 'offer', 'rejected'];

        // Zmienne do obliczenia średniej ilości zapisanych ofert miesięcznie
        let firstOfferDate: Date | null = null;
        let lastOfferDate: Date | null = null;

        jobOffers.forEach(offer => {
          const status = offer.status || 'saved';
          if (sentStatuses.includes(status)) sentCount++;
          if (responseStatuses.includes(status)) responseCount++;

          // Aktualizacja dat dla obliczenia średniej miesięcznej
          if (offer.created_at) {
            const createdDate = new Date(offer.created_at);
            if (firstOfferDate === null || createdDate < firstOfferDate) {
              firstOfferDate = createdDate;
            }
            if (lastOfferDate === null || createdDate > lastOfferDate) {
              lastOfferDate = createdDate;
            }
          }
        });

        // Obliczanie średniej miesięcznej zapisanych ofert
        let averageSavedPerMonth = 0;
        if (firstOfferDate && lastOfferDate) {
          const monthsDiff = 
            ((lastOfferDate as Date).getFullYear() - (firstOfferDate as Date).getFullYear()) * 12 + 
            ((lastOfferDate as Date).getMonth() - (firstOfferDate as Date).getMonth()) + 1; // +1 aby uwzględnić bieżący miesiąc
          
          // Jeśli jest mniej niż miesiąc, ustaw na 1 aby uniknąć dzielenia przez 0
          const effectiveMonths = Math.max(1, monthsDiff);
          averageSavedPerMonth = Math.round(totalOffers / effectiveMonths);
        }
        
        // Obliczanie procentów
        const totalCount = totalOffers || 0;
        const sentPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;
        const responsePercentage = totalCount > 0 ? Math.round((responseCount / totalCount) * 100) : 0;
        const responseRate = sentCount > 0 ? Math.round((responseCount / sentCount) * 100) : 0;
        
        // Obliczanie procentu ofert z własnym CV
        const customCvs = customCVCount || 0;
        const customCVPercentage = sentCount > 0 ? Math.round((customCvs / sentCount) * 100) : 0;
        
        // Obliczanie średniego czasu odpowiedzi (od wysłania do następnej zmiany statusu)
        let totalResponseTime = 0;
        let responseTimeCount = 0;
        jobOffers.forEach(offer => {
          if (Array.isArray(offer.status_changes) && offer.status_changes.length >= 2) {
            // Znajdź indeks zmiany statusu na "send"
            let sendIndex = -1;
            for (let i = 0; i < offer.status_changes.length; i++) {
              const statusChange = offer.status_changes[i];
              if (statusChange && typeof statusChange === 'string' && statusChange.includes('send-')) {
                sendIndex = i;
                break;
              }
            }
            // Jeśli znaleziono zmianę na "send" i po niej jest kolejna zmiana
            if (sendIndex !== -1 && sendIndex < offer.status_changes.length - 1) {
              const sendChangeStr = offer.status_changes[sendIndex];
              const sendTimestampMatch = sendChangeStr.match(/send-(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
              if (sendTimestampMatch && sendTimestampMatch[1]) {
                const sendDate = new Date(sendTimestampMatch[1]);
                // Znajdź następną zmianę statusu po "send" (tylko contact lub wyższy)
                let nextStatusChange = null;
                for (let i = sendIndex + 1; i < offer.status_changes.length; i++) {
                  const nextChange = offer.status_changes[i];
                  if (typeof nextChange === 'string') {
                    if (nextChange.includes('contact-') || 
                        nextChange.includes('interview-') || 
                        nextChange.includes('rejected-') || 
                        nextChange.includes('offer-')) {
                      nextStatusChange = nextChange;
                      break;
                    }
                  }
                }
                if (nextStatusChange) {
                  const nextStatusMatch = nextStatusChange.match(/[a-z]+-(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
                  if (nextStatusMatch && nextStatusMatch[1]) {
                    const responseDate = new Date(nextStatusMatch[1]);
                    const diffTime = Math.abs(responseDate.getTime() - sendDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays >= 1 && diffDays <= 180) {
                      totalResponseTime += diffDays;
                      responseTimeCount++;
                    }
                  }
                }
              }
            }
          }
        });
        const avgResponseTime = responseTimeCount > 0 
          ? (totalResponseTime / responseTimeCount).toFixed(1) 
          : "-";
        const formattedResponseTime = avgResponseTime !== "-" 
          ? `${avgResponseTime} dni` 
          : "Brak danych";
          
        console.log("StatsContext - Przygotowane metryki:", {
          sentPercentage,
          responsePercentage,
          responseTime: formattedResponseTime,
          responseRate,
          totalOffers: totalCount,
          averageSavedPerMonth,
          customCVCount: customCvs,
          customCVPercentage,
          trainingCount: trainingCount || 0
        });
          
        setMetrics({
          sentPercentage,
          responsePercentage,
          responseTime: formattedResponseTime,
          responseRate,
          totalOffers: totalCount,
          averageSavedPerMonth,
          customCVCount: customCvs,
          customCVPercentage,
          trainingCount: trainingCount || 0
        });
      } catch (error) {
        console.error("Błąd podczas pobierania metryk:", error);
      } finally {
        console.log("StatsContext - Zakończenie pobierania metryk, ustawienie metricsLoading=false");
        setMetricsLoading(false);
      }
    };

    // Pobranie danych
    fetchCombinedData();
    fetchSkillsData();
    fetchPositions();
    fetchMetrics();
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