import React from 'react';
import { IoClose } from "react-icons/io5";
import { CVData, useCV } from '../CVContext';
import { LuList } from 'react-icons/lu';
import { FaIndent } from 'react-icons/fa';

interface EducationSectionProps {
  cvData: CVData;
  updateEducation: (index: number, field: string, value: string) => void;
  removeEducation: (index: number) => void;
  addEducation: () => void;
  onBack: () => void;
  onNext: () => void;
}

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

const EducationSection: React.FC<EducationSectionProps> = ({
  cvData,
  updateEducation,
  removeEducation,
  addEducation,
  onBack,
  onNext
}) => {
  const { saveCV, isSaving } = useCV();
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 ml-6">
        <h3 className="text-lg font-semibold mb-2">Wykształcenie</h3>
        <p className="text-gray-600 mb-4">Dodaj informacje o swoim wykształceniu</p>

        <div className="space-y-4 max-h-[calc(60vh-7rem)] overflow-y-auto pr-2 pb-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
          }}
        >
          {cvData.education.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 mb-4 relative">
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => removeEducation(index)}
                  className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                  title="Usuń wpis"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uczelnia/Szkoła</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź nazwę uczelni/szkoły"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kierunek/Specjalizacja</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź kierunek/specjalizację"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data rozpoczęcia</label>
                  <input 
                    type="month" 
                    className="w-full border rounded-md px-3 py-2"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data zakończenia</label>
                  <div className="space-y-2">
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={edu.endDate === 'currentEducation' ? '' : edu.endDate}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                      disabled={edu.endDate === 'currentEducation'}
                    />
                    <div className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        id={`current-education-${index}`}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        checked={edu.endDate === 'currentEducation'}
                        onChange={(e) => {
                          updateEducation(
                            index, 
                            'endDate', 
                            e.target.checked ? 'currentEducation' : ''
                          );
                        }}
                      />
                      <label htmlFor={`current-education-${index}`} className="ml-2 text-sm text-gray-700">
                        Obecnie się uczę
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dodatkowe informacje</label>
                <TextFormatToolbar 
                  value={edu.description} 
                  onChange={(newValue) => updateEducation(index, 'description', newValue)} 
                />
                <textarea 
                  className="w-full border rounded-t-none rounded-b-md px-3 py-2 h-24" 
                  placeholder="Np. średnia ocen, ważne projekty, osiągnięcia"
                  value={edu.description}
                  onChange={(e) => updateEducation(index, 'description', e.target.value)}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Użyj przycisków powyżej, aby dodać podpunkty i formatowanie.
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="w-full border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
          onClick={addEducation}
        >
          + Dodaj kolejne wykształcenie
        </button>
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

export default EducationSection; 