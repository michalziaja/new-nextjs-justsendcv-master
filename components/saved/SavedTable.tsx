"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SavedTableTabs, type ApplicationStatus } from "./SavedTableTabs"
import { SavedTableSearch } from "./SavedTableSearch"
import { SavedTablePagination } from "./SavedTablePagination"
import { ArrowUpDown, ArrowUp, ArrowDown, Check, Circle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApplicationDetailsDrawer } from "./ApplicationDetailsDrawer"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
// Importuj współdzielone utils
import {
    updateApplicationStatus,
    statusSteps,
    parseStatusHistory,
    statusMapPLtoEN, // Potrzebne do konwersji w parseStatusHistoryToStringArray
    StatusHistory // Importuj typ dla parseStatusHistoryToStringArray
} from "@/lib/applicationStatusUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog" // Import AlertDialog
import { useSearchParams } from "next/navigation"

// Konfiguracja szerokości kolumn (bez zmian)
const COLUMN_WIDTHS = {
  position: 300,
  company: 200,
  date: 140,
  status: 80,
  validUntil: 120,
  priority: 100,
  site: 100,
} as const;

// Mapowanie statusów EN->PL (potrzebne do mapowania danych z bazy)
const statusMap = {
  saved: 'zapisana',
  send: 'wysłana',
  contact: 'kontakt',
  interview: 'rozmowa',
  offer: 'oferta',
  rejected: 'odmowa'
} as const;

// Typ dla oferty pracy z Supabase (bez zmian)
interface JobOffer {
  id: string;
  user_id: string;
  title: string;
  company: string;
  site: string | null;
  url: string | null;
  status: string; // Klucz EN z bazy
  full_description: string | null;
  note: string | null;
  salary: string | null;
  created_at: string;
  status_changes: string[];
  expire: string | null;
  priority: number;
}

// Typ dla aplikacji w tabeli (zmapowany)
type MappedApplication = {
  id: string;
  position: string;
  company: string;
  url: string;
  date: string; // Sformatowana data PL
  status: ApplicationStatus; // Status PL
  validUntil: string; // Sformatowana data PL lub '-'
  description: string;
  priority: number;
  site: string;
  dbStatus: string; // Oryginalny status EN
  status_changes: string[]; // Oryginalna historia jako string[]
}

// Mapowanie JobOffer na Application do wyświetlania w tabeli
const mapJobOfferToApplication = (job: JobOffer): MappedApplication => {
  return {
    id: job.id,
    position: job.title,
    company: job.company,
    url: job.url || '',
    date: new Date(job.created_at).toLocaleDateString('pl-PL'),
    status: statusMap[job.status as keyof typeof statusMap] || 'zapisana', // Fallback
    validUntil: job.expire ? new Date(job.expire).toLocaleDateString('pl-PL') : '-',
    description: job.full_description || '',
    priority: job.priority,
    site: job.site || '',
    dbStatus: job.status,
    status_changes: job.status_changes
  };
};

// Typ dla konfiguracji sortowania (bez zmian)
type SortConfig = {
  key: keyof JobOffer | null // Sortowanie nadal bazuje na kluczach z bazy
  direction: 'asc' | 'desc'
}

