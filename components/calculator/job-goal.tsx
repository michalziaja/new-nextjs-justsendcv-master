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
    <div className="space-y-4">
      {/* Pole wyszukiwania z przyciskiem w jednej linii */}
      <div className="flex gap-2 items-center">
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
            className="bg-gradient-to-r from-[#00B2FF] to-blue-600 hover:from-[#00A0FF] hover:to-blue-700 text-white h-10"
            onClick={searchJobOffers}
            disabled={isLoading}
          >
            {isLoading ? "Wyszukiwanie..." : "Szukaj ofert"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-sm border border-red-200">{error}</div>
      )}
      
      <div className="overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
          WebkitOverflowScrolling: 'touch',
        }}>
        {searchResults.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm bg-gradient-to-r from-[#00B2FF] to-blue-600 bg-clip-text text-transparent font-medium sticky top-0 bg-white py-2 z-10 border-b">
              Znaleziono {searchResults.length} ofert spełniających kryteria:
            </p>
            {searchResults.map((offer) => (
              <div key={offer.id} className="border border-gray-200 rounded-sm p-3 bg-gradient-to-r from-white to-blue-50/30 hover:from-white hover:to-blue-100/40 transition-colors shadow-sm">
                <div className="font-semibold text-gray-800">{offer.title}</div>
                <div className="text-sm text-gray-600 mt-1">{offer.company}</div>
                {offer.salary && (
                  <div className="text-sm font-medium bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mt-2">{offer.salary}</div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    Dodano: {new Date(offer.created_at).toLocaleDateString('pl-PL')}
                  </div>
                  <Badge className="bg-gradient-to-r from-[#00B2FF]/20 to-blue-600/20 text-blue-800 hover:from-[#00B2FF]/30 hover:to-blue-600/30 text-xs border border-blue-200">{offer.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="border rounded-sm bg-gradient-to-r from-gray-50 to-blue-50/30 py-8 flex items-center justify-center shadow-sm">
            <p className="text-center text-gray-500">Nie znaleziono ofert spełniających kryteria</p>
          </div>
        ) : isLoading ? (
          <div className="border rounded-sm bg-gradient-to-r from-gray-50 to-blue-50/30 py-8 flex items-center justify-center">
            <p className="text-center text-gray-500">Wyszukiwanie ofert...</p>
          </div>
        ) : (
          <div className="border rounded-sm bg-gradient-to-r from-gray-50 to-blue-50/30 py-8 flex items-center justify-center">
            <p className="text-center text-gray-500">Wpisz minimalną kwotę zarobków i kliknij "Szukaj ofert"</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Główny komponent zawierający narzędzia płacowe - bez wewnętrznych zakładek
export function SalaryTools({ activeTab = "wyszukaj" }: { activeTab?: string }) {
  // Komponent wyświetla bezpośrednio zawartość w zależności od aktywnej zakładki z górnego panelu
  return (
    <Card className="w-full h-full flex flex-col shadow-[2px_4px_10px_rgba(0,0,0,0.3)] rounded-sm">
      <CardHeader className="pb-2 border-b bg-gradient-to-r from-gray-50 to-blue-50/30">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {activeTab === "wyszukaj" ? "Wyszukiwarka ofert" : "Sprawdź zarobki"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4">
        {activeTab === "wyszukaj" ? (
          <JobGoalContent />
        ) : (
          <SalaryChecker embedded={true} />
        )}
      </CardContent>
    </Card>
  );
} 