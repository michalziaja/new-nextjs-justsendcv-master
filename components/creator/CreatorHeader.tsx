import React from 'react';
import { IoMdEye } from "react-icons/io";
// Dodajemy importy ikon dla każdej sekcji
import { 
  FaPlay, 
  FaUser, 
  FaFileAlt, 
  FaBriefcase, 
  FaProjectDiagram, 
  FaGraduationCap, 
  FaCertificate, 
  FaLightbulb, 
  FaFlag 
} from "react-icons/fa";

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
  // Definiujemy kolejność sekcji z ikonami
  const sections = [
    { id: 'start', name: 'Start', icon: FaPlay },
    { id: 'personalData', name: 'Dane', icon: FaUser },
    { id: 'description', name: 'Opis', icon: FaFileAlt },
    { id: 'experience', name: 'Doświad.', icon: FaBriefcase },
    { id: 'projects', name: 'Projekty', icon: FaProjectDiagram },
    { id: 'education', name: 'Edukacja', icon: FaGraduationCap },
    { id: 'courses', name: 'Kursy', icon: FaCertificate },
    { id: 'skills', name: 'Umiejęt.', icon: FaLightbulb },
    { id: 'summary', name: 'Podsum.', icon: FaFlag }
  ];
  
  // Funkcja pomocnicza do sprawdzania, czy sekcja powinna być oznaczona jako ukończona
  const isSectionCompleted = (sectionName: string): boolean => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    const sectionIndex = sections.findIndex(s => s.id === sectionName);
    return sectionIndex < currentIndex;
  };
  
  // Funkcja pomocnicza do sprawdzania, czy sekcja jest aktywna
  const isSectionActive = (sectionName: string): boolean => {
    return activeSection === sectionName;
  };
  
  return (
    <div className="flex items-center gap-0">
      {/* Pasek postępu z nowoczesnymi kartami */}
      <div className="relative w-full">
        {/* Responsywne karty postępu */}
        <div 
          ref={badgeContainerRef}
          className="flex w-full overflow-visible mb-0 relative z-10 py-0"
          style={{
            overflowY: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
            WebkitOverflowScrolling: 'touch',
            margin: '0',
            gap: '0'
          }}
        >
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = isSectionActive(section.id);
            const isCompleted = isSectionCompleted(section.id);
            
            return (
              <div 
                key={section.id}
                className={`relative flex flex-col items-center justify-center py-3 transition-all duration-300 transform flex-1 min-w-0 -ml-px first:ml-0 first:rounded-tl-sm last:rounded-tr-sm
                  ${isActive ? 
                    'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg border-blue-600' : 
                    isCompleted ? 
                    'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md border-green-500' : 
                    'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600'
                  }`}
                style={{ marginLeft: index > 0 ? '-1px' : '0' }}
              >
                {/* Nazwa sekcji */}
                <span className={`text-[10px] xs:text-[10px] sm:text-xs font-medium text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-1
                  ${isActive || isCompleted ? 'text-white' : 'text-gray-600 dark:text-gray-300'}
                `}>
                  {section.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Przycisk przełączania - widoczny tylko gdy prop switchMode jest dostępny */}
      {switchMode && (
        <div className="relative flex flex-col items-center justify-center py-2 transition-all duration-300 transform min-w-0 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 rounded-tr-sm mr-2">
          <button
            onClick={switchMode}
            className="flex items-center justify-center rounded-sm transition-all duration-200"
            title="Przełącz na podgląd"
          >
            <IoMdEye className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatorHeader; 