// components/drawer-sections/ApplicationStatus.tsx
import { BookmarkIcon, SendIcon, PhoneIcon, UsersIcon, CheckIcon, XIcon, SaveIcon } from "lucide-react"
import { mockApplications } from "../saved/mockData"
import { ApplicationStatus as ApplicationStatusType } from "../saved/SavedTableTabs"
import { cn } from "@/lib/utils"
import * as React from 'react'
import { createClient } from "@/utils/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Mapa statusów z angielskiego na polski
const statusMapENtoPL = {
  saved: 'zapisana',
  send: 'wysłana',
  contact: 'kontakt',
  interview: 'rozmowa', 
  offer: 'oferta',
  rejected: 'odmowa'
} as const;

// Mapa statusów z polskiego na angielski
const statusMapPLtoEN = {
  zapisana: 'saved',
  wysłana: 'send',
  kontakt: 'contact',
  rozmowa: 'interview',
  oferta: 'offer',
  odmowa: 'rejected'
} as const;

// Typ dla historii statusu
interface StatusHistory {
  status: ApplicationStatusType;
  date: string;
}

// Funkcja parsująca historię statusów z Supabase
const parseStatusHistory = (statusChanges: string[] | null): StatusHistory[] => {
  if (!statusChanges || statusChanges.length === 0) {
    return [];
  }

  return statusChanges.map(entry => {
    // Podział wpisu na status i datę
    const parts = entry.split('-');
    
    if (parts.length < 2) {
      console.error("Nieprawidłowy format wpisu w historii statusów:", entry);
      return { status: 'zapisana', date: '' };
    }
    
    // Pobierz status (pierwsza część) i datę (reszta ciągu po pierwszym myślniku)
    const status = parts[0];
    // Łączymy resztę części w przypadku, gdyby data zawierała myślniki
    const dateTime = parts.slice(1).join('-');
    
    // Przekształć status z angielskiego na polski
    const plStatus = statusMapENtoPL[status as keyof typeof statusMapENtoPL] as ApplicationStatusType || 'zapisana';
    
    // Formatuj datę
    let formattedDate = dateTime;
    try {
      const date = new Date(dateTime);
      formattedDate = date.toLocaleDateString('pl-PL');
    } catch (error) {
      console.error("Błąd formatowania daty:", error);
    }
    
    return {
      status: plStatus,
      date: formattedDate
    };
  });
};

interface ApplicationStatusProps {
  application: typeof mockApplications[0]
  onStatusChange?: (newStatus: ApplicationStatusType) => void
}

