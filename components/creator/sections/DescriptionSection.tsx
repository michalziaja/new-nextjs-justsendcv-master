import React, { useState } from 'react';
import { Sparkles } from "lucide-react";
import { CVData, useCV } from '../CVContext';
import { Loader2 } from "lucide-react";

interface DescriptionSectionProps {
  cvData: CVData;
  updateDescription: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  cvData,
  updateDescription,
  onBack,
  onNext
}) => {
  const { saveCV, isSaving, selectedJob } = useCV();
  // Stan dla generowania opisu przez AI
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Funkcja do generowania opisu przez AI
  const generateDescription = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      // Przygotowanie danych do wysłania do API
      const requestData = {
        jobTitle: selectedJob?.title || "",
        userDescription: cvData.description || "",
        experience: cvData.experience || [],
        skills: cvData.skills || {}
      };
      
      // Wywołanie API
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Błąd generowania opisu");
      }
      
      const data = await response.json();
      
      // Zaktualizuj opis w CV
      updateDescription(data.description);
      
    } catch (error) {
      console.error("Błąd generowania opisu:", error);
      setGenerationError(error instanceof Error ? error.message : "Nieznany błąd");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full ">
      <div className="p-4 ml-6">
      <h3 className="text-lg font-semibold mb-2">Opis profilu</h3>
      <p className="text-gray-600 mb-4">Wprowadź krótki opis swojego profilu zawodowego, umiejętności i celów</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Profil zawodowy</label>
        <div className="relative">
          <textarea 
            className="w-full border rounded-md px-3 py-2 h-64" 
            placeholder="Napisz krótkie wprowadzenie o sobie, swoim doświadczeniu, umiejętnościach i celach zawodowych. Ten tekst będzie widoczny na początku Twojego CV."
            value={cvData.description}
            onChange={(e) => updateDescription(e.target.value)}
          ></textarea>
          <button 
            className={`absolute right-2 top-2 p-1 rounded-md transition-colors ${
              isGenerating ? 'bg-blue-100' : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
            }`}
            title="Użyj AI do wygenerowania opisu profilu"
            onClick={generateDescription}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Dobry opis powinien zawierać 3-5 zdań podsumowujących Twoje kluczowe kompetencje i doświadczenie.
        </p>
        
        {/* Informacja o asystencie AI */}
        <div className="mt-2 text-xs text-blue-600 flex items-center">
          <Sparkles className="w-3 h-3 mr-1" />
          <span>Kliknij ikonę iskierek, aby użyć AI do wygenerowania profesjonalnego opisu profilu</span>
        </div>
        
        {/* Wyświetlanie błędu */}
        {generationError && (
          <div className="mt-2 text-xs text-red-600">
            Błąd: {generationError}
          </div>
        )}
      </div>
      </div>
      {/* Kontener przycisków - zawsze na dole */}
      <div className="mt-auto flex justify-between border-t-2 p-4 w-full">
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
            className="px-4 py-1 h-8 w-24 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-sm  transition"
            onClick={() => saveCV(false)}
            disabled={isSaving}
          >
            {isSaving ? 'Zapis...' : 'Zapisz'}
          </button>
          
          <button 
            className="px-4 py-1 h-8 w-24 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-sm transition"
            onClick={onNext}
          >
            Dalej
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionSection; 