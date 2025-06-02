"use client";

import React, { useState, useRef, useEffect } from 'react';
import { IoIosCreate } from "react-icons/io";
import { BsZoomIn } from "react-icons/bs";
import { BsZoomOut } from "react-icons/bs";

// Interfejs dla właściwości komponentu
interface PreviewHeaderProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  language: 'pl' | 'en';
  toggleLanguage: () => void;
  totalPages: number;
  handlePrintClick: () => void;
  hasMinimumData: () => boolean;
  isGeneratingPdf: boolean;
  switchMode?: () => void;
  printRef?: React.RefObject<HTMLDivElement | null>; // Akceptuje null
  cvData?: any; // Dodajemy dane CV
  fullPreviewMode: boolean; // Dodajemy stan pełnego podglądu
  setFullPreviewMode: (mode: boolean) => void; // Dodajemy funkcję do zmiany stanu
}

// Komponent nagłówka dla podglądu CV
const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  zoom,
  setZoom,
  language,
  toggleLanguage,
  totalPages,
  handlePrintClick,
  hasMinimumData,
  isGeneratingPdf,
  switchMode,
  printRef,
  cvData,
  fullPreviewMode,
  setFullPreviewMode
}) => {
  // Stan do obsługi wysyłania emaila
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  const [email, setEmail] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Funkcja do zamknięcia popovera przy kliknięciu poza nim
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && 
          buttonRef.current && 
          !popoverRef.current.contains(event.target as Node) && 
          !buttonRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Inicjalizacja emaila z profilu
  useEffect(() => {
    if (cvData?.personalData?.email) {
      setEmail(cvData.personalData.email);
    }
  }, [cvData]);

  // Funkcja do wyświetlenia popovera
  const handleSendClick = () => {
    if (!showPopover) {
      // Przy pierwszym kliknięciu pokazujemy popover
      setEmailStatus('idle');
      setErrorMessage('');
      setShowPopover(true);
      
      // Aktualizacja emaila z profilu
      if (cvData?.personalData?.email) {
        setEmail(cvData.personalData.email);
      }
    } else {
      // Przy drugim kliknięciu (gdy popover jest otwarty) wysyłamy email
      sendTestEmail();
    }
  };

  // Funkcja generująca PDF i wysyłająca email
  const sendTestEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Proszę podać poprawny adres email');
      return;
    }

    if (!printRef || !printRef.current) {
      setErrorMessage('Nie można wygenerować CV. Spróbuj ponownie.');
      setEmailStatus('error');
      return;
    }

    setIsSending(true);
    setEmailStatus('idle');
    setErrorMessage('');

    try {
      console.log('Generowanie PDF do wysłania na email:', email);
      
      // Krok 1: Generowanie PDF z zawartości
      const cvContainer = printRef.current;
      const htmlContent = cvContainer.innerHTML;

      // Zbieramy wszystkie style ze strony
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
      
      // Przygotuj nazwę pliku
      const filename = `CV_${cvData?.personalData?.firstName || 'User'}_${cvData?.personalData?.lastName || 'CV'}.pdf`.replace(/\s+/g, '_');

      // Konfiguracja dla PDF
      const options = {
        filename,
        pageRanges: `1-${totalPages}`,
        printBackground: true
      };

      console.log('Wysyłanie żądania do API generowania PDF...');
      
      // Krok 2: Generowanie PDF za pomocą Puppeteer
      const pdfResponse = await fetch('/api/generate-pdf', {
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

      if (!pdfResponse.ok) {
        throw new Error(`Błąd podczas generowania PDF: ${pdfResponse.status}`);
      }

      // Pobierz wygenerowany PDF jako blob i konwertuj na base64
      const pdfBlob = await pdfResponse.blob();
      const reader = new FileReader();
      
      // Konwersja Blob na Base64 za pomocą Promise
      const base64PDF = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          // reader.result zawiera dane w formacie "data:application/pdf;base64,XXXXX"
          // Potrzebujemy wyciągnąć część po przecinku
          const base64 = reader.result?.toString().split(',')[1];
          resolve(base64 || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      console.log('PDF wygenerowany pomyślnie, wysyłanie emaila...');

      // Krok 3: Wysyłanie emaila z załączonym PDF
      const emailResponse = await fetch('/api/send-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          cvBase64: base64PDF,
          filename
        }),
      });

      // Pobieramy tekst odpowiedzi
      const responseText = await emailResponse.text();
      console.log('Status odpowiedzi:', emailResponse.status);
      console.log('Treść odpowiedzi:', responseText);

      if (!emailResponse.ok) {
        throw new Error(`Błąd podczas wysyłania: ${emailResponse.status} - ${responseText}`);
      }

      setEmailStatus('success');
      setTimeout(() => {
        setShowPopover(false);
        setEmailStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Błąd podczas wysyłania emaila:', error);
      setEmailStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Nieznany błąd podczas wysyłania');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center gap-0 flex-shrink-0">
      {/* Nagłówek z kontrolkami */}
      <div className="p-2 md:p-3 xl:p-4 flex-grow h-14 mr-2 ml-3 bg-transparent dark:bg-transparent border-0 border-gray-300 dark:border-gray-800 rounded-md items-center flex">
        {/* Lewa strona - zoom */}
        <div className="flex-1 flex justify-start">
          <div className="flex items-center bg-transparent dark:bg-transparent rounded-md px-2 py-0.5">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 5))}
              className="p-1 hover:scale-110 dark:hover:scale-110 transition-all duration-100 rounded"
              aria-label="Zmniejsz"
            >
              <BsZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium mx-2">{Math.round(zoom)}%</span>
            <button
              onClick={() => setZoom(Math.min(100, zoom + 5))}
              className="p-1 hover:scale-110 dark:hover:scale-110 transition-all duration-100 rounded"
              aria-label="Zwiększ"
              disabled={zoom >= 100}
            >
              <BsZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Środek - zmiana języka i informacja o liczbie stron */}
        <div className="flex-1 flex items-center justify-center gap-2 md:gap-3">
          <button
            className="flex shadow-[2px_4px_10px_rgba(0,0,0,0.3)] items-center bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800 px-2 md:px-3 py-1 rounded-sm text-sm md:text-sm whitespace-nowrap"
            onClick={toggleLanguage}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            <span className="hidden sm:inline">{language.toUpperCase()}</span>
            <span className="sm:hidden">{language.toUpperCase()}</span>
          </button>
          
          {/* Przycisk pełnego podglądu CV */}
          <button
            className={`flex shadow-[2px_4px_10px_rgba(0,0,0,0.3)] items-center px-2 md:px-3 py-1 rounded-sm text-sm md:text-sm whitespace-nowrap transition-all duration-200 ${
              fullPreviewMode 
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-700 dark:hover:to-gray-800'
            }`}
            onClick={() => setFullPreviewMode(!fullPreviewMode)}
            title={fullPreviewMode ? "Wróć do podglądu krok po kroku" : "Pokaż całe CV"}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={fullPreviewMode ? "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
            </svg>
            <span className="hidden sm:inline">{fullPreviewMode ? 'Krok po kroku' : 'Pełny podgląd'}</span>
            <span className="sm:hidden">{fullPreviewMode ? 'Krok' : 'Pełny'}</span>
          </button>
          
          {/* <div className="flex shadow-[2px_4px_10px_rgba(0,0,0,0.3)] items-center bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-sm px-3 py-1 text-sm">
            <span>{totalPages} {totalPages === 1 }</span> 
          </div> */}
        </div>

        {/* Prawa strona - pobieranie i wysyłanie */}
        <div className="flex-1 flex justify-end gap-2">
          {/* Przycisk wysyłania */}
          <div className="relative">
            <button
              ref={buttonRef}
              className="flex shadow-[2px_4px_10px_rgba(0,0,0,0.3)] items-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-2 md:px-3 py-1 rounded-sm text-sm md:text-sm whitespace-nowrap"
              onClick={handleSendClick}
              disabled={!hasMinimumData() || isSending}
            >
              {isSending ? (
                <>
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden md:inline">Wysyłanie...</span>
                  <span className="md:hidden">Wysyłanie...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden md:inline">Wyślij</span>
                  <span className="md:hidden">Wyślij</span>
                </>
              )}
            </button>

            {/* Popover do wprowadzania adresu email */}
            {showPopover && (
              <div 
                ref={popoverRef}
                className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 w-72 p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    {emailStatus === 'success' ? (
                      <span className="text-green-600">Wiadomość wysłana pomyślnie!</span>
                    ) : emailStatus === 'error' ? (
                      <span className="text-red-600">Błąd podczas wysyłania</span>
                    ) : (
                      "Podaj adres email"
                    )}
                  </h3>
                  
                  {emailStatus === 'error' && errorMessage && (
                    <div className="text-sm mb-2 p-2 bg-red-50 dark:bg-red-900 dark:bg-opacity-30 rounded text-red-600 dark:text-red-400">
                      {errorMessage}
                    </div>
                  )}
                  
                  <div className="mb-0">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="twoj@email.com"
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 dark:text-white"
                      disabled={isSending || emailStatus === 'success'}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Sprawdz email i kliknij "Wyślij" ponownie
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Przycisk pobierania */}
          <button
            className="flex shadow-[2px_4px_10px_rgba(0,0,0,0.3)] items-center bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-2 md:px-3 py-1 rounded-sm text-sm md:text-sm whitespace-nowrap"
            onClick={handlePrintClick}
            disabled={!hasMinimumData() || isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <>
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden md:inline">Generowanie...</span>
                <span className="md:hidden">Gen...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="hidden md:inline">Pobierz</span>
                <span className="md:hidden">PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Przycisk przełączania obok nagłówka */}
      {switchMode && (
        <button
          onClick={switchMode}
          className="h-14 w-14 bg-transparent dark:bg-sidebar rounded-sm flex items-center justify-center mr-2"
          title="Przełącz na kreator"
        >
          <IoIosCreate className="w-8 h-8 text-blue-600" />
        </button>
      )}
    </div>
  );
};

export default PreviewHeader; 