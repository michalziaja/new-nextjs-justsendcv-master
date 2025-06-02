import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { SalaryChecker } from "./salary-checker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// Interfejs dla oferty pracy z Supabase
interface JobOffer {
  id: string;
  user_id: string;
  title: string;
  company: string;
  site?: string;
  url?: string;
  status: string;
  full_description?: string;
  note?: string;
  salary?: string;
  created_at: string;
  status_changes: string[];
  expire?: string;
  priority: number;
}

// Interfejs dla props JobGoalContent
interface JobGoalContentProps {
  embedded?: boolean;
}

// Funkcja do parsowania zarobków z różnych formatów
const extractMinSalary = (salaryString?: string): number | null => {
  if (!salaryString) return null;
  
  // Usuń 'brutto', 'netto', 'PLN', '€', 'EUR' itd.
  const cleanSalary = salaryString.replace(/brutto|netto|PLN|zł|€|EUR|\/miesiąc|\/mies\.|\/month|\/hour|\/godzinę/gi, '').trim();
  
  // Znajdź pierwszą liczbę (biorąc pod uwagę różne separatory)
  const numberMatch = cleanSalary.match(/(\d[\d\s.,]*)/);
  if (!numberMatch) return null;
  
  // Wyciągnij liczbę i zamień separatory na format liczbowy
  let minSalary = numberMatch[0].replace(/\s/g, '').replace(',', '.');
  
  // Konwertuj na liczbę
  const salary = parseFloat(minSalary);
  
  // Jeśli znajdziemy EUR, przelicz na PLN (przybliżony kurs)
  if (salaryString.toUpperCase().includes('EUR') || salaryString.includes('€')) {
    return salary * 4.3; // Przybliżony kurs EUR do PLN
  }
  
  return salary;
};

// Komponent do wyszukiwania ofert pracy
export function JobGoalContent({ embedded = false }: JobGoalContentProps) {
  const [minSalary, setMinSalary] = useState<string>("5000"); // Domyślna wartość 5000
  const [searchResults, setSearchResults] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  // Wyszukaj oferty automatycznie przy pierwszym renderowaniu
  useEffect(() => {
    searchJobOffers();
  }, []);
  
  // Funkcja do wyszukiwania ofert na podstawie minimalnego wynagrodzenia
  const searchJobOffers = async () => {
    if (!minSalary || isNaN(parseFloat(minSalary))) {
      setError("Podaj prawidłową kwotę minimalnego wynagrodzenia");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Musisz być zalogowany, aby wyszukiwać oferty");
        setIsLoading(false);
        return;
      }
      
      // Pobierz wszystkie oferty użytkownika
      const { data: jobOffers, error } = await supabase
        .from('job_offers')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Błąd podczas pobierania ofert:", error);
        setError("Wystąpił błąd podczas pobierania ofert");
        setIsLoading(false);
        return;
      }
      
      // Filtruj oferty na podstawie minimalnego wynagrodzenia
      const minSalaryValue = parseFloat(minSalary);
      const filteredOffers = jobOffers.filter(offer => {
        const offerMinSalary = extractMinSalary(offer.salary);
        return offerMinSalary !== null && offerMinSalary >= minSalaryValue;
      });
      
      setSearchResults(filteredOffers);
      
    } catch (err) {
      console.error("Wystąpił błąd:", err);
      setError("Wystąpił nieoczekiwany błąd podczas wyszukiwania");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Pole wyszukiwania z przyciskiem w jednej linii - stała wysokość */}
      <div className="flex gap-2 items-center flex-shrink-0">
        <div className="flex-1">
          <Label htmlFor="min-salary" className="text-sm font-medium mb-1 block">
            Minimalna kwota zarobków
          </Label>
          <Input 
            id="min-salary"
            type="number" 
            className="h-10" 
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchJobOffers();
              }
            }}
          />
        </div>
        <div className="mt-7">
          <Button 
            className="bg-gradient-to-r from-[#00B2FF] to-blue-600 hover:from-[#00A0FF] hover:to-blue-700 text-white h-10 whitespace-nowrap"
            onClick={searchJobOffers}
            disabled={isLoading}
          >
            {isLoading ? "Wyszukiwanie..." : "Szukaj ofert"}
          </Button>
        </div>
      </div>

      {/* Kontener dla błędów - stała wysokość gdy występuje błąd */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-sm border border-red-200 flex-shrink-0">
          {error}
        </div>
      )}
      
      {/* Główny kontener wyników - zajmuje pozostałą przestrzeń z overflow */}
      <div className="flex-1 min-h-0 border border-gray-200 rounded-sm bg-white">
        <div 
          className="h-full overflow-y-auto p-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
          }}
        >
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {/* Nagłówek z liczbą wyników - sticky */}
              <div className="sticky top-0 bg-white py-2 border-b border-gray-100 mb-3 z-10">
                <p className="text-sm bg-gradient-to-r from-[#00B2FF] to-blue-600 bg-clip-text text-transparent font-medium">
                  Znaleziono {searchResults.length} ofert spełniających kryteria:
                </p>
              </div>
              
              {/* Lista ofert z odpowiednim paddingiem */}
              <div className="space-y-3 pb-4">
                {searchResults.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="border border-gray-200 rounded-sm p-4 bg-gradient-to-r from-white to-blue-50/30 hover:from-white hover:to-blue-100/40 transition-colors shadow-sm"
                  >
                    <div className="font-semibold text-gray-800 text-base leading-tight">
                      {offer.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {offer.company}
                    </div>
                    {offer.salary && (
                      <div className="text-sm font-medium bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mt-2">
                        {offer.salary}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3 gap-2">
                      <div className="text-xs text-gray-500">
                        Dodano: {new Date(offer.created_at).toLocaleDateString('pl-PL')}
                      </div>
                      <Badge className="bg-gradient-to-r from-[#00B2FF]/20 to-blue-600/20 text-blue-800 hover:from-[#00B2FF]/30 hover:to-blue-600/30 text-xs border border-blue-200 whitespace-nowrap">
                        {offer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : hasSearched ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.137 0-4.146-.832-5.657-2.343m0 0L3 10.5v.5a6 6 0 006.5 6H18A7.5 7.5 0 0012 15z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Nie znaleziono ofert spełniających kryteria</p>
                <p className="text-gray-400 text-xs mt-1">Spróbuj obniżyć minimalną kwotę wynagrodzenia</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-8 px-4">
                <div className="w-8 h-8 mx-auto mb-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Wyszukiwanie ofert...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Wpisz minimalną kwotę zarobków i kliknij "Szukaj ofert"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Główny komponent zawierający narzędzia płacowe - bez wewnętrznych zakładek
export function SalaryTools({ activeTab = "wyszukaj" }: { activeTab?: string }) {
  // Komponent wyświetla bezpośrednio zawartość w zależności od aktywnej zakładki z górnego panelu
  return (
    <Card className="w-full h-full flex flex-col shadow-[2px_4px_10px_rgba(0,0,0,0.3)] rounded-sm">
      <CardHeader className="pb-2 border-b bg-gradient-to-r from-gray-50 to-blue-50/30 flex-shrink-0">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {activeTab === "wyszukaj" ? "Wyszukiwarka ofert" : "Sprawdź zarobki"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-4 overflow-hidden">
        {activeTab === "wyszukaj" ? (
          <JobGoalContent />
        ) : (
          <SalaryChecker embedded={true} />
        )}
      </CardContent>
    </Card>
  );
} 