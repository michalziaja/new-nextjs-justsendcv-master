"use client"

import { useState } from "react"
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
import { FileEdit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Check, ArrowUpCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockApplications } from "./mockData"
import { ApplicationDetailsDrawer } from "./ApplicationDetailsDrawer"
import { EditApplicationModal } from "./EditApplicationModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Konfiguracja szerokości kolumn (w pikselach)
const COLUMN_WIDTHS = {
  position: 300,    // Stanowisko
  company: 200,     // Firma
  date: 140,        // Data
  status: 80,       // Status
  validUntil: 120,  // Ważna do
  priority: 100,    // Priorytet
} as const;

type SortConfig = {
  key: keyof typeof mockApplications[0] | null
  direction: 'asc' | 'desc'
}

export function SavedTable() {
  const [status, setStatus] = useState<ApplicationStatus>("wszystkie")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [selectedApplication, setSelectedApplication] = useState<typeof mockApplications[0] | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [applications, setApplications] = useState(mockApplications)
  const itemsPerPage = 10

  // Funkcja sortująca
  const sortData = (data: typeof mockApplications) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Obsługa kliknięcia w nagłówek kolumny
  const handleSort = (key: keyof typeof mockApplications[0]) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Renderowanie ikony sortowania
  const renderSortIcon = (key: keyof typeof mockApplications[0]) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-1 h-3 w-3" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3" /> : 
      <ArrowDown className="ml-1 h-3 w-3" />;
  };
  
  // Filtrowanie i wyszukiwanie
  const filteredApplications = mockApplications.filter(app => {
    const matchesStatus = status === "wszystkie" || app.status === status
    const matchesSearch = app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Sortowanie
  const sortedApplications = sortData(filteredApplications);

  const totalPages = Math.ceil(sortedApplications.length / itemsPerPage)

  // Paginacja
  const paginatedApplications = sortedApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Tworzenie pustych wierszy dla dużych ekranów
  const emptyRows = Array(Math.max(0, itemsPerPage - paginatedApplications.length))
    .fill(null)
    .map((_, index) => index);

  // Obsługa zmiany statusu w tabeli
  const handleStatusFilterChange = (newStatus: ApplicationStatus) => {
    setStatus(newStatus)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleUrlClick = (url: string) => {
    window.open(url, '_blank')
  }

  const handleRowClick = (app: typeof mockApplications[0]) => {
    setSelectedApplication(app)
    setIsDrawerOpen(true)
  }

  const handleEditClick = (e: React.MouseEvent, app: typeof mockApplications[0]) => {
    e.stopPropagation() // Zapobiega otwieraniu drawera
    setSelectedApplication(app)
    setIsEditModalOpen(true)
  }

  const handleApplicationStatusChange = (newStatus: ApplicationStatus, app: typeof mockApplications[0]) => {
    // Aktualizacja statusu aplikacji
    const updatedApplications = applications.map(a => 
      a.id === app.id ? { ...a, status: newStatus } : a
    )
    setApplications(updatedApplications)
  }

  const statusOptions: ApplicationStatus[] = [
    'wysłane',
    'kontakt',
    'rozmowa',
    'oferta',
    'odmowa',
    'zapisane'
  ]

  const getStatusStyles = (status: ApplicationStatus) => {
    switch (status) {
      case 'wysłane': return 'bg-purple-600 text-white'
      case 'kontakt': return 'bg-yellow-600 text-white'
      case 'rozmowa': return 'bg-cyan-600 text-white'
      case 'oferta': return 'bg-green-600 text-white'
      case 'odmowa': return 'bg-red-600 text-white'
      case 'zapisane': return 'bg-blue-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

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
  const SortIcon = ({ sortKey, sortConfig }: { sortKey: keyof typeof mockApplications[0], sortConfig: SortConfig }) => {
    if (sortConfig.key !== sortKey) return <ArrowUpDown className="ml-1 h-3 w-3" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3" /> : 
      <ArrowDown className="ml-1 h-3 w-3" />;
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <SavedTableSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <Button variant="outline" className="mt-0 mr-1">
          Dodaj aplikację
        </Button>
      </div>

      <SavedTableTabs
        activeStatus={status}
        onStatusChange={handleStatusFilterChange}
      />

      <div className="rounded-md border-2 border-gray-300 ml-1 mr-1 overflow-x-auto shadow-[0_5px_15px_rgb(0,0,0,0.2)] dark:shadow-[0_5px_15px_rgb(255,255,255,0.2)] dark:bg-gray-900 dark:border-gray-800">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50 dark:bg-background z-10">
            <TableRow>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors lg:pl-3 md:pl-3 sm:pl-1"
                style={{ width: COLUMN_WIDTHS.position }}
                onClick={() => handleSort('position')}
              >
                <div className="flex items-center">
                  Stanowisko
                  {renderSortIcon('position')}
                </div>
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors"
                style={{ width: COLUMN_WIDTHS.company }}
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center">
                  Firma
                  {renderSortIcon('company')}
                </div>
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors text-center hidden min-[770px]:table-cell"
                style={{ width: COLUMN_WIDTHS.date }}
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center justify-center">
                  Data
                  {renderSortIcon('date')}
                </div>
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors text-center"
                style={{ width: COLUMN_WIDTHS.status }}
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center justify-center">
                  Status
                  {renderSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors text-center hidden min-[1300px]:table-cell"
                style={{ width: COLUMN_WIDTHS.validUntil }}
                onClick={() => handleSort('validUntil')}
              >
                <div className="flex items-center justify-center">
                  Ważna do
                  {renderSortIcon('validUntil')}
                </div>
              </TableHead>
              <TableHead 
                className="text-sm md:text-base font-bold hover:bg-accent cursor-pointer transition-colors text-center hidden min-[1000px]:table-cell"
                style={{ width: COLUMN_WIDTHS.priority }}
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center justify-center">
                  Priorytet
                  {renderSortIcon('priority')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplications.map((app) => (
              <TableRow 
                key={app.id}
                onClick={() => handleRowClick(app)}
                className="cursor-pointer hover:bg-muted/50 h-[45px] sm:h-[50px] md:h-[55px] lg:h-[60px]"
              >
                <TableCell 
                  className="font-medium md:pl-3 text-[11px] sm:text-xs md:text-sm"
                  style={{ width: COLUMN_WIDTHS.position }}
                >
                  <div className="truncate max-w-[130px] sm:max-w-[160px] md:max-w-[190px] lg:max-w-[280px]" title={app.position}> 
                    {app.position}
                  </div>
                </TableCell>
                <TableCell 
                  className="text-[11px] sm:text-xs md:text-sm"
                  style={{ width: COLUMN_WIDTHS.company }}
                >
                  <div className="truncate max-w-[110px] sm:max-w-[140px] md:max-w-[150px]" title={app.company}>
                    {app.company}
                  </div>
                </TableCell>
                <TableCell 
                  className="hidden min-[770px]:table-cell text-center text-[11px] sm:text-xs md:text-sm"
                  style={{ width: COLUMN_WIDTHS.date }}
                >
                  {app.date}
                </TableCell>
                <TableCell 
                  onClick={(e) => e.stopPropagation()} 
                  style={{ width: COLUMN_WIDTHS.status }}
                  className="text-center lg:w-20 md:w-16 sm:w-12"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span 
                        className={`inline-flex items-center justify-center rounded-sm w-16 sm:w-20 px-1 sm:px-2 py-1 text-[11px] sm:text-xs font-medium cursor-pointer ${getStatusStyles(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="text-xs md:text-sm">
                      {statusOptions.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => handleApplicationStatusChange(option, app)}
                          className="text-xs md:text-sm"
                        >
                          {option}
                          {app.status === option && (
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell 
                  className="hidden min-[1300px]:table-cell text-center text-xs md:text-sm"
                  style={{ width: COLUMN_WIDTHS.validUntil }}
                >
                  {app.validUntil}
                </TableCell>
                <TableCell 
                  className="text-center hidden min-[1000px]:table-cell"
                  style={{ width: COLUMN_WIDTHS.priority }}
                >
                  <div className="flex items-center justify-center gap-0.5">
                    {Array.from({ length: app.priority || 0 }).map((_, index) => (
                      <Circle
                        key={index}
                        className={cn(
                          "h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current",
                          getPriorityColor(app.priority || 0)
                        )}
                      />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {/* Puste wiersze tylko na dużych ekranach */}
            {emptyRows.map((index) => (
              <TableRow key={`empty-${index}`} className="hidden lg:table-row h-[45px] sm:h-[50px] md:h-[55px] lg:h-[60px]">
                <TableCell className="text-transparent pl-4" style={{ width: COLUMN_WIDTHS.position }}>-</TableCell>
                <TableCell style={{ width: COLUMN_WIDTHS.company }} />
                <TableCell className="hidden min-[770px]:table-cell text-center" style={{ width: COLUMN_WIDTHS.date }} />
                <TableCell style={{ width: COLUMN_WIDTHS.status }} />
                <TableCell className="hidden min-[1300px]:table-cell" style={{ width: COLUMN_WIDTHS.validUntil }} />
                <TableCell className="hidden min-[1000px]:table-cell" style={{ width: COLUMN_WIDTHS.priority }} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <SavedTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <ApplicationDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        application={selectedApplication}
        onEdit={() => {
          setIsDrawerOpen(false)
          setIsEditModalOpen(true)
        }}
      />

      <EditApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        application={selectedApplication}
      />
    </div>
  )
} 