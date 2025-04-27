import React, { useState, useEffect, useRef } from 'react';
import { JobOffer } from "../../saved/ApplicationDetailsDrawer";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCV, SavedCV } from '../CVContext';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { createClient } from "@/utils/supabase/client";

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
    setActiveSection
  } = useCV();
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Stany dla obsługi ofert pracy
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  
  // Nowy stan dla zakładek
  const [activeTab, setActiveTab] = useState<CVCreationTab>('general');

  // Dodaję stan dla wybranego CV
  const [selectedCVId, setSelectedCVId] = useState<string>('');
  const [selectedCVInfo, setSelectedCVInfo] = useState<SavedCV | null>(null);
  const [selectedCVJobOffer, setSelectedCVJobOffer] = useState<any | null>(null);

  // Pobieranie ofert pracy
  useEffect(() => {
    const fetchJobOffers = async () => {
      setIsLoadingOffers(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setJobOffers([]);
          setIsLoadingOffers(false);
          return;
        }

        const { data: offers, error } = await supabase
          .from('job_offers')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'saved') // Filtrujemy tylko zapisane oferty
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Błąd podczas pobierania ofert pracy:", error);
          setJobOffers([]);
        } else {
          // Dodatkowe filtrowanie po statusie dla pewności
          const savedOffers = offers?.filter(offer => offer.status === 'saved') || [];
          setJobOffers(savedOffers);
          console.log('Pobrano oferty zapisane:', savedOffers.length);
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
        setJobOffers([]);
      } finally {
        setIsLoadingOffers(false);
      }
    };

    fetchJobOffers();
  }, []);

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

  // Funkcja do przesyłania CV do analizy
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    
    if ('dataTransfer' in event) {
      // Obsługa zdarzenia upuszczenia pliku (drop)
      event.preventDefault();
      setIsDragging(false);
      
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        file = event.dataTransfer.files[0];
      }
    } else if ('target' in event && event.target instanceof HTMLInputElement && event.target.files && event.target.files.length > 0) {
      // Obsługa zdarzenia wyboru pliku (input type="file")
      file = event.target.files[0];
    }
    
    if (!file) return;
    
    setUploadingFile(true);
    const supabase = createClient();
    
    try {
      // Sprawdź rozszerzenie pliku
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['pdf', 'docx', 'doc'].includes(fileExt)) {
        alert("Obsługiwane formaty to PDF, DOCX i DOC. Proszę wybrać prawidłowy format pliku.");
        setUploadingFile(false);
        return;
      }
      
      // Zapisz plik w Supabase Storage
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `cv-uploads/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('user-files')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Pobierz URL pliku
      const { data: urlData } = await supabase
        .storage
        .from('user-files')
        .createSignedUrl(filePath, 3600); // URL ważny przez godzinę
        
      if (!urlData?.signedUrl) {
        throw new Error("Nie udało się uzyskać URL pliku");
      }
      
      // Tu dodamy później kod do analizy CV przez AI
      alert("Funkcja analizy CV przez AI jest w trakcie implementacji. Plik został przesłany.");
      
      // Utworzenie nowego CV (tymczasowo, później zostanie wypełnione wynikami analizy)
      createNewCV();
      setCVName(`CV z ${file.name}`);
      await saveCV(true);
      
    } catch (error) {
      console.error("Błąd podczas przesyłania pliku:", error);
      alert("Wystąpił błąd podczas przesyłania pliku.");
    } finally {
      setUploadingFile(false);
      // Zresetuj pole wyboru pliku
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Obsługa przeciągania plików
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
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
  const fetchJobOfferForCV = async (jobOfferId: string | null) => {
    if (!jobOfferId) {
      setSelectedCVJobOffer(null);
      return;
    }

    try {
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
    } catch (error) {
      console.error("Wystąpił błąd:", error);
      setSelectedCVJobOffer(null);
    }
  };

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
    <div className="p-6">
      {/* <h2 className="text-2xl font-bold mb-6">Kreator CV</h2> */}
      
      <div className="p-4 mb-0">
        <h3 className="text-lg font-semibold mb-4">Twoje zapisane CV</h3>
        
        {savedCVs.length === 0 ? (
          <div className="text-gray-500 mb-2">
            Nie masz jeszcze żadnych zapisanych CV.
          </div>
        ) : (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lewa kolumna - wybór CV */}
              <div className="flex flex-col">
                
                <select
                  className="w-full text-xs border border-gray-300 rounded-md p-2 mb-3"
                  value={selectedCVId}
                  onChange={(e) => {
                    const cvId = e.target.value;
                    setSelectedCVId(cvId);
                    if (cvId) {
                      const selectedCV = savedCVs.find(cv => cv.id === cvId);
                      if (selectedCV) {
                        setSelectedCVInfo(selectedCV);
                        setIsRenaming(null);
                        setIsDeleting(null);
                        fetchJobOfferForCV(selectedCV.job_offer_id);
                      }
                    } else {
                      setSelectedCVInfo(null);
                      setSelectedCVJobOffer(null);
                    }
                  }}
                >
                  <option value="">-- Wybierz CV --</option>
                  {savedCVs.map(cv => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name} {cv.is_draft && !cv.name.toLowerCase().includes('kopia robocza') ? '(kopia robocza)' : ''}
                    </option>
                  ))}
                </select>

                {/* Informacje o wybranym CV */}
                {selectedCVInfo && (
                  <div className="border border-gray-200 rounded-md px-4 py-1 bg-gray-50">
                    {/* <h4 className="text-sm font-medium mb-2">{selectedCVInfo.name}</h4> */}
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>
                        <span className="font-medium">Utworzono:</span> {formatDate(selectedCVInfo.created_at)}
                      </p>
                      <p>
                        <span className="font-medium">Ostatnia aktualizacja:</span> {formatDate(selectedCVInfo.updated_at)}
                      </p>
                      <p>
                        <span className="font-medium">Szablon:</span> {selectedCVInfo.selected_template}
                      </p>
                      
                    </div>

                    {/* Informacja o ofercie pracy, jeśli CV było tworzone pod ofertę */}
                    {selectedCVJobOffer && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          CV utworzone dla oferty:
                        </p>
                        <div className="bg-blue-50 border border-blue-100 rounded p-2">
                          <p className="text-xs font-medium">{selectedCVJobOffer.title}</p>
                          <p className="text-xs text-gray-600">{selectedCVJobOffer.company}</p>
                          <div className="flex items-center mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusStyles(selectedCVJobOffer.status)}`}>
                              {statusMap[selectedCVJobOffer.status] || selectedCVJobOffer.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Prawa kolumna - przyciski */}
              <div className="flex flex-col justify-start items-center">
                
                <div className="space-y-1 w-full flex mb-1 flex-col items-center">
                  <button
                    onClick={() => {
                      if (selectedCVId) {
                        loadCV(selectedCVId);
                        setActiveSection('personalData');
                      } else {
                        alert('Wybierz CV z listy.');
                      }
                    }}
                    disabled={!selectedCVId}
                    className={`w-3/4 px-3 py-2 text-sm rounded-sm flex items-center justify-center ${
                      selectedCVId 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edytuj wybrane
                  </button>
                  
                  <button
                    onClick={() => {
                      if (selectedCVId) {
                        setIsRenaming(selectedCVId);
                        const cv = savedCVs.find(cv => cv.id === selectedCVId);
                        setNewName(cv ? cv.name : '');
                      } else {
                        alert('Wybierz CV z listy.');
                      }
                    }}
                    disabled={!selectedCVId}
                    className={`w-3/4 px-3 py-2 text-sm rounded-sm flex items-center justify-center ${
                      selectedCVId 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Zmień nazwę
                  </button>
                  
                  <button
                    onClick={() => {
                      if (selectedCVId) {
                        if (confirm('Czy na pewno chcesz usunąć wybrane CV?')) {
                          deleteSavedCV(selectedCVId);
                          setSelectedCVId('');
                          setSelectedCVInfo(null);
                          setSelectedCVJobOffer(null);
                        }
                      } else {
                        alert('Wybierz CV z listy.');
                      }
                    }}
                    disabled={!selectedCVId}
                    className={`w-3/4 px-3 py-2 text-sm rounded-sm flex items-center justify-center ${
                      selectedCVId 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Usuń
                  </button>
                </div>
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
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Zapisz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wybór szablonu */}
      <div className="p-6 mb-1 -mt-6">
        <h3 className="text-lg font-semibold mb-2">Wybierz szablon</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border p-4 rounded-md cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="font-medium">{template.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 -mt-4">
        {/* Wybór typu CV */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Jak chcesz stworzyć CV?</h3>
          
          {/* Zakładki dla różnych opcji tworzenia CV */}
          <div className="mb-4 border-b">
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
            <div className="rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lewa kolumna: przycisk */}
                <div className="flex flex-col justify-center items-center p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                  {/* <h4 className="text-sm font-medium mb-3 text-center">Stwórz nowe ogólne CV</h4> */}
                  <button
                    onClick={() => {
                      createNewCV();
                      setActiveSection('personalData');
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors"
                  >
                    Utwórz nowe CV
                  </button>
                </div>
                
                {/* Prawa kolumna: wskazówka/opis */}
                <div className="flex flex-col justify-center p-4 border border-gray-200 rounded-lg bg-gray-50">
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
              </div>
            </div>
          )}
          
          {/* Zawartość zakładki "Import istniejącego CV" */}
          {activeTab === 'import' && (
            <div className="rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lewa kolumna: przycisk/obszar drag & drop */}
                <div className="flex flex-col justify-center items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  {/* <h4 className="text-sm font-medium mb-3 text-center">Import istniejącego CV</h4> */}
                  
                  {/* Obszar drag & drop */}
                  <div 
                    className={`border-2 border-dashed rounded-md p-4 mb-4 w-full transition-all text-center ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleFileUpload}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center cursor-pointer">
                      <svg 
                        className={`w-10 h-12 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="mb-1 text-sm font-medium">
                        {isDragging ? 'Upuść plik tutaj' : 'Przeciągnij i upuść plik'}
                      </p>
                      <p className="text-xs text-gray-500">
                        lub
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Przycisk */}
                  <label 
                    className={`w-full mt-2 py-2 text-sm ${uploadingFile ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md flex justify-center items-center cursor-pointer transition-colors`}
                  >
                    {uploadingFile ? 'Przetwarzanie...' : 'Wybierz plik CV'}
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {/* Prawa kolumna: wskazówka/opis */}
                <div className="flex flex-col justify-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium mb-2">Jak działa import CV?</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Załaduj swoje istniejące CV w formacie PDF lub DOCX. Nasze narzędzie przeanalizuje jego zawartość.
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
                    Po przesłaniu pliku, nasze narzędzie automatycznie wypełni odpowiednie pola na podstawie treści dokumentu. Możesz następnie edytować i dostosować wszystkie informacje.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Zawartość zakładki "CV dopasowane do oferty" */}
          {activeTab === 'jobOffer' && (
            <div className="rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lewa kolumna: wybór oferty i przycisk */}
                <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  {/* <h4 className="text-sm font-medium mb-3">CV dopasowane do oferty pracy</h4> */}
                  
                  {isLoadingOffers ? (
                    <p className="text-gray-500">Ładowanie ofert pracy...</p>
                  ) : jobOffers.length === 0 ? (
                    <p className="text-gray-500">Nie masz żadnych zapisanych ofert pracy.</p>
                  ) : (
                    <>
                      {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wybierz ofertę pracy
                      </label> */}
                      <select
                        className="w-full text-xs border border-gray-300 rounded-md p-2 mb-3"
                        value={selectedOffer?.id || ''}
                        onChange={(e) => {
                          const offer = jobOffers.find(o => o.id === e.target.value);
                          setSelectedOffer(offer || null);
                        }}
                      >
                        <option value="">-- Wybierz ofertę --</option>
                        {jobOffers.map(offer => (
                          <option key={offer.id} value={offer.id}>
                            {offer.title} - {offer.company}
                          </option>
                        ))}
                      </select>
                      
                      {selectedOffer && (
                        <div className="border border-gray-200 rounded-md p-3 mb-3">
                          <h4 className="font-medium text-sm">{selectedOffer.title}</h4>
                          <p className="text-sm text-gray-600">{selectedOffer.company}</p>
                          {selectedOffer.salary && (
                            <p className="text-xs text-gray-600 mt-1">{selectedOffer.salary}</p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${getStatusStyles(selectedOffer.status)}`}>
                              {statusMap[selectedOffer.status] || selectedOffer.status}
                            </span>
                            <span className={`text-sm ml-2 ${getPriorityColor(selectedOffer.priority)}`}>
                              Priorytet: {selectedOffer.priority}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={handleCreateCVForJob}
                        disabled={!selectedOffer}
                        className={`w-full py-2 rounded-sm mt-auto ${
                          selectedOffer 
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Stwórz CV dla tej oferty
                      </button>
                    </>
                  )}
                </div>
                
                {/* Prawa kolumna: wskazówka/opis */}
                <div className="flex flex-col justify-center p-4 border border-gray-200 rounded-lg bg-gray-50">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartSection;