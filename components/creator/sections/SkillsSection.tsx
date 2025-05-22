import React, { useState, useRef, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { Sparkles } from "lucide-react";
import { CVData, useCV } from '../CVContext';
import { IoMdCheckboxOutline, IoMdSquareOutline } from "react-icons/io";

interface SkillsSectionProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  updateTechnicalSkills: (value: string) => void;
  updateSoftSkills: (value: string) => void;
  updateLanguage: (index: number, field: string, value: string) => void;
  addLanguage: () => void;
  onBack: () => void;
  onNext: () => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  cvData,
  setCvData,
  updateTechnicalSkills,
  updateSoftSkills,
  updateLanguage,
  addLanguage,
  onBack,
  onNext
}) => {
  const { jobAnalysis, selectedJob } = useCV();
  
  // Stany do kontrolowania widoczności popoverów dla każdej sekcji
  const [showTechnicalSuggestions, setShowTechnicalSuggestions] = useState(false);
  const [showSoftSuggestions, setShowSoftSuggestions] = useState(false);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  
  // Referencje do kontenerów popoverów
  const technicalPopoverRef = useRef<HTMLDivElement>(null);
  const softPopoverRef = useRef<HTMLDivElement>(null);
  const languagePopoverRef = useRef<HTMLDivElement>(null);
  
  // Funkcja zamykająca popovery po kliknięciu poza nimi
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (technicalPopoverRef.current && !technicalPopoverRef.current.contains(event.target as Node)) {
        setShowTechnicalSuggestions(false);
      }
      if (softPopoverRef.current && !softPopoverRef.current.contains(event.target as Node)) {
        setShowSoftSuggestions(false);
      }
      if (languagePopoverRef.current && !languagePopoverRef.current.contains(event.target as Node)) {
        setShowLanguageSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Sprawdzamy wartości domyślne przy renderowaniu (dla debugowania)
  React.useEffect(() => {
    console.log("Wartości tytułów sekcji:", {
      technical: cvData.skills.technicalSectionTitle,
      soft: cvData.skills.softSectionTitle
    });
  }, [cvData.skills.technicalSectionTitle, cvData.skills.softSectionTitle]);
  
  // Funkcje do przełączania widoczności umiejętności
  const toggleTechnicalSkills = () => {
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        showTechnicalSkills: !cvData.skills.showTechnicalSkills
      }
    });
  };
  
  const toggleSoftSkills = () => {
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        showSoftSkills: !cvData.skills.showSoftSkills
      }
    });
  };
  
  const suggestedSkills = {
    technical: jobAnalysis?.technologies || [],
    skills: jobAnalysis?.skills || [],
    languages: jobAnalysis?.languages || []
  };
  
  const hasSuggestedSkills = 
    suggestedSkills.technical.length > 0 || 
    suggestedSkills.skills.length > 0 || 
    suggestedSkills.languages.length > 0;
  
  const addSuggestedSkills = (type: 'technical' | 'soft' | 'languages') => {
    if (type === 'technical') {
      const currentSkills = new Set(cvData.skills.technical);
      suggestedSkills.technical.forEach(skill => currentSkills.add(skill));
      
      setCvData({
        ...cvData,
        skills: {
          ...cvData.skills,
          technical: Array.from(currentSkills)
        }
      });
      setShowTechnicalSuggestions(false);
    } else if (type === 'soft') {
      const currentSkills = new Set(cvData.skills.soft);
      suggestedSkills.skills.forEach(skill => currentSkills.add(skill));
      
      setCvData({
        ...cvData,
        skills: {
          ...cvData.skills,
          soft: Array.from(currentSkills)
        }
      });
      setShowSoftSuggestions(false);
    } else if (type === 'languages') {
      const existingLanguageCodes = new Set(cvData.skills.languages.map(l => l.language.toLowerCase()));
      
      const newLanguages = suggestedSkills.languages
        .filter(lang => !existingLanguageCodes.has(lang.toLowerCase()))
        .map(lang => ({ language: lang, level: 'B2' }));
      
      if (newLanguages.length > 0) {
        setCvData({
          ...cvData,
          skills: {
            ...cvData.skills,
            languages: [...cvData.skills.languages, ...newLanguages]
          }
        });
      }
      setShowLanguageSuggestions(false);
    }
  };
  
  // Funkcja dodająca pojedynczą sugerowaną umiejętność
  const addSingleSuggestedSkill = (type: 'technical' | 'soft', skill: string) => {
    if (type === 'technical') {
      if (!cvData.skills.technical.includes(skill)) {
        setCvData({
          ...cvData,
          skills: {
            ...cvData.skills,
            technical: [...cvData.skills.technical, skill]
          }
        });
      }
    } else if (type === 'soft') {
      if (!cvData.skills.soft.includes(skill)) {
        setCvData({
          ...cvData,
          skills: {
            ...cvData.skills,
            soft: [...cvData.skills.soft, skill]
          }
        });
      }
    }
  };
  
  // Funkcja dodająca pojedynczy sugerowany język
  const addSingleSuggestedLanguage = (language: string) => {
    const exists = cvData.skills.languages.some(lang => 
      lang.language.toLowerCase() === language.toLowerCase()
    );
    
    if (!exists) {
      setCvData({
        ...cvData,
        skills: {
          ...cvData.skills,
          languages: [...cvData.skills.languages, { language, level: 'B2' }]
        }
      });
    }
  };

  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  const addTechnicalSkill = () => {
    if (newTechnicalSkill.trim() === '') return;
    
    const updatedSkills = [...cvData.skills.technical, newTechnicalSkill.trim()];
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        technical: updatedSkills
      }
    });
    setNewTechnicalSkill('');
  };
  
  const removeTechnicalSkill = (index: number) => {
    const updatedSkills = [...cvData.skills.technical];
    updatedSkills.splice(index, 1);
    
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        technical: updatedSkills
      }
    });
  };
  
  const addSoftSkill = () => {
    if (newSoftSkill.trim() === '') return;
    
    const updatedSkills = [...cvData.skills.soft, newSoftSkill.trim()];
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        soft: updatedSkills
      }
    });
    setNewSoftSkill('');
  };
  
  const removeSoftSkill = (index: number) => {
    const updatedSkills = [...cvData.skills.soft];
    updatedSkills.splice(index, 1);
    
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        soft: updatedSkills
      }
    });
  };

  const { saveCV, isSaving } = useCV();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 ml-6">
        <h3 className="text-lg font-semibold mb-4">Umiejętności</h3>

        <div className="space-y-4">
          <div className="mb-6">
            <div className="flex items-center mb-1">
              <button 
                onClick={toggleTechnicalSkills}
                className="focus:outline-none"
                title={cvData.skills.showTechnicalSkills ? "Ukryj umiejętności techniczne" : "Pokaż umiejętności techniczne"}
              >
                {cvData.skills.showTechnicalSkills ? (
                  <IoMdCheckboxOutline className="w-5 h-5 text-blue-500" />
                ) : (
                  <IoMdSquareOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <label className="ml-2 text-sm font-medium text-gray-700">Umiejętności techniczne</label>
              
              {/* Przycisk sugestii AI dla umiejętności technicznych */}
              {selectedJob && jobAnalysis && suggestedSkills.technical.length > 0 && (
                <div className="relative ml-auto">
                  <button
                    onClick={() => setShowTechnicalSuggestions(!showTechnicalSuggestions)}
                    className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    title="Sugestie AI"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Sugestie AI
                  </button>
                  
                  {/* Popover z sugestiami dla umiejętności technicznych */}
                  {showTechnicalSuggestions && (
                    <div 
                      ref={technicalPopoverRef}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">Sugerowane umiejętności</h5>
                          <button
                            onClick={() => setShowTechnicalSuggestions(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2 max-h-40 overflow-y-auto">
                          {suggestedSkills.technical.map((skill, index) => (
                            <div
                              key={index}
                              onClick={() => addSingleSuggestedSkill('technical', skill)}
                              className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-100"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => addSuggestedSkills('technical')}
                          className="mt-2 w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Dodaj wszystkie
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {cvData.skills.showTechnicalSkills && (
              <div className="ml-7 mb-2 space-y-2">
                <div className="flex items-center">
                  <label className="text-xs text-gray-500 mr-2 w-12">Sekcja:</label>
                  <input 
                    type="text" 
                    className="border rounded-md px-3 py-1 text-sm w-1/4"
                    placeholder="Puste pole ukryje nagłówek"
                    value={cvData.skills.technicalSectionTitle !== undefined ? cvData.skills.technicalSectionTitle : "Techniczne"}
                    onChange={(e) => {
                      setCvData({
                        ...cvData,
                        skills: {
                          ...cvData.skills,
                          technicalSectionTitle: e.target.value
                        }
                      });
                    }}
                  />
                  <span className="ml-2 text-xs text-gray-500">Usuń aby pozostawić bez nagłówka</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <div className="flex-grow">
                <input
                  type="text"
                  value={newTechnicalSkill}
                  onChange={(e) => setNewTechnicalSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnicalSkill();
                    }
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Dodaj umiejętność techniczną (np. JavaScript, React, itp.)"
                />
              </div>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
                onClick={addTechnicalSkill}
              >
                Dodaj
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {cvData.skills.technical.map((skill, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-r from-[#00B2FF]/20 to-blue-600/20 border border-blue-200 rounded-full px-3 py-1 flex items-center"
                >
                  <span className="text-sm text-gray-800">{skill}</span>
                  <button 
                    className="ml-2 text-gray-500 hover:text-red-500"
                    onClick={() => removeTechnicalSkill(index)}
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-1">
              <button 
                onClick={toggleSoftSkills}
                className="focus:outline-none"
                title={cvData.skills.showSoftSkills ? "Ukryj umiejętności miękkie" : "Pokaż umiejętności miękkie"}
              >
                {cvData.skills.showSoftSkills ? (
                  <IoMdCheckboxOutline className="w-5 h-5 text-blue-500" />
                ) : (
                  <IoMdSquareOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <label className="ml-2 text-sm font-medium text-gray-700">Umiejętności miękkie</label>
              
              {/* Przycisk sugestii AI dla umiejętności miękkich */}
              {selectedJob && jobAnalysis && suggestedSkills.skills.length > 0 && (
                <div className="relative ml-auto">
                  <button
                    onClick={() => setShowSoftSuggestions(!showSoftSuggestions)}
                    className="flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    title="Sugestie AI"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Sugestie AI
                  </button>
                  
                  {/* Popover z sugestiami dla umiejętności miękkich */}
                  {showSoftSuggestions && (
                    <div 
                      ref={softPopoverRef}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">Sugerowane umiejętności</h5>
                          <button
                            onClick={() => setShowSoftSuggestions(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2 max-h-40 overflow-y-auto">
                          {suggestedSkills.skills.map((skill, index) => (
                            <div
                              key={index}
                              onClick={() => addSingleSuggestedSkill('soft', skill)}
                              className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded cursor-pointer hover:bg-green-100"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => addSuggestedSkills('soft')}
                          className="mt-2 w-full text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Dodaj wszystkie
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {cvData.skills.showSoftSkills && (
              <div className="ml-7 mb-2 space-y-2">
                <div className="flex items-center">
                  <label className="text-xs text-gray-500 mr-2 w-12">Sekcja:</label>
                  <input 
                    type="text" 
                    className="border rounded-md px-3 py-1 text-sm w-1/4"
                    placeholder="Puste pole ukryje nagłówek"
                    value={cvData.skills.softSectionTitle !== undefined ? cvData.skills.softSectionTitle : "Miękkie"}
                    onChange={(e) => {
                      setCvData({
                        ...cvData,
                        skills: {
                          ...cvData.skills,
                          softSectionTitle: e.target.value
                        }
                      });
                    }}
                  />
                  <span className="ml-2 text-xs text-gray-500">Usuń aby pozostawić bez nagłówka</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <div className="flex-grow">
                <input
                  type="text"
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSoftSkill();
                    }
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Dodaj umiejętność miękką (np. komunikatywność, praca zespołowa, itp.)"
                />
              </div>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white rounded-sm hover:from-blue-500 hover:to-blue-700 transition"
                onClick={addSoftSkill}
              >
                Dodaj
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {cvData.skills.soft.map((skill, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-r from-green-100 to-green-200 border border-green-200 rounded-full px-3 py-1 flex items-center"
                >
                  <span className="text-sm text-gray-800">{skill}</span>
                  <button 
                    className="ml-2 text-gray-500 hover:text-red-500"
                    onClick={() => removeSoftSkill(index)}
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Języki obce</label>
              
              {/* Przycisk sugestii AI dla języków */}
              {selectedJob && jobAnalysis && suggestedSkills.languages.length > 0 && (
                <div className="relative ml-auto">
                  <button
                    onClick={() => setShowLanguageSuggestions(!showLanguageSuggestions)}
                    className="flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                    title="Sugestie AI"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Sugestie AI
                  </button>
                  
                  {/* Popover z sugestiami dla języków */}
                  {showLanguageSuggestions && (
                    <div 
                      ref={languagePopoverRef}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">Sugerowane języki</h5>
                          <button
                            onClick={() => setShowLanguageSuggestions(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2 max-h-40 overflow-y-auto">
                          {suggestedSkills.languages.map((language, index) => (
                            <div
                              key={index}
                              onClick={() => addSingleSuggestedLanguage(language)}
                              className="text-xs bg-purple-50 text-purple-800 px-2 py-1 rounded cursor-pointer hover:bg-purple-100"
                            >
                              {language}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => addSuggestedSkills('languages')}
                          className="mt-2 w-full text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                        >
                          Dodaj wszystkie
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              {cvData.skills.languages.map((lang, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                  <input 
                    type="text" 
                    className="border rounded-md px-3 py-2" 
                    placeholder="Język"
                    value={lang.language}
                    onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                  />
                  <select 
                    className="border rounded-md px-3 py-2"
                    value={lang.level}
                    onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                  >
                    <option value="">Wybierz poziom</option>
                    <option value="A1 - Początkujący">A1 - Początkujący</option>
                    <option value="A2 - Podstawowy">A2 - Podstawowy</option>
                    <option value="B1 - Intermediate">B1 - Średniozaawansowany</option>
                    <option value="B2 - Wyższy średniozaawansowany">B2 - Wyższy średniozaawansowany</option>
                    <option value="C1 - Zaawansowany">C1 - Zaawansowany</option>
                    <option value="C2 - Biegły">C2 - Biegły</option>
                  </select>
                </div>
              ))}
              <button 
                className="w-full border-dashed border border-gray-300 rounded py-1 text-sm text-gray-500 hover:bg-gray-50 transition"
                onClick={addLanguage}
              >
                + Dodaj kolejny język
              </button>
            </div>
          </div>
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

export default SkillsSection; 