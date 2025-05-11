import React, { useState, useEffect, useRef } from 'react';
import { JobOffer } from "../../saved/ApplicationDetailsDrawer";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCV, SavedCV } from '../CVContext';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { createClient } from "@/utils/supabase/client";
import CVFileUploader from '../CVFileUploader';

// Deklaracja typu dla window.gc
declare global {
  interface Window {
    gc?: () => void;
  }
}

interface StartSectionProps {
  selectedJob: JobOffer | null;
  setSelectedJob: (job: JobOffer | null) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  templates: { id: string; name: string }[];
  savedJobs: JobOffer[];
  isLoadingJobs: boolean;
  onNext: () => void;
}

// Typ dla zakładek w kreatorze CV
type CVCreationTab = 'general' | 'import' | 'jobOffer';

// Typ dla głównych zakładek
type MainTab = 'new' | 'saved';

const StartSection: React.FC<StartSectionProps> = ({
  selectedJob,
  setSelectedJob,
  selectedTemplate,
  setSelectedTemplate,
  templates,
  savedJobs,
  isLoadingJobs,
  onNext
}) => {
  const {
    savedCVs,
    isLoading,
    loadCV,
    createNewCV,
    deleteSavedCV,
    setCVName,
    saveCV,
    setActiveSection,
   
  } = useCV();
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  
  // Stany dla obsługi ofert pracy
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  
  // Stan dla zakładek tworzenia CV
  const [activeTab, setActiveTab] = useState<CVCreationTab>('general');
  
  // Stan dla głównych zakładek
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('new');

  // Stany dla wybranego CV
  const [selectedCVId, setSelectedCVId] = useState<string>('');
  const [selectedCVInfo, setSelectedCVInfo] = useState<SavedCV | null>(null);
  const [selectedCVJobOffer, setSelectedCVJobOffer] = useState<any | null>(null);

  // Style dla statusów
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'saved': return 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
    }
  }

  // Mapowanie statusów EN->PL
  const statusMap: Record<string, string> = {
    saved: 'zapisana',
    applied: 'aplikowano',
    interview: 'rozmowa',
    offer: 'oferta',
    rejected: 'odrzucono',
    accepted: 'zaakceptowano',
    expired: 'wygasła'
  };

  // Kolory priorytetu
  const getPriorityColor = (value: number) => {
    switch (value) {
      case 1: return 'text-green-500'
      case 2: return 'text-yellow-500'
      case 3: return 'text-orange-500'
      case 4: return 'text-red-400'
      case 5: return 'text-red-600'
      default: return 'text-gray-400'
    }
  }

  // Obsługa pomyślnego przetworzenia pliku CV
  const handleFileProcessed = (extractedText: string) => {
    console.log('Przetworzono plik CV:', extractedText.substr(0, 100) + '...');
    // Tutaj można dodać dodatkową logikę po przetworzeniu pliku
  };

  // Funkcja do zmiany nazwy CV
  const handleRename = async (cvId: string) => {
    if (!newName.trim()) return;
    
    const cv = savedCVs.find(cv => cv.id === cvId);
    if (!cv) return;
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('user_cvs')
        .update({ name: newName })
        .eq('id', cvId);
        
      if (error) throw error;
      
      // Aktualizacja lokalnej listy
      // Odświeżenie listy CV - zostanie obsłużone przez useEffect w kontekście
      
      setIsRenaming(null);
      setNewName('');
      
    } catch (error) {
      console.error("Błąd podczas zmiany nazwy CV:", error);
      alert("Wystąpił błąd podczas zmiany nazwy CV.");
    }
  };
  
  // Tworzenie nowego CV dla wybranej oferty
  const handleCreateCVForJob = () => {
    if (!selectedOffer) return;
    
    createNewCV();
    setCVName(`CV - ${selectedOffer.title} w ${selectedOffer.company}`);
    setSelectedJob(selectedOffer);
    setActiveSection('personalData');
  };

  // Funkcja do pobierania informacji o ofercie pracy powiązanej z CV
  // Memoizujemy funkcję za pomocą useCallback, aby zapobiec niepotrzebnym renderom
  const fetchJobOfferForCV = React.useCallback(async (jobOfferId: string | null) => {
    if (!jobOfferId) {
      setSelectedCVJobOffer(null);
      return;
    }

    try {
      // Zamiast pobierać dane z bazy, możemy sprawdzić, czy oferta jest dostępna w savedJobs
      const matchingJob = savedJobs.find(job => job.id === jobOfferId);
      
      if (matchingJob) {
        setSelectedCVJobOffer(matchingJob);
      } else {
        // Jeśli nie znaleziono oferty w lokalnych danych, pobieramy ją z bazy
        const supabase = createClient();
        const { data, error } = await supabase
          .from('job_offers')
          .select('*')
          .eq('id', jobOfferId)
          .single();

        if (error) {
          console.error("Błąd podczas pobierania oferty pracy:", error);
          setSelectedCVJobOffer(null);
        } else {
          setSelectedCVJobOffer(data);
        }
      }
    } catch (error) {
      console.error("Wystąpił błąd:", error);
      setSelectedCVJobOffer(null);
    }
  }, [savedJobs]); // Dodajemy savedJobs jako zależność

  // Funkcja do formatowania daty
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: pl });
  };

  // W przypadku ładowania danych
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-lg">Ładowanie zapisanych CV...</div>
      </div>
    );
  }

  return (
    <div className="p-1 overflow-visible">
      {/* Główne zakładki */}
      <div className="mb-2">
        <div className="flex justify-center mb-2">
          <div className="bg-gray-100 p-1 rounded-lg flex w-full">
            <button
              onClick={() => setActiveMainTab('new')}
              className={`py-3 px-6 rounded-md  text-2sm font-medium flex-1 transition-all duration-200 ${
                activeMainTab === 'new'
                  ? 'bg-white text-blue-600 shadow-sm '
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nowe CV
            </button>
            <button
              onClick={() => setActiveMainTab('saved')}
              className={`py-3 px-6 rounded-md text-2sm font-medium flex-1 transition-all duration-200 ${
                activeMainTab === 'saved'
                  ? 'bg-white text-blue-600 shadow-sm '
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Zapisane CV
            </button>
          </div>
        </div>
      </div>
      
      {/* Sekcja "Nowe CV" */}
      {activeMainTab === 'new' && (
        <>
          <div className="grid grid-cols-1 gap-6 overflow-visible">
            {/* Wybór typu CV */}
            <div className="px-6 overflow-visible">
              {/* <h3 className="text-lg font-semibold mb-4">Jak chcesz stworzyć CV?</h3> */}
          
          {/* Zakładki dla różnych opcji tworzenia CV */}
          <div className="mb-4 mt-1 border-b">
            <div className="flex justify-between">
              {/* Zakładka 1: Nowe ogólne CV */}
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'general'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('general')}
              >
                Nowe ogólne CV
              </button>
              
              {/* Zakładka 2: Import istniejącego CV */}
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'import'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('import')}
              >
                Import istniejącego CV
              </button>
              
              {/* Zakładka 3: CV dopasowane do oferty */}
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'jobOffer'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('jobOffer')}
              >
                CV dopasowane do oferty
              </button>
            </div>
          </div>
          
          {/* Zawartość zakładki "Nowe ogólne CV" */}
          {activeTab === 'general' && (
                <div className="rounded-lg ">
                  {/* Wskazówki na całej szerokości */}
                  <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                  <h4 className="text-sm font-medium mb-2">Kiedy wybrać to rozwiązanie?</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Stwórz uniwersalne CV do wykorzystania w różnych aplikacjach. Ta opcja jest idealna, gdy:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                    <li>Planujesz aplikować na różne stanowiska</li>
                    <li>Chcesz stworzyć CV od podstaw</li>
                    <li>Potrzebujesz elastycznego dokumentu, który łatwo dostosujesz</li>
                  </ul>
                </div>
                  
                  {/* Przycisk na całej szerokości */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        createNewCV();
                        setSelectedTemplate(templates[0]?.id || ""); // Automatycznie wybierz pierwszy szablon
                        setActiveSection('personalData');
                      }}
                      className="w-full max-w-md py-3 mt-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-md hover:from-green-600 hover:to-green-800 transition-all shadow-sm"
                    >
                      Utwórz nowe CV
                    </button>
              </div>
            </div>
          )}
          
          {/* Zawartość zakładki "Import istniejącego CV" */}
          {activeTab === 'import' && (
            <div className="rounded-lg">
                  {/* Wskazówki na całej szerokości */}
                  <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                  <h4 className="text-sm font-medium mb-2">Jak działa import CV?</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Załaduj swoje istniejące CV w formacie PDF lub DOCX. Nasze narzędzie przeanalizuje jego zawartość bez zapisywania pliku.
                  </p>
                  <div className="mb-4">
                    <h5 className="text-xs font-medium mb-2">Obsługiwane formaty:</h5>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">PDF</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">DOCX</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">DOC</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                      Po przesłaniu pliku, tekst zostanie wyekstrahowany i wyświetlony w konsoli przeglądarki (naciśnij F12, aby zobaczyć). 
                      Plik nie będzie nigdzie zapisywany i zostanie usunięty z pamięci po zakończeniu analizy.
                    </p>
                  </div>
                  
                  {/* Uploader plików CV na całej szerokości - bez obramowania */}
                  <div className="flex flex-col items-center p-4 bg-white">
                    <CVFileUploader 
                      onFileProcessed={handleFileProcessed}
                      className="w-full max-w-md"
                    />
                  </div>
            </div>
          )}
          
          {/* Zawartość zakładki "CV dopasowane do oferty" */}
          {activeTab === 'jobOffer' && (
            <div className="rounded-lg flex flex-col overflow-visible">
                  {/* Wskazówki na całej szerokości */}
                  <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                  <h4 className="text-sm font-medium mb-2">Dlaczego warto dopasować CV do oferty?</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Tworzenie CV dopasowanego do konkretnej oferty pracy znacząco zwiększa szanse na sukces w procesie rekrutacji:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4 mb-4">
                    <li>Podkreślasz dokładnie te umiejętności, których szuka pracodawca</li>
                    <li>Używasz słów kluczowych, które mogą być wyszukiwane przez systemy ATS</li>
                    <li>Pokazujesz, że zależy Ci właśnie na tym stanowisku</li>
                  </ul>
                  <p className="text-xs text-gray-600">
                    Wybierz ofertę z listy zapisanych ofert pracy, aby stworzyć CV idealnie dopasowane do wymagań rekrutera.
                  </p>
                  </div>
                  
                  {/* Wybór oferty - w formie listy zamiast select */}
                  <div className="bg-white mt-2">
                    {isLoadingJobs ? (
                      <div className="p-4 text-gray-500 text-center">Ładowanie ofert pracy...</div>
                    ) : savedJobs.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">Nie masz żadnych zapisanych ofert pracy.</div>
                    ) : (
                      <div className="overflow-y-auto" style={{ maxHeight: 'calc(38vh)' }}>
                        {savedJobs.map(offer => (
                          <div 
                            key={offer.id} 
                            className={`border ${selectedOffer?.id === offer.id 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'} 
                              rounded-md p-3 mb-2 cursor-pointer transition-all`}
                            onClick={() => setSelectedOffer(offer)}
                          >
                            <div className="flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium text-sm">{offer.title}</h3>
                                  <p className="text-xs text-gray-600">{offer.company}</p>
                                </div>
                                <div className="flex items-center">
                                  <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusStyles(offer.status)}`}>
                                    {statusMap[offer.status] || offer.status}
                                  </span>
                                  <span className={`text-xs ml-2 ${getPriorityColor(offer.priority)}`}>
                                    Priorytet: {offer.priority}
                                  </span>
                                </div>
                              </div>
                              
                              {offer.salary && (
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Wynagrodzenie:</span> {offer.salary}
                                </p>
                              )}
                              
                              {selectedOffer?.id === offer.id && (
                                <div className="mt-3 flex justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      createNewCV();
                                      setCVName(`CV - ${offer.title} w ${offer.company}`);
                                      setSelectedJob(offer);
                                      setSelectedTemplate(templates[0]?.id || ""); // Automatycznie wybierz pierwszy szablon
                                      setActiveSection('personalData');
                                    }}
                                    className="px-4 py-1 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-md hover:from-green-600 hover:to-green-800 transition-all shadow-sm"
                                  >
                                    Wybierz
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Sekcja "Zapisane CV" */}
      {activeMainTab === 'saved' && (
        <div className="px-6 mb-0 mt-0 overflow-visible">
          <div className="mb-0 pb-2 pt-2">
            {/* <h3 className="text-lg font-semibold">Twoje zapisane CV</h3> */}
            {/* <p className="text-sm text-gray-600">
              Zarządzaj swoimi zapisanymi CV - edytuj, zmieniaj nazwy lub usuń niepotrzebne.
            </p> */}
          </div>
          
          {savedCVs.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <div className="text-gray-600 mb-2">
                Nie masz jeszcze żadnych zapisanych CV.
              </div>
              <button
                onClick={() => setActiveMainTab('new')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-md hover:from-green-600 hover:to-green-800 transition-all shadow-sm"
              >
                Stwórz nowe CV
              </button>
            </div>
          ) : (
            <div className="overflow-visible">
              <div className="grid grid-cols-1 gap-1 overflow-visible">
                {/* Wskazówki i objaśnienia na całej szerokości */}
                <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                  <h4 className="text-sm font-medium mb-2">Zarządzanie zapisanymi CV</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Tutaj znajdziesz wszystkie zapisane przez Ciebie CV. Możesz je edytować, zmieniać ich nazwy lub usunąć.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4 mb-4">
                    <li>Wybierz CV, aby zobaczyć jego szczegóły</li>
                    <li>Kliknij "Kontynuuj", aby kontynuować pracę nad wybranym CV</li>
                    <li>Użyj ikonek edycji i usuwania, aby zarządzać swoimi CV</li>
                  </ul>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded">
                    <h5 className="text-xs font-medium text-blue-700 mb-1">Wskazówka</h5>
                    <p className="text-xs text-blue-700">
                      Dobrą praktyką jest tworzenie dedykowanych CV dla różnych branż lub stanowisk. 
                      To znacznie zwiększa Twoje szanse podczas rekrutacji.
                    </p>
                  </div>
                </div>
                
                {/* Lista zapisanych CV */}
                <div className="bg-white overflow-y-auto" style={{ maxHeight: 'calc(38vh)' }}>
                  {savedCVs.map((cv) => {
                    const isSelected = cv.id === selectedCVId;
                    const cvType = cv.job_offer_id 
                      ? 'Dopasowane do oferty' 
                      : 'Ogólne';
                    
                    return (
                      <div 
                        key={cv.id} 
                        className={`border ${isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'} 
                          rounded-md p-3 mb-2 cursor-pointer transition-all`}
                        onClick={() => {
                          setSelectedCVId(cv.id);
                          setSelectedCVInfo(cv);
                          fetchJobOfferForCV(cv.job_offer_id);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h3 className="font-medium text-sm">{cv.name}</h3>
                              {cv.is_draft && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                                  Autozapis
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                {cvType}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                                {cv.selected_template || 'Brak szablonu'}
                              </span>
                            </div>
                            
                            {/* Połączone daty w jednej linii */}
                            <div className="text-xs text-gray-600">
                              <p>
                                <span className="font-medium">Utworzono:</span> {formatDate(cv.created_at)} • <span className="font-medium">Zaktualizowano:</span> {formatDate(cv.updated_at)}
                              </p>
                            </div>
                            
                            {/* Wyświetlanie stanowiska i firmy jeśli CV powiązane z ofertą */}
                            {isSelected && selectedCVJobOffer && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Stanowisko: <span className="text-blue-700">{selectedCVJobOffer.title}</span> w firmie <span className="text-blue-700">{selectedCVJobOffer.company}</span>
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusStyles(selectedCVJobOffer.status)}`}>
                                    {statusMap[selectedCVJobOffer.status] || selectedCVJobOffer.status}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Przyciski akcji */}
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsRenaming(cv.id);
                                setNewName(cv.name);
                              }}
                              className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-all flex items-center justify-center"
                              title="Zmień nazwę"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                              </svg>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Czy na pewno chcesz usunąć to CV?')) {
                                  deleteSavedCV(cv.id);
                                  if (cv.id === selectedCVId) {
                                    setSelectedCVId('');
                                    setSelectedCVInfo(null);
                                    setSelectedCVJobOffer(null);
                                  }
                                }
                              }}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-all flex items-center justify-center"
                              title="Usuń"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Przycisk kontynuacji tylko dla zaznaczonego CV */}
                        {isSelected && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadCV(cv.id);
                                setActiveSection('personalData');
                              }}
                              className="px-4 py-1 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-md hover:from-green-600 hover:to-green-800 transition-all shadow-sm"
                            >
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Kontynuuj
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {isRenaming && (
                <div className="mt-3 p-3 border border-gray-200 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Zmień nazwę CV</h4>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border rounded p-2 mb-2"
                    placeholder="Nowa nazwa CV"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsRenaming(null)}
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={() => {
                        if (isRenaming) {
                          handleRename(isRenaming);
                        }
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-md hover:from-green-600 hover:to-green-800 transition-all shadow-sm"
                    >
                      Zapisz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StartSection;