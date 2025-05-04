"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/utils/supabase/client"

// Struktura dla stanowisk
interface JobPosition {
  title: string;
  count: number;
  color: string;
  originalTitles?: string[];
}

export function PopularPositions() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(true);
  
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

  // Funkcja normalizująca nazwę stanowiska
  const normalizeJobTitle = (title: string): string => {
    if (!title) return "";
    
    // Zamień na małe litery
    title = title.toLowerCase();
    
    // Usuń prefiksy określające poziom doświadczenia
    const experienceLevels = ['junior', 'senior', 'mid', 'lead', 'head of', 'chief', 'principal'];
    experienceLevels.forEach(level => {
      title = title.replace(new RegExp(`^${level}\\s+`, 'i'), '');
    });
    
    // Usuń sufiksy z "developer", "engineer", itp.
    const commonSuffixes = [' developer', ' engineer', ' specialist', ' expert', ' consultant'];
    commonSuffixes.forEach(suffix => {
      if (title.endsWith(suffix)) {
        title = title.substring(0, title.length - suffix.length);
      }
    });
    
    // Usuń typowe kwalifikatory
    const qualifiers = [' fullstack', ' front-end', ' backend', ' full stack', ' software'];
    qualifiers.forEach(qualifier => {
      title = title.replace(qualifier, '');
    });
    
    // Standaryzuj często używane technologie
    const techAliases: Record<string, string> = {
      'react.js': 'react',
      'reactjs': 'react',
      'node.js': 'node',
      'nodejs': 'node',
      'javascript': 'js',
      'typescript': 'ts',
      'python developer': 'python',
      'java developer': 'java'
    };
    
    Object.entries(techAliases).forEach(([alias, standard]) => {
      if (title.includes(alias)) {
        title = title.replace(alias, standard);
      }
    });
    
    // Wyczyść białe znaki
    title = title.trim();
    
    return title;
  };
  
  // Pobierz i przetwórz dane o stanowiskach
  useEffect(() => {
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
          // Mapa do zliczania znormalizowanych stanowisk
          const positionCountMap: Record<string, number> = {};
          
          // Mapa do śledzenia oryginalnych nazw stanowisk
          const originalTitles: Record<string, string[]> = {};
          
          // Przetwórz każdą ofertę
          allOffers.forEach(offer => {
            const title = offer[titleColumn as keyof typeof offer];
            if (title && typeof title === 'string') {
              const normalizedTitle = normalizeJobTitle(title);
              if (normalizedTitle) {
                positionCountMap[normalizedTitle] = (positionCountMap[normalizedTitle] || 0) + 1;
                
                // Śledź oryginalne nazwy dla każdego znormalizowanego tytułu
                if (!originalTitles[normalizedTitle]) {
                  originalTitles[normalizedTitle] = [];
                }
                if (!originalTitles[normalizedTitle].includes(title)) {
                  originalTitles[normalizedTitle].push(title);
                }
              }
            }
          });
          
          // Przygotuj dane do wyświetlenia
          let positionItems = Object.entries(positionCountMap)
            .map(([title, count], index) => ({
              title,
              count,
              color: positionColors[index % positionColors.length],
              originalTitles: originalTitles[title]
            }))
            .sort((a, b) => b.count - a.count);
          
          // Filtruj pozycje, które występują więcej niż raz
          const popularPositions = positionItems.filter(pos => pos.count > 1);
          
          // Jeśli nie ma popularnych pozycji, weź 5 ostatnich
          if (popularPositions.length === 0) {
            positionItems = positionItems.slice(0, 5);
          } else {
            positionItems = popularPositions;
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
    
    fetchPositions();
  }, []);

  return (
    <Card className="overflow-hidden h-[268px] bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardHeader className="flex flex-row items-center justify-between -mt-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-green-500" />
          <CardTitle className="text-md font-medium">Popularne stanowiska</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {positionsLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : positions.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              {positions.slice(0, 5).map((position, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: position.color }}
                      />
                      <h4 className="text-sm font-medium capitalize">{position.title}</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">{position.count} ofert</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Brak danych o stanowiskach</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 