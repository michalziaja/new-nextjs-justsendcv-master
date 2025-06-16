import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GrRestroomWomen, GrRestroomMen } from "react-icons/gr";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaChartLine, FaRegArrowAltCircleUp, FaRegArrowAltCircleDown } from "react-icons/fa";

// --- Interfaces for source data (JSON) ---
interface SalaryDetails {
  median: number;
  p25: number;
  p75: number;
}

interface GenderDetails {
  count: number;
  percentage: number;
}

interface SourceBenefit {
  name: string;
  percentage: number;
}

interface PositionLevel {
  level: string;
  salaries?: {
    gross?: SalaryDetails;
    net?: SalaryDetails;
  };
  gender_distribution?: {
    women?: GenderDetails;
    men?: GenderDetails;
  };
  benefits?: SourceBenefit[];
}

interface Position {
  title: string;
  category: string[];
  sample_size: number;
  responsibilities?: string[];
  salaries?: {
    gross?: SalaryDetails;
    net?: SalaryDetails;
    gender_distribution?: {
      women?: GenderDetails;
      men?: GenderDetails;
    };
    benefits?: SourceBenefit[];
  };
  levels?: PositionLevel[];
}

interface LetterData {
  letter: string;
  positions: Position[];
}

// --- Transformed interface used internally by the component ---
interface JobSalaryLevel {
    level: string;
    medianSalary: { gross: number; net: number };
    minSalary: { gross: number; net: number };
    maxSalary: { gross: number; net: number };
    genderRatio: { male: number; female: number };
    benefits: string[];
}

interface JobSalaryInfo {
  title: string;
    category: string[];
    medianSalary: { gross: number; net: number };
    minSalary: { gross: number; net: number };
    maxSalary: { gross: number; net: number };
    genderRatio: { male: number; female: number };
  benefits: string[];
    responsibilities: string[];
  currency: string;
  sampleSize: number;
  hasLevels: boolean;
    levels?: JobSalaryLevel[];
}

// --- Helper Functions and Internal Components ---

const formatCurrency = (amount: number | undefined | null, currency = "PLN"): string => {
    if (amount == null || isNaN(amount)) {
        return `-- ${currency}`;
    }
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount);
};

const SalaryRangeDisplay = ({ min, median, max, currency, type }: { min: number, median: number, max: number, currency: string, type: 'brutto' | 'netto' }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ">
        {/* Min Card */}
        <div className="flex items-center gap-3 rounded-sm bg-gradient-to-r from-orange-100 to-amber-200 p-3 border border-orange-200 shadow-sm transition-transform">
            <div>
                <div className="text-xs  text-orange-800 font-medium">Min {type}</div>
                <div className="text-base text-center font-semibold text-orange-900">{formatCurrency(min, currency)}</div>
            </div>
        </div>
        {/* Median Card */}
        <div className="flex items-center gap-3 rounded-sm bg-gradient-to-r from-[#00B2FF]/90 to-blue-600 p-3 border border-blue-300 shadow-sm scale-105 md:scale-100 relative transition-transform5">
            <div>
                <div className="text-xs text-white font-semibold">Mediana {type}</div>
                <div className="text-xl text-center font-bold text-white">{formatCurrency(median, currency)}</div>
            </div>
        </div>
         {/* Max Card */}
        <div className="flex items-center gap-3 rounded-sm bg-gradient-to-r from-teal-200 to-emerald-300 p-3 border border-teal-200 shadow-sm transition-transform">
            <div>
                <div className="text-xs text-center text-teal-800 font-medium">Max {type}</div>
                <div className="text-base text-center font-semibold text-teal-900">{formatCurrency(max, currency)}</div>
            </div>
        </div>
    </div>
);

const SalaryTypeToggle = ({ value, onChange }: { value: 'brutto' | 'netto', onChange: (value: 'brutto' | 'netto') => void }) => (
    <Tabs value={value} onValueChange={(v) => onChange(v as 'brutto' | 'netto')} className="w-[130px] flex-shrink-0">
        <TabsList className="grid w-full grid-cols-2 bg-gray-200/80 h-7 rounded-sm">
            <TabsTrigger value="brutto" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 rounded-sm h-5 data-[state=active]:text-white text-xs px-0 py-0 ">
                Brutto
            </TabsTrigger>
            <TabsTrigger value="netto" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 rounded-sm data-[state=active]:text-white text-xs px-0 py-0 h-5">
                Netto
            </TabsTrigger>
        </TabsList>
    </Tabs>
);

