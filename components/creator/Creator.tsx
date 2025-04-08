"use client";

import React, { useState } from 'react';
import { mockApplications } from '@/components/saved/mockData';
import { useCV } from './CVContext';

// Komponent dla lewej strony - kreator
export default function Creator() {
  // Używamy kontekstu CV
  const {
    cvData,
    setCvData,
    selectedJob,
    setSelectedJob,
    selectedTemplate,
    setSelectedTemplate,
    activeSection,
    setActiveSection
  } = useCV();
  
  // Dostępne szablony CV
  const templates = [
    { id: 'nowoczesny', name: 'Nowoczesny' },
    { id: 'klasyczny', name: 'Klasyczny' },
    { id: 'kreatywny', name: 'Kreatywny' },
  ];

  // Funkcja do aktualizacji danych osobowych
  const updatePersonalData = (field: string, value: string) => {
    setCvData({
      ...cvData,
      personalData: {
        ...cvData.personalData,
        [field]: value
      }
    });
  };

  // Funkcja do aktualizacji doświadczenia
  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExperience = [...cvData.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    
    setCvData({
      ...cvData,
      experience: updatedExperience
    });
  };

  // Funkcja do dodawania nowego doświadczenia
  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [
        ...cvData.experience,
        {
          position: '',
          company: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });
  };

  // Funkcja do aktualizacji wykształcenia
  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...cvData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    setCvData({
      ...cvData,
      education: updatedEducation
    });
  };

  // Funkcja do dodawania nowego wykształcenia
  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [
        ...cvData.education,
        {
          school: '',
          degree: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });
  };

  // Funkcja do aktualizacji umiejętności technicznych
  const updateTechnicalSkills = (value: string) => {
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        technical: value.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
      }
    });
  };

  // Funkcja do aktualizacji umiejętności miękkich
  const updateSoftSkills = (value: string) => {
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        soft: value.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
      }
    });
  };

  // Funkcja do aktualizacji języków
  const updateLanguage = (index: number, field: string, value: string) => {
    const updatedLanguages = [...cvData.skills.languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    };
    
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        languages: updatedLanguages
      }
    });
  };

  // Funkcja do dodawania nowego języka
  const addLanguage = () => {
    setCvData({
      ...cvData,
      skills: {
        ...cvData.skills,
        languages: [
          ...cvData.skills.languages,
          { language: '', level: '' }
        ]
      }
    });
  };
  
  // Funkcja do renderowania odpowiedniej sekcji
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'jobSelection':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Wybierz ofertę pracy</h3>
            <p className="text-gray-600 mb-4">Wybierz ofertę, pod którą chcesz dostosować swoje CV</p>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-2">
              {mockApplications.map(job => (
                <div 
                  key={job.id} 
                  className={`p-3 mb-2 rounded cursor-pointer hover:bg-gray-100 transition ${selectedJob?.id === job.id ? 'bg-blue-50 border border-blue-300' : 'bg-white border'}`}
                  onClick={() => setSelectedJob(job)}
                >
                  <h4 className="font-medium">{job.position}</h4>
                  <p className="text-sm text-gray-600">{job.company}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                disabled={!selectedJob}
                onClick={() => setActiveSection('templateSelection')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
      
      case 'templateSelection':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Wybierz szablon CV</h3>
            <p className="text-gray-600 mb-4">Wybierz szablon, który najlepiej pasuje do Twojego profilu</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <div 
                  key={template.id} 
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="h-32 mb-2 bg-gray-200 rounded flex items-center justify-center">
                    {/* Tutaj później dodamy podgląd szablonu */}
                    <span>Podgląd szablonu {template.name}</span>
                  </div>
                  <p className="font-medium text-center">{template.name}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('jobSelection')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setActiveSection('personalData')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'personalData':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Dane osobowe</h3>
            <p className="text-gray-600 mb-4">Wprowadź swoje podstawowe dane kontaktowe</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź imię"
                  value={cvData.personalData.firstName}
                  onChange={(e) => updatePersonalData('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź nazwisko"
                  value={cvData.personalData.lastName}
                  onChange={(e) => updatePersonalData('lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź email"
                  value={cvData.personalData.email}
                  onChange={(e) => updatePersonalData('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input 
                  type="tel" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź numer telefonu"
                  value={cvData.personalData.phone}
                  onChange={(e) => updatePersonalData('phone', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Wprowadź adres"
                  value={cvData.personalData.address}
                  onChange={(e) => updatePersonalData('address', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('templateSelection')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setActiveSection('experience')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Doświadczenie zawodowe</h3>
            <p className="text-gray-600 mb-4">Dodaj informacje o swoim doświadczeniu zawodowym</p>
            
            {cvData.experience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stanowisko</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Wprowadź nazwę stanowiska"
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="Wprowadź nazwę firmy"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data rozpoczęcia</label>
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data zakończenia</label>
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opis obowiązków</label>
                  <textarea 
                    className="w-full border rounded-md px-3 py-2 h-24" 
                    placeholder="Opisz swoje obowiązki i osiągnięcia"
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
            
            <button 
              className="w-full border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
              onClick={addExperience}
            >
              + Dodaj kolejne doświadczenie
            </button>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('personalData')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setActiveSection('education')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Wykształcenie</h3>
            <p className="text-gray-600 mb-4">Dodaj informacje o swoim wykształceniu</p>
            
            {cvData.education.map((edu, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 mb-4">
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
                    <input 
                      type="month" 
                      className="w-full border rounded-md px-3 py-2"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dodatkowe informacje</label>
                  <textarea 
                    className="w-full border rounded-md px-3 py-2 h-24" 
                    placeholder="Np. średnia ocen, ważne projekty, osiągnięcia"
                    value={edu.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
            
            <button 
              className="w-full border-dashed border-2 border-gray-300 rounded-lg py-3 text-gray-500 hover:bg-gray-50 transition"
              onClick={addEducation}
            >
              + Dodaj kolejne wykształcenie
            </button>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('experience')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setActiveSection('skills')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'skills':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Umiejętności</h3>
            <p className="text-gray-600 mb-4">Dodaj swoje umiejętności istotne dla wybranej oferty pracy</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Umiejętności techniczne</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Np. Java, Python, SQL (rozdziel przecinkami)"
                  value={cvData.skills.technical.join(', ')}
                  onChange={(e) => updateTechnicalSkills(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Umiejętności miękkie</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder="Np. praca w zespole, komunikacja (rozdziel przecinkami)"
                  value={cvData.skills.soft.join(', ')}
                  onChange={(e) => updateSoftSkills(e.target.value)}
                />
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
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('education')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setActiveSection('summary')}
              >
                Dalej
              </button>
            </div>
          </div>
        );
        
      case 'summary':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Podsumowanie</h3>
            <p className="text-gray-600 mb-4">Sprawdź wszystkie wprowadzone informacje</p>
            
            {selectedJob && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium">Wybrana oferta pracy:</p>
                <p><span className="font-medium">{selectedJob.position}</span> - {selectedJob.company}</p>
              </div>
            )}
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium">Wybrany szablon:</p>
              <p>{templates.find(t => t.id === selectedTemplate)?.name}</p>
            </div>
            
            <div className="border rounded-lg divide-y">
              <div className="p-3 flex justify-between items-center">
                <span>Dane osobowe</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('personalData')}
                >
                  Edytuj
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>Doświadczenie</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('experience')}
                >
                  Edytuj
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>Wykształcenie</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('education')}
                >
                  Edytuj
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>Umiejętności</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveSection('skills')}
                >
                  Edytuj
                </button>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                onClick={() => setActiveSection('skills')}
              >
                Wstecz
              </button>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Generuj CV
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className=" bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Kreator CV</h2>
      
      {/* Pasek postępu */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className={activeSection === 'jobSelection' ? 'font-semibold text-blue-600' : ''}>Wybór oferty</span>
          <span className={activeSection === 'templateSelection' ? 'font-semibold text-blue-600' : ''}>Szablon</span>
          <span className={activeSection === 'personalData' ? 'font-semibold text-blue-600' : ''}>Dane osobowe</span>
          <span className={activeSection === 'experience' ? 'font-semibold text-blue-600' : ''}>Doświadczenie</span>
          <span className={activeSection === 'education' ? 'font-semibold text-blue-600' : ''}>Wykształcenie</span>
          <span className={activeSection === 'skills' ? 'font-semibold text-blue-600' : ''}>Umiejętności</span>
          <span className={activeSection === 'summary' ? 'font-semibold text-blue-600' : ''}>Podsumowanie</span>
        </div>
        <div className=" bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: `${
                activeSection === 'jobSelection' ? '14.28%' : 
                activeSection === 'templateSelection' ? '28.56%' : 
                activeSection === 'personalData' ? '42.84%' : 
                activeSection === 'experience' ? '57.12%' : 
                activeSection === 'education' ? '71.4%' : 
                activeSection === 'skills' ? '85.68%' : 
                '100%'
              }`
            }}
          />
        </div>
      </div>
      
      {/* Zawartość aktywnej sekcji */}
      {renderActiveSection()}
    </div>
  );
};