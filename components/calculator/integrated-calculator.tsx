"use client";

import { useState, useEffect, useCallback } from "react";
// import { 
//   Card, 
//   CardContent, 
//   CardHeader, 
//   CardTitle 
// } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateUopSalary, calculateUopBrutto } from "./core/uop-calculator";
import { calculateZlecenieSalary, calculateZlecenieBrutto } from "./core/zlecenie-calculator";
import { calculateDzieloSalary, calculateDzieloBrutto } from "./core/dzielo-calculator";
import { UopOptionsState, CalculationResults, defaultResults, UopContractType } from "./utils/types";
import { calculateRaiseResults, calculatePeriodAmounts } from "./utils/calculation-utils";
import { ACCIDENT_RATES, PPK_RATES } from "./data/constants";
import { B2BCalculationOptions, calculateB2BSalary, calculateB2BBrutto, B2BCalculationResult } from "./core/b2b-calculator";
import { convertB2BToCalculationResults } from "./utils/b2b-conversion-utils";

// Interfejs dla propsów kalkulatora
interface IntegratedCalculatorProps {
  onResultsUpdate?: (results: CalculationResults, calcDirection: string) => void;
  initialContractType?: UopContractType;
  contractTypeMain?: string;
  onContractTypeMainChange?: (type: string) => void;
  initialB2bType?: "ogolne" | "liniowy" | "ryczalt";
  onB2bTypeChange?: (type: string) => void;
}

