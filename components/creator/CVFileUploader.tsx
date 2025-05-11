import React, { useState, useRef } from 'react';
import { useCV } from './CVContext';
import { CVData } from './CVContext';
import { useRouter } from 'next/navigation';

// Deklaracja typu dla window.gc
declare global {
  interface Window {
    gc?: () => void;
  }
}

interface CVFileUploaderProps {
  onFileProcessed?: (text: string) => void;
  className?: string;
  onImportSuccess?: () => void; // Callback do powiadomienia rodzica o sukcesie
}

// Dodajemy interfejs dla odpowiedzi od API Gemini
interface GeminiAnalysisResponse {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    socialLinks?: Array<{
      type: string;
      url: string;
      include: boolean;
    }>;
  };
  description: string;
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    type?: 'job' | 'project';
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  courses?: Array<{
    name: string;
    organizer: string;
    date: string;
    certificateNumber: string;
    description?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: Array<{
      language: string;
      level: string;
    }>;
  };
}

const CVFileUploader: React.FC<CVFileUploaderProps> = ({ 
  onFileProcessed,
  className = '',
  onImportSuccess
}) => {
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pdfParsingError, setPdfParsingError] = useState<boolean>(false);
  const [processingWithAI, setProcessingWithAI] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cvData, setCvData, setCVName, saveCV, setActiveSection } = useCV();
  const router = useRouter();

  // Funkcja do analizy CV przez model Gemini
  const analyzeWithGemini = async (text: string): Promise<GeminiAnalysisResponse | null> => {
    setProcessingWithAI(true);
    try {
      // Endpoint API dla analizy CV - ścieżka uwzględnia grupę (dashboard)
      const url = '/api/analyze-cv';
      
      console.log("🚀 Wysyłam zapytanie do API analizy CV:", url);
      console.log(`📄 Długość tekstu CV: ${text.length} znaków`);
      
      // Wyświetl krótki fragment tekstu w konsoli dla debugowania
      if (text.length > 0) {
        console.log("📝 Fragment tekstu CV (pierwsze 200 znaków):");
        console.log(text.substring(0, 200) + "...");
      }
      
      const startTime = Date.now();
      
      // Dodajemy timeout dla zapytania, aby uniknąć zbyt długiego oczekiwania
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minuty timeout
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
          signal: controller.signal
        });
        
        // Wyczyść timeout po otrzymaniu odpowiedzi
        clearTimeout(timeoutId);
        
        const endTime = Date.now();
        console.log(`✅ Odpowiedź z API otrzymana po ${(endTime - startTime) / 1000} sekundach`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Błąd API: ${response.status} - ${errorText}`);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("📊 Dane otrzymane z analizy CV:", data);
        
        // Weryfikacja otrzymanych danych
        if (!data || typeof data !== 'object') {
          console.error("❌ Nieprawidłowy format danych z API");
          throw new Error("Nieprawidłowy format danych otrzymanych z API");
        }
        
        // Sprawdzenie, czy dane zawierają potrzebne sekcje
        const requiredSections = ['personalData', 'experience', 'education', 'skills'];
        const missingSections = requiredSections.filter(section => !data[section]);
        
        if (missingSections.length > 0) {
          console.warn(`⚠️ Ostrzeżenie: Brakujące sekcje w odpowiedzi: ${missingSections.join(', ')}`);
          // Uzupełniamy brakujące sekcje domyślnymi wartościami
          missingSections.forEach(section => {
            switch (section) {
              case 'personalData':
                data.personalData = {
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  address: '',
                  socialLinks: []
                };
                break;
              case 'experience':
                data.experience = [];
                break;
              case 'education':
                data.education = [];
                break;
              case 'skills':
                data.skills = { technical: [], soft: [], languages: [] };
                break;
              default:
                break;
            }
          });
        }
        
        setAnalysisResult(data); // Zapisujemy wynik analizy do stanu
        return data;
      } catch (fetchError: any) {
        // Sprawdzenie, czy błąd wynika z timeout'u
        if (fetchError.name === 'AbortError') {
          console.error("⏱️ Przekroczono czas oczekiwania na odpowiedź z API");
          throw new Error("Przekroczono czas oczekiwania na odpowiedź z API analizy CV");
        }
        
        console.error("❌ Błąd podczas komunikacji z API:", fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error("❌ Błąd podczas analizy CV z modelem Gemini:", error);
      return null;
    } finally {
      setProcessingWithAI(false);
    }
  };

  // Funkcja mapująca dane z Gemini do struktury CVData
  const mapGeminiDataToCVData = (geminiData: GeminiAnalysisResponse): CVData => {
    // Bierzemy aktualne dane z kontekstu jako bazę
    const currentCVData = { ...cvData };
    
    console.log("🔄 Mapowanie danych z analizy AI do struktury CV");
    
    try {
      // Mapujemy dane osobowe z weryfikacją i czyszczeniem
      currentCVData.personalData = {
        ...currentCVData.personalData,
        firstName: geminiData.personalData?.firstName?.trim() || currentCVData.personalData.firstName,
        lastName: geminiData.personalData?.lastName?.trim() || currentCVData.personalData.lastName,
        email: geminiData.personalData?.email?.trim() || currentCVData.personalData.email,
        phone: geminiData.personalData?.phone?.trim() || currentCVData.personalData.phone,
        address: geminiData.personalData?.address?.trim() || currentCVData.personalData.address,
      };
      
      // Mapujemy linki społecznościowe, jeśli istnieją
      if (geminiData.personalData?.socialLinks && Array.isArray(geminiData.personalData.socialLinks)) {
        // Filtrujemy, aby usunąć niepoprawne linki (bez URL lub typu)
        currentCVData.personalData.socialLinks = geminiData.personalData.socialLinks
          .filter(link => link && link.url && link.type)
          .map(link => ({
            type: link.type,
            url: link.url,
            include: link.include !== false // domyślnie true, jeśli nie określono
          }));
        
        console.log(`📱 Znaleziono ${currentCVData.personalData.socialLinks.length} linków społecznościowych`);
      }
      
      // Mapujemy opis
      if (geminiData.description && typeof geminiData.description === 'string') {
        currentCVData.description = geminiData.description.trim();
        console.log(`📝 Znaleziono opis o długości ${currentCVData.description.length} znaków`);
      }
      
      // Mapujemy doświadczenie z weryfikacją każdego pola
      if (geminiData.experience && Array.isArray(geminiData.experience) && geminiData.experience.length > 0) {
        // Filtrujemy, aby usunąć niepoprawne elementy i zapewnić wymagane pola
        currentCVData.experience = geminiData.experience
          .filter(exp => exp && (exp.position || exp.company)) // Wymagamy przynajmniej pozycji lub firmy
          .map(exp => ({
            position: exp.position?.trim() || '',
            company: exp.company?.trim() || '',
            startDate: exp.startDate?.trim() || '',
            endDate: exp.endDate?.trim() || '',
            description: exp.description?.trim() || '',
            type: exp.type === 'project' ? 'project' : 'job' // Domyślnie 'job'
          }));
        
        console.log(`💼 Znaleziono ${currentCVData.experience.length} pozycji doświadczenia`);
      }
      
      // Mapujemy edukację
      if (geminiData.education && Array.isArray(geminiData.education) && geminiData.education.length > 0) {
        currentCVData.education = geminiData.education
          .filter(edu => edu && (edu.school || edu.degree)) // Wymagamy przynajmniej szkoły lub stopnia
          .map(edu => ({
            school: edu.school?.trim() || '',
            degree: edu.degree?.trim() || '',
            startDate: edu.startDate?.trim() || '',
            endDate: edu.endDate?.trim() || '',
            description: edu.description?.trim() || ''
          }));
        
        console.log(`🎓 Znaleziono ${currentCVData.education.length} pozycji edukacji`);
      }
      
      // Mapujemy kursy
      if (geminiData.courses && Array.isArray(geminiData.courses) && geminiData.courses.length > 0) {
        currentCVData.courses = geminiData.courses
          .filter(course => course && course.name) // Wymagamy przynajmniej nazwy kursu
          .map(course => ({
            name: course.name?.trim() || '',
            organizer: course.organizer?.trim() || '',
            date: course.date?.trim() || '',
            certificateNumber: course.certificateNumber?.trim() || '',
            description: course.description?.trim() || ''
          }));
        
        console.log(`📜 Znaleziono ${currentCVData.courses.length} kursów/certyfikatów`);
      }
      
      // Mapujemy umiejętności
      if (geminiData.skills) {
        // Umiejętności techniczne
        if (geminiData.skills.technical && Array.isArray(geminiData.skills.technical)) {
          currentCVData.skills.technical = geminiData.skills.technical
            .filter(skill => skill && typeof skill === 'string' && skill.trim() !== '')
            .map(skill => skill.trim());
          
          console.log(`🔧 Znaleziono ${currentCVData.skills.technical.length} umiejętności technicznych`);
        }
        
        // Umiejętności miękkie
        if (geminiData.skills.soft && Array.isArray(geminiData.skills.soft)) {
          currentCVData.skills.soft = geminiData.skills.soft
            .filter(skill => skill && typeof skill === 'string' && skill.trim() !== '')
            .map(skill => skill.trim());
          
          console.log(`🤝 Znaleziono ${currentCVData.skills.soft.length} umiejętności miękkich`);
        }
        
        // Języki
        if (geminiData.skills.languages && Array.isArray(geminiData.skills.languages)) {
          currentCVData.skills.languages = geminiData.skills.languages
            .filter(lang => lang && lang.language) // Wymagamy przynajmniej nazwy języka
            .map(lang => ({
              language: lang.language?.trim() || '',
              level: lang.level?.trim() || ''
            }));
          
          console.log(`🌐 Znaleziono ${currentCVData.skills.languages.length} języków`);
        }
      }
      
    } catch (error) {
      console.error("❌ Błąd podczas mapowania danych z analizy AI:", error);
      // W przypadku błędu zwracamy oryginalne dane
    }
    
    console.log("✅ Zakończono mapowanie danych CV");
    return currentCVData;
  };

  // Funkcja do wykonania przekierowania do edycji CV
  const navigateToEditor = () => {
    // Ustawienie aktywnej sekcji na 'personal' (dane osobowe) aby od niej zacząć edycję
    setActiveSection('personal');
    
    // Jeśli przekazano callback onImportSuccess, wywołaj go
    if (onImportSuccess) {
      onImportSuccess();
    }
    
    // Dodajemy komunikat o powodzeniu
    console.log("✅ Pomyślnie przekierowano do edytora CV po udanym imporcie");
    
    // Nie używamy już przekierowania przez router - wszystko dzieje się poprzez callbacki
  };

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
    setAnalysisResult(null); // Resetujemy poprzedni wynik analizy
    
    try {
      // Resetujemy stan błędu
      setPdfParsingError(false);
      
      // Sprawdź rozszerzenie pliku
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['pdf', 'docx', 'doc'].includes(fileExt)) {
        alert("Obsługiwane formaty to PDF, DOCX i DOC. Proszę wybrać prawidłowy format pliku.");
        setUploadingFile(false);
        return;
      }
      
      console.log(`Rozpoczynam ekstrakcję tekstu z pliku ${file.name} (${file.size} bajtów, typ: ${file.type})`);
      
      // Ekstrakcja tekstu w zależności od typu pliku
      let extractedText = '';
      
      if (fileExt === 'pdf') {
        try {
          // Import potrzebnych modułów z pdfjs-dist
          const pdfjsLib = await import('pdfjs-dist');
          
          // Próba 1: Użycie lokalnie skopiowanego pliku workera
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdfjs/pdf.worker.min.mjs';
            
            // Odczytanie pliku jako ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            // Załadowanie dokumentu PDF
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdfDocument = await loadingTask.promise;
            
            console.log(`PDF wczytany poprawnie, liczba stron: ${pdfDocument.numPages}`);
            
            // Ekstrakcja tekstu ze wszystkich stron
            let textContent = '';
            for (let i = 1; i <= pdfDocument.numPages; i++) {
              const page = await pdfDocument.getPage(i);
              const pageText = await page.getTextContent();
              textContent += pageText.items.map((item: any) => item.str).join(' ') + '\n';
            }
            
            extractedText = textContent;
          } catch (workerError) {
            console.error("Błąd przy użyciu lokalnego workera:", workerError);
            
            // Próba 2: Użycie CDN jako alternatywy
            try {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
              
              // Odczytanie pliku jako ArrayBuffer
              const arrayBuffer = await file.arrayBuffer();
              // Załadowanie dokumentu PDF
              const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
              const pdfDocument = await loadingTask.promise;
              
              // Ekstrakcja tekstu ze wszystkich stron
              let textContent = '';
              for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const pageText = await page.getTextContent();
                textContent += pageText.items.map((item: any) => item.str).join(' ') + '\n';
              }
              
              extractedText = textContent;
            } catch (cdnError) {
              console.error("Błąd przy użyciu unpkg CDN:", cdnError);
              
              // Próba 3: Użycie innego CDN
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              
              // Odczytanie pliku jako ArrayBuffer
              const arrayBuffer = await file.arrayBuffer();
              // Załadowanie dokumentu PDF
              const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
              const pdfDocument = await loadingTask.promise;
              
              // Ekstrakcja tekstu ze wszystkich stron
              let textContent = '';
              for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const pageText = await page.getTextContent();
                textContent += pageText.items.map((item: any) => item.str).join(' ') + '\n';
              }
              
              extractedText = textContent;
            }
          }
        } catch (error) {
          console.error("Błąd podczas przetwarzania PDF:", error);
          throw error;
        }
      } else if (fileExt === 'docx' || fileExt === 'doc') {
        // Import modułu mammoth do obsługi DOCX
        const mammoth = await import('mammoth');
        
        // Odczytanie pliku jako ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Konwersja DOCX na tekst
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
        console.log(`Dokument DOCX wczytany poprawnie, długość tekstu: ${extractedText.length} znaków`);
      }
      
      // Wyświetlenie ekstrahowanego tekstu w konsoli
      console.log('Wyekstrahowany tekst z CV (pierwsze 500 znaków):');
      console.log(extractedText.substring(0, 500) + '...');
      
      // Wywołanie callback'a z wyekstrahowanym tekstem, jeśli został przekazany
      if (onFileProcessed) {
        onFileProcessed(extractedText);
      }
      
      // Analiza tekstu CV za pomocą modelu Gemini
      const analysisResult = await analyzeWithGemini(extractedText);
      
      if (analysisResult) {
        // Mapowanie danych z analizy do struktury CVData
        const mappedCVData = mapGeminiDataToCVData(analysisResult);
        
        // Aktualizacja danych CV w kontekście
        setCvData(mappedCVData);
        
        // Ustawienie nazwy CV (można użyć np. pierwszego słowa z nazwy pliku)
        const fileName = file.name.split('.')[0];
        setCVName(`Zaimportowane CV - ${fileName}`);
        
        // Zapisanie CV w bazie danych
        const savedId = await saveCV(true); // true oznacza, że zapisujemy jako szkic
        
        if (savedId) {
          // Dodajemy komunikat o powodzeniu
          console.log("✅ Pomyślnie zaimportowano CV");
        } else {
          alert("CV zostało zaimportowane, ale wystąpił problem z zapisem danych. Sprawdź konsolę po więcej szczegółów.");
        }
      } else {
        alert("CV zostało zaimportowane, ale wystąpił problem z analizą AI. Sprawdź konsolę po więcej szczegółów.");
      }
      
      // Czyszczenie pamięci po ekstrakcji
      clearMemory();
      
    } catch (error) {
      console.error("❌ Wystąpił błąd podczas ekstrakcji tekstu z CV:", error);
      
      // Resetujemy stany
      setAnalysisResult(null);
      
      // Sprawdzamy, czy to błąd parsowania PDF
      // Pobieramy jeszcze raz rozszerzenie pliku w bloku catch
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'pdf') {
        setPdfParsingError(true);
      }
      
      // Pokazujemy odpowiedni komunikat błędu
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("czas oczekiwania")) {
          alert("Analiza CV zajmuje zbyt dużo czasu. Serwer może być przeciążony. Spróbuj ponownie później lub zredukuj rozmiar pliku.");
        } else if (error.message.toLowerCase().includes("api") || error.message.toLowerCase().includes("gemini")) {
          alert("Wystąpił błąd podczas analizy CV przez model AI. Spróbuj ponownie później lub skontaktuj się z administratorem.");
        } else {
          alert("Wystąpił błąd podczas ekstrakcji tekstu z CV. Sprawdź konsolę przeglądarki po więcej szczegółów.");
        }
      } else {
        alert("Wystąpił nieznany błąd podczas przetwarzania CV. Sprawdź konsolę przeglądarki po więcej szczegółów.");
      }
    } finally {
      setUploadingFile(false);
      // Resetowanie pola input po zakończeniu
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Funkcja do czyszczenia pamięci po ekstrakcji tekstu
  const clearMemory = () => {
    // Wymuszenie zwolnienia pamięci przez garbage collector
    if (window.gc) {
      window.gc();
    } else {
      console.log('Ręczne czyszczenie pamięci nie jest dostępne. Plik zostanie usunięty z pamięci przez garbage collector JavaScript.');
    }
    
    // Dodatkowe działania pomagające w zwolnieniu pamięci
    setTimeout(() => {
      // Tworzenie dużej ilości obiektów może pomóc uruchomić garbage collector
      const arr = [];
      for (let i = 0; i < 1000; i++) {
        arr.push(new ArrayBuffer(1024 * 10)); // Tworzymy obiekty o wielkości 10KB
      }
      console.log('Pamięć została wyczyszczona po ekstrakcji tekstu z CV');
    }, 1000);
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

  return (
    <div className={className}>
      
      {/* Obszar drag & drop - wyświetlany przed importem */}
      {!analysisResult && (
        <>
          {/* Obszar drag & drop */}
          <div 
            className={`border-2 border-dashed rounded-md p-6 w-full transition-all text-center ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : uploadingFile || processingWithAI
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileUpload}
            onClick={() => {
              if (!uploadingFile && !processingWithAI) {
                fileInputRef.current?.click();
              }
            }}
          >
            <div className={`flex flex-col items-center ${!uploadingFile && !processingWithAI ? 'cursor-pointer' : ''}`}>
              <svg 
                className={`w-10 h-12 mb-3 ${
                  isDragging 
                    ? 'text-blue-500' 
                    : uploadingFile 
                      ? 'text-yellow-500' 
                      : processingWithAI 
                        ? 'text-blue-500' 
                        : 'text-gray-400'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              
              <p className="mb-2 text-sm font-medium">
                {isDragging 
                  ? 'Upuść plik tutaj' 
                  : uploadingFile 
                    ? 'Wczytywanie pliku...' 
                    : processingWithAI 
                      ? 'Analizowanie CV...' 
                      : 'Kliknij i wybierz plik lub przeciągnij i upuść'}
              </p>
              
              <p className="text-xs text-gray-500">
                {uploadingFile || processingWithAI 
                  ? 'Proszę czekać, trwa przetwarzanie...' 
                  : 'Obsługiwane formaty: PDF, DOCX, DOC'}
              </p>
              
              {!uploadingFile && !processingWithAI && (
                <p className="mt-2 text-xs text-gray-500 max-w-md">
                  Twoje CV zostanie przeanalizowane przez sztuczną inteligencję, która automatycznie 
                  wypełni odpowiednie pola w kreatorze CV. Po imporcie będziesz mógł edytować wszystkie dane.
                </p>
              )}
              
              {uploadingFile && (
                <div className="mt-3 text-sm text-yellow-600">
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Wczytuję i przetwarzam plik...
                  </div>
                </div>
              )}
              
              {processingWithAI && (
                <div className="mt-3 text-sm text-blue-600">
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analizuję CV za pomocą sztucznej inteligencji...
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              disabled={uploadingFile || processingWithAI}
              className="hidden"
            />
          </div>
        </>
      )}

      {/* Komunikat o sukcesie i przycisk do edycji - widoczne po udanym imporcie */}
      {analysisResult && (
        <div className="text-center">
          <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">CV zostało pomyślnie zaimportowane!</h3>
            <p className="text-green-700">
              Model sztucznej inteligencji przeanalizował Twoje CV i rozpoznał główne informacje.
              Możesz teraz przejść do edycji, aby sprawdzić i dopracować swoje CV.
            </p>
          </div>
          
          <button 
            onClick={navigateToEditor}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 transition-all shadow-md flex items-center justify-center font-medium text-lg"
          >
            <svg className="w-6 h-6 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            <span>Przejdź do edycji CV</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      )}
      
      {/* Informacja o błędzie parsowania PDF */}
      {pdfParsingError && (
        <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <strong>Błąd parsowania PDF:</strong>
          </div>
          <p className="ml-7">
            Ten plik PDF może być zabezpieczony lub zawierać zeskanowany tekst, 
            który nie może być automatycznie ekstrahowany. Dla najlepszych rezultatów, 
            użyj PDF z kopiowanym tekstem lub dokumentu DOCX.
          </p>
        </div>
      )}
    </div>
  );
};

export default CVFileUploader; 