import React from 'react';
import { IoClose } from "react-icons/io5";
import { CVData, useCV } from '../CVContext';

interface PersonalDataSectionProps {
  cvData: CVData;
  updatePersonalData: (field: string, value: string) => void;
  selectedJob: any; // Dostosuj typ do faktycznej struktury selectedJob
  setSelectedJob: (job: any) => void;
  onBack: () => void;
  onNext: () => void;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  cvData,
  updatePersonalData,
  selectedJob,
  setSelectedJob,
  onBack,
  onNext
}) => {
  const { saveCV, isSaving } = useCV();
  
  return (
    <div className="flex flex-col h-full ">
      <div className="p-4 ml-6">
        <h3 className="text-lg font-semibold mb-2">Dane osobowe</h3>
        <p className="text-gray-600 mb-4">Wprowadź swoje podstawowe dane kontaktowe</p>
        
        {/* Informacja o wybranym stanowisku z możliwością edycji/usunięcia */}
        {selectedJob && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-700">Informacja o aplikowanym stanowisku:</h4>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                title="Usuń wybrane stanowisko"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stanowisko</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm" 
                  value={selectedJob.title}
                  onChange={(e) => {
                    // Tworzymy kopię obiektu i aktualizujemy tytuł
                    const updatedJob = {...selectedJob, title: e.target.value};
                    setSelectedJob(updatedJob);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Firma</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm" 
                  value={selectedJob.company}
                  onChange={(e) => {
                    // Tworzymy kopię obiektu i aktualizujemy firmę
                    const updatedJob = {...selectedJob, company: e.target.value};
                    setSelectedJob(updatedJob);
                  }}
                />
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Ta informacja będzie widoczna w nagłówku Twojego CV. Możesz ją edytować lub usunąć.
            </div>
          </div>
        )}
        
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

export default PersonalDataSection; 