export function ApplicationStatus({ application, onStatusChange }: ApplicationStatusProps) {
  const [activeStep, setActiveStep] = React.useState<ApplicationStatusType>(application.status)
  const [statusHistory, setStatusHistory] = React.useState<StatusHistory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Stan dialogu potwierdzenia
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false)
  const [statusToConfirm, setStatusToConfirm] = React.useState<{status: ApplicationStatusType, index: number} | null>(null)

  // Pobieranie historii statusów z Supabase
  React.useEffect(() => {
    const fetchStatusHistory = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Pobieranie historii statusów dla konkretnej oferty
        const { data, error } = await supabase
          .from('job_offers')
          .select('status_changes, status')
          .eq('id', application.id)
          .single();
        
        if (error) {
          console.error("Błąd podczas pobierania historii statusów:", error);
          setIsLoading(false);
          return;
        }
        
        console.log("Pobrane dane statusów:", data);
        
        // Parsowanie historii statusów
        const history = parseStatusHistory(data.status_changes);
        
        // Dodanie aktualnego statusu, jeśli nie ma go w historii lub jest inny niż ostatni wpis
        const currentStatus = statusMapENtoPL[data.status as keyof typeof statusMapENtoPL] as ApplicationStatusType || 'zapisana';
        
        if (history.length === 0 || history[history.length - 1].status !== currentStatus) {
          // Aktualny status nie jest obecny w historii
          console.log("Dodawanie brakującego statusu:", currentStatus);
          history.push({
            status: currentStatus,
            date: new Date().toLocaleDateString('pl-PL')
          });
        }
        
        // Ustawienie aktualnego statusu na podstawie danych z bazy
        setActiveStep(currentStatus);
        
        // Sortowanie historii według daty (nie według kolejności statusów)
        const sortedHistory = [...history].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        
        setStatusHistory(sortedHistory);
      } catch (error) {
        console.error("Wystąpił błąd:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatusHistory();
  }, [application.id, application.status]);

  // Definiowanie kroków statusu z ich odpowiednimi ikonami
  const statusSteps = [
    { status: 'zapisana' as const, icon: BookmarkIcon },
    { status: 'wysłana' as const, icon: SendIcon },
    { status: 'kontakt' as const, icon: PhoneIcon },
    { status: 'rozmowa' as const, icon: UsersIcon },
    { status: 'oferta' as const, icon: CheckIcon },
    { status: 'odmowa' as const, icon: XIcon }
  ] as const;

  // Znajdź daty dla każdego statusu z historii
  const getDateForStatus = (status: ApplicationStatusType): string => {
    // Szukamy od końca, aby znaleźć najnowszy wpis dla danego statusu
    for (let i = statusHistory.length - 1; i >= 0; i--) {
      if (statusHistory[i].status === status) {
        return statusHistory[i].date;
      }
    }
    return '';
  };

  const getStatusStyles = (status: ApplicationStatusType) => {
    switch (status) {
      case 'zapisana': return 'bg-blue-600 text-white hover:bg-blue-700'
      case 'kontakt': return 'bg-yellow-600 text-white hover:bg-yellow-700'
      case 'rozmowa': return 'bg-cyan-600 text-white hover:bg-cyan-700'
      case 'oferta': return 'bg-green-600 text-white hover:bg-green-700'
      case 'odmowa': return 'bg-red-600 text-white hover:bg-red-700'
      case 'wysłana': return 'bg-purple-600 text-white hover:bg-purple-700'
      default: return 'bg-gray-200 text-gray-500 hover:bg-gray-300'
    }
  }

  const currentStepIndex = statusSteps.findIndex(step => step.status === activeStep)

  // Funkcja sprawdzająca, czy jest to cofnięcie statusu
  const isStatusReversal = (newStatus: ApplicationStatusType): boolean => {
    const currentIndex = statusSteps.findIndex(step => step.status === activeStep);
    const newIndex = statusSteps.findIndex(step => step.status === newStatus);
    
    // Jeśli nowy status ma mniejszy indeks niż aktualny, to jest to cofnięcie
    return newIndex < currentIndex;
  }

  // Zapisywanie zmiany statusu w bazie danych
  const updateStatusInDatabase = async (newStatus: ApplicationStatusType, removeSubsequentStatuses: boolean = false) => {
    try {
      const supabase = createClient();
      
      // Mapowanie statusu z polskiego na angielski
      const dbStatus = statusMapPLtoEN[newStatus as keyof typeof statusMapPLtoEN];
      const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      // Pobierz aktualną historię statusów z bazy
      const { data, error: fetchError } = await supabase
        .from('job_offers')
        .select('status_changes')
        .eq('id', application.id)
        .single();
      
      if (fetchError) {
        console.error("Błąd podczas pobierania historii statusów:", fetchError);
        return;
      }
      
      let updatedStatusChanges = data.status_changes || [];
      
      // Specjalne traktowanie dla statusu "zapisana" (saved)
      const isSavedStatus = dbStatus === 'saved';
      
      if (removeSubsequentStatuses) {
        // Filtrowanie historii - zachowaj tylko statusy poprzedzające nowy status
        // lub równe nowemu statusowi (jeśli już występuje)
        const newStatusIndex = statusSteps.findIndex(s => s.status === newStatus);
        
        // Jeśli cofamy się do "zapisana", chcemy zachować tylko oryginalny wpis "saved"
        if (isSavedStatus) {
          // Znajdź pierwszy wpis "saved"
          const savedEntryIndex = updatedStatusChanges.findIndex((entry: string) => 
            entry.startsWith('saved-')
          );
          
          if (savedEntryIndex !== -1) {
            // Zachowaj tylko oryginalny wpis "saved"
            updatedStatusChanges = [updatedStatusChanges[savedEntryIndex]];
          }
        } else {
          // Dla innych statusów, standardowe filtrowanie
          const parsedHistory = parseStatusHistory(updatedStatusChanges);
          
          // Filtruj, zostawiając tylko statusy poprzedzające nowy status w kolejności
          const filteredHistory = parsedHistory.filter(item => {
            const itemIndex = statusSteps.findIndex(s => s.status === item.status);
            return itemIndex <= newStatusIndex;
          });
          
          // Konwertuj z powrotem na format bazy danych
          updatedStatusChanges = filteredHistory.map(item => {
            const enStatus = statusMapPLtoEN[item.status as keyof typeof statusMapPLtoEN];
            // Używamy oryginalnej daty z parsowanej historii
            const originalEntry = data.status_changes.find((entry: string) => 
              entry.startsWith(enStatus + '-')
            );
            return originalEntry || `${enStatus}-${item.date}`;
          });
        }
      }
      
      // Dodaj nowy wpis historii, ale tylko jeśli nie jest to "saved" lub jeszcze nie ma tego statusu
      const newStatusEntry = `${dbStatus}-${currentDateTime}`;
      
      // Sprawdź, czy ten status już istnieje
      const existingIndex = updatedStatusChanges.findIndex((entry: string) => 
        entry.startsWith(dbStatus + '-')
      );
      
      if (existingIndex !== -1) {
        // Jeśli to status "saved", nie aktualizujemy daty - zachowujemy oryginalną
        if (!isSavedStatus) {
          updatedStatusChanges[existingIndex] = newStatusEntry;
        }
        // Dla "saved" nie zmieniamy istniejącego wpisu - zostawiamy oryginalną datę
      } else {
        // Status nie istnieje jeszcze w historii, dodajemy nowy wpis
        updatedStatusChanges.push(newStatusEntry);
      }
      
      // Aktualizacja statusu i historii statusów w bazie danych
      const { error } = await supabase
        .from('job_offers')
        .update({
          status: dbStatus,
          status_changes: updatedStatusChanges
        })
        .eq('id', application.id);
      
      if (error) {
        console.error("Błąd podczas aktualizacji statusu:", error);
        return;
      }
      
      // Pobierz zaktualizowaną historię statusów
      const { data: updatedData, error: refetchError } = await supabase
        .from('job_offers')
        .select('status_changes')
        .eq('id', application.id)
        .single();
      
      if (refetchError) {
        console.error("Błąd podczas pobierania zaktualizowanej historii statusów:", refetchError);
        return;
      }
      
      // Aktualizacja lokalnego stanu historii
      const updatedHistory = parseStatusHistory(updatedData.status_changes);
      
      // Sortuj historię wg daty
      const sortedHistory = [...updatedHistory].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      
      setStatusHistory(sortedHistory);
      
    } catch (error) {
      console.error("Wystąpił nieoczekiwany błąd:", error);
    }
  };
  
  // Obsługa próby zmiany statusu
  const handleStatusChangeAttempt = (status: ApplicationStatusType, index: number) => {
    // Sprawdź, czy jest to cofnięcie statusu
    if (isStatusReversal(status)) {
      // Otwórz dialog potwierdzenia
      setStatusToConfirm({status, index});
      setConfirmDialogOpen(true);
    } else {
      // Jeśli nie jest to cofnięcie, zmień status normalnie
      handleConfirmedStatusChange(status, index, false);
    }
  }

  // Obsługa potwierdzonej zmiany statusu
  const handleConfirmedStatusChange = (status: ApplicationStatusType, index: number, removeSubsequentStatuses: boolean) => {
    setActiveStep(status);
    
    // Aktualizacja statusu w bazie danych
    updateStatusInDatabase(status, removeSubsequentStatuses);
    
    // Wywołanie funkcji zwrotnej, jeśli została przekazana
    if (onStatusChange) {
      onStatusChange(status);
    }
  }

  return (
    <>
    <div className="py-2">
      <div className="relative flex items-center justify-between gap-x-4 sm:gap-x-4 md:gap-x-4">
        {/* Linia tła */}
        <div className="absolute left-16 right-8 sm:right-12 md:right-16 top-5 sm:top-[22px] md:top-6 h-[2px] bg-gray-300/50 transition-all duration-500 ease-in-out z-10" />
        
        {/* Animowana linia postępu */}
        <div 
          className="absolute left-16 right-12 top-5 sm:top-[22px] md:top-6 h-[2px] bg-primary/100 transition-all duration-700 ease-in-out z-10"
          style={{ 
            width: currentStepIndex >= 0 
              ? `calc(${(85 / (statusSteps.length - 1)) * currentStepIndex}% - ${currentStepIndex === 0 ? 20 : 0}px)`
              : '0%',
          }} 
        />

        {/* Krok po kroku */}
        {statusSteps.map((step, index) => {
          const Icon = step.icon
          const isActive = activeStep === 'odmowa' 
            ? currentStepIndex >= index && step.status !== 'oferta'
            : currentStepIndex >= index
          const isCurrent = step.status === activeStep
          const isPrevious = currentStepIndex > index && !isCurrent
            
            // Pobierz datę zmiany statusu dla danego kroku (jeśli istnieje)
            const statusDate = getDateForStatus(step.status);

          return (
            <div 
              key={step.status}
              className={cn(
                "relative flex flex-col items-center z-20 w-full",
                step.status === 'oferta' && activeStep === 'odmowa' && "opacity-100"
              )}
            >
              {/* Kółko ze statusem */}
              <div
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 relative",
                  isActive ? getStatusStyles(step.status) : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
                  isCurrent && "ring-2 ring-primary ring-offset-2 scale-110 shadow-xl shadow-primary/20",
                  isPrevious && "shadow-xl",
                  !isActive && "shadow-xl",
                  step.status === 'oferta' && activeStep === 'odmowa' && "cursor-not-allowed opacity-50",
                  "hover:scale-105"
                )}
                title={step.status}
                onClick={() => {
                  if (!(step.status === 'oferta' && activeStep === 'odmowa')) {
                      handleStatusChangeAttempt(step.status, index)
                  }
                }}
              >
                <Icon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 transition-transform duration-300",
                  isCurrent && "scale-110 text-white",
                  isPrevious && "text-white/90"
                )} />
              </div>

              {/* Etykieta */}
              <div className="mt-2 sm:mt-2.5 md:mt-3 text-center w-full">
                <span className={cn(
                  "text-[10px] sm:text-[11px] font-medium block transition-colors duration-300 truncate px-1",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                </span>
                  {/* Wyświetlanie daty z historii statusów */}
                <span className={cn(
                  "text-[8px] sm:text-[9px] block transition-colors duration-300",
                  isActive ? "text-primary/70" : "text-muted-foreground/70"
                )}>
                    {statusDate || (isLoading ? "Ładowanie..." : "-")}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>

      {/* Dialog potwierdzenia zmiany statusu */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cofnięcie statusu</AlertDialogTitle>
            <AlertDialogDescription>
              Chcesz cofnąć status aplikacji do "{statusToConfirm?.status}". 
              Ta operacja usunie wszystkie późniejsze statusy z historii. Czy na pewno chcesz kontynuować?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialogOpen(false)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusToConfirm) {
                  handleConfirmedStatusChange(statusToConfirm.status, statusToConfirm.index, true);
                  setConfirmDialogOpen(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Tak, cofnij status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}