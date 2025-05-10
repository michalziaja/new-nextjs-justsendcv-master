"use client"

import React from "react"
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
import { useStats } from "@/components/stats/StatsContext"

export const StatsContainer: React.FC = () => {
  // Użycie hooka kontekstu statystyk
  const { 
    portals, 
    salaryRanges, 
    statuses, 
    timelineData, 
    skills, 
    technologies, 
    isLoading, 
    jobsLoading, 
    skillsLoading,
    metricsLoading,
    metrics
  } = useStats();
  
  // Dodajemy logi do debugowania
  React.useEffect(() => {
    console.log("StatsContainer - metricsLoading:", metricsLoading);
    console.log("StatsContainer - metrics:", metrics);
  }, [metrics, metricsLoading]);
  
  return (
    <div className="flex flex-1 flex-col gap-2 p-2 transition-all duration-200">
      <div className="mb-14 ml-2 mr-2 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
      lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-15 xl:mr-15 xl:mt-12">
        {/* Sekcja statystyk (skuteczność aplikowania, portale/statusy, wynagrodzenia) */}
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-3">
          {/* Skuteczność aplikowania */}
          <div className="lg:col-span-1 flex flex-col h-[250px]">
            <KeyMetricsSection />
          </div>
          
          {/* Portale i statusy z zakładkami */}
          <div className="lg:col-span-1 flex flex-col h-[250px]">
            <PortalsStatusesSection 
              portals={portals}
              statuses={statuses}
              isLoading={isLoading}
            />
          </div>
          
          {/* Wynagrodzenia w ofertach */}
          <div className="lg:col-span-1 flex flex-col h-[250px]">
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
              <div className="h-[250px]">
                <SkillsCard skills={skills} isLoading={skillsLoading} />
              </div>
              <div className="h-[250px]">
                <TechnologiesCard technologies={technologies} isLoading={skillsLoading} />
              </div>
            </div>
          </div>
          
          {/* Popularne stanowiska */}
          <div className="lg:col-span-1 h-[250px]">
            <PopularPositions />
          </div>
        </div>
      </div>
    </div>
  );
}; 