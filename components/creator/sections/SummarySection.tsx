import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import AdvancedFormatting from '../AdvancedFormatting';
import { CVData, useCV } from '../CVContext'; // Zakładamy, że typ CVData jest zdefiniowany w CVContext
import { fontSizes, spacing, optimizeStylesForPDF, normalizeUnit } from '../templates/TemplateStyles'; // Importujemy domyślne style i funkcje

interface SummarySectionProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  selectedJob: any; // Dostosuj ten typ do faktycznej struktury selectedJob
  selectedTemplate: string;
  templates: { id: string; name: string }[];
  defaultSpacing: any; // Dostosuj ten typ do faktycznej struktury defaultSpacing
  defaultFontSizes: any; // Dostosuj ten typ do faktycznej struktury defaultFontSizes
  onBack: () => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  cvData,
  setCvData,
  selectedJob,
  selectedTemplate,
  templates,
  defaultSpacing,
  defaultFontSizes,
  onBack
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isAutoFormatting, setIsAutoFormatting] = useState(false);
  const { saveCV, isSaving } = useCV();

  /**
   * Funkcja do automatycznego formatowania CV - dostosowuje czcionki i marginesy
   * aby optymalnie wypełnić przestrzeń na stronach
   */
  const handleAutoFormat = async () => {
    setIsAutoFormatting(true);
    
    try {
      // Szacowanie ilości treści na podstawie długości tekstów
      const estimateContentLength = () => {
        let totalContent = 0;
        
        // Dane osobowe i opis
        totalContent += cvData.personalData.firstName.length + cvData.personalData.lastName.length;
        totalContent += cvData.description.length * 1.2; // Opis ma większą wagę
        
        // Doświadczenie zawodowe
        cvData.experience.forEach(exp => {
          totalContent += exp.position.length + exp.company.length + exp.description.length;
        });
        
        // Wykształcenie
        cvData.education.forEach(edu => {
          totalContent += edu.school.length + edu.degree.length + edu.description.length;
        });
        
        // Kursy
        if (cvData.courses) {
          cvData.courses.forEach(course => {
            totalContent += course.name.length + course.organizer.length + (course.description?.length || 0);
          });
        }
        
        // Umiejętności
        totalContent += cvData.skills.technical.join('').length;
        totalContent += cvData.skills.soft.join('').length;
        totalContent += cvData.skills.languages.reduce((acc, lang) => acc + lang.language.length + lang.level.length, 0);
        
        return totalContent;
      };

      const contentLength = estimateContentLength();
      
      // Określenie czy treść zmieści się na jednej stronie (próg ~2000 znaków)
      const shouldOptimizeForOnePage = contentLength < 2000;
      const shouldOptimizeForTwoPages = contentLength >= 2000 && contentLength < 4000;
      
      // Bazowe style do modyfikacji - z normalizacją jednostek
      let optimizedFontSizes = { ...fontSizes };
      let optimizedSpacing = { ...spacing };
      
      if (shouldOptimizeForOnePage) {
        // Zwiększenie czcionek aby lepiej wypełnić jedną stronę
        optimizedFontSizes = {
          ...optimizedFontSizes,
          base: normalizeUnit('12px'),          // +1px
          nameHeader: normalizeUnit('32px'),    // +4px
          sectionHeader: normalizeUnit('20px'), // +2px
          contactInfo: normalizeUnit('13px'),   // +1px
          dates: normalizeUnit('14px'),         // +1px
          position: normalizeUnit('14px'),      // +1px
          company: normalizeUnit('13px'),       // +1px
          description: normalizeUnit('12px'),   // +1px
          profileText: normalizeUnit('13px'),   // +1px
          tagText: normalizeUnit('13px'),       // +1px
          rodoText: normalizeUnit('10px')       // +1px
        };
        
        // Zwiększenie odstępów dla lepszego rozmieszczenia
        optimizedSpacing = {
          ...optimizedSpacing,
          sections: {
            ...optimizedSpacing.sections,
            margin: normalizeUnit('28px'), // +4px
          },
          sectionSpacing: {
            ...optimizedSpacing.sectionSpacing,
            profile: normalizeUnit('28px'),    // +4px
            experience: normalizeUnit('28px'), // +4px
            education: normalizeUnit('28px'),  // +4px
            courses: normalizeUnit('28px'),    // +4px
            skills: normalizeUnit('28px'),     // +4px
          },
          elements: {
            ...optimizedSpacing.elements,
            itemMargin: normalizeUnit('20px'), // +4px
          }
        };
        
      } else if (shouldOptimizeForTwoPages) {
        // Lekkie zmniejszenie czcionek aby lepiej rozłożyć treść na dwie strony
        optimizedFontSizes = {
          ...optimizedFontSizes,
          base: normalizeUnit('10.5px'),        // -0.5px
          sectionHeader: normalizeUnit('17px'), // -1px
          description: normalizeUnit('10.5px'), // -0.5px
          profileText: normalizeUnit('11.5px'), // -0.5px
        };
        
        // Zmniejszenie odstępów aby pomieścić więcej treści
        optimizedSpacing = {
          ...optimizedSpacing,
          sections: {
            ...optimizedSpacing.sections,
            margin: normalizeUnit('20px'), // -4px
          },
          sectionSpacing: {
            ...optimizedSpacing.sectionSpacing,
            profile: normalizeUnit('20px'),    // -4px
            experience: normalizeUnit('20px'), // -4px
            education: normalizeUnit('20px'),  // -4px
            courses: normalizeUnit('20px'),    // -4px
            skills: normalizeUnit('20px'),     // -4px
          },
          elements: {
            ...optimizedSpacing.elements,
            itemMargin: normalizeUnit('12px'), // -4px
          }
        };
        
      } else {
        // Dla bardzo długich CV - agresywne zmniejszenie
        optimizedFontSizes = {
          ...optimizedFontSizes,
          base: normalizeUnit('10px'),          // -1px
          sectionHeader: normalizeUnit('16px'), // -2px
          description: normalizeUnit('10px'),   // -1px
          profileText: normalizeUnit('11px'),   // -1px
          tagText: normalizeUnit('11px'),       // -1px
        };
        
        optimizedSpacing = {
          ...optimizedSpacing,
          sections: {
            ...optimizedSpacing.sections,
            margin: normalizeUnit('16px'), // -8px
          },
          sectionSpacing: {
            ...optimizedSpacing.sectionSpacing,
            profile: normalizeUnit('16px'),    // -8px
            experience: normalizeUnit('16px'), // -8px
            education: normalizeUnit('16px'),  // -8px
            courses: normalizeUnit('16px'),    // -8px
            skills: normalizeUnit('16px'),     // -8px
          },
          elements: {
            ...optimizedSpacing.elements,
            itemMargin: normalizeUnit('10px'), // -6px
          }
        };
      }
      
      // Optymalizacja stylów dla lepszej zgodności z PDF
      const optimizedCustomStyles = {
        fontSizes: optimizeStylesForPDF(optimizedFontSizes),
        spacing: optimizeStylesForPDF(optimizedSpacing)
      };
      
      // Zastosowanie nowych stylów
      setCvData({
        ...cvData,
        customStyles: {
          ...cvData.customStyles,
          ...optimizedCustomStyles
        }
      });
      
      // Krótkie opóźnienie dla lepszego UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Błąd podczas auto-formatowania:', error);
    } finally {
      setIsAutoFormatting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 ml-6">
        {!showAdvancedOptions && (
          <>
            <h3 className="text-lg font-semibold mb-2">Podsumowanie</h3>
            <p className="text-gray-600 mb-4">
              Sprawdź wszystkie wprowadzone informacje i przejdź do opcji zaawansowanych.
            </p>
            
            {selectedJob && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <p className="font-medium">Wybrana oferta pracy:</p>
                <p><span className="font-medium">{selectedJob.title}</span> - {selectedJob.company}</p>
              </div>
            )}
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
              <p className="font-medium">Wybrany szablon:</p>
              <p>{templates.find(t => t.id === selectedTemplate)?.name}</p>
            </div>

            {/* Sekcja Auto-formatowania */}
            <div className="mt-6 border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <h4 className="font-medium text-purple-800 mb-3">✨ Inteligentne formatowanie</h4>
              <p className="text-sm text-purple-700 mb-3">
                Automatycznie dostosuj czcionki i marginesy aby optymalnie wypełnić strony CV. 
                Funkcja analizuje ilość treści, inteligentnie formatuje dokument i synchronizuje wygląd między podglądem a PDF.
              </p>
              <div className="text-xs text-purple-600 mb-3 bg-purple-100 p-2 rounded border border-purple-200">
                <strong>✅ Nowe ulepszenia:</strong> Poprawiona zgodność formatowania między podglądem aplikacji a wygenerowanym PDF!
              </div>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-md transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAutoFormat}
                disabled={isAutoFormatting}
              >
                {isAutoFormatting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Formatowanie...
                  </>
                ) : (
                  '🎯 Auto-formatuj CV'
                )}
              </button>
            </div>

            {/* Sekcja Klauzuli RODO */}
            <div className="mt-6 border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Klauzula RODO</h4>
              
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="showRodoClause"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={cvData.showRodoClause ?? true}
                  onChange={(e) => setCvData({...cvData, showRodoClause: e.target.checked})}
                />
                <label htmlFor="showRodoClause" className="ml-2 text-sm text-gray-700">
                  Wyświetl klauzulę RODO na CV (na dole ostatniej strony)
                </label>
              </div>
              
              <textarea 
                className={`w-full border rounded-md px-3 py-2 h-32 text-xs ${!cvData.showRodoClause ? 'bg-gray-100' : ''}`}
                placeholder="Wpisz swoją klauzulę RODO..."
                value={cvData.rodoClause || ''}
                onChange={(e) => setCvData({...cvData, rodoClause: e.target.value})}
                disabled={!cvData.showRodoClause}
              ></textarea>
            </div>

            {/* Informacja o możliwości pobrania CV */}
            <div className="flex justify-center mt-6">
              <p className="text-sm text-gray-500">
                Możesz pobrać lub wysłać swoje CV z panelu podglądu po prawej stronie.
              </p>
            </div>
          </>
        )}
        
        {showAdvancedOptions && (
          <AdvancedFormatting 
            cvData={cvData}
            setCvData={setCvData}
            defaultSpacing={defaultSpacing}
            defaultFontSizes={defaultFontSizes}
            onClose={() => setShowAdvancedOptions(false)}
          />
        )}
      </div>
      
      {/* Przyciski nawigacyjne - widoczne zawsze w sekcji summary */}
      <div className="mt-auto flex justify-between border-t-2 p-4 w-full">
      {!showAdvancedOptions ? (
        <>
          <div>
            <button 
              className="px-4 py-1 h-8 w-24 bg-gradient-to-r from-gray-500/80 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-sm transition"
              onClick={onBack}
            >
              Wstecz
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className="px-4 py-1 h-8 w-24 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-sm transition"
              onClick={() => saveCV(false)}
              disabled={isSaving}
            >
              {isSaving ? 'Zapis...' : 'Zapisz'}
            </button>
            
            <button 
              className="px-4 py-1 h-8 w-52 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-sm  transition"
              onClick={() => setShowAdvancedOptions(true)}
            >
              Opcje formatowania
            </button>
          </div>
        </>
      ) : (
        <div className="ml-auto">
          <button 
            className="px-4 py-1 h-8 bg-gradient-to-r w-52 from-gray-500 to-gray-600 text-white rounded-sm hover:from-gray-600 hover:to-gray-700 transition"
            onClick={() => setShowAdvancedOptions(false)}
          >
            Wróć do podsumowania
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default SummarySection;  