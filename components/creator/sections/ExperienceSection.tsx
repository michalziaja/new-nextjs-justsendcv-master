import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { CVData, useCV } from '../CVContext';
import { LuList } from 'react-icons/lu';
import { FaIndent } from 'react-icons/fa';
import { Sparkles, Loader2 } from "lucide-react";

interface ExperienceSectionProps {
  cvData: CVData;
  updateExperience: (index: number, field: string, value: string) => void;
  removeExperience: (index: number) => void;
  addExperience: (type?: 'job' | 'project') => void;
  onBack: () => void;
  onNext: () => void;
}

// Komponent asystenta AI do generowania opisu doświadczenia
const AIAssistant = ({ 
  experienceIndex, 
  position, 
  company,
  jobTitle,
  description,
  onUpdate 
}: { 
  experienceIndex: number; 
  position: string; 
  company: string;
  jobTitle: string | undefined;
  description: string; 
  onUpdate: (index: number, field: string, value: string) => void;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funkcja do generowania opisu doświadczenia
  const generateDescription = async () => {
    // Sprawdź czy mamy minimalny opis do pracy
    if (!description || description.trim().length < 10) {
      setError("Wprowadź przynajmniej kilka słów opisu, aby AI mogło go ulepszyć");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Dane do zapytania
      const requestData = {
        jobTitle: jobTitle || "",
        position,
        company,
        description
      };

      // Zapytanie do API
      const response = await fetch('/api/generate-experience-description', {
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
      
      // Aktualizacja opisu doświadczenia
      onUpdate(experienceIndex, 'description', data.description);
    } catch (error) {
      console.error("Błąd generowania opisu doświadczenia:", error);
      setError(error instanceof Error ? error.message : "Nieznany błąd");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute top-2 right-10">
      <button
        onClick={generateDescription}
        disabled={isGenerating}
        className={`text-gray-500 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100 transition-colors ${
          isGenerating ? 'bg-blue-50' : ''
        }`}
        title="Użyj AI do ulepszenia opisu doświadczenia"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
      </button>
      {error && (
        <div className="absolute right-0 top-8 w-48 bg-red-50 border border-red-200 text-red-600 text-xs p-1 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

// Komponent paska narzędzi formatowania tekstu
const TextFormatToolbar = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void 
}) => {
  // Funkcja do dodawania podpunktu
  const addBulletPoint = () => {
    // Dodajemy podpunkt na początku jeśli tekst jest pusty
    if (!value.trim()) {
      onChange('• ');
      return;
    }

    // Pobieramy pozycję kursora (jeśli jesteśmy w textarea)
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (textarea?.tagName === 'TEXTAREA') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Sprawdzamy, czy kursor jest na początku linii
      const textBeforeCursor = value.substring(0, start);
      const textAfterCursor = value.substring(end);
      
      // Znajdź początek aktualnej linii
      const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
      const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
      
      // Sprawdź, czy linia już zaczyna się od podpunktu
      const currentLine = textBeforeCursor.substring(lineStart);
      if (currentLine.trimStart().startsWith('•')) {
        return; // Nie dodawaj podpunktu, jeśli już jest
      }
      
      // Dodaj podpunkt na początku aktualnej linii
      const newText = 
        textBeforeCursor.substring(0, lineStart) + 
        '• ' + 
        textBeforeCursor.substring(lineStart) + 
        textAfterCursor;
      
      onChange(newText);
      
      // Ustaw kursor po podpunkcie
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = lineStart + 2;
      }, 0);
    } else {
      // Fallback dla przypadku, gdy nie mamy dostępu do kursora
      onChange(value + '\n• ');
    }
  };

  // Funkcja do zwiększania wcięcia
  const increaseIndent = () => {
    // Dodajemy wcięcie na początku jeśli tekst jest pusty
    if (!value.trim()) {
      onChange('    ');
      return;
    }

    const textarea = document.activeElement as HTMLTextAreaElement;
    if (textarea?.tagName === 'TEXTAREA') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Sprawdzamy, czy zaznaczony jest tekst
      if (start !== end) {
        // Dodaj wcięcie do każdej linii w zaznaczeniu
        const selectedText = value.substring(start, end);
        const lines = selectedText.split('\n');
        const indentedLines = lines.map(line => '    ' + line);
        const newText = 
          value.substring(0, start) + 
          indentedLines.join('\n') + 
          value.substring(end);
        
        onChange(newText);
        
        // Dostosuj pozycję kursora po zmianie
        const newStart = start;
        const newEnd = start + indentedLines.join('\n').length;
        
        setTimeout(() => {
          textarea.selectionStart = newStart;
          textarea.selectionEnd = newEnd;
        }, 0);
        
        return;
      }
      
      // Znajdź początek aktualnej linii
      const textBeforeCursor = value.substring(0, start);
      const textAfterCursor = value.substring(end);
      const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
      const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
      
      // Dodaj wcięcie na początku aktualnej linii
      const newText = 
        value.substring(0, lineStart) + 
        '    ' + 
        value.substring(lineStart);
      
      onChange(newText);
      
      // Ustaw kursor uwzględniając dodane wcięcie
      setTimeout(() => {
        const newPosition = start + 4;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
        textarea.focus();
      }, 0);
    } else {
      // Fallback dla przypadku, gdy nie mamy dostępu do kursora
      onChange('    ' + value);
    }
  };

  return (
    <div className="flex mb-1 border border-gray-300 rounded-t-md border-b-0 bg-gray-50 p-1">
      <button
        type="button"
        onClick={addBulletPoint}
        className="p-1 hover:bg-gray-200 rounded"
        title="Dodaj podpunkt"
      >
        <LuList className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={increaseIndent}
        className="p-1 hover:bg-gray-200 rounded"
        title="Zwiększ wcięcie"
      >
        <FaIndent className="w-4 h-4" />
      </button>
    </div>
  );
};

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  cvData,
  updateExperience,
  removeExperience,
  addExperience,
  onBack,
  onNext
}) => {
  const { saveCV, isSaving, selectedJob } = useCV();
  // Sprawdzamy, czy mamy przynajmniej jedno doświadczenie zawodowe
  const hasJobExperience = cvData.experience.some(exp => !exp.type || exp.type === 'job');
  
  return (
    <div className="flex flex-col h-full ">
      <div className="p-4 ml-6">
      <h3 className="text-lg font-semibold mb-2">Doświadczenie zawodowe</h3>
      <p className="text-gray-600 mb-4">
        Opisz swoje doświadczenie zawodowe, zaczynając od najnowszych stanowisk.
      </p>
      
      <div className="space-y-4 max-h-[calc(60vh-7.5rem)] overflow-y-auto pr-2 pb-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
        }}
      >
        {cvData.experience
          .filter(exp => !exp.type || exp.type === 'job')
          .map((exp, index) => {
            // Znajdź faktyczny indeks w pełnej tablicy experience
            const actualIndex = cvData.experience.findIndex(
              (e, idx) => (!e.type || e.type === 'job') && 
              cvData.experience.filter(ex => !ex.type || ex.type === 'job').indexOf(e) === index
            );
            
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3 mb-4 relative">
                <div className="absolute top-2 right-2">
                  <button 
                    onClick={() => removeExperience(actualIndex)}
                    className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                    title="Usuń doświadczenie"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Asystent AI do generowania opisu doświadczenia */}
                <AIAssistant 
                  experienceIndex={actualIndex}
                  position={exp.position}
                  company={exp.company}
                  jobTitle={selectedJob?.title}
                  description={exp.description}
                  onUpdate={updateExperience}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stanowisko</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Np. Programista JavaScript"
                    value={exp.position}
                    onChange={(e) => updateExperience(actualIndex, 'position', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Np. XYZ Sp. z o.o."
                    value={exp.company}
                    onChange={(e) => updateExperience(actualIndex, 'company', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data rozpoczęcia</label>
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(actualIndex, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data zakończenia</label>
                    <div className="space-y-2">
                      <input 
                        type="month" 
                        className="w-full border rounded-md px-3 py-2"
                        value={exp.endDate === 'currentJob' ? '' : exp.endDate}
                        onChange={(e) => updateExperience(actualIndex, 'endDate', e.target.value)}
                        disabled={exp.endDate === 'currentJob'}
                      />
                      <div className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          id={`current-job-${index}`}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          checked={exp.endDate === 'currentJob'}
                          onChange={(e) => {
                            updateExperience(
                              actualIndex, 
                              'endDate', 
                              e.target.checked ? 'currentJob' : ''
                            );
                          }}
                        />
                        <label htmlFor={`current-job-${index}`} className="ml-2 text-sm text-gray-700">
                          Obecnie pracuję
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis obowiązków i osiągnięć
                    <span className="ml-1 text-xs text-blue-500">
                      <Sparkles className="w-3 h-3 inline-block" /> Dostępny asystent AI
                    </span>
                  </label>
                  <TextFormatToolbar 
                    value={exp.description} 
                    onChange={(newValue) => updateExperience(actualIndex, 'description', newValue)} 
                  />
                  <textarea 
                    className="w-full border rounded-t-none rounded-b-md px-3 py-2 h-24" 
                    placeholder="Opisz swoje główne obowiązki, odpowiedzialności i osiągnięcia na tym stanowisku"
                    value={exp.description}
                    onChange={(e) => updateExperience(actualIndex, 'description', e.target.value)}
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    Użyj przycisków powyżej, aby dodać podpunkty i formatowanie. Ikona iskierek pozwala wygenerować opis na podstawie wprowadzonych danych.
                  </p>
                </div>
              </div>
            );
          })}
      </div>
      
      <div className="flex space-x-2 mt-10">
        <button 
          className="w-full border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
          onClick={() => addExperience('job')}
        >
          + Dodaj doświadczenie zawodowe
        </button>
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

export default ExperienceSection; 