import React, { useEffect, useState } from 'react';
import { CVData, useCV } from './CVContext'; // Zakładamy, że typ CVData jest zdefiniowany w CVContext
import { IoMdCheckboxOutline, IoMdSquareOutline } from 'react-icons/io';

// Definicja typów dla structury formatowania
type SpacingItem = Record<string, string>;
type SpacingConfig = Record<string, SpacingItem>;
type FontSizesConfig = Record<string, string>;

interface AdvancedFormattingProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  defaultSpacing: SpacingConfig;
  defaultFontSizes: FontSizesConfig;
  onClose: () => void;
}

const AdvancedFormatting: React.FC<AdvancedFormattingProps> = ({
  cvData,
  setCvData,
  defaultSpacing,
  defaultFontSizes,
  onClose
}) => {
  const { saveCV, isSaving } = useCV();
  
  // Pobieramy aktualne style - niestandardowe lub domyślne
  const currentSpacing = { ...defaultSpacing, ...(cvData.customStyles?.spacing || {}) };
  const currentFontSizes = { ...defaultFontSizes, ...(cvData.customStyles?.fontSizes || {}) };
  
  // Stan do przechowywania zaznaczonych czcionek do grupowej edycji
  const [selectedFonts, setSelectedFonts] = useState<Record<string, boolean>>({});
  // Stan do przechowywania wartości jednoczesnego zwiększenia/zmniejszenia
  const [bulkAdjustment, setBulkAdjustment] = useState<number>(0);
  
  // Mapowanie kluczy na bardziej przyjazne nazwy dla UI (przykładowe)
  const spacingLabels: Record<string, Record<string, string>> = {
    document: { paddingTop: 'Margines górny (dokument)', paddingSides: 'Marginesy boczne (dokument)' },
    header: { 
      bottomMargin: 'Odstęp pod nagłówkiem (dane osobowe)',
      nameToContactSpacing: 'Odstęp między imieniem a danymi kontaktowymi'
    },
    sections: { margin: 'Odstęp między sekcjami' },
    elements: { 
      tagGapHorizontal: 'Odstęp poziomy między umiejętnościami'
    }
  };
  
  // Rozszerzony obiekt nazw dla wszystkich dostępnych czcionek
  const fontLabels: Record<string, string> = {
    // Nagłówek i dane kontaktowe
    nameHeader: 'Imię i nazwisko',
    contactInfo: 'Informacje kontaktowe',
    
    // Nagłówki sekcji
    sectionHeader: 'Nagłówki sekcji',
    
    // Bazowe czcionki
    
    // Doświadczenie i edukacja
    position: 'Stanowisko/Pozycja/Projekt (i Daty)',
    company: 'Nazwa firmy/organizacji',
    description: 'Opisy doświadczeń/edukacji',
    
    // Różne elementy
    tagText: 'Umiejętności, języki',
    rodoText: 'Klauzula RODO',
  };

  // Funkcja pomocnicza do usuwania jednostek i zwracania tylko liczb
  const stripUnits = (value: string): number => {
    if (!value) return 0;
    const numMatch = value.match(/^(\d+(\.\d+)?)/);
    return numMatch ? parseFloat(numMatch[1]) : 0;
  };

  // Funkcja pomocnicza do aktualizacji niestandardowych stylów dla 'spacing'
  const updateSpacingStyle = (group: string, key: string, value: string | number) => {
    // Dodaj jednostkę 'px' jeśli wartość jest liczbą
    const formattedValue = typeof value === 'number' ? `${value}px` : value;

    setCvData(prevCvData => {
      // Tworzymy głęboką kopię obiektu spacing
      const newCustomStyles = { 
        ...prevCvData.customStyles,
        spacing: { 
          ...(prevCvData.customStyles?.spacing || {}) 
        }
      };
      
      // Rzutowanie na bezpieczny typ dla operacji
      const spacingAsRecord = newCustomStyles.spacing as Record<string, Record<string, string>>;
      
      // Tworzymy lub aktualizujemy grupę
      if (!spacingAsRecord[group]) {
        spacingAsRecord[group] = {};
      }
      
      // Aktualizujemy konkretną właściwość
      spacingAsRecord[group][key] = formattedValue;
      
      // Jeśli zmieniamy odstęp między sekcjami, aktualizujemy wszystkie wartości w sectionSpacing
      if (group === 'sections' && key === 'margin') {
        // Inicjalizujemy sectionSpacing jeśli nie istnieje
        if (!spacingAsRecord['sectionSpacing']) {
          spacingAsRecord['sectionSpacing'] = {};
        }
        
        // Aktualizujemy common i wszystkie poszczególne sekcje
        spacingAsRecord['sectionSpacing']['common'] = formattedValue;
        spacingAsRecord['sectionSpacing']['profile'] = formattedValue;
        spacingAsRecord['sectionSpacing']['experience'] = formattedValue;
        spacingAsRecord['sectionSpacing']['projects'] = formattedValue;
        spacingAsRecord['sectionSpacing']['education'] = formattedValue;
        spacingAsRecord['sectionSpacing']['courses'] = formattedValue;
        spacingAsRecord['sectionSpacing']['skills'] = formattedValue;
      }
      
      return {
        ...prevCvData,
        customStyles: newCustomStyles
      };
    });
  };

  // Funkcja pomocnicza do aktualizacji niestandardowych stylów dla 'fontSizes'
  const updateFontSize = (key: string, value: string | number) => {
    // Dodaj jednostkę 'px' jeśli wartość jest liczbą
    const formattedValue = typeof value === 'number' ? `${value}px` : value;

    setCvData(prevCvData => {
      const newFontSizes = {
        ...(prevCvData.customStyles?.fontSizes || {}),
        [key]: formattedValue,
      };
      
      // Jeśli aktualizujemy position lub dates, synchronizujemy ich wartości
      if (key === 'position' || key === 'dates') {
        newFontSizes['position'] = formattedValue;
        newFontSizes['dates'] = formattedValue;
      }
      
      return {
        ...prevCvData,
        customStyles: {
          ...prevCvData.customStyles,
          fontSizes: newFontSizes,
        },
      };
    });
  };

  // Funkcja do zwiększania wartości o 0.5 dla fontSizes i o 1 dla spacing
  const incrementValue = (type: 'spacing' | 'fontSize', group: string, key: string, currentValue: string) => {
    const numericValue = stripUnits(currentValue);
    if (type === 'spacing') {
      updateSpacingStyle(group, key, numericValue + 1);
    } else {
      updateFontSize(key, numericValue + 0.5);
    }
  };

  // Funkcja do zmniejszania wartości o 0.5 dla fontSizes i o 1 dla spacing (minimum 0)
  const decrementValue = (type: 'spacing' | 'fontSize', group: string, key: string, currentValue: string) => {
    const numericValue = stripUnits(currentValue);
    if (numericValue > 0) {
      if (type === 'spacing') {
        updateSpacingStyle(group, key, numericValue - 1);
      } else {
        // Zapobiegamy zmniejszeniu poniżej 0
        const newValue = Math.max(0, numericValue - 0.5);
        updateFontSize(key, newValue);
      }
    }
  };

  // Funkcja do przełączania zaznaczenia czcionki
  const toggleFontSelection = (key: string) => {
    setSelectedFonts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Funkcja do zaznaczania/odznaczania wszystkich czcionek
  const toggleAllFonts = () => {
    const currentlyAllSelected = Object.keys(fontLabels).every(key => selectedFonts[key]);
    
    const newSelectedState = !currentlyAllSelected;
    const newSelectedFonts = Object.keys(fontLabels).reduce((acc, key) => {
      acc[key] = newSelectedState;
      return acc;
    }, {} as Record<string, boolean>);
    
    setSelectedFonts(newSelectedFonts);
  };

  // Funkcja do grupowej zmiany rozmiarów zaznaczonych czcionek
  const applyBulkAdjustment = (adjustment: number) => {
    // Dla każdej zaznaczonej czcionki
    Object.entries(selectedFonts).forEach(([key, isSelected]) => {
      if (isSelected) {
        // Pobierz aktualną wartość
        const defaultValue = defaultFontSizes[key as keyof typeof defaultFontSizes] ?? '';
        const customValue = cvData.customStyles?.fontSizes?.[key as keyof typeof cvData.customStyles.fontSizes];
        const currentValue = customValue !== undefined && customValue !== '' ? customValue : defaultValue;
        
        // Oblicz nową wartość
        const numericValue = stripUnits(currentValue);
        const newValue = Math.max(0, numericValue + adjustment);
        
        // Aktualizuj wartość
        updateFontSize(key, newValue);
      }
    });
  };

  // Komponent kontrolki bez przycisków +/-
  const NumberControl = ({ 
    type, 
    group, 
    propKey, 
    value, 
    defaultVal, 
    label 
  }: { 
    type: 'spacing' | 'fontSize', 
    group: string, 
    propKey: string, 
    value: string, 
    defaultVal: string, 
    label: string 
  }) => {
    const numericValue = stripUnits(value || defaultVal);
    
    return (
      <div className="flex items-center justify-between">
        {type === 'fontSize' && (
          <div className="mr-2">
            <button 
              onClick={() => toggleFontSelection(propKey)}
              className="focus:outline-none"
              title={selectedFonts[propKey] ? "Odznacz" : "Zaznacz do grupowej edycji"}
            >
              {selectedFonts[propKey] ? (
                <IoMdCheckboxOutline className="w-4 h-4 text-blue-500" />
              ) : (
                <IoMdSquareOutline className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        )}
        <label className="text-xs font-medium text-gray-600 flex-1">{label}</label>
        <input
          type={type === 'fontSize' ? "number" : "number"}
          className="w-1/3 border rounded-md px-3 py-1.5 text-sm text-center"
          min="0"
          step={type === 'fontSize' ? "0.5" : "1"}
          value={numericValue}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0) {
              if (type === 'spacing') {
                updateSpacingStyle(group, propKey, val);
              } else {
                updateFontSize(propKey, val);
              }
            }
          }}
        />
      </div>
    );
  };

  // Hook useEffect do inicjalizacji formularza i wartości formatowania
  useEffect(() => {
    if (cvData?.customStyles) {
      // Synchronizuj wartości odstępu sekcji
      if (cvData.customStyles.spacing?.sections?.margin && cvData.customStyles.spacing) {
        const spacingValue = cvData.customStyles.spacing.sections.margin;
        
        // Upewnij się, że struktura istnieje
        if (!cvData.customStyles.spacing.sectionSpacing) {
          setCvData(prevData => ({
            ...prevData,
            customStyles: {
              ...prevData.customStyles,
              spacing: {
                ...(prevData.customStyles?.spacing || {}),
                sectionSpacing: { 
                  common: spacingValue,
                  profile: spacingValue,
                  experience: spacingValue,
                  projects: spacingValue,
                  education: spacingValue,
                  courses: spacingValue,
                  skills: spacingValue
                }
              }
            }
          }));
        } else {
          // Aktualizuj wszystkie sekcje, jeśli wartości się różnią
          const sectionSpacing = cvData.customStyles.spacing.sectionSpacing;
          const needsUpdate = sectionSpacing.common !== spacingValue || 
                              sectionSpacing.profile !== spacingValue ||
                              sectionSpacing.experience !== spacingValue ||
                              sectionSpacing.projects !== spacingValue ||
                              sectionSpacing.education !== spacingValue ||
                              sectionSpacing.courses !== spacingValue ||
                              sectionSpacing.skills !== spacingValue;
          
          if (needsUpdate) {
            setCvData(prevData => {
              const newSpacing = {
                ...(prevData.customStyles?.spacing || {}),
                sectionSpacing: {
                  ...(prevData.customStyles?.spacing?.sectionSpacing || {}),
                  common: spacingValue,
                  profile: spacingValue,
                  experience: spacingValue,
                  projects: spacingValue,
                  education: spacingValue,
                  courses: spacingValue,
                  skills: spacingValue
                }
              };
              
              return {
                ...prevData,
                customStyles: {
                  ...prevData.customStyles,
                  spacing: newSpacing
                }
              };
            });
          }
        }
      }
      
      // Ustaw wartości formularza na podstawie customStyles
      // ... existing code ...
    }
  }, [cvData?.customStyles, setCvData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-0">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Zaawansowane opcje formatowania</h4>
        <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-2 -ml-2 rounded border border-blue-100">
          <span className="font-medium">Wskazówka:</span> Dostosuj marginesy i odstępy aby zniwelować problemy z wyswietlaniem.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Pola dla marginesów */}
          {/* <h5 className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-2 mt-2">Marginesy i odstępy</h5> */}
          {Object.entries(spacingLabels).map(([group, keys]) => (
            Object.entries(keys).map(([key, label]) => {
              // Pobierz wartość niestandardową lub domyślną
              const defaultValue = defaultSpacing[group as keyof typeof defaultSpacing]?.[key as keyof typeof defaultSpacing[keyof typeof defaultSpacing]] ?? '';
              const customValue = cvData.customStyles?.spacing?.[group as keyof typeof cvData.customStyles.spacing]?.[key as keyof typeof cvData.customStyles.spacing[keyof typeof cvData.customStyles.spacing]];
              const currentValue = customValue !== undefined && customValue !== '' ? customValue : defaultValue;
              
              return (
                <NumberControl 
                  key={`${group}-${key}`}
                  type="spacing"
                  group={group}
                  propKey={key}
                  value={currentValue}
                  defaultVal={defaultValue}
                  label={label}
                />
              );
            })
          ))}

          {/* Pola dla rozmiarów czcionek */}
          {/* <h5 className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-2 mt-4">Rozmiary czcionek</h5> */}
          
          {/* Panel grupowej edycji rozmiarów czcionek */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-3 rounded-md mb-2 mt-8 -ml-2  border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <button 
                  onClick={toggleAllFonts}
                  className="focus:outline-none mr-2"
                  title="Zaznacz/Odznacz wszystkie"
                >
                  {Object.keys(fontLabels).every(key => selectedFonts[key]) ? (
                    <IoMdCheckboxOutline className="w-5 h-5 text-blue-500" />
                  ) : (
                    <IoMdSquareOutline className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <span className="text-sm font-medium text-gray-700">Grupowa edycja zaznaczonych czcionek</span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => applyBulkAdjustment(-0.5)}
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  disabled={Object.values(selectedFonts).every(v => !v)}
                >
                  -0.5
                </button>
                <button
                  onClick={() => applyBulkAdjustment(0.5)}
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  disabled={Object.values(selectedFonts).every(v => !v)}
                >
                  +0.5
                </button>
                <button
                  onClick={() => applyBulkAdjustment(1)}
                  className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                  disabled={Object.values(selectedFonts).every(v => !v)}
                >
                  +1
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Zaznacz elementy, które chcesz zmodyfikować jednocześnie, a następnie użyj przycisków do zmiany rozmiaru.</p>
          </div>
          
          {Object.entries(fontLabels).map(([key, label]) => {
            // Pobierz wartość niestandardową lub domyślną
            const defaultValue = defaultFontSizes[key as keyof typeof defaultFontSizes] ?? '';
            const customValue = cvData.customStyles?.fontSizes?.[key as keyof typeof cvData.customStyles.fontSizes];
            const currentValue = customValue !== undefined && customValue !== '' ? customValue : defaultValue;

            // Pomijamy rendering kontrolki dla "dates", ponieważ teraz używa tej samej wartości co "position"
            if (key === 'dates') return null;

            return (
              <NumberControl 
                key={`font-${key}`}
                type="fontSize"
                group=""
                propKey={key}
                value={currentValue}
                defaultVal={defaultValue}
                label={label}
              />
            );
          })}
        </div>

        {/* Sekcja Zdjęcie Profilowe */}
        <h5 className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-2 mt-8">Zdjęcie Profilowe</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Utrzymujemy układ siatki dla spójności */}
          <div className="flex items-center justify-between">
            <label htmlFor="photoScaleAdvanced" className="text-xs font-medium text-gray-600 w-1/2">Skala zdjęcia (%)</label>
            <input
              id="photoScaleAdvanced"
              type="number"
              className="w-1/2 border rounded-md px-3 py-1.5 text-sm text-center"
              min="100"
              max="200"
              step="5"
              value={cvData.personalData?.photoScalePercent || 100} // Odczyt z personalData, domyślnie 100
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 100 && val <= 200) {
                  setCvData(prevCvData => ({
                    ...prevCvData,
                    personalData: {
                      // Upewniamy się, że personalData istnieje, chociaż powinno
                      ...(prevCvData.personalData || { 
                        firstName: '', lastName: '', email: '', phone: '', address: '' 
                      }), 
                      photoScalePercent: val,
                    },
                  }));
                }
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="photoBorderRadius" className="text-xs font-medium text-gray-600 w-1/2">Zaokrąglenie rogów (px)</label>
            <input
              id="photoBorderRadius"
              type="number"
              className="w-1/2 border rounded-md px-3 py-1.5 text-sm text-center"
              min="0"
              max="50"
              step="1"
              value={parseInt(cvData.personalData?.photoBorderRadius || '0', 10)} // Odczyt z personalData, domyślnie 0
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 50) {
                  setCvData(prevCvData => ({
                    ...prevCvData,
                    personalData: {
                      ...(prevCvData.personalData || { 
                        firstName: '', lastName: '', email: '', phone: '', address: '' 
                      }), 
                      photoBorderRadius: `${val}px`,
                    },
                  }));
                }
              }}
            />
          </div>
          {/* Można tu dodać w przyszłości inne opcje związane ze zdjęciem, np. border-radius */}
        </div>

      </div>
      
      {/* Przyciski na dole */}
      {/* <div className="mt-auto flex justify-between border-t-2 p-4 w-full">
        <button 
          className="px-4 py-2 bg-gradient-to-r w-24 from-green-500 to-green-600 text-white rounded-sm hover:from-green-600 hover:to-green-700 transition"
          onClick={() => saveCV(false)}
          disabled={isSaving}
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz'}
        </button>
        
        <button 
          className="px-4 py-2 bg-gradient-to-r w-52 from-gray-500 to-gray-600 text-white rounded-sm hover:from-gray-600 hover:to-gray-700 transition"
          onClick={onClose}
        >
          Wróć do podsumowania
        </button>
      </div> */}
    </div>
  );
};

export default AdvancedFormatting; 