const GenderDistributionDisplay = ({ male, female }: { male: number | undefined, female: number | undefined }) => (
    <div className="flex justify-center items-center gap-10 md:gap-16 pt-4 pb-4 mt-2 border-t border-b border-gray-200">
        <div className="flex flex-col items-center text-center">
            <div className="text-amber-500 mb-2"><GrRestroomWomen size={30} /></div>
            <span className="text-sm font-medium text-gray-700">Kobiety</span>
            <span className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">{female != null ? `${female}%` : '--%'}</span>
        </div>
        <div className="flex flex-col items-center text-center">
            <div className="text-gray-600 mb-2"><GrRestroomMen size={30} /></div>
            <span className="text-sm font-medium text-gray-700">Mężczyźni</span>
            <span className="text-lg font-semibold bg-gradient-to-r from-[#00B2FF] to-blue-600 bg-clip-text text-transparent">{male != null ? `${male}%` : '--%'}</span>
        </div>
    </div>
);

/**
 * Displays benefits. Always renders the header.
 * Includes min-height to stabilize layout when data appears/disappears.
 */
const BenefitTagsDisplay = ({ title, items, placeholder, limit = 6 }: { title: string, items: string[] | undefined, placeholder: string, limit?: number }) => (
    <div className="mt-5 min-h-[70px] bg-gradient-to-r from-gray-50 dark:from-slate-700 to-blue-50/30 dark:to-blue-950/20 p-3 rounded-sm border border-gray-200 dark:border-gray-600 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
        {/* Conditionally render tags or placeholder */}
        {items && items.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {items.slice(0, limit).map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="bg-gradient-to-r from-[#00B2FF]/20 dark:from-[#00B2FF]/30 to-blue-600/20 dark:to-blue-600/30 text-blue-800 dark:text-blue-200 hover:from-[#00B2FF]/30 hover:to-blue-600/30 text-sm font-normal px-2.5 py-0.5 border border-blue-200 dark:border-blue-500">
                        {benefit}
                    </Badge>
                ))}
                {items.length > limit && (
                     <Badge variant="outline" className="text-xs font-normal px-2 py-0.5">
                        +{items.length - limit} więcej
                    </Badge>
                )}
            </div>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{placeholder}</p>
        )}
    </div>
);


/**
 * Displays responsibilities. Always renders the header.
 * Content expands to accommodate all items.
 */
