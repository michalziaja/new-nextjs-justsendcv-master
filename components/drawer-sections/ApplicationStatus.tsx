// components/drawer-sections/ApplicationStatus.tsx
import { cn } from "@/lib/utils"
import * as React from 'react'
// Importuj współdzielone utils
import {
    updateApplicationStatus,
    parseStatusHistory,
    statusSteps, // Importuj kroki
    statusMapENtoPL, // Potrzebne do inicjalizacji
    StatusHistory, // Importuj typ
} from "@/lib/applicationStatusUtils"
import type { ApplicationStatus as ApplicationStatusType } from "../saved/SavedTableTabs" // Importuj typ
import { createClient } from "@/utils/supabase/client" // Potrzebne do fetch initial
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
import { JobOffer } from "../saved/ApplicationDetailsDrawer"

interface ApplicationStatusProps {
  application: JobOffer
  onStatusChange?: (newStatus: ApplicationStatusType) => void
}

export function ApplicationStatus({ application, onStatusChange }: ApplicationStatusProps) {
  // Inicjalizuj activeStep na podstawie application.status (który powinien być PL)
  const [activeStep, setActiveStep] = React.useState<ApplicationStatusType>(application.status as ApplicationStatusType)
  const [statusHistory, setStatusHistory] = React.useState<StatusHistory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false)
  const [statusToConfirm, setStatusToConfirm] = React.useState<{status: ApplicationStatusType, index: number} | null>(null)

  // Pobieranie historii statusów z Supabase - pozostaje podobne
  React.useEffect(() => {
    const fetchStatusHistory = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('job_offers')
          .select('status_changes, status') // Pobieramy też aktualny status EN
          .eq('id', application.id)
          .single();

        if (error) {
          console.error("Błąd podczas pobierania historii statusów:", error);
           setStatusHistory([]); // Ustaw pustą historię w razie błędu
           // Ustaw activeStep na podstawie przekazanego application.status (PL) jako fallback
           setActiveStep(application.status as ApplicationStatusType);
          setIsLoading(false);
          return;
        }

        console.log("Pobrane dane statusów:", data);

        // Użyj współdzielonej funkcji parsowania
        let history = parseStatusHistory(data.status_changes);

        // Ustaw aktualny status na podstawie danych z bazy (przekonwertowany na PL)
        const currentStatusDB = statusMapENtoPL[data.status as keyof typeof statusMapENtoPL] as ApplicationStatusType || 'zapisana';
        setActiveStep(currentStatusDB);

         // Sprawdzenie spójności - czy ostatni wpis w historii pasuje do statusu z bazy
        if (history.length > 0 && history[history.length - 1].status !== currentStatusDB) {
             console.warn("Niespójność między ostatnim wpisem historii a aktualnym statusem z bazy. Wyświetlam status z bazy.");
             // Można rozważyć dodanie brakującego wpisu lokalnie, jak wcześniej, jeśli taka logika jest pożądana
             // history.push({
             //   status: currentStatusDB,
             //   date: new Date().toLocaleDateString('pl-PL') // Lub data z 'created_at' jeśli to pierwszy status?
             // });
        } else if (history.length === 0 && data.status) {
             // Jeśli historia jest pusta, ale mamy status z bazy (np. 'saved')
              console.log("Historia pusta, dodawanie wpisu na podstawie statusu z bazy:", currentStatusDB);
              history.push({
                 status: currentStatusDB,
                 // Użyj daty utworzenia aplikacji jako przybliżonej daty pierwszego statusu
                 date: application.created_at ? new Date(application.created_at).toLocaleDateString('pl-PL') : new Date().toLocaleDateString('pl-PL')
             });
        }


        // Sortowanie historii wg daty (potrzebujemy przekonwertować daty PL z powrotem na obiekty Date do sortowania)
         const sortedHistory = [...history].sort((a, b) => {
            const parseDatePL = (dateStr: string): Date => {
                 if (!dateStr || dateStr.includes("Nieznana") || dateStr.includes("Błąd")) return new Date(0); // Handle invalid/placeholder dates
                 const parts = dateStr.split('.');
                 if (parts.length === 3) {
                     // Format DD.MM.YYYY
                     return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                 }
                 return new Date(0); // Fallback for unexpected format
            };
            const dateA = parseDatePL(a.date);
            const dateB = parseDatePL(b.date);
            return dateA.getTime() - dateB.getTime();
         });


        setStatusHistory(sortedHistory);

      } catch (error) {
        console.error("Wystąpił błąd:", error);
        setStatusHistory([]);
        setActiveStep(application.status as ApplicationStatusType); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusHistory();
  // Dodaj application.status do zależności, aby odświeżyć, jeśli zmieni się w tabeli
  }, [application.id, application.status]);

  // Definicja kroków jest teraz importowana

  // Znajdź daty dla każdego statusu z historii (bez zmian)
  const getDateForStatus = (status: ApplicationStatusType): string => {
    for (let i = statusHistory.length - 1; i >= 0; i--) {
      if (statusHistory[i].status === status) {
        return statusHistory[i].date;
      }
    }
    return '';
  };

  // Style (bez zmian)
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

  // Index aktualnego kroku (bez zmian)
  const currentStepIndex = statusSteps.findIndex(step => step.status === activeStep)

  // Funkcja sprawdzająca cofnięcie (używa importowanych statusSteps)
  const isStatusReversal = (newStatus: ApplicationStatusType): boolean => {
    const currentIndex = statusSteps.findIndex(step => step.status === activeStep);
    const newIndex = statusSteps.findIndex(step => step.status === newStatus);
    return newIndex < currentIndex;
  }

  // Zapisywanie zmiany statusu - USUNIĘTE (przeniesione do utils)

  // Obsługa próby zmiany statusu (bez zmian, używa isStatusReversal)
  const handleStatusChangeAttempt = (status: ApplicationStatusType, index: number) => {
    if (isStatusReversal(status)) {
      setStatusToConfirm({status, index});
      setConfirmDialogOpen(true);
    } else {
      handleConfirmedStatusChange(status, index, false);
    }
  }

  // Obsługa potwierdzonej zmiany statusu (teraz używa utils)
  const handleConfirmedStatusChange = async (status: ApplicationStatusType, index: number, removeSubsequentStatuses: boolean) => {
    // Optymistyczne ustawienie aktywnego kroku
    setActiveStep(status);

    // Wywołanie współdzielonej funkcji aktualizacji
    const result = await updateApplicationStatus(application.id, status, removeSubsequentStatuses);

    if (result.success) {
      console.log("Status zaktualizowany pomyślnie.");
      // Zaktualizuj historię na podstawie danych zwróconych przez funkcję
      if (result.updatedHistory) {
        setStatusHistory(result.updatedHistory);
      }
      // Wywołaj callback do rodzica
      if (onStatusChange) {
        onStatusChange(status);
      }
    } else {
      console.error("Błąd aktualizacji statusu:", result.error);
      // TODO: Można dodać powiadomienie dla użytkownika o błędzie
      // Przywróć poprzedni stan wizualny w razie błędu? (opcjonalne)
      // const previousStatus = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1].status : application.status;
      // setActiveStep(previousStatus);
    }
    // Zamknij dialog, jeśli był otwarty
     setConfirmDialogOpen(false);
     setStatusToConfirm(null);
  }

  // Renderowanie komponentu (struktura JSX bez zmian, używa importowanych statusSteps)
  return (
    <>
    <div className="py-2">
      <div className="relative flex items-center justify-between gap-x-4 sm:gap-x-4 md:gap-x-4">
        {/* Linia tła */}
        <div className="absolute left-12 md:left-16 right-8 sm:right-12 md:right-16 top-5 sm:top-[22px] md:top-6 h-[2px] bg-gray-300/50 transition-all duration-500 ease-in-out z-10" />

        {/* Animowana linia postępu */}
        <div
          className="absolute left-12 md:left-16 right-12 top-5 sm:top-[22px] md:top-6 h-[2px] bg-primary/100 transition-all duration-700 ease-in-out z-10"
          style={{
            width: currentStepIndex >= 0
              // Dostosuj obliczenia, jeśli liczba kroków lub marginesy się zmienią
              ? `calc(${(85 / (statusSteps.length - 1)) * currentStepIndex}% - ${currentStepIndex === 0 ? 20 : 0}px)`
              : '0%',
          }}
        />

        {/* Krok po kroku */}
        {statusSteps.map((step, index) => {
          const Icon = step.icon
          // Logika isActive i isCurrent - uwzględnia specyficzne zachowanie dla 'odmowa'
           const isRejectedActive = activeStep === 'odmowa';
           const isActive = isRejectedActive
               ? currentStepIndex >= index && step.status !== 'oferta'
               : currentStepIndex >= index;
           const isCurrent = step.status === activeStep;
           const isPrevious = currentStepIndex > index && !isCurrent;

            // Pobierz datę zmiany statusu dla danego kroku (jeśli istnieje)
            const statusDate = getDateForStatus(step.status);

          return (
            <div
              key={step.status}
              className={cn(
                "relative flex flex-col items-center z-20 w-full",
                // Dodatkowe style dla 'oferta' gdy aktywna jest 'odmowa'
                step.status === 'oferta' && isRejectedActive && "opacity-50 cursor-not-allowed" // Zmieniono opacity na bardziej widoczne
              )}
            >
              {/* Kółko ze statusem */}
              <div
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 relative",
                  isActive ? getStatusStyles(step.status) : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
                  isCurrent && "ring-2 ring-primary ring-offset-2 scale-110 shadow-xl shadow-primary/20",
                  isPrevious && "shadow-xl", // Może być nadmiarowe z isActive
                  !isActive && "shadow-sm", // Mniejszy cień dla nieaktywnych
                  step.status === 'oferta' && isRejectedActive && "!cursor-not-allowed !bg-gray-300 !text-gray-500", // Nadpisanie styli dla oferty przy odmowie
                  "hover:scale-105"
                )}
                title={step.status}
                onClick={() => {
                  // Zezwól na kliknięcie tylko jeśli status nie jest 'oferta' gdy aktywna jest 'odmowa'
                  if (!(step.status === 'oferta' && isRejectedActive)) {
                      handleStatusChangeAttempt(step.status, index)
                  }
                }}
              >
                <Icon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 transition-transform duration-300",
                  isCurrent && "scale-110 text-white", // Zapewnij białą ikonę dla aktywnego
                   isActive && !isCurrent && "text-white/90", // Poprawka dla poprzednich aktywnych
                   !isActive && (step.status === 'oferta' && isRejectedActive ? "text-gray-500" : ""), // Ikona dla zablokowanej oferty
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
                    {/* Wyświetl datę jeśli krok jest aktywny lub bieżący, inaczej myślnik lub ładowanie */}
                     {(isActive || isCurrent) ? (statusDate || (isLoading ? "..." : "-")) : (isLoading ? "..." : "-")}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>

      {/* Dialog potwierdzenia zmiany statusu (bez zmian) */}
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
            <AlertDialogCancel onClick={() => { setConfirmDialogOpen(false); setStatusToConfirm(null); }}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusToConfirm) {
                  // Wywołaj handleConfirmedStatusChange z flagą true dla cofnięcia
                  handleConfirmedStatusChange(statusToConfirm.status, statusToConfirm.index, true);
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