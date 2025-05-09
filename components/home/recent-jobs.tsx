"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

// Typ dla oferty pracy
interface JobOffer {
  id: string;
  title: string;
  company: string;
  site: string | null;
  created_at: string;
}

export function RecentJobs() {
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecentJobs = async () => {
      setIsLoading(true);
      
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setIsLoading(false);
          return;
        }

        // Pobierz 3 najnowsze oferty użytkownika, posortowane wg daty dodania
        const { data: jobOffers, error } = await supabase
          .from('job_offers')
          .select('id, title, company, site, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error("Błąd podczas pobierania ostatnich ofert:", error);
          setIsLoading(false);
          return;
        }

        setRecentJobs(jobOffers || []);
      } catch (error) {
        console.error("Wystąpił błąd podczas pobierania ostatnich ofert:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentJobs();
  }, []);

  // Funkcja do obsługi kliknięcia na ofertę
  const handleJobClick = (jobId: string) => {
    // Przekierowuje do strony /saved i dodaje parametr, który pozwoli na otwarcie drawera
    router.push(`/saved?openDrawer=${jobId}`);
  };

  return (
    <Card className="h-full rounded-sm border-1 border-gray-200 dark:border-gray-800
    shadow-[2px_4px_10px_rgba(0,0,0,0.3)] 
    dark:shadow-slate-900/20
    bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 pt-1 -mb-2">
          <FileText className="h-5 w-5 text-[#00B2FF] stroke-2 transform transition-transform hover:scale-110" />
          Ostatnio zapisane oferty
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-2 pt-2">
            {/* Nagłówki kolumn */}
            <div className="grid pb-2 border-b border-gray-200 dark:border-gray-800" 
                 style={{ gridTemplateColumns: '2fr 1.5fr 0.7fr 0.5fr' }}>
              <div className="text-md font-medium">Stanowisko</div>
              <div className="text-md font-medium">Firma</div>
              <div className="text-md font-medium text-right pr-4">Portal</div>
              <div className="text-md font-medium text-right">Data</div>
            </div>
            
            {/* Skeleton loader */}
            <div className="space-y-3">
              {/* Generuj 3 wiersze szkieletu */}
              {[1, 2, 3].map((i) => (
                <div 
                  key={`skeleton-${i}`} 
                  className="grid rounded-lg py-3"
                  style={{ gridTemplateColumns: '2fr 1.5fr 0.7fr 0.5fr' }}
                >
                  <div className="pr-4">
                    <Skeleton className="h-3 w-[90%]" />
                  </div>
                  <div className="pr-4">
                    <Skeleton className="h-3 w-[75%]" />
                  </div>
                  <div className="text-right pr-4">
                    <Skeleton className="h-3 w-[80%] ml-auto" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-3 w-[90%] ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Brak zapisanych ofert
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {/* Nagłówki kolumn */}
            <div className="grid pb-0 -ml-2 -mr-2 rounded-sm bg-gray-100/70 dark:bg-gray-800 border-gray-200 dark:border-gray-800" 
                 style={{ gridTemplateColumns: '2fr 1.5fr 0.7fr 0.5fr' }}>
              <div className="text-md ml-4 font-medium flex items-center h-10">Stanowisko</div>
              <div className="text-md font-medium flex items-center h-10">Firma</div>
              <div className="text-md mr-2 font-medium text-right pr-4 flex items-center justify-end h-10">Portal</div>
              <div className="text-md mr-4 font-medium text-right flex items-center justify-end h-10">Data</div>
            </div>
            
            {/* Lista ofert */}
            <div className="space-y-1">
              {recentJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="grid hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm transition-colors duration-200 py-3 cursor-pointer"
                  style={{ gridTemplateColumns: '2fr 1.5fr 0.7fr 0.5fr' }}
                  onClick={() => handleJobClick(job.id)}
                >
                  <div className="text-sm ml-2 font-medium truncate">{job.title}</div>
                  <div className="text-sm -ml-1 text-muted-foreground truncate">{job.company}</div>
                  <div className="text-sm text-muted-foreground truncate text-right pr-4">{job.site || "-"}</div>
                  <div className="text-sm text-muted-foreground text-right">
                    {new Date(job.created_at).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 