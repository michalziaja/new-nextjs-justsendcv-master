import React from 'react';
import { IoMdEye } from "react-icons/io";

interface CreatorHeaderProps {
  activeSection: string;
  badgeContainerRef: React.RefObject<HTMLDivElement | null>;
  isScrolling: boolean;
  switchMode?: () => void;
}

const CreatorHeader: React.FC<CreatorHeaderProps> = ({
  activeSection,
  badgeContainerRef,
  isScrolling,
  switchMode
}) => {
  // Definiujemy kolejność sekcji
  const sections = ['start', 'personalData', 'description', 'experience', 'projects', 'education', 'courses', 'skills', 'summary'];
  
  // Funkcja pomocnicza do sprawdzania, czy sekcja powinna być oznaczona jako ukończona
  const isSectionCompleted = (sectionName: string): boolean => {
    const currentIndex = sections.indexOf(activeSection);
    const sectionIndex = sections.indexOf(sectionName);
    return sectionIndex < currentIndex;
  };
  
  // Funkcja pomocnicza do sprawdzania, czy sekcja jest aktywna
  const isSectionActive = (sectionName: string): boolean => {
    return activeSection === sectionName;
  };
  
  return (
    <div className="flex items-center gap-0">
      {/* Pasek postępu z plakietkami */}
      <div className="ml-1 relative w-full">
        {/* Responsywne plakietki postępu */}
        <div 
          ref={badgeContainerRef}
          className="flex justify-between items-center gap-x-1 w-full overflow-visible mb-0 relative z-10 py-2 px-2"
          style={{
            overflowY: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
            WebkitOverflowScrolling: 'touch',
            margin: '4px 0'
          }}
        >
          {/* Badge: Start */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('start') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                isSectionCompleted('start') ? 
                'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Start
          </div>
          
          {/* Badge: Dane osobowe */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('personalData') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                isSectionCompleted('personalData') ? 
                'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Dane
          </div>
          
          {/* Badge: Opis */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('description') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                isSectionCompleted('description') ? 
                'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Opis
          </div>
          
          {/* Badge: Doświadczenie */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('experience') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                isSectionCompleted('experience') ? 
                'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Doświad.
          </div>
          
          {/* Badge: Projekty */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('projects') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                isSectionCompleted('projects') ? 
                'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Projekty
          </div>
          
          {/* Badge: Edukacja */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('education') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                isSectionCompleted('education') ? 
                'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Edukacja
          </div>
          
          {/* Badge: Kursy */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('courses') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                isSectionCompleted('courses') ? 
                'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Kursy
          </div>
          
          {/* Badge: Umiejętności */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('skills') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 
                isSectionCompleted('skills') ? 
                'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Umiejęt.
          </div>
          
          {/* Badge: Podsumowanie */}
          <div 
            className={`px-0.5 xs:px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] xs:text-[10px] sm:text-xs md:text-sm transition whitespace-nowrap flex-shrink-0 flex-1 text-center shadow-[2px_4px_10px_rgba(0,0,0,0.2)] lg:shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              ${isSectionActive('summary') ? 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white shadow-md' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'}`}
          >
            Podsum.
          </div>
        </div>
      </div>
      
      {/* Przycisk przełączania - widoczny tylko gdy prop switchMode jest dostępny */}
      {switchMode && (
        <button
          onClick={switchMode}
          className="h-12 w-12 bg-transparent dark:bg-sidebar rounded-sm flex items-center justify-center mr-2 mb-1"
          title="Przełącz na podgląd"
        >
          <IoMdEye className="w-8 h-8 text-blue-600" />
        </button>
      )}
    </div>
  );
};

export default CreatorHeader; 