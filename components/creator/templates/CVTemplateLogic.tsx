"use client";

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { CVData } from '../CVContext';
import { JobOffer } from "../../saved/ApplicationDetailsDrawer";
import { 
  translations, 
  colorPalette, 
  fontSizes as defaultFontSizes,
  spacing as defaultSpacing,
  SectionInfo,
  A4_HEIGHT_MM,
  MM_TO_PX
} from './TemplateStyles';

// Rozszerzony interfejs informacji o sekcji
export interface EnhancedSectionInfo extends SectionInfo {
  key?: string; // Klucz sekcji (opcjonalnie, dla łatwiejszego debugowania)
  height?: number; // Dodano opcjonalne pole height
  childElements?: {[key: string]: ElementInfo}; // Informacje o pozycjach w sekcji
  isSplit?: boolean;                            // Czy sekcja jest podzielona między stronami
  continuationFromPage?: number;                // Z której strony jest kontynuacja
  elementsBoundaries?: {[key: string]: { firstElement: number, lastElement: number }}; // Granice elementów na stronach
}

// Informacja o pojedynczym elemencie (np. pozycja doświadczenia)
export interface ElementInfo {
  index: number;       // Indeks elementu w kolekcji
  start: number;       // Pozycja początkowa (offsetTop)
  end: number;         // Pozycja końcowa
  height: number;      // Wysokość elementu (offsetHeight + marginTop)
  page?: number;       // Strona, na której znajduje się element
}

// Interfejs podstawowych propsów dla wszystkich szablonów CV
export interface CVTemplateProps {
  data: CVData;
  selectedJob: JobOffer | null;
  language: 'pl' | 'en';
  pageIndex?: number;
  totalPages?: number;
  isPrintVersion?: boolean;
  isMeasurement?: boolean;
  sectionsMap?: {[key: string]: EnhancedSectionInfo};
  onSectionsUpdate?: (sections: {[key: string]: EnhancedSectionInfo}) => void;
  activeSection?: string;
  showProjectsInPreview?: boolean; // Flaga kontrolująca widoczność sekcji projektów
  showJobTitle?: boolean; // Flaga kontrolująca widoczność adnotacji o aplikowanym stanowisku
}

// Funkcja pomocnicza do formatowania daty
export const formatDate = (dateString: string, language: 'pl' | 'en' = 'pl') => {
  if (!dateString) return '';
  
  // Obsługa specjalnych przypadków dla "obecnie"/"present"
  if (dateString === 'currentJob' || dateString === 'currentEducation') {
    return language === 'pl' ? 'obecnie' : 'present';
  }
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};

// Rozszerzone referencje dla elementów sekcji
export interface SectionRefs {
  header: React.RefObject<HTMLDivElement | null>;
  profile: React.RefObject<HTMLDivElement | null>;
  experience: React.RefObject<HTMLDivElement | null>;
  projects: React.RefObject<HTMLDivElement | null>;
  education: React.RefObject<HTMLDivElement | null>;
  courses: React.RefObject<HTMLDivElement | null>;
  skills: React.RefObject<HTMLDivElement | null>;
  rodo: React.RefObject<HTMLDivElement | null>;
  experienceItems?: React.RefObject<HTMLDivElement | null>[];
  educationItems?: React.RefObject<HTMLDivElement | null>[];
  coursesItems?: React.RefObject<HTMLDivElement | null>[];
  projectItems?: React.RefObject<HTMLDivElement | null>[];
}

// Funkcja pomocnicza do głębokiego scalania (deep merge)
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    const targetValue = output[key as keyof T];
    const sourceValue = source[key as keyof T];

    if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
      output[key as keyof T] = deepMerge(targetValue as object, sourceValue as object) as unknown as T[keyof T];
    } else if (sourceValue !== undefined && sourceValue !== '') {
      output[key as keyof T] = sourceValue as T[keyof T];
    }
  });
  return output;
}

// Hook do sprawdzania zawartości sekcji
export function useHasContent(data: CVData) {
  return {
    profile: !!data.description?.trim(),
    experience: data.experience.some(exp => 
      (!exp.type || exp.type === 'job') && 
      (exp.position?.trim() || exp.company?.trim() || exp.description?.trim())
    ),
    projects: data.experience.some(exp => 
      exp.type === 'project' && 
      (exp.position?.trim() || exp.company?.trim() || exp.description?.trim())
    ),
    education: data.education.some(edu => 
      edu.school?.trim() || edu.degree?.trim() || edu.description?.trim()
    ),
    courses: data.courses && data.courses.length > 0 && data.courses.some(course => 
      course.name?.trim() || course.organizer?.trim()
    ),
    skills: (
      data.skills.technical.length > 0 || 
      data.skills.soft.length > 0 || 
      data.skills.languages.some(lang => lang.language?.trim() && lang.level?.trim())
    ),
    rodo: !!data.rodoClause?.trim() && data.showRodoClause !== false
  };
}