export function SavedTable() {
  const [status, setStatus] = useState<ApplicationStatus>("wszystkie")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'created_at', // Sortowanie po dacie utworzenia
    direction: 'desc'  // Sortowanie malejąco (od najnowszych)
  })
  const [selectedApplication, setSelectedApplication] = useState<MappedApplication | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [applications, setApplications] = useState<MappedApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const itemsPerPage = 10

  // Stany dla dialogu potwierdzenia w tabeli
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [statusToConfirmInTable, setStatusToConfirmInTable] = useState<{ app: MappedApplication, newStatus: ApplicationStatus } | null>(null);

  // Wewnątrz komponentu SavedTable, dodamy nowy stan do kontrolowania animacji
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pobieranie danych przy montowaniu
  useEffect(() => {
    const fetchJobOffers = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setApplications([]);
          setIsLoading(false);
          return;
        }

        const { data: jobOffers, error } = await supabase
          .from('job_offers')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error("Błąd podczas pobierania ofert pracy:", error);
          setApplications([]);
          setIsLoading(false);
          return;
        }

        const mappedApplications = jobOffers.map(mapJobOfferToApplication);
        setApplications(mappedApplications);

        // Sprawdź, czy jest parametr openDrawer w URL
        const drawerJobId = searchParams.get('openDrawer');
        if (drawerJobId) {
          // Znajdź aplikację o podanym ID
          const appToOpen = mappedApplications.find(app => app.id === drawerJobId);
          if (appToOpen) {
            // Ustaw aplikację i otwórz drawer
            setSelectedApplication(appToOpen);
            setIsDrawerOpen(true);
          }
        }

      } catch (error) {
        console.error("Wystąpił błąd:", error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobOffers();
  }, [searchParams]); // Dodaj searchParams jako zależność, aby reagować na zmiany w URL

  // Funkcja sortująca dane
  const sortData = (data: MappedApplication[]) => {
    if (!sortConfig.key) return data;
    const sortKeyMapped = sortConfig.key === 'title' ? 'position' : sortConfig.key;

    return [...data].sort((a, b) => {
      // @ts-ignore - Dynamiczny klucz
      const aValue = a[sortKeyMapped];
      // @ts-ignore
      const bValue = b[sortKeyMapped];

      if (sortConfig.key === 'created_at') {
         const dateA = new Date(a.date.split('.').reverse().join('-'));
         const dateB = new Date(b.date.split('.').reverse().join('-'));
         return sortConfig.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }
      if (sortConfig.key === 'status') {
         const indexA = statusSteps.findIndex(step => step.status === a.status);
         const indexB = statusSteps.findIndex(step => step.status === b.status);
         return sortConfig.direction === 'asc' ? indexA - indexB : indexB - indexA;
      }
      if (sortConfig.key === 'priority') {
         return sortConfig.direction === 'asc' ? (b.priority || 0) - (a.priority || 0) : (a.priority || 0) - (b.priority || 0);
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Obsługa kliknięcia w nagłówek kolumny sortowania
  const handleSort = (key: keyof JobOffer) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Renderowanie ikony sortowania
  const renderSortIcon = (key: keyof JobOffer) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-1 h-3 w-3" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  // Filtrowanie i wyszukiwanie
  const filteredApplications = applications.filter(app =>
    (status === "wszystkie" || app.status === status) &&
    (app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
     app.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sortowanie
  const sortedApplications = sortData(filteredApplications);

  // Paginacja
  const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
  const paginatedApplications = sortedApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Tworzenie pustych wierszy
  const emptyRows = Array(Math.max(0, itemsPerPage - paginatedApplications.length))
    .fill(null)
    .map((_, index) => index);

  // Obsługa zmiany filtra statusu
  const handleStatusFilterChange = (newStatus: ApplicationStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
  }

  // Obsługa zmiany wyszukiwania
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  // Obsługa kliknięcia URL
  const handleUrlClick = (url: string) => {
    window.open(url, '_blank');
  }

  // Obsługa kliknięcia wiersza (otwarcie Drawera)
  const handleRowClick = (app: MappedApplication) => {
    setSelectedApplication(app);
    setIsDrawerOpen(true);
  }

  // Obsługa próby zmiany statusu z tabeli (sprawdza cofnięcie i otwiera dialog)
  const handleTableStatusChangeAttempt = (newStatusPL: ApplicationStatus, app: MappedApplication) => {
    if (newStatusPL === app.status) return; // Nie rób nic jeśli status jest ten sam

    const currentIndex = statusSteps.findIndex(step => step.status === app.status);
    const newIndex = statusSteps.findIndex(step => step.status === newStatusPL);
    const isReversal = newIndex < currentIndex;

    if (isReversal) {
      setStatusToConfirmInTable({ app, newStatus: newStatusPL });
      setIsConfirmDialogOpen(true);
    } else {
      executeStatusUpdate(app, newStatusPL, false); // Wykonaj bez potwierdzenia
    }
  };

  // Obsługa potwierdzenia cofnięcia statusu w dialogu tabeli
  const handleConfirmedTableStatusChange = () => {
    if (statusToConfirmInTable) {
      executeStatusUpdate(statusToConfirmInTable.app, statusToConfirmInTable.newStatus, true); // removeSubsequent = true
    }
    setIsConfirmDialogOpen(false);
    setStatusToConfirmInTable(null);
  };

  // Główna funkcja wykonująca aktualizację statusu (w bazie i w stanie lokalnym)
  const executeStatusUpdate = async (app: MappedApplication, newStatusPL: ApplicationStatus, removeSubsequent: boolean) => {
    try {
      const result = await updateApplicationStatus(app.id, newStatusPL, removeSubsequent);

      if (result.success) {
        console.log("Status zaktualizowany pomyślnie (z tabeli).");
        setApplications(prevApps =>
          prevApps.map(a => {
            if (a.id === app.id) {
              const updatedDbStatus = Object.keys(statusMap).find(key => statusMap[key as keyof typeof statusMap] === newStatusPL) || a.dbStatus;
              // Aktualizuj historię w stanie lokalnym, jeśli została zwrócona
              const updatedStatusChangesString = result.updatedHistory
                ? parseStatusHistoryToStringArray(result.updatedHistory)
                : a.status_changes;

              return {
                 ...a,
                 status: newStatusPL,
                 dbStatus: updatedDbStatus,
                 status_changes: updatedStatusChangesString
               };
            }
            return a;
          })
        );

         if (isDrawerOpen && selectedApplication?.id === app.id) {
             setSelectedApplication(prev => prev ? { ...prev, status: newStatusPL } : null);
         }
      } else {
        console.error("Błąd podczas aktualizacji statusu (z tabeli):", result.error);
        // TODO: Poinformuj użytkownika
      }
    } catch (error) {
      console.error("Wystąpił nieoczekiwany błąd podczas executeStatusUpdate:", error);
       // TODO: Poinformuj użytkownika
    }
  }

    // Pomocnicza funkcja konwertująca historię z utils na string[] dla stanu tabeli
    const parseStatusHistoryToStringArray = (history: StatusHistory[]): string[] => {
        return history.map(item => {
            // Sprawdzenie, czy status istnieje w mapie przed indeksowaniem
            const enStatus = item.status !== 'wszystkie' 
                ? statusMapPLtoEN[item.status as keyof typeof statusMapPLtoEN]
                : 'saved'; // Domyślny status, jeśli z jakiegoś powodu napotkamy 'wszystkie'
            // Próba odtworzenia daty YYYY-MM-DD z formatu DD.MM.YYYY
            const dateParts = item.date.split('.');
            const isoishDate = dateParts.length === 3
                ? `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
                : new Date().toISOString().split('T')[0]; // Prosty fallback
            return `${enStatus}-${isoishDate}`;
        });
    };

  // Funkcja aktualizująca priorytet
  const handlePriorityChange = async (newPriority: number, appId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('job_offers')
        .update({ priority: newPriority })
        .eq('id', appId);

      if (error) {
        console.error("Błąd podczas aktualizacji priorytetu:", error);
        return;
      }

      setApplications(prevApps =>
        prevApps.map(a =>
          a.id === appId ? { ...a, priority: newPriority } : a
        )
      );
       if (isDrawerOpen && selectedApplication?.id === appId) {
           setSelectedApplication(prev => prev ? { ...prev, priority: newPriority } : null);
       }
    } catch (error) {
      console.error("Wystąpił błąd podczas aktualizacji priorytetu:", error);
    }
  }

  // Opcje statusów do Dropdown
  const statusOptions: ApplicationStatus[] = [
    'zapisana', 'wysłana', 'kontakt', 'rozmowa', 'oferta', 'odmowa',
  ]

  // Style dla statusów
  const getStatusStyles = (status: ApplicationStatus) => {
    switch (status) {
      case 'zapisana': return 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white'
      case 'wysłana': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
      case 'kontakt': return 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white'
      case 'rozmowa': return 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white'
      case 'oferta': return 'bg-gradient-to-r from-green-500 to-green-700 text-white'
      case 'odmowa': return 'bg-gradient-to-r from-red-500 to-red-700 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
    }
  }

  // Kolory priorytetu
  const getPriorityColor = (value: number) => {
    switch (value) {
      case 1: return 'text-green-500'
      case 2: return 'text-yellow-500'
      case 3: return 'text-orange-500'
      case 4: return 'text-red-400'
      case 5: return 'text-red-600'
      default: return 'text-muted-foreground/30'
    }
  }

  // Komponent SortIcon
  const SortIcon = ({ sortKey, sortConfig }: { sortKey: keyof JobOffer, sortConfig: SortConfig }) => {
    if (sortConfig.key !== sortKey) return <ArrowUpDown className="ml-1 h-3 w-3" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  // Dodamy funkcję do odświeżania danych
  const handleRefresh = async () => {
    // Rozpocznij animację
    setIsRefreshing(true);
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("Użytkownik nie jest zalogowany");
        setApplications([]);
        setIsLoading(false);
        return;
      }

      const { data: jobOffers, error } = await supabase
        .from('job_offers')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error("Błąd podczas pobierania ofert pracy:", error);
        setApplications([]);
        setIsLoading(false);
        return;
      }

      const mappedApplications = jobOffers.map(mapJobOfferToApplication);
      setApplications(mappedApplications);
    } catch (error) {
      console.error("Wystąpił błąd podczas odświeżania:", error);
      setApplications([]);
    } finally {
      setIsLoading(false);
      // Zakończ animację po krótkim opóźnieniu, aby była widoczna nawet przy szybkim odświeżeniu
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Funkcja do usuwania aplikacji
  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;
    
    console.log("Usuwanie aplikacji:", selectedApplication.id);
    
    try {
      const supabase = createClient();
      
      // Usunięcie oferty z bazy danych
      const { error } = await supabase
        .from('job_offers')
        .delete()
        .eq('id', selectedApplication.id);
        
      if (error) {
        console.error("Błąd podczas usuwania oferty:", error);
        return;
      }
      
      console.log("Oferta usunięta pomyślnie");
      
      // Aktualizacja stanu po usunięciu
      setApplications(prevApps => prevApps.filter(app => app.id !== selectedApplication.id));
      setSelectedApplication(null);
      setIsDrawerOpen(false);
      
    } catch (error) {
      console.error("Wystąpił błąd podczas usuwania oferty:", error);
    }
  };

  // Funkcje do nawigacji między ofertami
  const handleNextApplication = () => {
    if (!selectedApplication) return;
    
    // Znajdź indeks bieżącej aplikacji w posortowanej liście
    const currentIndex = sortedApplications.findIndex(app => app.id === selectedApplication.id);
    
    // Jeśli istnieje następna aplikacja, ustaw ją jako wybraną
    if (currentIndex !== -1 && currentIndex < sortedApplications.length - 1) {
      setSelectedApplication(sortedApplications[currentIndex + 1]);
    }
  };
  
  const handlePreviousApplication = () => {
    if (!selectedApplication) return;
    
    // Znajdź indeks bieżącej aplikacji w posortowanej liście
    const currentIndex = sortedApplications.findIndex(app => app.id === selectedApplication.id);
    
    // Jeśli istnieje poprzednia aplikacja, ustaw ją jako wybraną
    if (currentIndex > 0) {
      setSelectedApplication(sortedApplications[currentIndex - 1]);
    }
  };
  
  // Sprawdź, czy istnieją poprzednie/następne aplikacje
  const hasNextApplication = selectedApplication 
    ? sortedApplications.findIndex(app => app.id === selectedApplication.id) < sortedApplications.length - 1
    : false;
    
  const hasPreviousApplication = selectedApplication
    ? sortedApplications.findIndex(app => app.id === selectedApplication.id) > 0
    : false;

  return (
    <div className="flex flex-col space-y-4">
      {/* Sekcja wyszukiwania i odświeżania - bez zmian */}
      <div className="flex items-center justify-between">
        <SavedTableSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <Button 
          className="bg-gradient-to-r from-[#00B2FF] to-blue-600 dark:from-[#00B2FF] dark:to-blue-700 
            text-white border-0 hover:from-blue-500 hover:to-blue-700 
            transition-all duration-200 hover:scale-102 active:scale-100 
            shadow-md rounded-md text-sm md:text-sm mt-0 mr-1 h-8 w-32"
          onClick={handleRefresh}
        >
          <RefreshCw 
            className={cn(
              " mr-1 h-4 w-4 text-white transition-transform duration-700",
              isRefreshing && "animate-spin"
            )} 
          />
          Odśwież
        </Button>
      </div>

      {/* Zakładki statusów - bez zmian */}
      <div className="-ml-1">
        <SavedTableTabs activeStatus={status} onStatusChange={handleStatusFilterChange} />
      </div>

      {/* Tabela */}
      <div className="rounded-b-md -mt-2 border-1 bg-white border-gray-300 ml-0 mr-1 overflow-x-auto shadow-[2px_4px_10px_rgba(0,0,0,0.3)] dark:bg-gray-900 dark:border-gray-800">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50 dark:bg-background z-10">
            <TableRow>
              {/* Nagłówki kolumn z dodanymi klasami Tailwind CSS */}
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors lg:pl-3 md:pl-3 sm:pl-1" 
                style={{ width: COLUMN_WIDTHS.position }} 
                onClick={() => handleSort('title')}
              > 
                <div className="flex items-center">Stanowisko{renderSortIcon('title')}</div> 
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors" 
                style={{ width: COLUMN_WIDTHS.company }} 
                onClick={() => handleSort('company')}
              > 
                <div className="flex items-center">Firma{renderSortIcon('company')}</div> 
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors text-center hidden min-[770px]:table-cell" 
                style={{ width: COLUMN_WIDTHS.date }} 
                onClick={() => handleSort('created_at')}
              > 
                <div className="flex items-center justify-center">Data{renderSortIcon('created_at')}</div> 
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors text-center" 
                style={{ width: COLUMN_WIDTHS.status }} 
                onClick={() => handleSort('status')}
              > 
                <div className="flex items-center justify-center">Status{renderSortIcon('status')}</div> 
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors text-center hidden min-[1300px]:table-cell" 
                style={{ width: COLUMN_WIDTHS.site }} 
                onClick={() => handleSort('site')}
              > 
                <div className="flex items-center justify-center">Portal{renderSortIcon('site')}</div> 
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors text-center hidden min-[1000px]:table-cell" 
                style={{ width: COLUMN_WIDTHS.priority }} 
                onClick={() => handleSort('priority')}
              > 
                <div className="flex items-center justify-center">Priorytet{renderSortIcon('priority')}</div> 
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Stan ładowania */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Ładowanie danych...
                </TableCell>
              </TableRow>
            /* Stan braku wyników */
            ) : paginatedApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Brak ofert pracy do wyświetlenia
                </TableCell>
              </TableRow>
            /* Wyświetlanie danych */
            ) : (
              paginatedApplications.map((app) => (
                <TableRow key={app.id} onClick={() => handleRowClick(app)} className="cursor-pointer hover:bg-muted/50 h-[45px] sm:h-[50px] md:h-[55px] lg:h-[60px]">
                  <TableCell className="font-medium md:pl-3 text-[11px] sm:text-xs md:text-sm" style={{ width: COLUMN_WIDTHS.position }}> <div className="truncate max-w-[130px] sm:max-w-[160px] md:max-w-[190px] lg:max-w-[280px]" title={app.position}>{app.position}</div> </TableCell>
                  <TableCell className="text-[11px] sm:text-xs md:text-sm" style={{ width: COLUMN_WIDTHS.company }}> <div className="truncate max-w-[110px] sm:max-w-[140px] md:max-w-[150px]" title={app.company}>{app.company}</div> </TableCell>
                  <TableCell className="hidden min-[770px]:table-cell text-center text-[11px] sm:text-xs md:text-sm" style={{ width: COLUMN_WIDTHS.date }}>{app.date}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} style={{ width: COLUMN_WIDTHS.status }} className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span className={cn(`inline-flex items-center justify-center rounded-sm px-1 sm:px-2 py-1 text-[11px] sm:text-xs font-medium cursor-pointer min-w-[70px] w-auto`, getStatusStyles(app.status))}>
                          {app.status}
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="text-xs md:text-sm">
                        {statusOptions.map((option) => (
                          <DropdownMenuItem
                            key={option}
                            onClick={() => handleTableStatusChangeAttempt(option, app)}
                            className="text-xs md:text-sm"
                            disabled={option === app.status}
                          >
                            {option}
                            {app.status === option && ( <Check className="h-3 w-3 sm:h-4 sm:w-4 ml-2" /> )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="hidden min-[1300px]:table-cell text-center text-xs md:text-sm" style={{ width: COLUMN_WIDTHS.site }}>{app.site}</TableCell>
                  <TableCell className="text-center hidden min-[1000px]:table-cell" style={{ width: COLUMN_WIDTHS.priority }}> 
                    <div className="flex items-center justify-center gap-0.5"> 
                      {Array.from({ length: app.priority || 0 }).map((_, index) => ( 
                        <Circle key={index} className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current", getPriorityColor(app.priority || 0))} /> 
                      ))} 
                      {Array.from({ length: Math.max(0, 5 - (app.priority || 0)) }).map((_, index) => ( 
                        <Circle key={`empty-priority-${index}`} className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground/20" /> 
                      ))} 
                    </div> 
                  </TableCell>
                </TableRow>
              ))
            )}
            {/* Puste wiersze dla wypełnienia */}
            {!isLoading && paginatedApplications.length > 0 && emptyRows.map((index) => (
              <TableRow key={`empty-${index}`} className="hidden lg:table-row h-[45px] sm:h-[50px] md:h-[55px] lg:h-[60px]">
                <TableCell className="text-transparent" style={{ width: COLUMN_WIDTHS.position }}>-</TableCell>
                <TableCell style={{ width: COLUMN_WIDTHS.company }} />
                <TableCell className="hidden min-[770px]:table-cell" style={{ width: COLUMN_WIDTHS.date }} />
                <TableCell style={{ width: COLUMN_WIDTHS.status }} />
                <TableCell className="hidden min-[1300px]:table-cell" style={{ width: COLUMN_WIDTHS.site }} />
                <TableCell className="hidden min-[1000px]:table-cell" style={{ width: COLUMN_WIDTHS.priority }} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginacja - bez zmian */}
      <div className="flex justify-center">
        <SavedTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Drawer i Dialog */}
      <ApplicationDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        application={selectedApplication ? {
            id: selectedApplication.id,
            user_id: '', // Wypełniamy wymagane pola z JobOffer
            title: selectedApplication.position,
            company: selectedApplication.company,
            url: selectedApplication.url,
            site: selectedApplication.site,
            status: selectedApplication.dbStatus,
            full_description: selectedApplication.description,
            note: null,
            salary: null,
            created_at: new Date(selectedApplication.date.split('.').reverse().join('-')).toISOString(),
            status_changes: selectedApplication.status_changes,
            expire: selectedApplication.validUntil !== '-' ? 
                new Date(selectedApplication.validUntil.split('.').reverse().join('-')).toISOString() : null,
            priority: selectedApplication.priority
        } : null}
        onEdit={() => {}}
        onDelete={handleDeleteApplication}
        onStatusChange={(newStatus) => {
          if (selectedApplication) {
              setApplications(prevApps =>
                  prevApps.map(a =>
                      a.id === selectedApplication!.id ? { ...a, status: newStatus } : a
                  )
              );
              setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
          }
        }}
        onPriorityChange={(newPriority) => {
          if (selectedApplication) {
            handlePriorityChange(newPriority, selectedApplication.id);
          }
        }}
        onNextApplication={handleNextApplication}
        onPreviousApplication={handlePreviousApplication}
        hasNextApplication={hasNextApplication}
        hasPreviousApplication={hasPreviousApplication}
      />

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cofnięcie statusu</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz cofnąć status aplikacji "{statusToConfirmInTable?.app.position}"
              do "{statusToConfirmInTable?.newStatus}"? Spowoduje to usunięcie późniejszych statusów z historii.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsConfirmDialogOpen(false); setStatusToConfirmInTable(null); }}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedTableStatusChange}
              className="bg-red-600 hover:bg-red-700"
            >
              Tak, cofnij status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}