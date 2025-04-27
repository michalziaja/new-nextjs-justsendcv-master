import * as pdfJS from 'pdfjs-dist';

// Inicjalizacja PDF.js - ustawienie ścieżki do worker'a
if (typeof window !== 'undefined') {
  pdfJS.GlobalWorkerOptions.workerSrc = 
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJS.version}/pdf.worker.min.js`;
}

/**
 * Funkcja do odczytywania tekstu z pliku PDF używając pdfjs-dist (działa w przeglądarce)
 */
export async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    // Załadowanie dokumentu PDF
    const loadingTask = pdfJS.getDocument({ data: fileBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Przetworzenie każdej strony
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items;
      
      // Złączenie wszystkich elementów tekstowych ze strony
      const pageText = textItems
        .map((item: any) => item.str)
        .join(' ');
        
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Błąd podczas parsowania pliku PDF:', error);
    throw new Error('Nie udało się odczytać tekstu z pliku PDF');
  }
}

/**
 * Funkcja do odczytywania tekstu z pliku DOCX
 * (uproszczona wersja do przyszłej implementacji)
 */
export async function extractTextFromDOCX(fileBuffer: ArrayBuffer): Promise<string> {
  // UWAGA: Pełna implementacja zostanie dodana w późniejszym etapie
  // W tym momencie zwracamy przykładowy tekst
  return 'Tekst z dokumentu DOCX.\nTa funkcjonalność zostanie w pełni zaimplementowana w kolejnym etapie.';
}

/**
 * Główna funkcja do ekstrakcji tekstu z pliku CV (obsługuje różne formaty)
 */
export async function extractTextFromCV(file: File): Promise<string> {
  try {
    // Konwersja File na ArrayBuffer (działa w przeglądarce)
    const arrayBuffer = await file.arrayBuffer();
    
    // Sprawdzenie rozszerzenia pliku
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'pdf') {
      return extractTextFromPDF(arrayBuffer);
    } else if (fileExt === 'docx' || fileExt === 'doc') {
      return extractTextFromDOCX(arrayBuffer);
    } else {
      throw new Error('Nieobsługiwany format pliku. Akceptujemy tylko PDF, DOCX i DOC.');
    }
  } catch (error) {
    console.error('Błąd podczas ekstrakcji tekstu z CV:', error);
    return `Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`;
  }
}