// Ulepszony hook do obliczania layoutu sekcji bez skalowania czcionek
export function useSectionsLayout(
  sectionRefs: SectionRefs,
  hasContent: ReturnType<typeof useHasContent>,
  isMeasurement: boolean,
  onSectionsUpdate?: (sections: {[key: string]: EnhancedSectionInfo}) => void,
  effectiveSpacing = defaultSpacing
) {
  useLayoutEffect(() => {
    if (!isMeasurement || !onSectionsUpdate) return;
    
    // Standardowe wymiary strony A4 (w pikselach)
    const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;
    
    // Uwzględniamy zarówno górny jak i dolny padding dokumentu
    const paddingTop = parseStyleValue(effectiveSpacing.document.paddingTop);
    const paddingBottom = parseStyleValue(effectiveSpacing.document.paddingBottom);
    const pageMargin = 20; // Dodatkowy margines bezpieczeństwa
    
    // Odejmujemy oba paddingi i margines od całkowitej wysokości
    const availablePageHeight = A4_HEIGHT_PX - paddingTop - paddingBottom;
    
    const calculateSectionsLayout = () => {
      console.log("Rozpoczynam kalkulację layoutu sekcji");
      console.log(`Dostępna wysokość strony po uwzględnieniu paddingów: ${availablePageHeight}px (paddingTop: ${paddingTop}px, paddingBottom: ${paddingBottom}px)`);
      
      // Zbierz informacje o wszystkich sekcjach
      const sectionsInfo = Object.entries(sectionRefs).reduce((acc, [key, ref]) => {
        if (Array.isArray(ref)) return acc;

        if (ref && ref.current) {
          const offsetTop = ref.current.offsetTop;
          let height = ref.current.offsetHeight;
          if (key === 'header' || (hasContent[key as keyof typeof hasContent] && height > 0)) {
            let marginTop = 0;
            if (key !== 'header') {
              try {
                const styles = window.getComputedStyle(ref.current);
                marginTop = parseFloat(styles.marginTop);
                if (isNaN(marginTop)) marginTop = 0;
              } catch (e) {
                marginTop = parseStyleValue(effectiveSpacing.sections.margin);
              }
            }
            
            // Dla headera dodajemy paddingTop dokumentu do całkowitej wysokości
            const paddingTop = key === 'header' ? 
              parseStyleValue(effectiveSpacing.document.paddingTop) : 0;
            
            const totalHeight = height + marginTop + paddingTop;

            acc[key] = {
              key: key, // Zapisujemy klucz dla łatwiejszego debugowania
              start: offsetTop - marginTop,
              end: offsetTop + height + (key === 'header' ? paddingTop : 0),
              height: totalHeight,
              childElements: {}
            };
          } else {
            // console.log(`Pomijam sekcję ${key} - brak contentu lub wysokość 0.`);
          }
        }
        return acc;
      }, {} as { [key: string]: EnhancedSectionInfo }); // Typ jest teraz poprawny

      console.log("Wstępne informacje o sekcjach (z marginesami):");
      console.table(Object.values(sectionsInfo).map(s => ({ key: s.key, height: s.height, start: s.start, end: s.end })));

      // Dodaj informacje o elementach wewnątrz sekcji i ZAKTUALIZUJ wysokość sekcji nadrzędnej
      const elementSections = {
        'experience': sectionRefs.experienceItems,
        'projects': sectionRefs.projectItems,
        'education': sectionRefs.educationItems,
        'courses': sectionRefs.coursesItems
      };

      Object.entries(elementSections).forEach(([sectionKey, elements]) => {
        if (!elements || !Array.isArray(elements) || elements.length === 0 || !sectionsInfo[sectionKey]) return;

        const childElements: {[key: string]: ElementInfo} = {};
        let childrenTotalHeight = 0;

        elements.forEach((ref, index) => {
          if (ref?.current) {
            const offsetTop = ref.current.offsetTop;
            const height = ref.current.offsetHeight;
            let itemMarginTop = 0;
            if (index > 0) {
              try {
                const styles = window.getComputedStyle(ref.current);
                itemMarginTop = parseFloat(styles.marginTop);
                if (isNaN(itemMarginTop)) itemMarginTop = 0;
              } catch (e) {
                itemMarginTop = parseStyleValue(effectiveSpacing.elements.itemMargin);
              }
            }

            childElements[`${sectionKey}-${index}`] = {
              index,
              start: offsetTop - itemMarginTop,
              end: offsetTop + height,
              height: height + itemMarginTop // Wysokość elementu z jego górnym marginesem
            };
            childrenTotalHeight += height + itemMarginTop;
          }
        });

        if (Object.keys(childElements).length > 0) {
          const sectionDiv = sectionRefs[sectionKey as keyof typeof sectionRefs] as React.RefObject<HTMLDivElement>;
          let sectionHeaderHeight = 0;
          let contentSpacing = 0;
          let sectionMarginTop = 0;

          if (sectionDiv?.current) {
            const h2 = sectionDiv.current.querySelector('h2');
            if (h2) {
              sectionHeaderHeight = h2.offsetHeight;
              try {
                const styles = window.getComputedStyle(h2);
                sectionHeaderHeight += parseFloat(styles.paddingBottom) || 0;
                sectionHeaderHeight += parseFloat(styles.borderBottomWidth) || 0;
              } catch {}
            }
            contentSpacing = parseStyleValue(effectiveSpacing.elements.contentSpacing);
            try {
              const styles = window.getComputedStyle(sectionDiv.current);
              sectionMarginTop = parseFloat(styles.marginTop);
              if (isNaN(sectionMarginTop)) sectionMarginTop = 0;
            } catch {
              sectionMarginTop = parseStyleValue(effectiveSpacing.sections.margin);
            }
          }

          const totalSectionHeight = sectionMarginTop + sectionHeaderHeight + contentSpacing + childrenTotalHeight;
          console.log(`Aktualizacja wysokości dla ${sectionKey}: Margines=${sectionMarginTop}, Nagłówek=${sectionHeaderHeight}, Odstęp=${contentSpacing}, Dzieci=${childrenTotalHeight} => Total=${totalSectionHeight}`);

          sectionsInfo[sectionKey].height = totalSectionHeight;
          sectionsInfo[sectionKey].end = sectionsInfo[sectionKey].start + totalSectionHeight;
          sectionsInfo[sectionKey].childElements = childElements;
        }
      });

      console.log("Zaktualizowane informacje o sekcjach (po uwzględnieniu dzieci):");
      console.table(Object.values(sectionsInfo).map(s => ({ key: s.key, height: s.height, start: s.start, end: s.end })));

      const sectionOrder = ['header', 'profile', 'experience', 'projects', 'education', 'courses', 'skills', 'rodo'];
      const requiredSections = ['header'];
      const hasRequired = requiredSections.every(key => typeof sectionsInfo[key] !== 'undefined');

      if (!hasRequired) {
        console.log("Brak wymaganych sekcji (header), przerywam.");
        return;
      }

      const totalHeight = sectionOrder.reduce((sum, key) => {
        if (sectionsInfo[key]) {
          return sum + (sectionsInfo[key].height || 0); // Używamy obliczonej wysokości
        }
        return sum;
      }, 0);

      // Znajdź najwyższą wartość end ze wszystkich sekcji
      const maxEndPosition = Object.values(sectionsInfo).reduce((max, section) => {
        return Math.max(max, section.end);
      }, 0);

      // Sprawdź, czy całkowita wysokość i najwyższa pozycja end mieszczą się na jednej stronie
      const fitsOnOnePage = totalHeight <= availablePageHeight && maxEndPosition <= availablePageHeight;
      console.log(`Całkowita wysokość: ${totalHeight}px, Maksymalna pozycja końcowa: ${maxEndPosition}px, Dostępna wysokość strony: ${availablePageHeight}px, Mieści się na 1 stronie: ${fitsOnOnePage}`);

      const result: {[key: string]: EnhancedSectionInfo} = {};

      if (fitsOnOnePage) {
        Object.entries(sectionsInfo).forEach(([key, info]) => {
          if (info) {
            result[key] = {
              ...info, // Kopiujemy wszystkie właściwości z info
              fitsOnOnePage: true,
              page: 1,
            };
          }
        });
        Object.values(result).forEach(section => {
          if (section.childElements && section.page) {
            const pageNum = section.page;
            Object.values(section.childElements).forEach(elem => elem.page = pageNum);
          }
        });
        console.log("Wszystko mieści się na jednej stronie. Wynik:", result);
        onSectionsUpdate(result);
        return;
      }

      let currentPage = 1;
      let currentHeightPage1 = 0;
      let currentHeightPage2 = 0;

      // Próg wypełnienia strony (90%)
      const pageThreshold = availablePageHeight * 0.99;
      console.log(`Próg wypełnienia strony (95%): ${pageThreshold}px`);

      // Mapa, która będzie przechowywać informacje o podzielonych sekcjach
      const splitSections: {[key: string]: {
        firstElementsOnPage1: number[],
        elementsOnPage2: number[]
      }} = {};

      // Przetwarzanie sekcji w odpowiedniej kolejności
      sectionOrder.forEach(sectionKey => {
        if (!sectionsInfo[sectionKey]) return;

        const section = sectionsInfo[sectionKey];
        const sectionHeight = section.height || 0;

        if (sectionHeight <= 0) return;

        if (sectionKey === 'header') {
          result[sectionKey] = { ...section, page: 1, fitsOnOnePage: false };
          currentHeightPage1 += sectionHeight;
        } else if (sectionKey === 'rodo') {
          return; // Obsłużymy RODO na końcu
        } else if ((sectionKey === 'experience' || sectionKey === 'projects') && 
                   section.childElements && 
                   Object.keys(section.childElements).length > 0) {
          
          // Decyzja o umieszczeniu sekcji na stronie, niezależnie czy experience czy projects
          const shouldBeginOnPage2 = 
            currentPage === 2 || // Jesteśmy już na stronie 2
            currentHeightPage1 + sectionHeight > pageThreshold; // Nie mieści się na stronie 1
          
          if (shouldBeginOnPage2) {
            // Przenieś całą sekcję na stronę 2
            result[sectionKey] = { ...section, page: 2, fitsOnOnePage: false };
            currentHeightPage2 += sectionHeight;
            
            // Upewnij się, że wszystkie elementy tej sekcji są przypisane do strony 2
            if (section.childElements) {
              Object.keys(section.childElements).forEach(elemKey => {
                section.childElements![elemKey].page = 2;
              });
            }
            
            console.log(`Sekcja ${sectionKey} przeniesiona w całości na stronę 2`);
            
            // Przełącz na stronę 2 jeśli jeszcze tego nie zrobiliśmy
            if (currentPage === 1) {
              currentPage = 2;
            }
          } else {
            // Sprawdź, czy sekcja zmieści się na stronie 1, jeśli nie - podziel ją
            if (currentHeightPage1 + sectionHeight > pageThreshold) {
              // Podziel sekcję na elementy
              const childElementsArray = Object.entries(section.childElements)
                .sort((a, b) => a[1].index - b[1].index);
              
              // Elementy, które pozostaną na stronie 1
              const elementsOnPage1: number[] = [];
              // Elementy, które zostaną przeniesione na stronę 2
              const elementsOnPage2: number[] = [];
              
              // Wysokość nagłówka sekcji - szacujemy jako 10% całkowitej wysokości sekcji
              const headerHeight = sectionHeight * 0.1;
              
              // Inicjalizujemy wysokość sekcji na stronie 1 tylko wysokością nagłówka
              let sectionHeightOnPage1 = headerHeight;
              
              // Próbujemy dodać jak najwięcej elementów na stronę 1
              for (const [key, element] of childElementsArray) {
                const elementIndex = element.index;
                const elementHeight = element.height;
                
                // Sprawdź, czy dodanie tego elementu nie przekroczy progu
                if (currentHeightPage1 + sectionHeightOnPage1 + elementHeight <= pageThreshold) {
                  elementsOnPage1.push(elementIndex);
                  sectionHeightOnPage1 += elementHeight;
                } else {
                  elementsOnPage2.push(elementIndex);
                }
              }
              
              // Zapisz informacje o podziale dla późniejszego wykorzystania
              splitSections[sectionKey] = {
                firstElementsOnPage1: elementsOnPage1,
                elementsOnPage2: elementsOnPage2
              };
              
              console.log(`Podzielono sekcję ${sectionKey}: ${elementsOnPage1.length} elementów na stronie 1, ${elementsOnPage2.length} elementów na stronie 2`);
              
              // Oblicz faktyczną wysokość sekcji po podziale
              let sectionHeightPage1 = headerHeight;
              elementsOnPage1.forEach(index => {
                const elementKey = `${sectionKey}-${index}`;
                if (section.childElements && section.childElements[elementKey]) {
                  sectionHeightPage1 += section.childElements[elementKey].height;
                }
              });
              
              let sectionHeightPage2 = headerHeight; // Nagłówek też będzie na drugiej stronie
              elementsOnPage2.forEach(index => {
                const elementKey = `${sectionKey}-${index}`;
                if (section.childElements && section.childElements[elementKey]) {
                  sectionHeightPage2 += section.childElements[elementKey].height;
                }
              });
              
              // Dodaj sekcję do wyniku z informacją o podziale
              if (elementsOnPage1.length > 0) {
                result[sectionKey] = { 
                  ...section, 
                  page: 1, 
                  fitsOnOnePage: false,
                  isSplit: true,
                  elementsBoundaries: {
                    "1": { firstElement: elementsOnPage1[0], lastElement: elementsOnPage1[elementsOnPage1.length - 1] }
                  }
                };
                
                if (elementsOnPage2.length > 0) {
                  // Dodaj informację o elementach na stronie 2
                  result[sectionKey].elementsBoundaries!["2"] = { 
                    firstElement: elementsOnPage2[0], 
                    lastElement: elementsOnPage2[elementsOnPage2.length - 1] 
                  };
                }
                
                currentHeightPage1 += sectionHeightPage1;
                currentHeightPage2 += sectionHeightPage2;
              } else {
                // Jeśli żaden element nie mieści się na stronie 1, przenieś całą sekcję na stronę 2
                currentPage = 2;
                result[sectionKey] = { ...section, page: 2, fitsOnOnePage: false };
                currentHeightPage2 += sectionHeight;
              }
        } else {
              // Cała sekcja mieści się na stronie 1
              result[sectionKey] = { ...section, page: 1, fitsOnOnePage: false };
              currentHeightPage1 += sectionHeight;
            }
          }
            } else {
          // Standardowe przetwarzanie dla innych sekcji
          if (currentPage === 1) {
            // Jeśli strona 1 jest wypełniona w 90%, przenieś sekcję na stronę 2
            if (currentHeightPage1 + sectionHeight > pageThreshold) {
              console.log(`Sekcja ${sectionKey} (h=${sectionHeight}) przekracza próg 90% na stronie 1 (H1=${currentHeightPage1}). Przenoszę na stronę 2.`);
              currentPage = 2;
              result[sectionKey] = { ...section, page: 2, fitsOnOnePage: false };
              currentHeightPage2 += sectionHeight;
            } else {
              result[sectionKey] = { ...section, page: 1, fitsOnOnePage: false };
              currentHeightPage1 += sectionHeight;
            }
          } else {
            result[sectionKey] = { ...section, page: 2, fitsOnOnePage: false };
            currentHeightPage2 += sectionHeight;
          }
        }
      });

      if (sectionsInfo['rodo']) {
        const rodoPage = currentPage;
        const rodoHeight = sectionsInfo['rodo'].height || 0;
        // Upewnij się, że RODO zmieści się na docelowej stronie
        let assignedRodoPage = rodoPage;
        if (rodoPage === 1 && currentHeightPage1 + rodoHeight > pageThreshold) {
           console.log(`RODO (h=${rodoHeight}) nie mieści się na stronie 1 (H1=${currentHeightPage1}), przenoszę na stronę 2.`);
           assignedRodoPage = 2;
           currentPage = 2; // Upewnij się, że globalny currentPage jest 2
        } else if (rodoPage === 2 && currentHeightPage2 + rodoHeight > availablePageHeight) {
           // To nie powinno się zdarzyć przy limicie 2 stron, ale zostawmy log
           console.warn(`RODO (h=${rodoHeight}) nie mieści się na stronie 2 (H2=${currentHeightPage2}). Może być ucięte.`);
        }

        result['rodo'] = {
          ...sectionsInfo['rodo'],
          page: assignedRodoPage,
          fitsOnOnePage: false,
        };

        if (assignedRodoPage === 1) {
          currentHeightPage1 += rodoHeight;
        } else {
          currentHeightPage2 += rodoHeight;
        }
        console.log(`RODO (h=${rodoHeight}) przypisane do strony ${assignedRodoPage}`);
      }

      // Aktualizuj informacje o stronach dla elementów
      Object.entries(result).forEach(([key, section]) => {
        if (section.childElements) {
          if (section.isSplit && section.elementsBoundaries) {
            // Dla podzielonych sekcji, przypisz strony zgodnie z granicami
            Object.entries(section.elementsBoundaries).forEach(([pageStr, boundaries]) => {
              const page = parseInt(pageStr);
              const { firstElement, lastElement } = boundaries;
              
              for (let i = firstElement; i <= lastElement; i++) {
                const elemKey = `${key}-${i}`;
                if (section.childElements && section.childElements[elemKey]) {
                  section.childElements[elemKey].page = page;
                }
              }
            });
          } else if (section.page) {
            // Dla niepodzielonych sekcji, przypisz wszystkim elementom stronę sekcji
          const pageNum = section.page;
          Object.values(section.childElements).forEach(elem => elem.page = pageNum);
          }
        }
      });

      console.log(`Podział zakończony. Wysokość strony 1: ${currentHeightPage1}, Wysokość strony 2: ${currentHeightPage2}`);
      console.log("Wynikowa mapa sekcji (podział):");
      // Poprawione logowanie dla console.table
      console.table(Object.entries(result).map(([key, s]) => ({ 
        key, 
        page: s.page, 
        height: s.height, 
        fits: s.fitsOnOnePage, 
        split: s.isSplit ? 'tak' : 'nie' 
      })));
      onSectionsUpdate(result);
    };

    const timer = setTimeout(calculateSectionsLayout, 250);
    return () => clearTimeout(timer);
  }, [sectionRefs, hasContent, isMeasurement, onSectionsUpdate, effectiveSpacing]);
}

