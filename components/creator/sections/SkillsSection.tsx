import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { Sparkles } from "lucide-react";
import { CVData, useCV } from '../CVContext';

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const suggestedSkills = {
    technical: jobAnalysis?.technologies || [],
    skills: jobAnalysis?.skills || [],
    languages: jobAnalysis?.languages || []
  };
  
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

        {selectedJob && jobAnalysis && (
          <div className="mb-6 border border-blue-200 bg-blue-50 rounded-md p-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-blue-800">
                Sugerowane umiejętności na podstawie oferty {selectedJob.title}
              </h4>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-blue-600 text-sm"
              >
                {showSuggestions ? 'Ukryj' : 'Pokaż'} sugestie
              </button>
            </div>
            
            {showSuggestions && (
              <div className="mt-3 space-y-4">
                {suggestedSkills.technical.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">Sugerowane umiejętności techniczne:</h5>
                      <button
                        onClick={() => addSuggestedSkills('technical')}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Dodaj wszystkie
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {suggestedSkills.technical.map((skill, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {suggestedSkills.skills.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">Sugerowane umiejętności miękkie:</h5>
                      <button
                        onClick={() => addSuggestedSkills('soft')}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Dodaj wszystkie
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {suggestedSkills.skills.map((skill, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {suggestedSkills.languages.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">Sugerowane języki:</h5>
                      <button
                        onClick={() => addSuggestedSkills('languages')}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Dodaj wszystkie
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {suggestedSkills.languages.map((lang, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Umiejętności techniczne</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Umiejętności miękkie</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Języki obce</label>
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
                    <option value="A1">A1 - Początkujący</option>
                    <option value="A2">A2 - Podstawowy</option>
                    <option value="B1">B1 - Średniozaawansowany</option>
                    <option value="B2">B2 - Wyższy średniozaawansowany</option>
                    <option value="C1">C1 - Zaawansowany</option>
                    <option value="C2">C2 - Biegły</option>
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