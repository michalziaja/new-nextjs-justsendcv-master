import React, { useEffect } from 'react';
import { CVData, useCV } from './CVContext'; // Zakładamy, że typ CVData jest zdefiniowany w CVContext

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
  
  // Mapowanie kluczy na bardziej przyjazne nazwy dla UI (przykładowe)
  const spacingLabels: Record<string, Record<string, string>> = {
    document: { paddingTop: 'Margines górny (dokument)', paddingSides: 'Marginesy boczne (dokument)' },
    header: { bottomMargin: 'Odstęp pod nagłówkiem (dane osobowe)'},
    sections: { margin: 'Odstęp między sekcjami' },
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
    position: 'Stanowisko/Pozycja/Projekt',
    company: 'Nazwa firmy/organizacji',
    dates: 'Daty (od-do)',
    description: 'Opisy doświadczeń/edukacji',
    
    // Różne elementy
    subSectionHeader: 'Nagłówki umiejętności',
    tagText: 'Umiejętności, języki',
    rodoText: 'Klauzula RODO',
  };

  // Funkcja pomocnicza do usuwania jednostek i zwracania tylko liczb
  const stripUnits = (value: string): number => {
    if (!value) return 0;
    const numMatch = value.match(/^(\d+)/);
    return numMatch ? parseInt(numMatch[1], 10) : 0;
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

    setCvData(prevCvData => ({
      ...prevCvData,
      customStyles: {
        ...prevCvData.customStyles,
        fontSizes: {
          ...(prevCvData.customStyles?.fontSizes || {}),
          [key]: formattedValue,
        },
      },
    }));
  };

  // Funkcja do zwiększania wartości o 1
  const incrementValue = (type: 'spacing' | 'fontSize', group: string, key: string, currentValue: string) => {
    const numericValue = stripUnits(currentValue);
    if (type === 'spacing') {
      updateSpacingStyle(group, key, numericValue + 1);
    } else {
      updateFontSize(key, numericValue + 1);
    }
  };

  // Funkcja do zmniejszania wartości o 1 (minimum 0)
  const decrementValue = (type: 'spacing' | 'fontSize', group: string, key: string, currentValue: string) => {
    const numericValue = stripUnits(currentValue);
    if (numericValue > 0) {
      if (type === 'spacing') {
        updateSpacingStyle(group, key, numericValue - 1);
      } else {
        updateFontSize(key, numericValue - 1);
      }
    }
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
        <label className="text-xs font-medium text-gray-600 w-1/2">{label}</label>
        <input
          type="number"
          className="w-1/2 border rounded-md px-3 py-1.5 text-sm text-center"
          min="0"
          value={numericValue}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
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
        <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-2 rounded border border-blue-100">
          <span className="font-medium">Wskazówka:</span> Dostosuj marginesy i odstępy aby zniwelować problemy z wyswietlaniem.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Pola dla marginesów */}
          <h5 className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-2 mt-2">Marginesy i odstępy</h5>
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
          <h5 className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-2 mt-4">Rozmiary czcionek</h5>
          {Object.entries(fontLabels).map(([key, label]) => {
            // Pobierz wartość niestandardową lub domyślną
            const defaultValue = defaultFontSizes[key as keyof typeof defaultFontSizes] ?? '';
            const customValue = cvData.customStyles?.fontSizes?.[key as keyof typeof cvData.customStyles.fontSizes];
            const currentValue = customValue !== undefined && customValue !== '' ? customValue : defaultValue;

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
        <h5 className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-2 mt-4">Zdjęcie Profilowe</h5>
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