// Funkcja pomocnicza do parsowania wartości stylów
function parseStyleValue(value: string): number {
  if (!value) return 0;
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return 0;
  
  if (value.includes('px')) {
    return numericValue;
  } else if (value.includes('rem')) {
    return numericValue * 16; // Zakładamy, że 1rem = 16px
  } else if (value.includes('em')) {
    return numericValue * 16; // Zakładamy, że 1em = 16px
  } else if (value.includes('%')) {
    return numericValue / 100 * 16; // Procentowo od rozmiaru bazowego
  }
  
  return numericValue; // Jeśli nie ma jednostki, zakładamy px
}

// Nowa funkcja do określania, które sekcje powinny być widoczne
export const getVisibleSections = (activeSection: string, showProjectsInPreview: boolean = true) => {
  // Określamy kolejność sekcji w kreatorze
  const creatorsOrder = ['start', 'personalData', 'description', 'experience', 'projects', 'education', 'courses', 'skills', 'summary'];
  
  // Bazowe mapowanie sekcji kreatora na sekcje w szablonie CV
  const baseSectionMapping: Record<string, string[]> = {
    'start': ['header'],
    'personalData': ['header'],
    'description': ['header', 'profile'],
    'experience': ['header', 'profile', 'experience'],
    'projects': ['header', 'profile', 'experience', 'projects'],
    'education': ['header', 'profile', 'experience', 'projects', 'education'],
    'courses': ['header', 'profile', 'experience', 'projects', 'education', 'courses'],
    'skills': ['header', 'profile', 'experience', 'projects', 'education', 'courses', 'skills'],
    'summary': ['header', 'profile', 'experience', 'projects', 'education', 'courses', 'skills', 'rodo']
  };
  
  // Tworzymy kopię odpowiedniego mapowania dla aktualnej sekcji
  let visibleSections = [...(baseSectionMapping[activeSection] || [])];
  
  // Dodajemy projekty do listy widocznych sekcji, jeśli jesteśmy w trybie doświadczenia i flaga jest ustawiona
  if (activeSection === 'experience' && showProjectsInPreview) {
    // Jeśli lista nie zawiera jeszcze projektów, dodajemy je po doświadczeniu
    if (!visibleSections.includes('projects')) {
      const experienceIndex = visibleSections.indexOf('experience');
      if (experienceIndex !== -1) {
        visibleSections.splice(experienceIndex + 1, 0, 'projects');
      }
    }
  } else if (activeSection === 'experience' && !showProjectsInPreview) {
    // Usuwamy projekty z listy, jeśli flaga nie jest ustawiona
    visibleSections = visibleSections.filter(section => section !== 'projects');
  }
  
  // Pobranie indeksu aktualnej sekcji
  const currentIndex = creatorsOrder.indexOf(activeSection);
  if (currentIndex === -1) return ['header']; // Domyślnie pokaż tylko header, jeśli sekcja nie została znaleziona
  
  // Zwróć wszystkie sekcje, które powinny być widoczne dla aktualnej sekcji
  return visibleSections;
};

