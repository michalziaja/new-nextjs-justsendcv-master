"use client"

import React, { useEffect, useState } from "react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Import sekcji statystyk
import { KeyMetricsSection } from "@/components/stats/key-metrics"
import { JobOffersSection } from "@/components/stats/job-offers"
import { SkillsCard } from "@/components/stats/skills-card"
import { TechnologiesCard } from "@/components/stats/technologies-card"
import { PopularPositions } from "@/components/stats/popular-positions"
import { PortalsStatusesSection } from "@/components/stats/portals-statuses"
import { SalaryChartSection } from "@/components/stats/salary-chart"
import { createClient } from "@/utils/supabase/client"

// Typy danych
interface PortalData {
  name: string;
  value: number;
  color: string;
  gradientColor: string;
}

interface SalaryRange {
  range: string;
  count: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
  gradientColor: string;
}

interface SkillItem {
  name: string;
  count: number;
  color: string;
  gradientColor: string;
}

interface TimelineDataPoint {
  date: string;
  saved: number;
  sent: number;
}

interface TimelineTrend {
  date: string;
  count: number;
}

interface ColumnStat {
  id: string;
  title: string;
  taskCount: number;
  color: string;
}

interface TaskCompletionStats {
  completed: number;
  inProgress: number;
  todo: number;
  completionPercentage: number;
}

export default function StatsPage() {
  // Stany dla danych kombinowanych statystyk
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [salaryRanges, setSalaryRanges] = useState<SalaryRange[]>([]);
  const [statuses, setStatuses] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stany dla danych trendów ofert pracy
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Stany dla danych umiejętności
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [technologies, setTechnologies] = useState<SkillItem[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

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

  // Przypisanie koloru do elementu
  const getColorPair = (index: number) => colors[index % colors.length];

  useEffect(() => {
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

    // Pobranie danych
    fetchCombinedData();
    fetchSkillsData();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 transition-all duration-200">
      {/* <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Statystyki</h2>
          <p className="text-muted-foreground">
            Przegląd Twoich statystyk i postępów w poszukiwaniu pracy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6 text-blue-500" />
        </div>
      </div> */}
      
      <div className="mb-14 ml-2 mr-2 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
      lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-15 xl:mr-15 xl:mt-12">
        {/* Sekcja statystyk (skuteczność aplikowania, portale/statusy, wynagrodzenia) */}
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-3">
          {/* Skuteczność aplikowania */}
          <div className="lg:col-span-1 flex flex-col">
            <Suspense fallback={<div className="h-[230px]"><Skeleton className="w-full h-full" /></div>}>
              <KeyMetricsSection />
            </Suspense>
          </div>
          
          {/* Portale i statusy z zakładkami */}
          <div className="lg:col-span-1 flex flex-col">
            <PortalsStatusesSection 
              portals={portals}
              statuses={statuses}
              isLoading={isLoading}
            />
          </div>
          
          {/* Wynagrodzenia w ofertach */}
          <div className="lg:col-span-1 flex flex-col">
            <SalaryChartSection 
              salaryRanges={salaryRanges}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Sekcja trendu ofert pracy */}
        <div className="mt-2">
          <JobOffersSection 
            timelineData={timelineData}
            isLoading={jobsLoading}
          />
        </div>
        
        {/* Sekcja analizy umiejętności i popularnych stanowisk */}
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-3 mt-2">
          {/* Umiejętności i technologie */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <SkillsCard skills={skills} isLoading={skillsLoading} />
              <TechnologiesCard technologies={technologies} isLoading={skillsLoading} />
            </div>
          </div>
          
          {/* Popularne stanowiska */}
          <div className="lg:col-span-1">
            <PopularPositions />
          </div>
        </div>
      </div>
    </div>
  )
}
