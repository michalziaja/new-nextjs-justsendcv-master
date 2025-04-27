//components/creator/Preview.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useCV } from './CVContext';
import { IoIosCreate } from "react-icons/io";
// import { JobOffer } from "../saved/ApplicationDetailsDrawer";
import { ModernCVTemplate } from './templates/CVTemplate';
import PreviewHeader from './PreviewHeader';
import {
  translations,
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  MM_TO_PX
} from './templates/TemplateStyles';

import {
  optimizePageLayout
} from './templates/CVTemplateLogic';

// Komponent dla prawej strony - podgląd
export default function Preview({ switchMode }: { switchMode?: () => void }) {
  const { cvData, selectedJob, selectedTemplate, activeSection, showProjectsInPreview } = useCV();
  const [zoom, setZoom] = useState(100); // Startowa wartość 100%
  const [scrollNeeded, setScrollNeeded] = useState(true);
  const [autoZoom, setAutoZoom] = useState(100);
  const [language, setLanguage] = useState<'pl' | 'en'>('pl'); // Stan do przechowywania języka
  const [totalPages, setTotalPages] = useState(1); // Całkowita liczba stron
  const [measurementDone, setMeasurementDone] = useState(false); // Stan określający, czy pomiar został wykonany
  const [sectionsMap, setSectionsMap] = useState<{[key: string]: {
    start: number,
    end: number,
    fitsOnOnePage?: boolean,
    page?: number,
    isSplit?: boolean,
    childElements?: {[key: string]: {
      index: number,
      start: number,
      end: number,
      height: number,
      page?: number
    }},
    elementsBoundaries?: {[page: number]: {
      firstElement: number,
      lastElement: number
    }}
  }}>({});
  const [blockMapUpdate, setBlockMapUpdate] = useState(false); // Blokada aktualizacji mapy sekcji
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false); // Nowy stan do śledzenia generowania PDF
  const documentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null); // Referencja do drukowania (tylko zawartość)
  const contentMeasureRef = useRef<HTMLDivElement>(null); // Ref do pomiaru zawartości

  // Funkcja przełączająca język
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'pl' ? 'en' : 'pl');
  };

  // Funkcja skalowania - przelicza wyświetlany % na rzeczywisty współczynnik skalowania
  const getScaleFactor = (displayZoom: number) => {
    return (displayZoom * 1) / 100;
  };

  // Nowa funkcja do generowania PDF za pomocą Puppeteer
  const generatePdf = async () => {
    if (!hasMinimumData() || !printRef.current) return;

    try {
      setIsGeneratingPdf(true);

      // Przygotuj nazwę pliku
      const filename = `CV_${cvData.personalData.firstName}_${cvData.personalData.lastName}`.replace(/\s+/g, '_');

      // Zbierz HTML i CSS do wysyłki
      const cvContainer = printRef.current;
      if (!cvContainer) {
        throw new Error('Nie znaleziono kontenera CV');
      }

      console.log("Przygotowuję dane HTML do wysyłki...");
      const htmlContent = cvContainer.innerHTML;

      // Zbieramy wszystkie style ze strony
      console.log("Zbieranie stylów CSS...");
      const cssStyles = Array.from(document.styleSheets)
        .filter(styleSheet => {
          try {
            // Filtrujemy tylko arkusze stylów z tego samego pochodzenia
            return styleSheet.cssRules && !styleSheet.href?.startsWith('http');
          } catch (e) {
            console.warn("Błąd dostępu do stylu:", e);
            return false;
          }
        })
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            console.warn("Błąd dostępu do reguł stylu:", e);
            return '';
          }
        })
        .join('\n');

      // Konfiguracja dla PDF
      const options = {
        filename,
        pageRanges: `1-${totalPages}`,
        printBackground: true
      };

      console.log("Wysyłanie żądania do API...");
      console.log("Endpoint URL:", '/api/generate-pdf');

      // Wysyłamy żądanie do endpointu API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent,
          cssStyles,
          options
        }),
      });

      console.log("Status odpowiedzi:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Odpowiedź błędu:", errorData);
        throw new Error(`Błąd podczas generowania PDF: ${response.status} ${response.statusText}`);
      }

      // Pobierz wygenerowany PDF jako blob
      const pdfBlob = await response.blob();

      // Utwórz URL dla blobu
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Utwórz link do pobrania
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `${filename}.pdf`;

      // Wywołaj kliknięcie na linku, aby rozpocząć pobieranie
      downloadLink.click();

      // Zwolnij URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);

      console.log("PDF wygenerowany pomyślnie!");
    } catch (error) {
      console.error("Błąd podczas generowania PDF:", error);
      alert(`Wystąpił błąd podczas generowania PDF: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handler do aktualizacji mapy sekcji bez obsługi fontScaleFactor
  const handleSectionsUpdate = (sections: {[key: string]: {
    start: number,
    end: number,
    fitsOnOnePage?: boolean,
    page?: number,
    isSplit?: boolean,
    childElements?: {[key: string]: {
      index: number,
      start: number,
      end: number,
      height: number,
      page?: number
    }},
    elementsBoundaries?: {[page: number]: {
      firstElement: number,
      lastElement: number
    }}
  }}) => { // Usunięto parametr newFontScaleFactor
    console.log("Otrzymano aktualizację sekcji:", sections);

    // Jeśli blokada jest aktywna, nie aktualizuj mapy sekcji
    if (blockMapUpdate) {
      console.log("Aktualizacja mapy sekcji zablokowana");
      return;
    }

    // Sprawdź, czy dane CV mają wypełnione sekcje i usuń te, które są puste
    const filteredSections = { ...sections };

    // Zawsze zachowujemy sekcję header
    Object.keys(filteredSections).forEach(key => {
      // Dla sekcji experience, musimy zachować także elementy experience-X, jeśli experience jest widoczne
      if (key.startsWith('experience-') && !key.includes('project')) {
        const hasContent = cvData.experience.some(exp =>
          (!exp.type || exp.type === 'job') &&
          (exp.position?.trim() || exp.company?.trim() || exp.description?.trim())
        );
        if (!hasContent) {
          delete filteredSections[key];
        }
      }
      // Dla sekcji projects, musimy zachować także elementy projects-X, jeśli projects jest widoczne
      else if (key.startsWith('projects-')) {
        const hasContent = cvData.experience.some(exp =>
          exp.type === 'project' &&
          (exp.position?.trim() || exp.company?.trim() || exp.description?.trim())
        );
        if (!hasContent) {
          delete filteredSections[key];
        }
      }
      // Dla sekcji education, musimy zachować także elementy education-X, jeśli education jest widoczne
      else if (key.startsWith('education-')) {
        const hasContent = cvData.education.some(edu =>
          edu.school?.trim() || edu.degree?.trim() || edu.description?.trim()
        );
        if (!hasContent) {
          delete filteredSections[key];
        }
      }
    });

    setSectionsMap(filteredSections);
    setMeasurementDone(true);
    setBlockMapUpdate(true); // Zablokuj dalsze aktualizacje

    // Zapisz mapę sekcji w localStorage, bez fontScaleFactor
    try {
      localStorage.setItem('cv-sections-map', JSON.stringify(filteredSections));
    } catch (error) {
      console.error("Nie udało się zapisać mapy sekcji w localStorage:", error);
    }
  };

  // Pobranie zapisanej mapy sekcji przy inicjalizacji (bez fontScaleFactor)
  useEffect(() => {
    try {
      const savedSectionsMap = localStorage.getItem('cv-sections-map');

      if (savedSectionsMap) {
        const parsedMap = JSON.parse(savedSectionsMap);
        console.log("Odzyskano mapę sekcji z localStorage:", parsedMap);
        setSectionsMap(parsedMap);
        setBlockMapUpdate(true); // Zablokuj aktualizacje po odzyskaniu mapy z localStorage
      }
    } catch (error) {
      console.error("Nie udało się odczytać danych z localStorage:", error);
    }
  }, []);

  // Sprawdzenie czy dane CV są wystarczające do generowania sensownego PDF
  const hasMinimumData = () => {
    return cvData.personalData.firstName !== '' &&
           cvData.personalData.lastName !== '' &&
           cvData.personalData.email !== '';
  };

  // Automatyczne dostosowanie zoom w zależności od szerokości ekranu
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined' || !containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;

      // Standardowe wymiary A4 w mm: 210mm x 297mm (szerokość x wysokość)
      // Zachowujemy proporcje 1:1.414 (szerokość:wysokość)
      const a4Width = A4_WIDTH_MM;  // Użyto importowanej stałej

      // Przeliczamy mm na piksele (przybliżenie)
      const mmToPx = MM_TO_PX; // Użyto importowanej stałej
      const docWidthPx = a4Width * mmToPx;

      // Obliczenie optymalnego zoom, aby dokument mieścił się w kontenerze
      // Odejmujemy 40px na marginesy
      let optimalZoom = ((containerWidth - 40) / docWidthPx) * 100;

      // Ograniczenia zoom - min 55%, max 100%
      optimalZoom = Math.max(55, Math.min(100, optimalZoom));

      // Aktualizacja auto zoom
      setAutoZoom(optimalZoom);
    };

    // Nasłuchiwanie na zmiany rozmiaru okna
    window.addEventListener('resize', handleResize);
    // Pierwsze wywołanie po zamontowaniu
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sprawdzanie, czy potrzebny jest scroll
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (!documentRef.current || !containerRef.current) return;

      // Sprawdzamy czy potrzebne jest przewijanie
      const documentEl = documentRef.current;
      const containerEl = containerRef.current;

      const scale = getScaleFactor(zoom);
      const scaledDocHeight = documentEl.scrollHeight * scale;
      const containerHeight = containerEl.offsetHeight;

      setScrollNeeded(scaledDocHeight > containerHeight);
    };

    checkScrollNeeded();
    window.addEventListener('resize', checkScrollNeeded);

    return () => {
      window.removeEventListener('resize', checkScrollNeeded);
    };
  }, [zoom, cvData, selectedTemplate, totalPages]);

  // Aktualizacja zoomu przy zmianie autoZoom
  useEffect(() => {
    if (Math.abs(zoom - autoZoom) > 1) {
      setZoom(autoZoom);
    }
  }, [autoZoom]);

  // Obliczenie całkowitej liczby stron na podstawie zawartości
  useEffect(() => {
    // Funkcja do obliczania liczby stron
    const calculateTotalPages = () => {
      // Jeśli nie mamy jeszcze mapy sekcji, ustawiamy domyślnie 1 stronę
      if (!sectionsMap || Object.keys(sectionsMap).length === 0) {
        console.log("Brak mapy sekcji, ustawiam totalPages=1");
        setTotalPages(1);
        return;
      }

      // Sprawdź, czy mamy informację, że wszystko mieści się na jednej stronie
      const firstSectionKey = Object.keys(sectionsMap)[0];
      if (sectionsMap[firstSectionKey] && 'fitsOnOnePage' in sectionsMap[firstSectionKey] && sectionsMap[firstSectionKey].fitsOnOnePage === true) {
        console.log("Wszystkie sekcje mieszczą się na jednej stronie, ustawiam totalPages=1");
        setTotalPages(1);
        return;
      }

      // NAPRAWA: poprawiona metoda - znajdź najwyższy numer FAKTYCZNIE UŻYWANEJ strony
      // Musimy sprawdzić, czy na danej stronie istnieją jakieś sekcje, nie tylko sprawdzić numer strony
      const pagesWithContent = new Set<number>();

      // Sprawdź strony przypisane sekcjom
      Object.values(sectionsMap)
        .filter(section => 'page' in section && section.page !== undefined)
        .forEach(section => {
          const sectionPage = section.page as number;
          pagesWithContent.add(sectionPage);

          // Sprawdź strony przypisane elementom w tej sekcji
          if (section.childElements) {
            Object.values(section.childElements)
              .filter(element => element.page !== undefined)
              .forEach(element => {
                pagesWithContent.add(element.page as number);
              });
          }
        });

      // Konwertuj Set na Array, posortuj i znajdź największą wartość
      if (pagesWithContent.size > 0) {
        const maxPage = Math.max(...Array.from(pagesWithContent));
        console.log(`Obliczono stron na podstawie przypisań: ${maxPage}, strony z zawartością: ${Array.from(pagesWithContent).sort().join(', ')}`);

        const newTotalPages = maxPage;

        // Optymalizacja rozkładu elementów na stronach
        if (newTotalPages > 1) {
          const optimizedSections = optimizePageLayout(sectionsMap, newTotalPages);

          // Aktualizuj mapę sekcji tylko jeśli układ został zoptymalizowany
          if (JSON.stringify(optimizedSections) !== JSON.stringify(sectionsMap)) {
            console.log("Układ został zoptymalizowany");

            // Aktualizuj mapę sekcji, ale nie blokuj aktualizacji, aby umożliwić dalsze optymalizacje
            setSectionsMap(optimizedSections);

            // Zapisz zoptymalizowaną mapę w localStorage
            try {
              localStorage.setItem('cv-sections-map', JSON.stringify(optimizedSections));
            } catch (error) {
              console.error("Nie udało się zapisać zoptymalizowanej mapy w localStorage:", error);
            }
          }
        }

        setTotalPages(newTotalPages);
        return;
      }

      // Stara metoda jako fallback - znajdź najniższy punkt w dokumencie
      const maxEnd = Object.values(sectionsMap).reduce((max, section) => {
        return Math.max(max, section.end);
      }, 0);

      // Standardowa wysokość strony A4 w pikselach
      const pageHeight = A4_HEIGHT_MM * MM_TO_PX; // Użyto importowanych stałych
      console.log(`Wysokość strony A4: ${pageHeight}px`);

      // Oblicz liczbę stron
      const pages = Math.max(1, Math.ceil(maxEnd / pageHeight));

      console.log(`Obliczono stron: ${pages}, maksymalny punkt=${maxEnd}px, wysokość strony=${pageHeight}px`);

      // Sprawdź, czy faktycznie zmienia się liczba stron
      if (pages !== totalPages) {
        console.log(`Zmiana liczby stron z ${totalPages} na ${pages}`);
        setTotalPages(pages);
      } else {
        console.log(`Liczba stron pozostaje bez zmian: ${totalPages}`);
      }
    };

    // Oblicz liczbę stron po aktualizacji mapy sekcji
    calculateTotalPages();
  }, [sectionsMap, totalPages]);

  // Handler dla przycisku drukowania, który sprawdza dane przed wywołaniem generowania PDF
  const handlePrintClick = () => {
    if (hasMinimumData()) {
      generatePdf();
    }
  };

  // Zresetuj blokadę i wymuś nowy pomiar gdy zmienią się dane CV, język lub szablon
  useEffect(() => {
    console.log("Dane CV, język lub szablon zostały zmienione - wymuszenie ponownego pomiaru");

    // Zamiast resetować wszystko, zachowaj obecny układ stron
    // i tylko odblokuj możliwość aktualizacji
    setBlockMapUpdate(false);

    // Zachowaj poprzednią liczbę stron podczas aktualizacji
    const previousTotal = totalPages;

    // Tylko jeśli nie mamy jeszcze mapy sekcji, inicjalizujemy ją
    if (Object.keys(sectionsMap).length === 0) {
      setMeasurementDone(false);
    } else {
      // Mamy już mapę sekcji, więc tylko oznaczamy, że potrzebna jest aktualizacja
      // ale nie usuwamy istniejącej mapy, aby uniknąć migotania
      console.log("Zachowuję istniejącą mapę sekcji podczas aktualizacji");
    }

    // Usuwamy zapisaną mapę z localStorage, ale zachowujemy w stanie
    // aby uniknąć migotania interfejsu
    try {
      localStorage.removeItem('cv-sections-map');
    } catch (error) {
      console.error("Nie udało się usunąć danych z localStorage:", error);
    }
  }, [cvData, language, selectedTemplate]);

  return (
    <div className="flex flex-col bg-transparent overflow-hidden h-full">
      {/* Użyj komponentu PreviewHeader zamiast kodu nagłówka */}
      <PreviewHeader 
        zoom={zoom}
        setZoom={setZoom}
        language={language}
        toggleLanguage={toggleLanguage}
        totalPages={totalPages}
        handlePrintClick={handlePrintClick}
        hasMinimumData={hasMinimumData}
        isGeneratingPdf={isGeneratingPdf}
        switchMode={switchMode}
        printRef={printRef}
        cvData={cvData}
      />

      {/* Kontener główny ze scrollowaniem */}
      <div
        ref={containerRef}
        className="flex-1 -mt-1 bg-transparent flex justify-center px-0 pb-0 pt-0 relative"
        style={{
          overflowY: scrollNeeded ? 'auto' : 'hidden',
          overflowX: 'hidden',
          alignItems: 'flex-start',
          justifyContent: 'center',
          display: 'flex',
          height: '100%',
          maxHeight: 'calc(100% - 20px)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Wrapper dla dokumentu z zachowaniem proporcji */}
        <div
          className="mx-auto"
          style={{
            width: 'fit-content',
            paddingTop: '5px',
            paddingBottom: '0'
          }}
        >
          {/* Kontener wszystkich stron CV, jedna pod drugą */}
          <div
            ref={documentRef}
            className="mx-auto"
            style={{
              transform: `scale(${getScaleFactor(zoom)})`,
              transformOrigin: 'top center',
              marginBottom: '0'
            }}
          >
            {/* Renderowanie wielu stron jedna pod drugą */}
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={`page-${index}`}
                className="bg-white border-1 border-gray-400 rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] transition-transform duration-200"
                style={{
                  width: `${A4_WIDTH_MM}mm`,
                  height: `${A4_HEIGHT_MM}mm`,
                  marginBottom: index < totalPages - 1 ? '10mm' : '0',
                  position: 'relative',
                  pageBreakAfter: 'always'
                }}
              >
                <ModernCVTemplate
                  data={cvData}
                  selectedJob={selectedJob}
                  language={language}
                  pageIndex={index}
                  totalPages={totalPages}
                  sectionsMap={sectionsMap}
                  activeSection={activeSection}
                  showProjectsInPreview={showProjectsInPreview}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ukryty element do pomiaru zawartości CV - zawsze renderujemy */}
      <div>
        <div
          ref={contentMeasureRef}
          style={{
            width: `${A4_WIDTH_MM}mm`,
            position: 'absolute',
            visibility: 'hidden',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1000,
            left: '-9999px',
            top: 0
          }}
        >
          <ModernCVTemplate
            data={cvData}
            selectedJob={selectedJob}
            language={language}
            isMeasurement={true}
            onSectionsUpdate={handleSectionsUpdate}
            activeSection={activeSection}
            showProjectsInPreview={showProjectsInPreview}
          />
        </div>
      </div>

      {/* Wskaźnik gdy nie ma danych */}
      {!hasMinimumData() && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 dark:bg-black/80 p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Wypełnij podstawowe dane w formularzu edycji, aby wygenerować CV
            </p>
          </div>
        </div>
      )}

      {/* Ukryty element zawierający tylko CV do drukowania bez ramek i cieni */}
      <div className="hidden">
        <div
          ref={printRef}
          style={{
            width: `${A4_WIDTH_MM}mm`,
            position: 'relative'
          }}
        >
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={`print-page-${index}`}
              style={{
                width: `${A4_WIDTH_MM}mm`,
                height: `${A4_HEIGHT_MM}mm`,
                position: 'relative',
                pageBreakAfter: 'always'
              }}
            >
              <ModernCVTemplate
                data={cvData}
                selectedJob={selectedJob}
                language={language}
                isPrintVersion={true}
                pageIndex={index}
                totalPages={totalPages}
                sectionsMap={sectionsMap}
                activeSection="summary" // Zawsze pokazuj wszystko dla wersji do druku
                showProjectsInPreview={true} // Zawsze pokazuj projekty w wersji do druku
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
