"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateUopSalary, calculateUopBrutto } from "./core/uop-calculator";
import { calculateZlecenieSalary, calculateZlecenieBrutto } from "./core/zlecenie-calculator";
import { UopOptionsState, CalculationResults, defaultResults, UopContractType } from "./utils/types";
import { calculateRaiseResults, calculatePeriodAmounts } from "./utils/calculation-utils";
import { ACCIDENT_RATES, PPK_RATES } from "./data/constants";

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
  const [b2bType, setB2bType] = useState<"ogolne" | "liniowy" | "ryczalt">(initialB2bType as "ogolne" | "liniowy" | "ryczalt");
  
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
  
  // Wyniki obliczeń
  const [results, setResults] = useState<CalculationResults>(defaultResults);
  
  // Aktualizuj opcje przy zmianie kierunku obliczeń
  useEffect(() => {
    setOptions(prev => ({ ...prev, calcDirection }));
  }, [calcDirection]);
  
  // Aktualizuj typ umowy przy zmianie z zewnątrz
  useEffect(() => {
    if (initialContractType && initialContractType !== contractType) {
      setContractType(initialContractType);
    }
  }, [initialContractType]);
  
  // Wykonaj obliczenia dla wybranego typu umowy
  useEffect(() => {
    if (amount <= 0) {
      setResults(defaultResults);
      // Wywołaj onResultsUpdate z domyślnymi wynikami, jeśli kwota jest 0
      if (onResultsUpdate) {
        onResultsUpdate(defaultResults, calcDirection);
      }
      return;
    }
    
    // Jeśli aktywny jest B2B, użyj prostego obliczenia jako placeholderu
    if (contractTypeMain === "b2b") {
      // Proste obliczenia dla B2B jako placeholder
      let grossAmount = amount;
      let netAmount = 0;
      
      if (calcDirection === "netto") {
        grossAmount = amount * 1.23; // Bardzo uproszczone obliczenie brutto dla B2B
        netAmount = amount;
      } else {
        netAmount = amount * 0.81; // Bardzo uproszczone obliczenie netto dla B2B
      }
      
      // Uproszczone składki i koszty
      const employerCost = grossAmount * 1.05;
      
      // Oblicz wyniki podwyżek
      const raiseResults = calculateRaiseResults(
        grossAmount, 
        netAmount,
        (gross) => gross * 0.81 // Najprostsze przybliżenie dla B2B
      );
      
      // Oblicz wartości półroczne i roczne
      const periodAmounts = calculatePeriodAmounts(grossAmount, netAmount);
      
      // Przygotuj wyniki
      const calculationResults = {
        netAmount,
        grossAmount,
        employeeContributions: {
          pension: 0,
          disability: 0,
          sickness: 0,
          health: 0,
          tax: grossAmount - netAmount,
          ppk: 0
        },
        employerContributions: {
          pension: 0,
          disability: 0,
          accident: 0,
          fp: 0,
          fgsp: 0,
          ppk: 0
        },
        totalEmployerCost: employerCost,
        raiseResults,
        basis: {
          socialContributionsBasis: 0,
          healthContributionBasis: 0,
          taxBasis: grossAmount
        },
        ...periodAmounts
      };
      
      // Ustaw wyniki
      setResults(calculationResults);
      
      // Przekaż wyniki wyżej
      if (onResultsUpdate) {
        onResultsUpdate(calculationResults, calcDirection);
      }
      
      return;
    }
    
    let grossAmount = amount;
    let netAmount = 0;
    let fullResult;
    
    // Wybierz odpowiedni kalkulator w zależności od typu umowy
    if (contractType === "pracaUop") {
      // Obliczenia dla umowy o pracę
      if (calcDirection === "netto") {
        grossAmount = calculateUopBrutto(amount, options);
        netAmount = amount;
        fullResult = calculateUopSalary(grossAmount, options);
      } else {
        fullResult = calculateUopSalary(amount, options);
        netAmount = fullResult.netAmount;
      }
    } else if (contractType === "zlecenie") {
      // Obliczenia dla umowy zlecenia
    if (calcDirection === "netto") {
        grossAmount = calculateZlecenieBrutto(amount, options);
      netAmount = amount;
        fullResult = calculateZlecenieSalary(grossAmount, options);
      } else {
        fullResult = calculateZlecenieSalary(amount, options);
        netAmount = fullResult.netAmount;
      }
    } else {
      // Dla innych typów umów w przyszłości
      return;
    }
    
    // Oblicz wyniki dla różnych procentów podwyżki
    const raiseResults = calculateRaiseResults(
      grossAmount, 
      netAmount,
      (gross) => {
        if (contractType === "pracaUop") {
          return calculateUopSalary(gross, options).netAmount;
        } else if (contractType === "zlecenie") {
          return calculateZlecenieSalary(gross, options).netAmount;
        }
        return 0;
      }
    );
    
    // Oblicz wartości półroczne i roczne
    const periodAmounts = calculatePeriodAmounts(grossAmount, netAmount);
    
    // Przygotuj obiekt wyników
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
    
    // Ustaw wyniki lokalnie
    setResults(calculationResults);
    
    // Przekaż wyniki do komponentu nadrzędnego, jeśli jest taka funkcja
    if (onResultsUpdate) {
      onResultsUpdate(calculationResults, calcDirection);
    }
    
  }, [amount, calcDirection, options, contractType, contractTypeMain, b2bType]);
  
  // Obsługa zmiany typu umowy
  const handleContractTypeChange = (value: UopContractType) => {
    setContractType(value);
    
    // Zresetuj niektóre opcje przy zmianie typu umowy
    // na domyślne dla danego typu
    if (value === "zlecenie") {
      setOptions(prev => ({
        ...prev,
        zlecenieEmerytalne: true,
        zlecenieRentowe: true,
        zlecenieChorobowe: false,
        zlecenieZdrowotne: true,
        zlecenieKUP: "20",
        zlecenieSytuacja: "bezrobotny"
      }));
    }
  };
  
  // Obsługa zmiany kwoty
  const handleAmountChange = (value: number) => {
    setAmount(value);
  };
  
  // Obsługa zmiany kierunku obliczeń
  const handleCalcDirectionChange = (value: string) => {
    setCalcDirection(value);
  };
  
  // Obsługa zmiany opcji
  const handleOptionChange = (key: keyof UopOptionsState, value: any) => {
    if (key === 'zlecenieEmerytalne' && contractType === 'zlecenie') {
      // Dla zlecenia, gdy zmienia się składka emerytalna, automatycznie aktualizuj rentową
      setOptions(prev => ({ 
        ...prev, 
        [key]: value,
        zlecenieRentowe: value // Rentowa idzie w parze z emerytalną
      }));
    } else {
      setOptions(prev => ({ ...prev, [key]: value }));
    }
  };
  
  // Obsługa zmiany głównego typu umowy (umowa/b2b)
  const handleMainContractTypeChange = (value: string) => {
    if (onContractTypeMainChange) {
      onContractTypeMainChange(value);
    }
  };
  
  // Obsługa zmiany zakładki B2B
  const handleB2bTypeChange = (value: string) => {
    if (value === "ogolne" || value === "liniowy" || value === "ryczalt") {
      setB2bType(value);
      if (onB2bTypeChange) {
        onB2bTypeChange(value);
      }
    }
  };
  
  // Aktualizacja typu B2B przy zmianie z zewnątrz
  useEffect(() => {
    if (initialB2bType && initialB2bType !== b2bType) {
      setB2bType(initialB2bType as "ogolne" | "liniowy" | "ryczalt");
    }
  }, [initialB2bType]);
  
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
            <Tabs value={contractType} onValueChange={value => handleContractTypeChange(value as UopContractType)}>
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
            <Tabs value={b2bType} onValueChange={handleB2bTypeChange}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger 
                  value="ogolne" 
                  className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Zasady ogólne
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
              placeholder="Wpisz kwotę wynagrodzenia" 
              value={amount === 0 ? '' : amount} 
              onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div>
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
          </div>
        </div>
        
        {/* Opcje specyficzne dla danego typu umowy/działalności */}
        {contractTypeMain === "umowa" ? (
          // Dla umowy - wybierz odpowiedni formularz w zależności od typu umowy
          contractType === "pracaUop" ? (
            // Pola dla umowy o pracę
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex items-center justify-between mt-1">
                    <Label htmlFor="accident-rate" className="text-sm font-medium mr-4">Składka wypadkowa</Label>
                    <div className="w-1/3">
                      <Select 
                        value={options.uopAccidentRate} 
                        onValueChange={(value) => handleOptionChange('uopAccidentRate', value)}
                      >
                        <SelectTrigger id="accident-rate" className="h-9">
                          <SelectValue placeholder="Wybierz stawkę..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCIDENT_RATES.map(rate => (
                            <SelectItem key={rate} value={rate}>{rate}%</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2 pb-3 ml-0">
                    Opłacana przez pracodawcę, zależna od branży
                  </p>
              
                {/* PPK */}
                  <div className="flex items-center space-x-2 mt-3">
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
                    <div className="flex items-center justify-between mt-1 ml-4">
                      <Label htmlFor="ppk-rate" className="text-sm font-medium">Twoja składka PPK</Label>
                      <div className="w-1/3">
                        <Select 
                          value={options.uopPpkRate} 
                          onValueChange={(value) => handleOptionChange('uopPpkRate', value)}
                        >
                          <SelectTrigger id="ppk-rate" className="h-9">
                            <SelectValue placeholder="Wybierz składkę..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PPK_RATES.map(rate => (
                              <SelectItem key={rate} value={rate}>{rate}%</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {options.uopPpk && (
                    <p className="text-xs text-muted-foreground pb-2 -mt-2 ml-4">
                      Składka pracodawcy: 1.5% wynagrodzenia
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Prawa kolumna - można dodać inne elementy w przyszłości */}
                </div>
              </div>
            ) : contractType === "zlecenie" ? (
              // Pola dla umowy zlecenia
              <div className="space-y-4">
                {/* Sytuacja zawodowa zleceniobiorcy - na całą szerokość */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zlecenie-sytuacja" className="text-sm font-medium mb-1 block">
                      Sytuacja zawodowa zleceniobiorcy
                    </Label>
                    <Select 
                      value={options.zlecenieSytuacja} 
                      onValueChange={(value) => {
                        // Automatycznie ustaw odpowiednie opcje na podstawie wybranej sytuacji
                        let zlecenieEmerytalne = false;
                        let zlecenieChorobowe = false;
                        let zlecenieZdrowotne = true;
                        let age = "over26";
                        
                        // Student do 26 lat: brak składek i podatku
                        if (value === "student") {
                          zlecenieEmerytalne = false;
                          zlecenieChorobowe = false;
                          zlecenieZdrowotne = false;
                          age = "under26";
                        } 
                        // Pracownik innej firmy z wynagrodzeniem >= minimalnego: tylko składka zdrowotna
                        else if (value === "pracownik-min") {
                          zlecenieEmerytalne = false;
                          zlecenieChorobowe = false;
                          zlecenieZdrowotne = true;
                        }
                        // Pozostałe przypadki (pracownik < min, ta sama firma, bezrobotny): pełne ZUS 
                        else {
                          zlecenieEmerytalne = true;
                          zlecenieChorobowe = false; // Domyślnie chorobowe wyłączone
                          zlecenieZdrowotne = true;
                        }
                        
                        // Zaktualizuj wszystkie opcje razem
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
                  
                  <div>
                    {/* Koszty uzyskania przychodu */}
                    <Label htmlFor="zlecenie-koszty" className={`text-sm font-medium mb-1 ml-3 block ${options.zlecenieSytuacja === "student" ? "text-gray-400" : ""}`}>
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
                </div>
                
                {/* Wszystkie checkboxy jeden pod drugim */}
                <div className="space-y-3">
                  {/* Wiek zleceniobiorcy */}
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
                      {options.zlecenieSytuacja === "student" && 
                      <span className="text-xs text-muted-foreground ml-2">(automatycznie dla studenta)</span>}
                    </Label>
                  </div>
                  
                  {/* PIT-2 */}
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
                      {(options.zlecenieSytuacja === "student" || options.age === "under26") && 
                      <span className="text-xs text-muted-foreground ml-2">(brak podatku do 26 lat)</span>}
                    </Label>
                  </div>
                  
                  {/* Składki ZUS */}
                  <div className="mt-1">
                    <Label className="text-sm font-medium block mb-2">Składki ZUS</Label>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <input 
                        type="checkbox" 
                        id="emerytalne" 
                        checked={options.zlecenieEmerytalne}
                        onChange={(e) => handleOptionChange('zlecenieEmerytalne', e.target.checked)}
                        disabled={
                          options.zlecenieSytuacja === "student" || 
                          ["pracownik-min", "emeryt", "zlecenie-min"].includes(options.zlecenieSytuacja || "") ||
                          ["pracownik-pod-min", "ta-sama-firma", "bezrobotny", "zlecenie-pod-min"].includes(options.zlecenieSytuacja || "")
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <Label htmlFor="emerytalne" className="text-sm font-normal cursor-pointer">
                        Emerytalne i Rentowe
                        {options.zlecenieSytuacja === "student" && 
                        <span className="text-xs text-muted-foreground ml-2">(brak składek dla studenta)</span>}
                        {["pracownik-min", "emeryt", "zlecenie-min"].includes(options.zlecenieSytuacja || "") && 
                        <span className="text-xs text-muted-foreground ml-2">(brak składek w tej sytuacji)</span>}
                        {["pracownik-pod-min", "ta-sama-firma", "bezrobotny", "zlecenie-pod-min"].includes(options.zlecenieSytuacja || "") && 
                        <span className="text-xs text-muted-foreground ml-2">(obowiązkowe)</span>}
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <input 
                        type="checkbox" 
                        id="chorobowe" 
                        checked={options.zlecenieChorobowe}
                        onChange={(e) => handleOptionChange('zlecenieChorobowe', e.target.checked)}
                        disabled={
                          options.zlecenieSytuacja === "student" || 
                          ["pracownik-min", "emeryt", "zlecenie-min"].includes(options.zlecenieSytuacja || "") ||
                          !options.zlecenieEmerytalne
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <Label htmlFor="chorobowe" className="text-sm font-normal cursor-pointer">
                        Chorobowe (dobrowolne)
                        {(options.zlecenieSytuacja === "student" || 
                          ["pracownik-min", "emeryt", "zlecenie-min"].includes(options.zlecenieSytuacja || "")) && 
                        <span className="text-xs text-muted-foreground ml-2">(nieaktywne w tej sytuacji)</span>}
                        {!options.zlecenieEmerytalne && !["pracownik-min", "emeryt", "zlecenie-min", "student"].includes(options.zlecenieSytuacja || "") &&
                        <span className="text-xs text-muted-foreground ml-2">(wymaga składki emerytalnej)</span>}
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="zdrowotne" 
                        checked={options.zlecenieZdrowotne}
                        onChange={(e) => handleOptionChange('zlecenieZdrowotne', e.target.checked)}
                        disabled={
                          options.zlecenieSytuacja === "student" || 
                          ["pracownik-min", "pracownik-pod-min", "ta-sama-firma", "bezrobotny", "emeryt", "zlecenie-min", "zlecenie-pod-min"].includes(options.zlecenieSytuacja || "")
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <Label htmlFor="zdrowotne" className="text-sm font-normal cursor-pointer">
                        Zdrowotna (9%)
                        {options.zlecenieSytuacja === "student" && 
                        <span className="text-xs text-muted-foreground ml-2">(nieaktywne dla studenta)</span>}
                        {["pracownik-min", "pracownik-pod-min", "ta-sama-firma", "bezrobotny", "emeryt", "zlecenie-min", "zlecenie-pod-min"].includes(options.zlecenieSytuacja || "") && 
                        <span className="text-xs text-muted-foreground ml-2">(obowiązkowa)</span>}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                // Dla umowy o dzieło
                <div className="p-4 border rounded-sm bg-gray-50">
                  <p className="text-center text-gray-500">
                    Opcje dla umowy o dzieło są w trakcie implementacji
                  </p>
                </div>
              )
            ) : (
              // Pola dla B2B
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Forma opodatkowania */}
                  <div>
                    <Label htmlFor="b2b-tax-form" className="text-sm font-medium mb-1 block">
                      Forma opodatkowania
                    </Label>
                    <div className="text-sm text-muted-foreground mb-2">
                      Wybrany typ: <span className="font-semibold">{b2bType === "ogolne" ? "Zasady ogólne" : b2bType === "liniowy" ? "Podatek liniowy" : "Ryczałt"}</span>
                    </div>
                    
                    {/* Stawka ryczałtu - tylko gdy wybrano ryczałt */}
                    {b2bType === "ryczalt" && (
                      <div className="mt-3">
                        <Label htmlFor="b2b-ryczalt-rate" className="text-sm font-medium mb-1 block">
                          Stawka ryczałtu
                        </Label>
                        <Select 
                          value={"12"} 
                          onValueChange={() => {}}
                        >
                          <SelectTrigger id="b2b-ryczalt-rate">
                            <SelectValue placeholder="Wybierz stawkę..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8.5">8.5% (dla większości IT)</SelectItem>
                            <SelectItem value="12">12% (programy komputerowe)</SelectItem>
                            <SelectItem value="15">15% (niektóre usługi)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  {/* Składki ZUS */}
                  <div>
                    <Label htmlFor="b2b-zus" className="text-sm font-medium mb-1 block">
                      Składki ZUS
                    </Label>
                    <Select 
                      value={"pelny"} 
                      onValueChange={() => {}}
                    >
                      <SelectTrigger id="b2b-zus">
                        <SelectValue placeholder="Wybierz typ ZUS..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pelny">Pełny ZUS</SelectItem>
                        <SelectItem value="preferencyjny">Preferencyjny ZUS (2 lata)</SelectItem>
                        <SelectItem value="maly">Mały ZUS Plus</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Składki wpływają na wysokość podatku i kosztów
                    </p>
                  </div>
                </div>
                
                {/* Dodatkowe opcje */}
                <div className="space-y-3 mt-4">
                  <div className="text-sm font-medium">Dodatkowe opcje</div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="ulga-ip-box" 
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