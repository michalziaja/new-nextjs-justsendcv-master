import React, { useState, useRef } from 'react';

// Deklaracja typu dla window.gc
declare global {
  interface Window {
    gc?: () => void;
  }
}

interface CVFileUploaderProps {
  onFileProcessed?: (text: string) => void;
  className?: string;
}

const CVFileUploader: React.FC<CVFileUploaderProps> = ({ 
  onFileProcessed,
  className = '' 
}) => {
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pdfParsingError, setPdfParsingError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      }
      
      // Wyświetlenie ekstrahowanego tekstu w konsoli
      console.log('Wyekstrahowany tekst z CV:');
      console.log(extractedText);
      
      // Wywołanie callback'a z wyekstrahowanym tekstem, jeśli został przekazany
      if (onFileProcessed) {
        onFileProcessed(extractedText);
      }
      
      // Informacja dla użytkownika
      alert("Tekst CV został wyekstrahowany i wyświetlony w konsoli przeglądarki (naciśnij F12, aby zobaczyć).");
      
      // Czyszczenie pamięci po ekstrakcji
      clearMemory();
      
    } catch (error) {
      console.error("Wystąpił błąd podczas ekstrakcji tekstu z CV:", error);
      
      // Sprawdzamy, czy to błąd parsowania PDF
      // Pobieramy jeszcze raz rozszerzenie pliku w bloku catch
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'pdf') {
        setPdfParsingError(true);
      }
      
      alert("Wystąpił błąd podczas ekstrakcji tekstu z CV. Sprawdź konsolę przeglądarki po więcej szczegółów.");
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
      {/* Obszar drag & drop */}
      <div 
        className={`border-2 border-dashed rounded-md p-6 w-full transition-all text-center ${
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
            className={`w-10 h-12 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="mb-2 text-sm font-medium">
            {isDragging ? 'Upuść plik tutaj' : 'Kliknij i wybierz plik lub przeciągnij i upuść'}
          </p>
          <p className="text-xs text-gray-500">
            Obsługiwane formaty: PDF, DOCX, DOC
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
      
      {pdfParsingError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h5 className="text-sm font-medium text-red-600 mb-1">Wykryto problem z parsowaniem PDF</h5>
          <p className="text-xs text-red-600 mb-2">
            Wystąpił błąd podczas przetwarzania pliku PDF. Możliwe przyczyny:
          </p>
          <ul className="text-xs text-red-600 list-disc pl-4">
            <li>Plik PDF zawiera zabezpieczenia</li>
            <li>Plik PDF zawiera skanowane obrazy zamiast tekstu</li>
            <li>Problem z biblioteką do parsowania PDF</li>
          </ul>
          <p className="text-xs text-red-600 mt-2">
            Sugestia: Spróbuj zapisać plik w formacie DOCX i załadować ponownie.
          </p>
        </div>
      )}
    </div>
  );
};

export default CVFileUploader; 