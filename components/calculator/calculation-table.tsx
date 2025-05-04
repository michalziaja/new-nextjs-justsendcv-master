"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculationResults } from "./utils/types";
import { PieChart } from "./pie-chart";
import { useState } from "react";

interface CalculationTableProps {
  results: CalculationResults;
}

export const CalculationTable: React.FC<CalculationTableProps> = ({ 
  results
}) => {
  const [activeTab, setActiveTab] = useState<"components" | "employer" | "yearly">("components");

  const showPlaceholder = results.grossAmount <= 0;

  return (
    <div className="w-full">
      <Tabs 
        defaultValue="components" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "components" | "employer" | "yearly")}
      >
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger 
            value="components"
            className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            Składowe wynagrodzenia
          </TabsTrigger>
          <TabsTrigger 
            value="employer"
            className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            Koszty pracodawcy
          </TabsTrigger>
          <TabsTrigger 
            value="yearly"
            className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            Podsumowanie roczne
          </TabsTrigger>
        </TabsList>

        <div className="w-full min-h-[300px] max-h-[40vh] overflow-y-auto">
          {showPlaceholder ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Wprowadź kwotę w kalkulatorze</h3>
              <p className="text-gray-500 max-w-md">Wprowadź kwotę w polu powyżej, aby zobaczyć szczegóły kalkulacji wynagrodzenia i wykres</p>
            </div>
          ) : (
            <PieChart 
              results={results} 
              activeTab={activeTab}
            />
          )}
        </div>
      </Tabs>
    </div>
  );
};