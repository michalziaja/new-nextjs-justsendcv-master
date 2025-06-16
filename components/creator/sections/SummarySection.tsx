import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import AdvancedFormatting from '../AdvancedFormatting';
import { CVData, useCV } from '../CVContext'; // Zakładamy, że typ CVData jest zdefiniowany w CVContext

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
  const { saveCV, isSaving } = useCV();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 ml-6">
        {!showAdvancedOptions && (
          <>
            <h3 className="text-lg font-semibold mb-2">Podsumowanie</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sprawdź wszystkie wprowadzone informacje i przejdź do opcji zaawansowanych.
            </p>
            
            {selectedJob && (
              <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-600 mb-4">
                <p className="font-medium">Wybrana oferta pracy:</p>
                <p><span className="font-medium">{selectedJob.title}</span> - {selectedJob.company}</p>
              </div>
            )}
            
            <div className="p-3 bg-green-50 dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-600 mb-4">
              <p className="font-medium">Wybrany szablon:</p>
              <p>{templates.find(t => t.id === selectedTemplate)?.name}</p>
            </div>

            {/* Sekcja nazwy CV */}
            <div className="mt-6 border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-400 mb-3">Nazwa CV</h4>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                placeholder="Wpisz nazwę swojego CV..."
                value={cvData.cvName || ''}
                onChange={(e) => setCvData({...cvData, cvName: e.target.value})}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Ta nazwa będzie widoczna w panelu podglądu i przy pobieraniu CV.
              </p>
            </div>

            {/* Sekcja Klauzuli RODO */}
            <div className="mt-6 border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-400 mb-3">Klauzula RODO</h4>
              
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="showRodoClause"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  checked={cvData.showRodoClause ?? true}
                  onChange={(e) => setCvData({...cvData, showRodoClause: e.target.checked})}
                />
                <label htmlFor="showRodoClause" className="ml-2 text-sm text-gray-700 dark:text-gray-400">
                  Wyświetl klauzulę RODO na CV (na dole ostatniej strony)
                </label>
              </div>
              
              <textarea 
                className={`w-full border rounded-md px-3 py-2 h-32 text-xs ${!cvData.showRodoClause ? 'bg-gray-100 dark:bg-slate-800' : ''}`}
                placeholder="Wpisz swoją klauzulę RODO..."
                value={cvData.rodoClause || ''}
                onChange={(e) => setCvData({...cvData, rodoClause: e.target.value})}
                disabled={!cvData.showRodoClause}
              ></textarea>
            </div>

            {/* Informacja o możliwości pobrania CV */}
            <div className="flex justify-center mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              className="px-4 py-1 h-8 w-24 bg-gradient-to-r from-gray-500/80 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white dark:text-gray-400 rounded-sm transition"
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
              className="px-4 py-1 h-8 w-52 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white dark:text-gray-400 rounded-sm  transition"
              onClick={() => setShowAdvancedOptions(true)}
            >
              Opcje formatowania
            </button>
          </div>
        </>
      ) : (
        <div className="ml-auto">
          <button 
            className="px-4 py-1 h-8 bg-gradient-to-r w-52 from-gray-500 to-gray-600 text-white dark:text-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-700 rounded-sm hover:from-gray-600 hover:to-gray-700 transition"
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