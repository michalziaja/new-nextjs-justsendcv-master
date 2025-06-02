"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, FileText, Mail, PhoneCall, Send, X, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

// Struktura danych dla statystyk
interface StatusCounts {
  saved: number;
  send: number;
  contact: number;
  interview: number;
  offer: number;
  rejected: number;
}

// Komponent karty statystyk z kolorowym tłem
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  bgColor: string; // Kolor tła dla całej karty
  textColor: string; // Kolor tekstu dla kontrastu
  isLoading?: boolean;
}

function StatCard({ title, value, description, icon, bgColor, textColor, isLoading = false }: StatCardProps) {
  return (
    <Card className={`
      border-0
      ${bgColor}
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
      dark:shadow-slate-900/20
      transition-all duration-200
      rounded-sm
      ${textColor}
    `}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="-mt-6 text-sm font-sm md:text-base lg:text-base xl:text-base">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="-mt-8 mb-1 text-md md:text-2xl lg:text-2xl xl:text-2xl font-bold flex items-center">
          {isLoading ? (
            <Skeleton className="h-8 w-10" />
          ) : (
            value
          )}
        </div>
        <p className="text-xs opacity-80 hidden min-[700px]:block -mb-3">{description}</p>
      </CardContent>
    </Card>
  )
}

export function StatCards() {
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    saved: 0,
    send: 0,
    contact: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      setIsLoading(true);
      
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setIsLoading(false);
          return;
        }

        // Pobierz wszystkie oferty użytkownika
        const { data: jobOffers, error } = await supabase
          .from('job_offers')
          .select('status')
          .eq('user_id', user.id);

        if (error) {
          console.error("Błąd podczas pobierania ofert pracy:", error);
          setIsLoading(false);
          return;
        }

        // Zlicz oferty według statusów
        const counts: StatusCounts = {
          saved: 0,
          send: 0,
          contact: 0,
          interview: 0,
          offer: 0,
          rejected: 0
        };

        jobOffers.forEach(job => {
          const status = job.status as keyof StatusCounts;
          if (status in counts) {
            counts[status]++;
          }
        });

        setStatusCounts(counts);
      } catch (error) {
        console.error("Wystąpił błąd podczas pobierania statystyk:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusCounts();
  }, []);

  return (
    <div className="grid gap-2 sm:gap-2 md:gap-2 lg:gap-2 xl:gap-3 grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 ">
      {/* Karta "Zapisane" - niebieskie tło */}
      <StatCard 
        title="Zapisane" 
        value={statusCounts.saved}
        description="Zapisane oferty"
        icon={<FileText className="h-6 w-6 text-white" />}
        bgColor="bg-blue-500 dark:bg-blue-600"
        textColor="text-white"
        isLoading={isLoading}
      />
      {/* Karta "Wysłane" - fioletowe tło */}
      <StatCard 
        title="Wysłane" 
        value={statusCounts.send}
        description="Aplikacje wysłane"
        icon={<Send className="h-6 w-6 text-white" />}
        bgColor="bg-purple-500 dark:bg-purple-600"
        textColor="text-white"
        isLoading={isLoading}
      />
      {/* Karta "Kontakt" - żółte tło */}
      <StatCard 
        title="Kontakt" 
        value={statusCounts.contact}
        description="Kontakt od HR"
        icon={<Mail className="h-6 w-6 text-white" />}
        bgColor="bg-yellow-400 dark:bg-yellow-500"
        textColor="text-white dark:text-gray-900"
        isLoading={isLoading}
      />
      {/* Karta "Rozmowa" - błękitne tło */}
      <StatCard 
        title="Rozmowa" 
        value={statusCounts.interview}
        description="Umówione rozmowy"
        icon={<PhoneCall className="h-6 w-6 text-white" />}
        bgColor="bg-cyan-500 dark:bg-cyan-600"
        textColor="text-white"
        isLoading={isLoading}
      />
      {/* Karta "Oferta" - zielone tło */}
      <StatCard 
        title="Oferta" 
        value={statusCounts.offer}
        description="Otrzymane oferty"
        icon={<ClipboardList className="h-6 w-6 text-white" />}
        bgColor="bg-green-500 dark:bg-green-600"
        textColor="text-white"
        isLoading={isLoading}
      />
      {/* Karta "Odmowa" - czerwone tło */}
      <StatCard 
        title="Odmowa" 
        value={statusCounts.rejected}
        description="Odmowy"
        icon={<X className="h-6 w-6 text-white" />}
        bgColor="bg-red-500 dark:bg-red-600"
        textColor="text-white"
        isLoading={isLoading}
      />
    </div>
  )
} 