// Funkcja do optymalizacji rozkładu treści na stronach
function optimizePageLayout(
  sectionsInfo: {[key: string]: EnhancedSectionInfo},
  totalPages: number,
  effectiveSpacing = defaultSpacing
): {[key: string]: EnhancedSectionInfo} {
  // Nic nie robimy jeśli mamy tylko jedną stronę
  if (totalPages <= 1) return sectionsInfo;
  
  // Kopia oryginalnych sekcji
  const optimizedSections = { ...sectionsInfo };
  
  // Standardowa wysokość strony A4 w pikselach
  const pageHeight = A4_HEIGHT_MM * MM_TO_PX;
  
  // Próg wypełnienia strony (90%)
  const pageThreshold = pageHeight * 0.90;
  
  // Oblicz ile miejsca zajmują sekcje na każdej stronie
  const pagesContentHeight: Record<number, number> = {};
  
  // Zbieramy informacje o wszystkich sekcjach na stronach
  Object.entries(sectionsInfo).forEach(([key, section]) => {
    if (section.page) {
      // Sprawdź czy sekcja jest podzielona
      if (section.isSplit && section.elementsBoundaries) {
        // Dla podzielonych sekcji, obliczamy wysokość dla każdej strony osobno
        Object.entries(section.elementsBoundaries).forEach(([pageStr, boundaries]) => {
          const page = parseInt(pageStr);
          
          // Dodaj wysokość nagłówka sekcji (szacunkowo 10% całkowitej wysokości sekcji)
          const headerHeight = (section.height || 0) * 0.1;
            let elementsHeight = 0;
            
          // Oblicz wysokość elementów na tej stronie
            const { firstElement, lastElement } = boundaries;
            
            for (let i = firstElement; i <= lastElement; i++) {
              const elemKey = `${key}-${i}`;
              if (section.childElements && section.childElements[elemKey]) {
                elementsHeight += section.childElements[elemKey].height;
              }
            }
            
          // Dodaj wysokość do odpowiedniej strony
            if (!pagesContentHeight[page]) {
              pagesContentHeight[page] = 0;
            }
            
          pagesContentHeight[page] += headerHeight + elementsHeight;
        });
      } else {
        // Dla niepodzielonych sekcji, dodaj całą wysokość sekcji
        const pageIndex = section.page;
        const sectionHeight = section.end - section.start;
        
        if (!pagesContentHeight[pageIndex]) {
          pagesContentHeight[pageIndex] = 0;
        }
        
        pagesContentHeight[pageIndex] += sectionHeight;
      }
    }
  });
  
  // Wyświetl informacje o wykorzystaniu stron
  console.log("Wykorzystanie stron przed optymalizacją:", pagesContentHeight);
  
  // Sprawdź, które strony są niedopełnione, a które przepełnione
  const underfillThreshold = 0.4; // Strona jest niedopełniona, jeśli ma < 40% zawartości (zmniejszono z 50%)
  const overfillThreshold = 0.98; // Strona jest przepełniona, jeśli ma > 98% zawartości (zwiększono z 95%)
  
  // Specjalna obsługa dla RODO - jeśli istnieje i jest małe, nie powinno być przenoszone na nową stronę
  const rodoSection = optimizedSections['rodo'];
  if (rodoSection && rodoSection.page === totalPages && totalPages > 1) {
    const rodoHeight = rodoSection.end - rodoSection.start;
    
    // Jeśli RODO jest małe (mniej niż 5% wysokości strony) i jest jedyną sekcją na ostatniej stronie
    if (rodoHeight < pageHeight * 0.05) {
      const lastPageContent = Object.values(optimizedSections)
        .filter(section => section.page === totalPages && section.key !== 'rodo')
        .length;
      
      // Jeśli RODO jest jedyną sekcją na ostatniej stronie, spróbuj przenieść je na poprzednią stronę
      if (lastPageContent === 0) {
        const prevPage = totalPages - 1;
        const prevPageHeight = pagesContentHeight[prevPage] || 0;
        
        // Sprawdź czy RODO zmieści się na poprzedniej stronie
        if (prevPageHeight + rodoHeight <= pageHeight) {
          console.log(`Przenoszę małą sekcję RODO ze strony ${totalPages} na stronę ${prevPage}`);
          
          // Aktualizuj stronę RODO
          rodoSection.page = prevPage;
          
          // Aktualizuj wysokość stron
          if (!pagesContentHeight[prevPage]) pagesContentHeight[prevPage] = 0;
          pagesContentHeight[prevPage] += rodoHeight;
          pagesContentHeight[totalPages] -= rodoHeight;
        }
      }
    }
  }
  
  const underfillPages: number[] = [];
  const overfillPages: number[] = [];
  
  Object.entries(pagesContentHeight).forEach(([pageStr, height]) => {
    const page = parseInt(pageStr);
    const pageUtilization = height / pageHeight;
    
    if (pageUtilization < underfillThreshold) {
      underfillPages.push(page);
      console.log(`Strona ${page} jest niedopełniona: ${Math.round(pageUtilization * 100)}%`);
    } else if (pageUtilization > overfillThreshold) {
      overfillPages.push(page);
      console.log(`Strona ${page} jest przepełniona: ${Math.round(pageUtilization * 100)}%`);
    }
  });
  
  // Najpierw optymalizujemy przepełnione strony (przenosząc zawartość na następne strony)
  overfillPages.sort((a, b) => a - b); // Sortujemy strony rosnąco
  
  for (const page of overfillPages) {
    // Pomijamy ostatnią stronę - tam nie możemy przenieść zawartości
    if (page === totalPages) continue;
    
    // Znajdź sekcje/elementy, które można przenieść na następną stronę
    const nextPage = page + 1;
    
    // Szukamy sekcji experience lub projects, które można podzielić
    for (const [key, section] of Object.entries(optimizedSections)) {
      if ((key === 'experience' || key === 'projects') && 
          section.page === page && 
          section.childElements && 
          Object.keys(section.childElements).length > 1) {
        
        // Sprawdź, czy sekcja jest już podzielona
        if (section.isSplit) {
          // Jeśli już jest podzielona, możemy próbować przenieść więcej elementów
          if (section.elementsBoundaries && section.elementsBoundaries[String(page)]) {
            const boundaries = section.elementsBoundaries[String(page)];
            const { firstElement, lastElement } = boundaries;
            
            // Spróbuj przenieść ostatni element na następną stronę
            if (firstElement < lastElement) {
              const lastElementToMove = lastElement;
              const elemKey = `${key}-${lastElementToMove}`;
              
              if (section.childElements[elemKey]) {
                const elemHeight = section.childElements[elemKey].height;
                
                // Przenieś ostatni element na następną stronę
                console.log(`Przenoszę element ${elemKey} ze strony ${page} na stronę ${nextPage}`);
                
                // Aktualizuj granice elementów
                boundaries.lastElement = lastElement - 1;
                
                // Dodaj lub zaktualizuj granice dla następnej strony
                if (!section.elementsBoundaries[String(nextPage)]) {
                  section.elementsBoundaries[String(nextPage)] = {
                    firstElement: lastElementToMove,
                    lastElement: lastElementToMove
                  };
                } else {
                  const nextBoundaries = section.elementsBoundaries[String(nextPage)];
                  section.elementsBoundaries[String(nextPage)] = {
                    firstElement: Math.min(nextBoundaries.firstElement, lastElementToMove),
                    lastElement: Math.max(nextBoundaries.lastElement, lastElementToMove)
                  };
                }
                
                // Zaktualizuj stronę elementu
                section.childElements[elemKey].page = nextPage;
                
                // Aktualizuj wysokość stron
                pagesContentHeight[page] -= elemHeight;
                if (!pagesContentHeight[nextPage]) pagesContentHeight[nextPage] = 0;
                pagesContentHeight[nextPage] += elemHeight;
                
                break; // Przenieśliśmy jeden element, zakończ pętlę
              }
            }
          }
        } else {
          // Jeśli sekcja nie jest jeszcze podzielona, podziel ją
          const childElementsArray = Object.entries(section.childElements)
            .sort((a, b) => a[1].index - b[1].index);
          
          if (childElementsArray.length > 1) {
            // Znajdź ostatni element, który można przenieść
            const lastIndex = childElementsArray.length - 1;
            const [lastElemKey, lastElem] = childElementsArray[lastIndex];
            const elemIndex = lastElem.index;
            const elemHeight = lastElem.height;
            
            // Podziel sekcję, zostawiając ostatni element na następnej stronie
            console.log(`Dzielę sekcję ${key}, przenosząc element ${lastElemKey} na stronę ${nextPage}`);
            
            // Aktualizuj sekcję
          optimizedSections[key] = {
            ...section,
              isSplit: true,
              elementsBoundaries: {
                [String(page)]: {
                  firstElement: 0,
                  lastElement: elemIndex - 1
                },
                [String(nextPage)]: {
                  firstElement: elemIndex,
                  lastElement: elemIndex
                }
              }
            };
            
            // Aktualizuj stronę elementu
            section.childElements[lastElemKey].page = nextPage;
            
            // Aktualizuj wysokość stron
            pagesContentHeight[page] -= elemHeight;
          if (!pagesContentHeight[nextPage]) pagesContentHeight[nextPage] = 0;
            pagesContentHeight[nextPage] += elemHeight;
            
            break; // Podzieliliśmy jedną sekcję, zakończ pętlę
          }
        }
      }
    }
  }
  
  // Następnie optymalizujemy niedopełnione strony (przenosząc zawartość z poprzednich stron)
  underfillPages.sort((a, b) => b - a); // Sortujemy strony malejąco (od ostatniej)
  
  for (const page of underfillPages) {
    // Pomijamy pierwszą stronę - tam nie możemy przenieść zawartości
    if (page <= 1) continue;
    
    // Znajdź sekcje/elementy, które można przenieść z poprzedniej strony
    const prevPage = page - 1;
    
    // Sprawdź, ile miejsca zostało na bieżącej stronie
    const availableSpace = pageHeight - (pagesContentHeight[page] || 0);
    if (availableSpace <= 0) continue;
    
    // Szukamy podzielonych sekcji, których elementy można przenieść
    for (const [key, section] of Object.entries(optimizedSections)) {
      if (section.isSplit && section.elementsBoundaries && section.elementsBoundaries[String(prevPage)]) {
        const boundaries = section.elementsBoundaries[String(prevPage)];
        const { firstElement, lastElement } = boundaries;
        
        // Spróbuj przenieść ostatni element z poprzedniej strony
        if (firstElement < lastElement) {
          const lastElementToMove = lastElement;
          const elemKey = `${key}-${lastElementToMove}`;
          
          if (section.childElements && section.childElements[elemKey]) {
            const elemHeight = section.childElements[elemKey].height;
            
            // Sprawdź czy element zmieści się na bieżącej stronie
            if (elemHeight <= availableSpace) {
              // Przenieś element z poprzedniej strony na bieżącą
              console.log(`Przenoszę element ${elemKey} ze strony ${prevPage} na stronę ${page}`);
              
              // Aktualizuj granice elementów dla poprzedniej strony
              boundaries.lastElement = lastElement - 1;
              
              // Dodaj lub zaktualizuj granice dla bieżącej strony
              if (!section.elementsBoundaries[String(page)]) {
                section.elementsBoundaries[String(page)] = {
                  firstElement: lastElementToMove,
                  lastElement: lastElementToMove
                };
            } else {
                const pageBoundaries = section.elementsBoundaries[String(page)];
                section.elementsBoundaries[String(page)] = {
                  firstElement: Math.min(pageBoundaries.firstElement, lastElementToMove),
                  lastElement: Math.max(pageBoundaries.lastElement, lastElementToMove)
                };
              }
              
              // Zaktualizuj stronę elementu
              section.childElements[elemKey].page = page;
              
              // Aktualizuj wysokość stron
              pagesContentHeight[prevPage] -= elemHeight;
              pagesContentHeight[page] += elemHeight;
              
              break; // Przenieśliśmy jeden element, zakończ pętlę
            }
          }
        }
      }
    }
  }
  
  // Wyświetl informacje o wykorzystaniu stron po optymalizacji
  console.log("Wykorzystanie stron po optymalizacji:", pagesContentHeight);
  
  return optimizedSections;
}

// Eksport styli i innych potrzebnych elementów
export {
  translations,
  colorPalette,
  defaultFontSizes,
  defaultSpacing,
  optimizePageLayout
}; 