// Kalkulator wynagrodzeń (obecnie umowa o pracę i zlecenie)
export function IntegratedCalculator({ 
  onResultsUpdate, 
  initialContractType,
  contractTypeMain = "umowa",
  onContractTypeMainChange,
  initialB2bType = "ogolne",
  onB2bTypeChange
}: IntegratedCalculatorProps) {
  // Stan podstawowy
  const [amount, setAmount] = useState<number>(0);
  const [calcDirection, setCalcDirection] = useState<string>("brutto");
  const [contractType, setContractType] = useState<UopContractType>(initialContractType || "pracaUop");
  // Stan dla podtypu B2B
  const [b2bTypeTab, setB2bTypeTab] = useState<"ogolne" | "liniowy" | "ryczalt">(initialB2bType);
  
  // Opcje UoP
  const [options, setOptions] = useState<UopOptionsState>({
    uopUlga: false,
    uopPpk: false,
    uopPpkRate: "2",
    age: "over26",
    isPit2: true,
    isOutsideCity: false,
    uopAccidentRate: ACCIDENT_RATES[0],
    zlecenieEmerytalne: true,
    zlecenieRentowe: true,
    zlecenieChorobowe: false,
    dzieloKoszty: "50",
    calcDirection: "brutto",
    zlecenieSytuacja: "bezrobotny",
    zlecenieZdrowotne: true,
    zlecenieKUP: "20"
  });

  // Stan dla opcji kalkulatora B2B
  const [b2bActualOptions, setB2bActualOptions] = useState<B2BCalculationOptions>({
    taxType: initialB2bType === "ryczalt" ? "ogolne" : initialB2bType,
    vatRate: "23",
    costs: 0,
    zusType: "pelny",
    hasUlgaIPBox: false,
    hasPIT0: false,
    age: "over26"
  });
  
  // Wyniki obliczeń
  const [results, setResults] = useState<CalculationResults>(defaultResults);
  
  // Aktualizuj opcje UoP przy zmianie kierunku obliczeń
  useEffect(() => {
    setOptions(prev => ({ ...prev, calcDirection }));
  }, [calcDirection]);

  // Aktualizuj b2bActualOptions.taxType gdy zmienia się zakładka B2B (b2bTypeTab)
  // oraz wiek z ogólnego stanu 'options.age'
  useEffect(() => {
    setB2bActualOptions(prev => ({
      ...prev,
      taxType: b2bTypeTab === "ryczalt" ? "ogolne" : b2bTypeTab,
      age: options.age as ("under26" | "over26")
    }));
  }, [b2bTypeTab, options.age]);
  
  // Wykonaj obliczenia dla wybranego typu umowy
  useEffect(() => {
    if (amount <= 0) {
      setResults(defaultResults);
      if (onResultsUpdate) {
        onResultsUpdate(defaultResults, calcDirection);
      }
      return;
    }
    
    if (contractTypeMain === "b2b") {
      // --- Logika kalkulacji B2B ---
      const revenueNetBeforeVat = amount; // Kwota wpisana przez użytkownika to kwota netto (bez VAT)
      const vatRateValue = parseFloat(b2bActualOptions.vatRate) / 100;
      const calculatedVat = revenueNetBeforeVat * vatRateValue;
      const revenueWithVat = revenueNetBeforeVat + calculatedVat; // To jest przychód brutto (z VAT)

      // Logika dla ryczałtu (jeśli aktywna jest zakładka ryczałt) - wymaga dostosowania, jeśli amount to netto
      if (b2bTypeTab === "ryczalt") { 
        // Placeholder dla ryczałtu - przychód z VAT dla ryczałtu jest podstawą opodatkowania
        let grossAmountB2B_ryczalt = revenueWithVat; 
        // Uproszczone obliczenie zysku netto dla ryczałtu, np. 88% przychodu brutto (bardzo zgrubne!)
        let netAmountB2B_ryczalt = grossAmountB2B_ryczalt * 0.88; 

        const simplifiedB2BResults: CalculationResults = {
            netAmount: netAmountB2B_ryczalt,
            grossAmount: grossAmountB2B_ryczalt, // Na wykresie pokazujemy przychód z VAT
            employeeContributions: { 
                pension: 0, disability: 0, sickness: 0, health: 0, 
                tax: grossAmountB2B_ryczalt - netAmountB2B_ryczalt, // Uproszczony podatek
                ppk: 0 
            },
            employerContributions: { pension: 0, disability: 0, accident: 0, fp: 0, fgsp: 0, ppk: 0 },
            totalEmployerCost: grossAmountB2B_ryczalt,
            raiseResults: [],
            basis: { socialContributionsBasis: 0, healthContributionBasis: 0, taxBasis: grossAmountB2B_ryczalt },
            halfYearlyGross: grossAmountB2B_ryczalt * 6,
            halfYearlyNet: netAmountB2B_ryczalt * 6,
            yearlyGross: grossAmountB2B_ryczalt * 12,
            yearlyNet: netAmountB2B_ryczalt * 12,
            vatAmount: calculatedVat, // Obliczony VAT
            businessCosts: b2bActualOptions.costs, // Koszty z opcji
        };
        setResults(simplifiedB2BResults);
        if (onResultsUpdate) {
            onResultsUpdate(simplifiedB2BResults, "brutto"); 
        }
        return;
      }

      // Użyj kernela B2B dla "ogolne" i "liniowy"
      let b2bResult: B2BCalculationResult;
      
      // calculateB2BSalary oczekuje przychodu Z VAT
      b2bResult = calculateB2BSalary(revenueWithVat, b2bActualOptions); 
      
      const finalB2BResults = convertB2BToCalculationResults(
        revenueWithVat, // Przekazujemy przychód z VAT jako "grossAmount" do wykresu
        b2bResult.netAmount, 
        b2bActualOptions, 
        b2bResult
      );

      setResults(finalB2BResults);
      if (onResultsUpdate) {
        onResultsUpdate(finalB2BResults, "brutto"); // Dla B2B kierunek może być stały "brutto" (od przychodu)
      }
      return;
    }
    
    // --- Logika UoP, Zlecenie, Dzieło (istniejąca) ---
    let grossAmount = amount;
    let netAmount = 0;
    let fullResult;
    
    if (contractType === "pracaUop") {
      if (calcDirection === "netto") {
        grossAmount = calculateUopBrutto(amount, options);
        netAmount = amount;
        fullResult = calculateUopSalary(grossAmount, options);
      } else {
        fullResult = calculateUopSalary(amount, options);
        netAmount = fullResult.netAmount;
      }
    } else if (contractType === "zlecenie") {
      if (calcDirection === "netto") {
        grossAmount = calculateZlecenieBrutto(amount, options);
        netAmount = amount;
        fullResult = calculateZlecenieSalary(grossAmount, options);
      } else {
        fullResult = calculateZlecenieSalary(amount, options);
        netAmount = fullResult.netAmount;
      }
    } else if (contractType === "dzielo") {
      if (calcDirection === "netto") {
        grossAmount = calculateDzieloBrutto(amount, options);
        netAmount = amount;
        fullResult = calculateDzieloSalary(grossAmount, options);
      } else {
        fullResult = calculateDzieloSalary(amount, options);
        netAmount = fullResult.netAmount;
      }
    } else {
      return;
    }
    
    const raiseResults = calculateRaiseResults(
      grossAmount, 
      netAmount,
      (gross) => {
        if (contractType === "pracaUop") {
          return calculateUopSalary(gross, options).netAmount;
        } else if (contractType === "zlecenie") {
          return calculateZlecenieSalary(gross, options).netAmount;
        } else if (contractType === "dzielo") {
          return calculateDzieloSalary(gross, options).netAmount;
        }
        return 0;
      }
    );
    
    const periodAmounts = calculatePeriodAmounts(grossAmount, netAmount);
    
    const calculationResults = {
      netAmount,
      grossAmount,
      employeeContributions: fullResult.employeeContributions,
      employerContributions: fullResult.employerContributions,
      totalEmployerCost: fullResult.totalEmployerCost,
      raiseResults,
      basis: fullResult.basis,
      ...periodAmounts
    };
    
    setResults(calculationResults);
    
    if (onResultsUpdate) {
      onResultsUpdate(calculationResults, calcDirection);
    }
    
  }, [amount, calcDirection, options, contractType, contractTypeMain, b2bTypeTab, b2bActualOptions, onResultsUpdate]);
  
  // Obsługa zmiany kierunku obliczeń (głównie dla UoP)
  const handleCalcDirectionChange = (value: string) => {
    setCalcDirection(value);
  };
  
  // Obsługa zmiany stawki VAT dla B2B
  const handleVatRateChange = (value: B2BCalculationOptions['vatRate']) => {
    setB2bActualOptions(prev => ({ ...prev, vatRate: value }));
  };

  // Obsługa zmiany typu ZUS dla B2B
  const handleB2bZusTypeChange = (value: B2BCalculationOptions['zusType']) => {
    setB2bActualOptions(prev => ({ ...prev, zusType: value }));
  };

  // Obsługa zmiany kosztów B2B
  const handleB2bCostsChange = (value: number) => {
    setB2bActualOptions(prev => ({ ...prev, costs: value }));
  };

  // Obsługa zmiany opcji checkbox dla B2B
  const handleB2bCheckboxChange = (key: keyof B2BCalculationOptions, value: boolean) => {
    setB2bActualOptions(prev => ({ ...prev, [key]: value }));
  };
  
  // Obsługa zmiany opcji UoP (istniejąca)
  const handleOptionChange = useCallback((key: keyof UopOptionsState, value: string | number | boolean) => {
    // Jeśli zmieniamy wiek, zaktualizuj też wiek w opcjach B2B
    if (key === 'age') {
        setB2bActualOptions(prev => ({...prev, age: value as "under26" | "over26"}));
    }
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Obsługa zmiany głównego typu umowy (umowa/b2b)
  const handleMainContractTypeChange = (value: string) => {
    if (onContractTypeMainChange) {
      onContractTypeMainChange(value);
    }
  };
  
  // Obsługa zmiany zakładki B2B
  const handleB2bTypeTabChange = (value: string) => {
    const newB2bTypeTab = value as "ogolne" | "liniowy" | "ryczalt";
    setB2bTypeTab(newB2bTypeTab);
    if (onB2bTypeChange) {
      onB2bTypeChange(newB2bTypeTab);
    }
  };
  
  // Obsługa zmiany typu umowy (UoP, Zlecenie, Dzieło)
  const handleContractTypeChange = (value: string) => {
    const newType = value as UopContractType;
    setContractType(newType);
    // Resetowanie opcji specyficznych dla umowy (istniejąca logika)
    if (newType === "zlecenie") {
      setOptions(prev => ({
        ...prev,
        zlecenieEmerytalne: true,
        zlecenieRentowe: true,
        zlecenieChorobowe: false,
        zlecenieZdrowotne: true,
        zlecenieKUP: "20",
        zlecenieSytuacja: "bezrobotny"
      }));
    } else if (newType === "dzielo") {
      setOptions(prev => ({
        ...prev,
        dzieloKoszty: "50",
        dzieloSytuacja: "standard"
      }));
    }
  };
  
  // Obsługa zmiany kwoty
  const handleAmountChange = (value: number) => {
    setAmount(value);
  };
  
  // Aktualizacja typu B2B (zakładki) przy zmianie z zewnątrz
  useEffect(() => {
    if (initialB2bType && initialB2bType !== b2bTypeTab) {
      setB2bTypeTab(initialB2bType);
    }
  }, [initialB2bType, b2bTypeTab]);
  
  return (
    <div className="w-full">
      {/* Zakładki na górze kontenera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        {/* Pierwszy poziom zakładek: Umowa lub B2B */}
        <div className="flex-shrink-0 w-full sm:w-1/4">
          <Tabs value={contractTypeMain} onValueChange={handleMainContractTypeChange} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger 
                value="umowa" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                Umowa
              </TabsTrigger>
              <TabsTrigger 
                value="b2b" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                B2B
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Drugi poziom zakładek */}
        <div className="w-full sm:w-3/5">
          {contractTypeMain === "umowa" ? (
            <Tabs value={contractType} onValueChange={handleContractTypeChange} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger 
                  value="pracaUop" 
                  className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Umowa o pracę
                </TabsTrigger>
                <TabsTrigger 
                  value="zlecenie"
                  className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Zlecenie
                </TabsTrigger>
                <TabsTrigger 
                  value="dzielo" 
                  className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  O dzieło
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <Tabs value={b2bTypeTab} onValueChange={handleB2bTypeTabChange}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger 
                  value="ogolne" 
                  className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Skala podatkowa
                </TabsTrigger>
                <TabsTrigger 
                  value="liniowy" 
                  className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Liniowy
                </TabsTrigger>
                <TabsTrigger 
                  value="ryczalt" 
                  className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Ryczałt
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mb-6 bg-gradient-to-r from-[#00B2FF] to-blue-600 bg-clip-text text-transparent">
        Kalkulator wynagrodzeń
      </h2>
      
      {/* Panel formularza - zależny od typu umowy */}
      <div className="space-y-4 min-h-[25vh] overflow-y-auto">
        {/* Kwota i kierunek obliczeń - wspólne dla wszystkich typów */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="col-span-2">
            <Input 
              id="amount" 
              type="number" 
              placeholder={contractTypeMain === "b2b" ? "Wpisz kwotę netto usługi (bez VAT)" : "Wpisz kwotę wynagrodzenia"} 
              value={amount === 0 ? '' : amount} 
              onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div>
            {contractTypeMain === "b2b" ? (
              // Dla B2B - wybór stawki VAT
              <Select 
                value={b2bActualOptions.vatRate} 
                onValueChange={(value) => handleVatRateChange(value as B2BCalculationOptions['vatRate'])}
              >
                <SelectTrigger id="vat-rate">
                  <SelectValue placeholder="VAT..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% VAT</SelectItem>
                  <SelectItem value="5">5% VAT</SelectItem>
                  <SelectItem value="8">8% VAT</SelectItem>
                  <SelectItem value="23">23% VAT</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              // Dla umów tradycyjnych - brutto/netto
              <Select 
                value={calcDirection} 
                onValueChange={handleCalcDirectionChange}
              >
                <SelectTrigger id="calc-direction">
                  <SelectValue placeholder="Wybierz typ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brutto">Brutto</SelectItem>
                  <SelectItem value="netto">Netto</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        {/* Opcje specyficzne dla danego typu umowy/działalności */}
        {contractTypeMain === "umowa" ? (
          // Dla umowy - wybierz odpowiedni formularz w zależności od typu umowy
          contractType === "pracaUop" ? (
            // Pola dla umowy o pracę
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lewa kolumna dla UoP */}
              <div className="space-y-3">
                {/* Wiek pracownika */}
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="under-26"
                    checked={options.age === "under26"}
                    onChange={(e) => handleOptionChange('age', e.target.checked ? "under26" : "over26")}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <Label htmlFor="under-26" className="text-sm font-normal cursor-pointer">
                    Pracownik do 26 roku życia (zerowy PIT dla młodych)
                  </Label>
                </div>
                
                {/* Opcje podatku */}
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="pit2" 
                    checked={options.isPit2}
                    onChange={(e) => handleOptionChange('isPit2', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <Label htmlFor="pit2" className="text-sm font-normal cursor-pointer">
                    PIT-2 (kwota wolna 300 zł)
                  </Label>
                </div>
              
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="outside-city" 
                    checked={options.isOutsideCity}
                    onChange={(e) => handleOptionChange('isOutsideCity', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <Label htmlFor="outside-city" className="text-sm font-normal cursor-pointer">
                    Praca poza miejscem zamieszkania
                  </Label>
                </div>
                
                {/* Składka wypadkowa */}
                <div className="mt-3">
                  <div className="flex items-center space-x-4 min-h-[2rem]">
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Label htmlFor="accident-rate" className="text-sm font-medium">
                        Składka wypadkowa
                      </Label>
                    </div>
                    <div className="w-20 flex-shrink-0">
                      <Select 
                        value={options.uopAccidentRate} 
                        onValueChange={(value) => handleOptionChange('uopAccidentRate', value)}
                      >
                        <SelectTrigger id="accident-rate" className="h-8 text-sm">
                          <SelectValue placeholder="%" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCIDENT_RATES.map(rate => (
                            <SelectItem key={rate} value={rate}>{rate}%</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground flex-1">
                      Opłacana przez pracodawcę, zależna od branży
                    </p>
                  </div>
                </div>
            
                {/* PPK */}
                <div className="mt-3">
                  <div className="flex items-center space-x-4 min-h-[2rem]">
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <input 
                        type="checkbox" 
                        id="ppk" 
                        checked={options.uopPpk}
                        onChange={(e) => handleOptionChange('uopPpk', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <Label htmlFor="ppk" className="text-sm font-normal cursor-pointer">
                        Uczestnictwo w PPK
                      </Label>
                    </div>
                    {options.uopPpk && (
                      <div className="w-20 flex-shrink-0">
                        <Select 
                          value={options.uopPpkRate} 
                          onValueChange={(value) => handleOptionChange('uopPpkRate', value)}
                        >
                          <SelectTrigger id="ppk-rate" className="h-8 text-sm">
                            <SelectValue placeholder="%" />
                          </SelectTrigger>
                          <SelectContent>
                            {PPK_RATES.map(rate => (
                              <SelectItem key={rate} value={rate}>{rate}%</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {options.uopPpk && (
                      <p className="text-xs text-muted-foreground flex-1">
                        Składka pracodawcy: 1.5% wynagrodzenia
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Prawa kolumna dla UoP */}
              <div className="space-y-4">
                {/* Można dodać inne elementy w przyszłości */}
              </div>
            </div>
          ) : contractType === "zlecenie" ? (
            // Pola dla umowy zlecenia
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lewa kolumna dla Zlecenia */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="zlecenie-sytuacja" className="text-sm font-medium mb-1 block">
                      Sytuacja zawodowa zleceniobiorcy
                    </Label>
                    <Select 
                      value={options.zlecenieSytuacja} 
                      onValueChange={(value) => {
                        let zlecenieEmerytalne = false;
                        let zlecenieChorobowe = false;
                        let zlecenieZdrowotne = true;
                        if (value === "student") {
                          zlecenieEmerytalne = false;
                          zlecenieChorobowe = false;
                          zlecenieZdrowotne = false;
                        } else if (value === "pracownik-min") {
                          zlecenieEmerytalne = false;
                          zlecenieChorobowe = false;
                          zlecenieZdrowotne = true;
                        } else {
                          zlecenieEmerytalne = true;
                          zlecenieChorobowe = false;
                          zlecenieZdrowotne = true;
                        }
                        setOptions({ 
                          ...options, 
                          zlecenieSytuacja: value,
                          zlecenieEmerytalne,
                          zlecenieRentowe: zlecenieEmerytalne,
                          zlecenieChorobowe,
                          zlecenieZdrowotne,
                          age: value === "student" ? "under26" : options.age
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz sytuację..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Uczeń/student do 26 roku życia</SelectItem>
                        <SelectItem value="pracownik-min">Pracownik innej firmy (≥ od minimalnej)</SelectItem>
                        <SelectItem value="pracownik-pod-min">Pracownik innej firmy (&lt; od minimalnej)</SelectItem>
                        <SelectItem value="ta-sama-firma">Pracownik tej samej firmy</SelectItem>
                        <SelectItem value="bezrobotny">Osoba nigdzie niezatrudniona</SelectItem>
                        <SelectItem value="emeryt">Emeryt/rencista</SelectItem>
                        <SelectItem value="zlecenie-min">Kolejna umowa zlecenie (≥ od minimalnej)</SelectItem>
                        <SelectItem value="zlecenie-pod-min">Kolejna umowa zlecenie (&lt; od minimalnej)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="under-26-zlecenie"
                      checked={options.age === "under26"}
                      onChange={(e) => handleOptionChange('age', e.target.checked ? "under26" : "over26")}
                      disabled={options.zlecenieSytuacja === "student"} 
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <Label htmlFor="under-26-zlecenie" className={`text-sm font-normal cursor-pointer ${options.zlecenieSytuacja === "student" ? "text-gray-400" : ""}`}>
                      Do 26 roku życia (zerowy PIT)
                      {options.zlecenieSytuacja === "student" && <span className="text-xs text-muted-foreground ml-2">(automatycznie dla studenta)</span>}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="pit2-zlecenie" 
                      checked={options.isPit2}
                      onChange={(e) => handleOptionChange('isPit2', e.target.checked)}
                      disabled={options.zlecenieSytuacja === "student" || options.age === "under26"}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <Label htmlFor="pit2-zlecenie" className={`text-sm font-normal cursor-pointer ${(options.zlecenieSytuacja === "student" || options.age === "under26") ? "text-gray-400" : ""}`}>
                      PIT-2 (kwota wolna 300 zł)
                      {(options.zlecenieSytuacja === "student" || options.age === "under26") && <span className="text-xs text-muted-foreground ml-2">(brak podatku do 26 lat)</span>}
                    </Label>
                  </div>
                </div>
                {/* Prawa kolumna dla Zlecenia */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="zlecenie-koszty" className={`text-sm font-medium mb-1 block ${options.zlecenieSytuacja === "student" ? "text-gray-400" : ""}`}>
                      Koszty uzyskania przychodu
                    </Label>
                    <Select 
                      value={options.zlecenieKUP || "20"} 
                      onValueChange={(value) => handleOptionChange('zlecenieKUP', value)}
                      disabled={options.zlecenieSytuacja === "student"}
                    >
                      <SelectTrigger className={options.zlecenieSytuacja === "student" ? "opacity-50" : ""}>
                        <SelectValue placeholder="Wybierz koszty..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20% (standardowe)</SelectItem>
                        <SelectItem value="50">50% (prawa autorskie)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium block mb-2">Składki ZUS</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="emerytalne" 
                          checked={options.zlecenieEmerytalne}
                          onChange={(e) => handleOptionChange('zlecenieEmerytalne', e.target.checked)}
                          disabled={options.zlecenieSytuacja === "student" || ["pracownik-min", "emeryt", "zlecenie-min"].includes(options.zlecenieSytuacja || "") || ["pracownik-pod-min", "ta-sama-firma", "bezrobotny", "zlecenie-pod-min"].includes(options.zlecenieSytuacja || "")}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        />
                        <Label htmlFor="emerytalne" className="text-sm font-normal cursor-pointer">
                          Emerytalne i Rentowe
                          {options.zlecenieSytuacja === "student" && <span className="text-xs text-muted-foreground ml-2">(brak składek dla studenta)</span>}
                          {["pracownik-min", "emeryt", "zlecenie-min"].includes(options.zlecenieSytuacja || "") && <span className="text-xs text-muted-foreground ml-2">(brak składek w tej sytuacji)</span>}
                          {["pracownik-pod-min", "ta-sama-firma", "bezrobotny", "zlecenie-pod-min"].includes(options.zlecenieSytuacja || "") && <span className="text-xs text-muted-foreground ml-2">(obowiązkowe)</span>}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="chorobowe" 
                          checked={options.zlecenieChorobowe}
                          onChange={(e) => handleOptionChange('zlecenieChorobowe', e.target.checked)}
                          disabled={options.zlecenieSytuacja === "student" || ["pracownik-min", "emeryt", "zlecenie-min"].includes(options.zlecenieSytuacja || "") || !options.zlecenieEmerytalne}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        />
                        <Label htmlFor="chorobowe" className="text-sm font-normal cursor-pointer">
                          Chorobowe (dobrowolne)
                          {(options.zlecenieSytuacja === "student" || ["pracownik-min", "emeryt", "zlecenie-min"].includes(options.zlecenieSytuacja || "")) && <span className="text-xs text-muted-foreground ml-2">(nieaktywne w tej sytuacji)</span>}
                          {!options.zlecenieEmerytalne && !["pracownik-min", "emeryt", "zlecenie-min", "student"].includes(options.zlecenieSytuacja || "") && <span className="text-xs text-muted-foreground ml-2">(wymaga składki emerytalnej)</span>}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="zdrowotne" 
                          checked={options.zlecenieZdrowotne}
                          onChange={(e) => handleOptionChange('zlecenieZdrowotne', e.target.checked)}
                          disabled={options.zlecenieSytuacja === "student" || ["pracownik-min", "pracownik-pod-min", "ta-sama-firma", "bezrobotny", "emeryt", "zlecenie-min", "zlecenie-pod-min"].includes(options.zlecenieSytuacja || "")}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        />
                        <Label htmlFor="zdrowotne" className="text-sm font-normal cursor-pointer">
                          Zdrowotna (9%)
                          {options.zlecenieSytuacja === "student" && <span className="text-xs text-muted-foreground ml-2">(nieaktywne dla studenta)</span>}
                          {["pracownik-min", "pracownik-pod-min", "ta-sama-firma", "bezrobotny", "emeryt", "zlecenie-min", "zlecenie-pod-min"].includes(options.zlecenieSytuacja || "") && <span className="text-xs text-muted-foreground ml-2">(obowiązkowa)</span>}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : contractType === "dzielo" ? (
            // Pola dla umowy o dzieło
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lewa kolumna dla Dzieła */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dzielo-sytuacja" className="text-sm font-medium mb-1 block">
                      Sytuacja wykonawcy dzieła
                    </Label>
                    <Select 
                      value={options.dzieloSytuacja || "standard"} 
                      onValueChange={(value) => {
                        setOptions({ 
                          ...options, 
                          dzieloSytuacja: value,
                          age: value === "student" ? "under26" : options.age
                        });
                      }}
                    >
                      <SelectTrigger id="dzielo-sytuacja">
                        <SelectValue placeholder="Wybierz sytuację..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standardowa umowa o dzieło</SelectItem>
                        <SelectItem value="ta-sama-firma">Umowa z tym samym pracodawcą</SelectItem>
                        <SelectItem value="student">Uczeń/student do 26 lat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="under-26-dzielo"
                      checked={options.age === "under26"}
                      onChange={(e) => handleOptionChange('age', e.target.checked ? "under26" : "over26")}
                      disabled={options.dzieloSytuacja === "student"} 
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <Label htmlFor="under-26-dzielo" className={`text-sm font-normal cursor-pointer ${options.dzieloSytuacja === "student" ? "text-gray-400" : ""}`}>
                      Do 26 roku życia (zerowy PIT)
                      {options.dzieloSytuacja === "student" && <span className="text-xs text-muted-foreground ml-2">(automatycznie dla studenta)</span>}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="pit2-dzielo" 
                      checked={options.isPit2}
                      onChange={(e) => handleOptionChange('isPit2', e.target.checked)}
                      disabled={options.dzieloSytuacja === "student" || options.age === "under26"}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <Label htmlFor="pit2-dzielo" className={`text-sm font-normal cursor-pointer ${(options.dzieloSytuacja === "student" || options.age === "under26") ? "text-gray-400" : ""}`}>
                      PIT-2 (kwota wolna 300 zł)
                      {(options.dzieloSytuacja === "student" || options.age === "under26") && <span className="text-xs text-muted-foreground ml-2">(brak podatku do 26 lat)</span>}
                    </Label>
                  </div>
                </div>
                {/* Prawa kolumna dla Dzieła */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dzielo-koszty" className={`text-sm font-medium mb-1 block ${options.dzieloSytuacja === "student" ? "text-gray-400" : ""}`}>
                      Koszty uzyskania przychodu
                    </Label>
                    <Select 
                      value={options.dzieloKoszty || "50"} 
                      onValueChange={(value) => handleOptionChange('dzieloKoszty', value)}
                      disabled={options.dzieloSytuacja === "student"}
                    >
                      <SelectTrigger className={options.dzieloSytuacja === "student" ? "opacity-50" : ""}>
                        <SelectValue placeholder="Wybierz koszty..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20% (standardowe)</SelectItem>
                        <SelectItem value="50">50% (prace twórcze)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      50% - dla prac o charakterze twórczym
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-sm border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">Składki ZUS</div>
                    <p className="text-xs text-blue-700">
                      W standardowej umowie o dzieło zazwyczaj nie ma obowiązku opłacania składek ZUS. 
                      Wyjątkiem może być sytuacja, gdy umowa jest zawarta z tym samym pracodawcą.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null
        ) : (
          // Pola dla B2B
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lewa kolumna - Składki ZUS */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="b2b-zus" className="text-sm font-medium mb-1 block">
                    Składki ZUS
                  </Label>
                  <Select 
                    value={b2bActualOptions.zusType} 
                    onValueChange={(value) => handleB2bZusTypeChange(value as B2BCalculationOptions['zusType'])}
                  >
                    <SelectTrigger id="b2b-zus">
                      <SelectValue placeholder="Wybierz typ ZUS..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pelny">Pełny ZUS</SelectItem>
                      <SelectItem value="preferencyjny">Preferencyjny ZUS</SelectItem>
                      <SelectItem value="maly">Mały ZUS Plus</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Składki społeczne i zdrowotne
                  </p>
                </div>

                {/* Stawka ryczałtu - tylko gdy wybrano ryczałt */}
                {b2bTypeTab === "ryczalt" && (
                  <div>
                    <Label htmlFor="b2b-ryczalt-rate" className="text-sm font-medium mb-1 block">
                      Stawka ryczałtu (%)
                    </Label>
                     <Input 
                        id="b2b-ryczalt-rate-input"
                        type="number" 
                        placeholder="Np. 12" 
                        // value={b2bActualOptions.ryczaltRate || ''} // Dodaj ryczaltRate do B2BCalculationOptions jeśli potrzebne
                        // onChange={(e) => setB2bActualOptions(prev => ({...prev, ryczaltRate: parseFloat(e.target.value) || 0}))} 
                        // Na razie brak logiki dla ryczałtu w core
                      />
                    {/* <Select 
                      value={"12"} // Przykładowa wartość, wymaga podpięcia do stanu
                      onValueChange={() => {}} // Wymaga handlera
                    >
                      <SelectTrigger id="b2b-ryczalt-rate">
                        <SelectValue placeholder="Wybierz stawkę..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8.5">8.5% (dla większości IT)</SelectItem>
                        <SelectItem value="12">12% (programy komputerowe)</SelectItem>
                        <SelectItem value="15">15% (niektóre usługi)</SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>
                )}
              </div>
              
              {/* Prawa kolumna - Koszty */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="b2b-costs" className="text-sm font-medium mb-1 block">
                    Miesięczne koszty działalności (zł)
                  </Label>
                  <Input 
                    id="b2b-costs"
                    type="number" 
                    placeholder="Wpisz sumę wszystkich kosztów" 
                    value={b2bActualOptions.costs === 0 ? '' : b2bActualOptions.costs} 
                    onChange={(e) => handleB2bCostsChange(parseFloat(e.target.value) || 0)} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Suma wszystkich kosztów uzyskania przychodu
                  </p>
                </div>
              </div>
            </div>
            
            {/* Dodatkowe opcje podatkowe */}
            <div className="space-y-3 mt-4">
              <div className="text-sm font-medium">Dodatkowe opcje podatkowe</div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="under-26-b2b"
                  checked={options.age === "under26"}
                  onChange={(e) => handleOptionChange('age', e.target.checked ? "under26" : "over26")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <Label htmlFor="under-26-b2b" className="text-sm font-normal cursor-pointer">
                  Przedsiębiorca do 26 roku życia (zerowy PIT do 85 528 zł rocznie)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="ulga-ip-box" 
                  checked={b2bActualOptions.hasUlgaIPBox}
                  onChange={(e) => handleB2bCheckboxChange('hasUlgaIPBox', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <Label htmlFor="ulga-ip-box" className="text-sm font-normal cursor-pointer">
                  Ulga IP Box (5% podatku od kwalifikowanego dochodu)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="pit-0" 
                  checked={b2bActualOptions.hasPIT0}
                  onChange={(e) => handleB2bCheckboxChange('hasPIT0', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <Label htmlFor="pit-0" className="text-sm font-normal cursor-pointer">
                  PIT-0 dla powracających z zagranicy
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 