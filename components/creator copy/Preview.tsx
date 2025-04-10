"use client";

import React, { useState } from 'react';
import { JobOffer } from './mockData';
import { useCV, CVData } from './CVContext';

// Komponent dla podglądu CV w szablonie nowoczesnym
const ModernTemplate: React.FC<{ data: CVData; selectedJob?: JobOffer | null }> = ({ data, selectedJob }) => {
  return (
    <div className="p-6 font-sans text-sm h-full flex flex-col">
      <div className="flex-grow">
      {/* Nagłówek z danymi osobowymi */}
      <div className="border-b-2 border-blue-500 pb-4">
        <h1 className="text-2xl font-bold">{data.personalData.firstName} {data.personalData.lastName}</h1>
        <div className="text-gray-700 mt-2 grid grid-cols-2 gap-1">
          <div>Email: {data.personalData.email}</div>
          <div>Telefon: {data.personalData.phone}</div>
          <div className="col-span-2">Adres: {data.personalData.address}</div>
        </div>
        {selectedJob && (
          <div className="mt-2 text-blue-600 font-medium">
            Aplikacja na stanowisko: {selectedJob.position} w {selectedJob.company}
          </div>
        )}
      </div>
        
        {/* Opis profilu */}
        {data.description && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold border-b border-gray-300 pb-1">Profil zawodowy</h2>
            <p className="mt-2 text-gray-700 text-sm">{data.description}</p>
          </div>
        )}
      
      {/* Doświadczenie */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-1">Doświadczenie zawodowe</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mt-3">
            <div className="flex justify-between">
              <div className="font-medium">{exp.position}</div>
              <div className="text-gray-600 text-xs">
                {exp.startDate && formatDate(exp.startDate)} - {exp.endDate && formatDate(exp.endDate)}
              </div>
            </div>
            <div className="text-gray-700">{exp.company}</div>
            <div className="mt-1 text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
      
      {/* Wykształcenie */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-1">Wykształcenie</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mt-3">
            <div className="flex justify-between">
              <div className="font-medium">{edu.school}</div>
              <div className="text-gray-600 text-xs">
                {edu.startDate && formatDate(edu.startDate)} - {edu.endDate && formatDate(edu.endDate)}
              </div>
            </div>
            <div className="text-gray-700">{edu.degree}</div>
            <div className="mt-1 text-xs">{edu.description}</div>
          </div>
        ))}
      </div>
      
      {/* Umiejętności */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-1">Umiejętności</h2>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <h3 className="font-medium text-gray-800">Techniczne</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {data.skills.technical.map((skill, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Miękkie</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {data.skills.soft.map((skill, index) => (
                <span key={index} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <h3 className="font-medium text-gray-800">Języki obce</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {data.skills.languages.filter(lang => lang.language && lang.level).map((lang, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <span className="font-medium">{lang.language}:</span>
                <span className="bg-gray-100 px-1 rounded">{lang.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
      
      {/* Klauzula RODO - stały element na samym dole */}
      {data.rodoClause && (
        <div className="mt-auto pt-4 border-t border-gray-200">
          <p className="text-[9px] text-gray-500 leading-tight">{data.rodoClause}</p>
        </div>
      )}
    </div>
  );
};

// Funkcja pomocnicza do formatowania daty
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  } catch (e) {
    return dateString;
  }
};

// Dodaję definicję interfejsu dla props
interface PreviewProps {
  toggleButton?: React.ReactNode;
}

// Komponent dla prawej strony - podgląd
export default function Preview({ toggleButton }: PreviewProps) {
  const { cvData, selectedJob, selectedTemplate } = useCV();
  const [zoom, setZoom] = useState(100); // Startowa wartość 90% jako nowe 100%
  const [scrollNeeded, setScrollNeeded] = useState(true);
  const [autoZoom, setAutoZoom] = useState(100);
  const documentRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Funkcja renderująca odpowiedni szablon
  const renderTemplate = () => {
    return <ModernTemplate data={cvData} selectedJob={selectedJob} />;
  };

  // Funkcja skalowania - przelicza wyświetlany % na rzeczywisty współczynnik skalowania
  const getScaleFactor = (displayZoom: number) => {
    // Aktualne 90% to nowe 100%
    return (displayZoom * 1) / 100;
  };

  // Automatyczne dostosowanie zoom w zależności od szerokości ekranu
  React.useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined' || !containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      
      // Standardowe wymiary A4 w mm: 210mm x 297mm (szerokość x wysokość)
      // Zachowujemy proporcje 1:1.414 (szerokość:wysokość)
      const a4Width = 210;  // mm
      const a4Ratio = 297 / 210;  // stosunek wysokości do szerokości
      
      // Przeliczamy mm na piksele (przybliżenie)
      const mmToPx = 3.779;
      const docWidthPx = a4Width * mmToPx;
      
      // Obliczenie optymalnego zoom, aby dokument mieścił się w kontenerze
      // Odejmujemy 40px na marginesy
      let optimalZoom = ((containerWidth - 40) / docWidthPx) * 100;
      
      // Ograniczenia zoom - min 60%, max 90%
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

  // Sprawdzanie, czy potrzebny jest scroll i jego kierunek
  React.useEffect(() => {
    const checkScrollNeeded = () => {
      if (!documentRef.current || !containerRef.current) return;
      
      // Obliczyć rzeczywistą wysokość przeskalowanego dokumentu
      const documentEl = documentRef.current;
      const containerEl = containerRef.current;
      
      const scale = getScaleFactor(zoom);
      const scaledDocHeight = documentEl.offsetHeight * scale;
      const scaledDocWidth = documentEl.offsetWidth * scale;
      const containerHeight = containerEl.offsetHeight;
      const containerWidth = containerEl.offsetWidth;
      
      // Sprawdzamy czy potrzebne jest przewijanie pionowe
      const needsVerticalScroll = scaledDocHeight > containerHeight;
      
      // Na dużych ekranach nie potrzebujemy przewijania poziomego,
      // tylko na małych ekranach gdy dokument nie mieści się w poziomie
      // const needsHorizontalScroll = scaledDocWidth > containerWidth;
      
      setScrollNeeded(needsVerticalScroll);
    };

    // Sprawdzenie po renderowaniu i załadowaniu
    checkScrollNeeded();
    
    // Sprawdzenie przy zmianie rozmiaru okna
    window.addEventListener('resize', checkScrollNeeded);
    
    // Dodatkowe sprawdzenie po pełnym załadowaniu strony
    // setTimeout(checkScrollNeeded, 100);
    
    return () => {
      window.removeEventListener('resize', checkScrollNeeded);
    };
  }, [zoom, cvData, selectedTemplate]);

  // Automatyczny zoom dla ekranów o szerokości poniżej określonego progu
  React.useEffect(() => {
    // Aktualizuj zoom tylko jeśli szerokość ekranu się zmieni znacząco
    if (Math.abs(zoom - autoZoom) > 1) {
      setZoom(autoZoom);
    }
  }, [autoZoom]);

  // Styl dla kontenera dokumentu
  const getDocumentContainerStyle = () => {
    const scaleFactor = getScaleFactor(zoom);
    
    // Stałe proporcje A4 (szerokość:wysokość = 1:1.414)
    const width = '210mm';
    const height = '297mm';
    
    return {
      width,
      height,
      transform: `scale(${scaleFactor})`,
      transformOrigin: scrollNeeded ? 'top center' : 'center',
      position: scrollNeeded ? 'absolute' as const : 'relative' as const,
      top: scrollNeeded ? 0 : 'auto'
    };
  };

  return (
    <div className="h-[calc(90vh-4.5rem)] flex flex-col bg-transparent overflow-hidden">
      {/* Nagłówek z kontrolkami */}
      <div className="flex h-16 mb-1 gap-2">
        {/* Panel z kontrolkami */}
        <div className={`p-4 ${toggleButton ? 'flex-1' : 'w-full'} ml-2 mr-0 flex h-12 bg-white dark:bg-sidebar rounded-md shadow-[2px_4px_10px_rgba(0,0,0,0.3)] items-center`}>
          {/* Lewa strona - zoom */}
          <div className="flex-1 flex justify-start">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setZoom(Math.max(50, zoom - 5))}
                className="p-1 hover:bg-gray-200 rounded"
                aria-label="Zmniejsz"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              </button>
              <span className="text-sm">{Math.round(zoom)}%</span>
              <button 
                onClick={() => setZoom(Math.min(100, zoom + 5))}
                className="p-1 hover:bg-gray-200 rounded"
                aria-label="Zwiększ"
                disabled={zoom >= 110}
              >
                <svg className={`w-5 h-5 ${zoom >= 110 ? 'opacity-50' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </button>
        </div>
      </div>
        
          {/* Środek - zmiana wyglądu i języka */}
          <div className="flex-1 flex items-center justify-center gap-2 md:gap-3">
            <button 
              className="flex shadow-[2px_4px_10px_rgba(0,0,0,0.3)]  items-center bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-3 py-1 rounded-md text-sm md:text-sm whitespace-nowrap"
              onClick={() => console.log("Zmień wygląd")}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="hidden sm:inline">Wygląd</span>
              {/* <span className="sm:hidden">Styl</span> */}
            </button>
            
            <button
              className="flex shadow-[2px_4px_10px_rgba(0,0,0,0.3)]  items-center bg-gray-200 hover:bg-gray-300 px-2 md:px-3 py-1 rounded-md text-sm md:text-sm whitespace-nowrap"
              onClick={() => console.log("Zmień język dokumentu")}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              <span className="hidden sm:inline">Język</span>
              <span className="sm:hidden">PL</span>
            </button>
          </div>
          
          {/* Prawa strona - pobieranie */}
          <div className="flex-1 flex justify-end">
            <button 
              className="flex shadow-[2px_4px_10px_rgba(0,0,0,0.3)] items-center bg-green-600 hover:bg-green-700 text-white px-2 md:px-3 py-1 rounded-md text-sm md:text-sm whitespace-nowrap"
              onClick={() => console.log("Pobierz PDF")}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="hidden sm:inline">Pobierz PDF</span>
              <span className="md:hidden">PDF</span>
            </button>
          </div>
        </div>
        
        {/* Przycisk przełączania (jeśli przekazany) */}
        {toggleButton && (
          <div className="mr-2">
            {toggleButton}
          </div>
        )}
              </div>
      
      {/* Kontener główny ze scrollowaniem */}
      <div 
        ref={containerRef}
        className="flex-1 ml-2 mr-2 mt-4 bg-transparent flex justify-center px-0 pb-6 pt-0 relative"
        style={{ 
          overflowX: 'hidden',
          overflowY: scrollNeeded ? 'auto' : 'hidden',
          alignItems: scrollNeeded ? 'flex-start' : 'center',
          justifyContent: 'center',
          display: 'flex',
          height: '100%',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
        }}
      >
        {/* Wrapper dla dokumentu z zachowaniem proporcji */}
        <div 
          className="mx-auto transition-duration-200"
          style={{
            // Zachowujemy proporcje strony A4 (1:1.414)
            width: 'fit-content',
            // padding: '0px',
            paddingTop: '5px',
            paddingBottom: scrollNeeded ? '0px' : '0' // Usuwamy dolny padding gdy nie potrzeba przewijania
          }}
        >
          {/* Podgląd dokumentu z skalowaniem */}
          <div 
            ref={documentRef}
            className="bg-white border-1 border-gray-500 rounded-sm mx-auto shadow-[2px_4px_10px_rgba(0,0,0,0.3)] transition-transform duration-200"
            style={{
              width: '210mm',
              height: '297mm', 
              transform: `scale(${getScaleFactor(zoom)})`,
              transformOrigin: scrollNeeded ? 'top center' : 'center', // Skaluj od góry gdy scroll potrzebny
              maxHeight: scrollNeeded ? 'none' : '100%', // Ograniczenie maksymalnej wysokości gdy nie potrzeba przewijania
              marginBottom: scrollNeeded ? '0' : '-30px' // Zmniejszenie marginesu dolnego gdy nie ma przewijania
            }}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
}