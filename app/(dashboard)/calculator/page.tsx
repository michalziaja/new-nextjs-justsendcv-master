"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorInput } from "@/components/calculator/calculator-input";
import { CalculationTable } from "@/components/calculator/calculation-table";
import { SalaryTools } from "@/components/calculator/job-goal";
import { SalaryChecker } from "@/components/calculator/salary-checker";
import { JobGoalContent } from "@/components/calculator/job-goal";
import { IntegratedCalculator } from "@/components/calculator/integrated-calculator";
import { CalculationResults, defaultResults, UopContractType } from "@/components/calculator/utils/types";

import { useState, useCallback } from "react";

export default function CalculatorPage() {
  // Stan aktywnych zakładek
  const [contractType, setContractType] = useState<string>("umowa");
  const [subType, setSubType] = useState<UopContractType>("pracaUop");
  const [b2bType, setB2bType] = useState<"ogolne" | "liniowy" | "ryczalt">("ogolne");
  const [toolsTab, setToolsTab] = useState<string>("wyszukaj");
  
  // Stan dla wyników kalkulatora
  const [calculatorResults, setCalculatorResults] = useState<CalculationResults>(defaultResults);
  const [calcDirection, setCalcDirection] = useState<string>("brutto");
  
  // Stan dla symulatora podwyżki
  const [selectedRaisePercent, setSelectedRaisePercent] = useState<number>(0);
  
  // Funkcja do ustawiania typu kontraktu
  const handleContractChange = (value: string) => {
    setContractType(value);
    setCalculatorResults(defaultResults);
  };
  
  // Obsługa zmiany podtypu umowy
  const handleSubTypeChange = (value: string) => {
    if (contractType === "umowa") {
      setSubType(value as UopContractType);
    } else {
      if (value === "ogolne" || value === "liniowy" || value === "ryczalt") {
        setB2bType(value);
      }
    }
    setCalculatorResults(defaultResults);
  };
  
  // Funkcja odbierająca wyniki z kalkulatora
  const handleResultsUpdate = useCallback((results: CalculationResults, direction: string) => {
    setCalculatorResults(results);
    setCalcDirection(direction);
  }, []);

  // Pobierz aktualny podtyp
  const getCurrentSubType = () => {
    return contractType === "umowa" ? subType : b2bType;
  };
  
  return (
    <div className="flex flex-1 flex-col gap-0 p-2 transition-all duration-200
                    mb-6 ml-2 mr-2 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
                    lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-15 xl:mr-15 xl:mt-12">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 ">
        <div className="bg-transparent lg:col-span-2 space-y-4 ">
          <div className="bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-4">
            <IntegratedCalculator 
              onResultsUpdate={handleResultsUpdate} 
              initialContractType={subType as UopContractType}
              contractTypeMain={contractType}
              onContractTypeMainChange={handleContractChange}
              initialB2bType={b2bType}
              onB2bTypeChange={handleSubTypeChange}
            />
          </div>
          
          <div className="bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-4 min-h-[42vh]">
            <CalculationTable 
              results={calculatorResults}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-4 max-h-[80vh] sticky top-4">
            {/* <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#00B2FF] to-blue-600 bg-clip-text text-transparent">Narzędzia płacowe</h2> */}
            
            <Tabs value={toolsTab} onValueChange={setToolsTab} className="w-full mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="wyszukaj"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Wyszukaj oferty
                </TabsTrigger>
                <TabsTrigger 
                  value="zarobki"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Sprawdź zarobki
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {toolsTab === "wyszukaj" ? (
              <JobGoalContent embedded={true} />
            ) : (
              <SalaryChecker />
            )}
          </div>
        </div>
      </div>
    
    </div>
  );
} 