const ResponsibilitiesList = ({ title, items, placeholder }: { title: string, items: string[] | undefined, placeholder: string }) => (
    <div className="mt-4 bg-gradient-to-r from-gray-50 dark:from-slate-700 to-blue-50/30 dark:to-blue-950/20 p-3 rounded-sm border border-gray-200 dark:border-gray-600 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
        {/* Conditionally render full list or placeholder */}
        {items && items.length > 0 ? (
            <div className="pr-2"> 
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                    {items.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{placeholder}</p>
        )}
    </div>
);

// --- Main SalaryChecker Component ---

const LEVEL_LABELS = ["Młodszy Specjalista", "Specjalista", "Starszy Specjalista"];

export function SalaryChecker({ embedded = false }: { embedded?: boolean }) {
    // --- State Hooks ---
  const [jobTitle, setJobTitle] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [jobData, setJobData] = useState<JobSalaryInfo | null>(null);
  const [salaryType, setSalaryType] = useState<'brutto' | 'netto'>('brutto');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(1); // Default to Specialist
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [positionsData, setPositionsData] = useState<LetterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
    // --- Effect Hooks ---
    // Fetch data on initial mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        const response = await fetch('/position_salary.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: LetterData[] = await response.json();
        if (!Array.isArray(data) || data.length === 0 || !data[0]?.letter || !Array.isArray(data[0]?.positions)) {
          console.warn('Fetched data has unexpected structure:', data);
          throw new Error('Invalid salary data format received.');
        }
        console.log('Salary data fetched:', data.reduce((sum, d) => sum + (d.positions?.length || 0), 0), 'positions');
        setPositionsData(data);
      } catch (err) {
        console.error('Error fetching or processing salary data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading salary data.'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
    // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
    // --- Data Processing and Handling ---
    // Map raw data to internal structure
    const mapPositionToJobSalaryInfo = useCallback((position: Position): JobSalaryInfo | null => {
        if (!position) return null;
    const hasLevels = !!position.levels && position.levels.length > 0;
    
        const mappedLevels: JobSalaryLevel[] | undefined = hasLevels && position.levels ? position.levels.map(
            (level: PositionLevel): JobSalaryLevel => ({
                level: level.level || 'Unknown Level',
                medianSalary: { gross: level.salaries?.gross?.median ?? 0, net: level.salaries?.net?.median ?? 0 },
                minSalary: { gross: level.salaries?.gross?.p25 ?? 0, net: level.salaries?.net?.p25 ?? 0 },
                maxSalary: { gross: level.salaries?.gross?.p75 ?? 0, net: level.salaries?.net?.p75 ?? 0 },
                genderRatio: { male: level.gender_distribution?.men?.percentage ?? 50, female: level.gender_distribution?.women?.percentage ?? 50 },
                benefits: level.benefits?.map((b: SourceBenefit) => b.name) || []
            })
        ) : undefined;

        let initialDisplayData: Omit<JobSalaryLevel, 'level'>;
        if (hasLevels && mappedLevels && mappedLevels.length > 0) {
            initialDisplayData = mappedLevels[0];
        } else if (position.salaries) {
            initialDisplayData = {
                medianSalary: { gross: position.salaries.gross?.median ?? 0, net: position.salaries.net?.median ?? 0 },
                minSalary: { gross: position.salaries.gross?.p25 ?? 0, net: position.salaries.net?.p25 ?? 0 },
                maxSalary: { gross: position.salaries.gross?.p75 ?? 0, net: position.salaries.net?.p75 ?? 0 },
                genderRatio: { male: position.salaries.gender_distribution?.men?.percentage ?? 50, female: position.salaries.gender_distribution?.women?.percentage ?? 50 },
                benefits: position.salaries.benefits?.map((b: SourceBenefit) => b.name) || [],
            };
        } else {
             initialDisplayData = {
                medianSalary: { gross: 0, net: 0 }, minSalary: { gross: 0, net: 0 }, maxSalary: { gross: 0, net: 0 },
                genderRatio: { male: 50, female: 50 }, benefits: [],
            };
        }

        return {
      title: position.title,
            category: position.category || [],
      currency: "PLN",
      sampleSize: position.sample_size || 0,
      hasLevels: hasLevels,
            levels: mappedLevels,
            responsibilities: position.responsibilities || [],
            medianSalary: initialDisplayData.medianSalary,
            minSalary: initialDisplayData.minSalary,
            maxSalary: initialDisplayData.maxSalary,
            genderRatio: initialDisplayData.genderRatio,
            benefits: initialDisplayData.benefits,
        };
    }, []);

    // Update suggestions based on input
    const updateSuggestions = useCallback((input: string) => {
        if (!input.trim() || !positionsData || positionsData.length === 0) {
            setSuggestions([]); 
            setShowSuggestions(false); 
            return;
        }
        
        const searchKey = input.toLowerCase();
        const foundPositions: string[] = [];
        const maxSuggestions = 10;
        
        // Najpierw szukamy stanowisk, które zaczynają się od wpisanego tekstu
        for (const letterData of positionsData) {
            for (const position of letterData.positions ?? []) {
                // Sprawdzamy, czy stanowisko zaczyna się od wpisanego tekstu
                if (position.title.toLowerCase().startsWith(searchKey)) {
                    foundPositions.push(position.title);
                    if (foundPositions.length >= maxSuggestions) break;
                }
            }
            if (foundPositions.length >= maxSuggestions) break;
        }
        
        // Jeśli nie znaleziono wystarczającej liczby stanowisk, możemy dodać te, które zawierają wpisany tekst
        if (foundPositions.length < maxSuggestions) {
            for (const letterData of positionsData) {
                for (const position of letterData.positions ?? []) {
                    // Sprawdzamy, czy stanowisko zawiera wpisany tekst (ale nie zaczyna się od niego)
                    // i nie jest jeszcze w naszej liście wyników
                    if (!position.title.toLowerCase().startsWith(searchKey) && 
                        position.title.toLowerCase().includes(searchKey) &&
                        !foundPositions.includes(position.title)) {
                        foundPositions.push(position.title);
                        if (foundPositions.length >= maxSuggestions) break;
                    }
                }
                if (foundPositions.length >= maxSuggestions) break;
            }
        }
        
        setSuggestions(foundPositions);
        setShowSuggestions(foundPositions.length > 0);
    }, [positionsData]);

    // Perform search logic
    const performSearch = useCallback((searchTerm: string) => {
        setHasSearched(true); setShowSuggestions(false); setJobData(null); setSelectedLevelIndex(1);

        if (!searchTerm.trim() || !positionsData || positionsData.length === 0) return;

        const searchKey = searchTerm.toLowerCase();
      let foundPosition: Position | null = null;
      
        // Exact match first
        for (const letterData of positionsData) {
            for (const position of letterData.positions ?? []) {
                if (position.title.toLowerCase() === searchKey) { foundPosition = position; break; }
            } if (foundPosition) break;
        }
        // Partial match if no exact match
        if (!foundPosition) {
            // Najpierw próbujemy znaleźć stanowiska zaczynające się od wpisanego tekstu
            for (const letterData of positionsData) {
                for (const position of letterData.positions ?? []) {
                    if (position.title.toLowerCase().startsWith(searchKey)) { 
                        foundPosition = position; 
                        break; 
                    }
                } 
                if (foundPosition) break;
            }
            
            // Jeśli nadal nie znaleziono, szukamy stanowisk zawierających tekst
            if (!foundPosition) {
                for (const letterData of positionsData) {
                    for (const position of letterData.positions ?? []) {
                        if (position.title.toLowerCase().includes(searchKey)) { 
                            foundPosition = position; 
                            break; 
                        }
                    } 
                    if (foundPosition) break;
                }
            }
        }
        
        // Map and set data if found
      if (foundPosition) {
        const mappedData = mapPositionToJobSalaryInfo(foundPosition);
        setJobData(mappedData);
        }
    }, [positionsData, mapPositionToJobSalaryInfo]);

    // --- Event Handlers ---
    const handleSearchClick = () => { performSearch(jobTitle); };
    const handleSuggestionClick = (suggestion: string) => { setJobTitle(suggestion); setShowSuggestions(false); performSearch(suggestion); };
    const handleLevelChange = (newIndex: number) => {
         if ((jobData?.hasLevels && jobData.levels && newIndex >= 0 && newIndex < jobData.levels.length) ||
            (!jobData?.hasLevels && newIndex === 1 && jobData)) {
            setSelectedLevelIndex(newIndex);
        }
    };

    // --- Memoized Derived State ---
    // Get data for the currently selected level/tab
    const currentDisplayData = useMemo(() => {
        if (!jobData) return null;
        if (jobData.hasLevels && jobData.levels && selectedLevelIndex >= 0 && selectedLevelIndex < jobData.levels.length) {
            return jobData.levels[selectedLevelIndex];
        }
        return {
            medianSalary: jobData.medianSalary, minSalary: jobData.minSalary, maxSalary: jobData.maxSalary,
            genderRatio: jobData.genderRatio, benefits: jobData.benefits, level: "Ogólne"
        };
    }, [jobData, selectedLevelIndex]);

    // --- Rendering Logic ---

    // Loading State
    if (isLoading) {
          return <div className="flex items-center justify-center h-full p-4">
            <div className="animate-pulse text-center text-gray-500">
              <div className="w-36 h-6 bg-gray-200 rounded-sm mx-auto mb-2"></div>
              <p className="text-sm">Ładowanie danych...</p>
            </div>
          </div>;
    }
    
    // Error State
    if (error) {
        return <div className="flex flex-col items-center justify-center text-center h-full p-4">
            <p className="text-red-600 font-semibold">Wystąpił błąd</p>
            <p className="text-sm text-red-500 mt-1">{error.message}</p>
            <p className="text-xs text-gray-400 mt-2">Spróbuj odświeżyć stronę.</p>
        </div>;
    }

    // Main Content
    return (
        <div className="w-full p-4 h-full overflow-y-auto" 
             style={{
                 scrollbarWidth: 'thin',
                 scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
             }}>
            <div className="space-y-4">
                {/* Search Section */}
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Input
                                type="text" 
                                className="h-10 pr-8" 
                                placeholder="Wpisz nazwę stanowiska..." 
                                value={jobTitle}
                                onChange={(e) => { setJobTitle(e.target.value); updateSuggestions(e.target.value); }}
                                onFocus={() => updateSuggestions(jobTitle)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick(); if (e.key === 'Escape') setShowSuggestions(false); }}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div ref={suggestionRef} className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto z-20 bg-white dark:bg-sidebar border rounded-sm shadow-lg">
                                    {suggestions.map((suggestion) => ( 
                                      <div 
                                        key={suggestion} 
                                        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-600" 
                                        onClick={() => handleSuggestionClick(suggestion)}
                                      >
                                        {suggestion}
                                      </div> 
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              
                {/* Results Section */}
                <div className="space-y-3 pt-1">
                    {/* Level Tabs */}
                    <Tabs value={selectedLevelIndex.toString()} onValueChange={(value) => handleLevelChange(parseInt(value, 10))} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700 h-8 rounded-sm">
                            {LEVEL_LABELS.map((label, index) => {
                                let isDisabled = true;
                                if (jobData?.hasLevels && jobData.levels) { isDisabled = index >= jobData.levels.length; }
                                else if (jobData && !jobData.hasLevels) { isDisabled = index !== 1; }
                                else if (!jobData && !hasSearched) { isDisabled = index !== 1; }
                                else if (!jobData && hasSearched) { isDisabled = true; }
                                
                                // Określamy styl dla zakładki - szary dla stanowisk bez podziału na poziomy
                                const activeClass = (jobData && !jobData.hasLevels && index === 1) 
                                  ? "data-[state=active]:bg-gray-400  data-[state=active]:text-white" 
                                  : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white";
        
                                return (
                                  <TabsTrigger 
                                    key={label} 
                                    value={index.toString()} 
                                    disabled={isDisabled} 
                                    className={`${activeClass} disabled:opacity-50 disabled:cursor-not-allowed h-full text-xs sm:text-xs px-1 transition-colors dark:text-gray-300`}
                                  >
                                    {label}
                                  </TabsTrigger> 
                                );
                            })}
                        </TabsList>
                    </Tabs>

                    {/* Main Data Area or Placeholders */}
                    <div className="space-y-4">
                        {/* "Not Found" Message */}
                        {hasSearched && !jobData && !isLoading && (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-10 px-4 rounded-sm bg-gradient-to-r from-gray-50 dark:from-slate-800 to-blue-50/10 dark:to-blue-950/10 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <p className="font-medium">Nie znaleziono danych dla stanowiska:</p>
                                <p className="italic bg-gradient-to-r from-[#00B2FF] to-blue-600 bg-clip-text text-transparent mt-1">"{jobTitle}"</p>
                                <p className="text-sm text-gray-400 mt-2">Spróbuj wpisać inną nazwę.</p>
                            </div>
                        )}

                        {/* Data Display Area (Render if data exists OR before first search) */}
                        {(jobData || !hasSearched) && (
                            <div className="space-y-2"> 
                                {/* Salary Cards */}
                                <SalaryRangeDisplay
                                    min={(salaryType === 'brutto' ? currentDisplayData?.minSalary?.gross : currentDisplayData?.minSalary?.net) ?? 0}
                                    median={(salaryType === 'brutto' ? currentDisplayData?.medianSalary?.gross : currentDisplayData?.medianSalary?.net) ?? 0}
                                    max={(salaryType === 'brutto' ? currentDisplayData?.maxSalary?.gross : currentDisplayData?.maxSalary?.net) ?? 0}
                                    currency={jobData?.currency || "PLN"} type={salaryType}
                                />
                                {/* Toggle and Industry */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3">
                                    <div className="flex-1 flex items-center flex-wrap gap-x-2 gap-y-1">
                                        <span className="text-sm font-medium text-gray-700 flex-shrink-0">Branża:</span>
                                        {jobData && jobData.category.length > 0 ? (
                                            jobData.category.map(cat => ( 
                                              <Badge 
                                                key={cat} 
                                                variant="outline" 
                                                className="text-xs font-normal border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/20"
                                              >
                                                {cat}
                                              </Badge> 
                                            ))
                                        ) : ( <span className="text-sm text-gray-500 italic">Brak danych</span> )}
                                    </div>
                                    <SalaryTypeToggle value={salaryType} onChange={setSalaryType} />
                                </div>
                                 {/* Gender Distribution */}
                                 <GenderDistributionDisplay male={currentDisplayData?.genderRatio?.male} female={currentDisplayData?.genderRatio?.female} />
                            </div>
                        )}
                        
                        {/* Benefits and Responsibilities */}
                        <BenefitTagsDisplay
                            title="Popularne benefity"
                            items={currentDisplayData?.benefits}
                            placeholder={hasSearched && jobData ? "Brak danych o benefitach dla tego stanowiska/poziomu." : "Wyszukaj stanowisko, aby zobaczyć popularne benefity."}
                        />
                        
                        <ResponsibilitiesList
                            title="Typowe zadania i obowiązki"
                            items={jobData?.responsibilities}
                            placeholder={hasSearched && jobData ? "Brak danych o zadaniach dla tego stanowiska." : "Wyszukaj stanowisko, aby zobaczyć typowe zadania."}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 