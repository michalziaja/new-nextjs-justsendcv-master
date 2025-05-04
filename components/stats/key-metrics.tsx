"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Send, CheckCheck, Clock, Percent, FileText } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

// Struktura danych dla nowych metryk
interface ApplicationMetrics {
  sentPercentage: number;
  responsePercentage: number;
  responseTime: string;
  responseRate: number;
  totalOffers: number;
  averageSavedPerMonth: number;
  customCVCount: number;
  customCVPercentage: number;
}

export function KeyMetricsSection() {
  // Stan dla metryk
  const [metrics, setMetrics] = useState<ApplicationMetrics>({
    sentPercentage: 0,
    responsePercentage: 0,
    responseTime: "-",
    responseRate: 0,
    totalOffers: 0,
    averageSavedPerMonth: 0,
    customCVCount: 0,
    customCVPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Funkcja pobierająca dane
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Pobieranie danych o ofertach pracy i ich statusach
        const { data: jobOffers, count: totalOffers } = await supabase
          .from('job_offers')
          .select('id, status, status_changes, created_at', { count: 'exact' });
        
        // Pobieranie danych o specjalnych CV
        const { data: customCVs, count: customCVCount } = await supabase
          .from('user_cvs')
          .select('id, job_offer_id', { count: 'exact' })
          .not('job_offer_id', 'is', null);
          
        if (!jobOffers || totalOffers === null) {
          // Brak danych - ustawienie domyślnych metryk
          setMetrics({
            sentPercentage: 0,
            responsePercentage: 0,
            responseTime: "Brak danych",
            responseRate: 0,
            totalOffers: 0,
            averageSavedPerMonth: 0,
            customCVCount: 0,
            customCVPercentage: 0,
          });
          return;
        }
        
        // Liczenie statusów ofert zgodnie z nową logiką
        let sentCount = 0; // wysłane lub wyższy
        let responseCount = 0; // contact lub wyższy
        const sentStatuses = ['send', 'contact', 'interview', 'offer', 'rejected'];
        const responseStatuses = ['contact', 'interview', 'offer', 'rejected'];

        // Zmienne do obliczenia średniej ilości zapisanych ofert miesięcznie
        let firstOfferDate: Date | null = null;
        let lastOfferDate: Date | null = null;

        jobOffers.forEach(offer => {
          const status = offer.status || 'saved';
          if (sentStatuses.includes(status)) sentCount++;
          if (responseStatuses.includes(status)) responseCount++;

          // Aktualizacja dat dla obliczenia średniej miesięcznej
          if (offer.created_at) {
            const createdDate = new Date(offer.created_at);
            if (firstOfferDate === null || createdDate < firstOfferDate) {
              firstOfferDate = createdDate;
            }
            if (lastOfferDate === null || createdDate > lastOfferDate) {
              lastOfferDate = createdDate;
            }
          }
        });

        // Obliczanie średniej miesięcznej zapisanych ofert
        let averageSavedPerMonth = 0;
        if (firstOfferDate && lastOfferDate) {
          const monthsDiff = 
            ((lastOfferDate as Date).getFullYear() - (firstOfferDate as Date).getFullYear()) * 12 + 
            ((lastOfferDate as Date).getMonth() - (firstOfferDate as Date).getMonth()) + 1; // +1 aby uwzględnić bieżący miesiąc
          
          // Jeśli jest mniej niż miesiąc, ustaw na 1 aby uniknąć dzielenia przez 0
          const effectiveMonths = Math.max(1, monthsDiff);
          averageSavedPerMonth = Math.round(totalOffers / effectiveMonths);
        }
        
        // Obliczanie procentów
        const totalCount = totalOffers || 0;
        const sentPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;
        const responsePercentage = totalCount > 0 ? Math.round((responseCount / totalCount) * 100) : 0;
        const responseRate = sentCount > 0 ? Math.round((responseCount / sentCount) * 100) : 0;
        
        // Obliczanie procentu ofert z własnym CV
        const customCvs = customCVCount || 0;
        const customCVPercentage = sentCount > 0 ? Math.round((customCvs / sentCount) * 100) : 0;
        
        // Obliczanie średniego czasu odpowiedzi (od wysłania do następnej zmiany statusu)
        let totalResponseTime = 0;
        let responseTimeCount = 0;
        jobOffers.forEach(offer => {
          if (Array.isArray(offer.status_changes) && offer.status_changes.length >= 2) {
            // Znajdź indeks zmiany statusu na "send"
            let sendIndex = -1;
            for (let i = 0; i < offer.status_changes.length; i++) {
              const statusChange = offer.status_changes[i];
              if (statusChange && typeof statusChange === 'string' && statusChange.includes('send-')) {
                sendIndex = i;
                break;
              }
            }
            // Jeśli znaleziono zmianę na "send" i po niej jest kolejna zmiana
            if (sendIndex !== -1 && sendIndex < offer.status_changes.length - 1) {
              const sendChangeStr = offer.status_changes[sendIndex];
              const sendTimestampMatch = sendChangeStr.match(/send-(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
              if (sendTimestampMatch && sendTimestampMatch[1]) {
                const sendDate = new Date(sendTimestampMatch[1]);
                // Znajdź następną zmianę statusu po "send" (tylko contact lub wyższy)
                let nextStatusChange = null;
                for (let i = sendIndex + 1; i < offer.status_changes.length; i++) {
                  const nextChange = offer.status_changes[i];
                  if (typeof nextChange === 'string') {
                    if (nextChange.includes('contact-') || 
                        nextChange.includes('interview-') || 
                        nextChange.includes('rejected-') || 
                        nextChange.includes('offer-')) {
                      nextStatusChange = nextChange;
                      break;
                    }
                  }
                }
                if (nextStatusChange) {
                  const nextStatusMatch = nextStatusChange.match(/[a-z]+-(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
                  if (nextStatusMatch && nextStatusMatch[1]) {
                    const responseDate = new Date(nextStatusMatch[1]);
                    const diffTime = Math.abs(responseDate.getTime() - sendDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays >= 1 && diffDays <= 180) {
                      totalResponseTime += diffDays;
                      responseTimeCount++;
                    }
                  }
                }
              }
            }
          }
        });
        const avgResponseTime = responseTimeCount > 0 
          ? (totalResponseTime / responseTimeCount).toFixed(1) 
          : "-";
        const formattedResponseTime = avgResponseTime !== "-" 
          ? `${avgResponseTime} dni` 
          : "Brak danych";
        setMetrics({
          sentPercentage,
          responsePercentage,
          responseTime: formattedResponseTime,
          responseRate,
          totalOffers: totalCount,
          averageSavedPerMonth,
          customCVCount: customCvs,
          customCVPercentage
        });
      } catch (error) {
        console.error("Błąd podczas pobierania metryk:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <Card className="overflow-hidden h-[250px] bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-4 py-2">
            <Skeleton className="h-[230px] w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-2 gap-y-3 p-4 h-[230px]">
            {/* Procent wysłanych ofert */}
            <div className="flex flex-col items-center p-2 rounded-md border bg-card text-card-foreground shadow-sm">
              <Send className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-sm font-medium text-center">Wysłane</span>
              <span className="text-xl font-bold text-blue-500">{metrics.sentPercentage}%</span>
            </div>
            
            {/* Procent odpowiedzi */}
            <div className="flex flex-col items-center p-2 rounded-md border bg-card text-card-foreground shadow-sm">
              <CheckCheck className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-sm font-medium text-center">Odpowiedzi</span>
              <span className="text-xl font-bold text-green-500">{metrics.responsePercentage}%</span>
            </div>
            
            {/* Procent odpowiedzi na wysłane oferty */}
            <div className="flex flex-col items-center p-2 rounded-md border bg-card text-card-foreground shadow-sm">
              <Percent className="h-5 w-5 text-purple-500 mb-1" />
              <span className="text-sm font-medium text-center">Skuteczność</span>
              <span className="text-xl font-bold text-purple-500">{metrics.responseRate}%</span>
            </div>
            
            {/* Średni czas odpowiedzi */}
            <div className="flex flex-col items-center p-2 rounded-md border bg-card text-card-foreground shadow-sm">
              <Clock className="h-5 w-5 text-orange-500 mb-1" />
              <span className="text-sm font-medium text-center">Czas odpowiedzi</span>
              <span className="text-xl font-bold text-orange-500">{metrics.responseTime}</span>
            </div>
            
            {/* Średnia ilość zapisanych ofert miesięcznie */}
            <div className="flex flex-col items-center p-2 rounded-md border bg-card text-card-foreground shadow-sm">
              <BarChart className="h-5 w-5 text-cyan-500 mb-1" />
              <span className="text-sm font-medium text-center">Oferty/mies.</span>
              <span className="text-xl font-bold text-cyan-500">{metrics.averageSavedPerMonth}</span>
            </div>
            
            {/* Liczba specjalnych CV */}
            <div className="flex flex-col items-center p-2 rounded-md border bg-card text-card-foreground shadow-sm">
              <FileText className="h-5 w-5 text-amber-500 mb-1" />
              <span className="text-sm font-medium text-center">Specjalne CV</span>
              <span className="text-xl font-bold text-amber-500">{metrics.customCVCount}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 