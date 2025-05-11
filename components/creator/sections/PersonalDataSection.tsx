import React, { useEffect, useState, useRef } from 'react';
import { IoClose } from "react-icons/io5";
import { CVData, useCV } from '../CVContext';
import { FaLinkedin, FaGithub, FaGlobe, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";
import { IoMdCheckboxOutline, IoMdSquareOutline } from "react-icons/io";
import { FaUser, FaShareAlt } from "react-icons/fa";

interface PersonalDataSectionProps {
  cvData: CVData;
  updatePersonalData: (field: string, value: string) => void;
  selectedJob: any; // Dostosuj typ do faktycznej struktury selectedJob
  setSelectedJob: (job: any) => void;
  onBack: () => void;
  onNext: () => void;
}

// Interfejs dla linku społecznościowego
interface SocialLink {
  type: string;
  url: string;
  include: boolean;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  cvData,
  updatePersonalData,
  selectedJob,
  setSelectedJob,
  onBack,
  onNext
}) => {
  const { saveCV, isSaving, loadUserProfile, currentCVId } = useCV();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(cvData.personalData.socialLinks || []);
  
  // Stan do kontrolowania widoczności sekcji zdjęcia w formularzu
  const [includePhoto, setIncludePhoto] = useState(cvData.personalData.includePhotoInCV || false);
  // Stan do kontrolowania skali zdjęcia
  const [currentPhotoScale, setCurrentPhotoScale] = useState(cvData.personalData.photoScalePercent || 100);
  // Stan do kontrolowania zaokrąglenia rogów zdjęcia (wartość procentowa 0-50)
  const [currentBorderRadiusPercent, setCurrentBorderRadiusPercent] = useState(0);
  // Stan do śledzenia ostatnio zmienionego linku (dla efektu wizualnego)
  const [lastToggledLinkIndex, setLastToggledLinkIndex] = useState<number | null>(null);
  // Stan do kontrolowania widoczności adnotacji o stanowisku w CV
  const [showJobTitle, setShowJobTitle] = useState(cvData.showJobTitleInCV || false);
  
  const profileLoadedRef = useRef(false);

  // Pobierz dane profilu przy pierwszym renderowaniu, jeśli tworzymy nowe CV
  useEffect(() => {
    // Wywołaj loadUserProfile tylko jeśli tworzymy nowe CV (currentCVId jest null)
    // i profil nie został jeszcze załadowany w tej sesji komponentu.
    if (currentCVId === null && !profileLoadedRef.current) {
      console.log("PersonalDataSection: Ładowanie danych profilu dla nowego CV.");
      loadUserProfile();
      profileLoadedRef.current = true; // Oznacz, że profil został załadowany
    }
  }, [loadUserProfile, currentCVId]);

  // Efekt do synchronizacji stanów lokalnych z cvData (np. socialLinks, includePhoto itd.)
  useEffect(() => {
    if (cvData.personalData.socialLinks) {
      setSocialLinks(cvData.personalData.socialLinks);
    }
    // Synchronizuj stan checkboxa zdjęcia z danymi CV
    if (cvData.personalData.includePhotoInCV !== undefined) {
      // Poprawka: Konwertuj potencjalny string z kontekstu na boolean
      setIncludePhoto(String(cvData.personalData.includePhotoInCV).toLowerCase() === 'true');
    }
    // Synchronizuj stan skali zdjęcia z danymi CV
    if (cvData.personalData.photoScalePercent !== undefined) {
      setCurrentPhotoScale(cvData.personalData.photoScalePercent);
    }
    // Synchronizuj stan zaokrąglenia rogów zdjęcia z danymi CV
    if (cvData.personalData.photoBorderRadius !== undefined) {
      const radiusStr = cvData.personalData.photoBorderRadius;
      if (typeof radiusStr === 'string' && radiusStr.endsWith('%')) {
        const percentValue = parseInt(radiusStr.replace('%', ''));
        if (!isNaN(percentValue)) {
          setCurrentBorderRadiusPercent(Math.max(0, Math.min(50, percentValue)));
        }
      } else if (radiusStr === '0px' || radiusStr === '0' || Number(radiusStr) === 0) {
        setCurrentBorderRadiusPercent(0);
      }
    }
    // Synchronizuj stan widoczności adnotacji o stanowisku
    if (cvData.showJobTitleInCV !== undefined) {
      setShowJobTitle(cvData.showJobTitleInCV);
    }
  }, [cvData.personalData, cvData.showJobTitleInCV]);
  
  // Funkcja do zmiany stanu "include" dla linku społecznościowego
  const toggleSocialLinkInclude = (index: number) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      include: !updatedLinks[index].include
    };
    setSocialLinks(updatedLinks);
    
    // Aktualizacja danych personalnych w CV poprzez przekazanie nowej tablicy linków
    updatePersonalData('socialLinks', JSON.stringify(updatedLinks));
    
    // Ustaw indeks ostatnio przełączonego linku dla efektu wizualnego
    setLastToggledLinkIndex(index);
    
    // Zresetuj efekt wizualny po 1 sekundzie
    setTimeout(() => {
      setLastToggledLinkIndex(null);
    }, 1000);
    
    // Automatyczny zapis CV po zmianie linków
    saveCV(true);
  };
  
  // Funkcja pomocnicza zwracająca ikonę dla danego typu linku
  const getSocialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin className="text-blue-600" />;
      case 'github':
        return <FaGithub className="text-gray-800" />;
      case 'portfolio':
      case 'website':
        return <FaGlobe className="text-green-600" />;
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      case 'facebook':
        return <FaFacebook className="text-blue-700" />;
      case 'instagram':
        return <FaInstagram className="text-pink-600" />;
      default:
        return <FaGlobe className="text-gray-500" />;
    }
  };
  
  return (
    <div className="flex flex-col h-full ">
      <div className="p-4 ml-6 -mt-2">
        <h3 className="text-lg font-semibold mb-0 flex items-center">
          <FaUser className="mr-2 text-blue-500" /> Dane osobowe
        </h3>
        <p className="text-gray-600 mb-4 text-sm">Wprowadź swoje podstawowe dane kontaktowe</p>
        
        {/* Informacja o wybranym stanowisku z możliwością edycji/usunięcia */}
        {selectedJob && (
          <div className="mb-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-start ">
            
            
            </div>
            
            {/* Wyświetlanie w jednym rzędzie */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  className="w-2/3 border rounded-md px-3 py-2 text-sm" 
                  value={selectedJob.title}
                  onChange={(e) => {
                    // Tworzymy kopię obiektu i aktualizujemy tytuł
                    const updatedJob = {...selectedJob, title: e.target.value};
                    setSelectedJob(updatedJob);
                  }}
                />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  className="w-2/3 border rounded-md px-3 py-2 text-sm" 
                  value={selectedJob.company}
                  onChange={(e) => {
                    // Tworzymy kopię obiektu i aktualizujemy firmę
                    const updatedJob = {...selectedJob, company: e.target.value};
                    setSelectedJob(updatedJob);
                  }}
                />
              </div>
            </div>
            
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="showJobTitle"
                className="mr-2 h-3 w-3 text-blue-600 border-gray-300 rounded"
                checked={showJobTitle}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setShowJobTitle(newValue);
                  // Aktualizujemy parametr w CVData
                  const cvDataUpdate = {
                    ...cvData,
                    showJobTitleInCV: newValue
                  };
                  updatePersonalData('showJobTitleInCV', newValue.toString());
                }}
              />
              <label htmlFor="showJobTitle" className="text-sm text-gray-600">
                Pokaż informację o stanowisku w nagłówku CV
              </label>
            </div>
            
         
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-baseline">
            <label className="text-md font-medium text-gray-900 mr-3 whitespace-nowrap w-10">Imię</label>
            <input 
              type="text" 
              className="w-3/4 border text-sm rounded-md px-3 py-2" 
              placeholder="Wprowadź imię"
              value={cvData.personalData.firstName}
              onChange={(e) => updatePersonalData('firstName', e.target.value)}
            />
          </div>
          <div className="flex items-baseline">
            <label className="text-md font-medium text-gray-900 mr-10 whitespace-nowrap w-10">Nazwisko</label>
            <input 
              type="text" 
              className="w-4/6 border text-sm rounded-md px-3 py-2" 
              placeholder="Wprowadź nazwisko"
              value={cvData.personalData.lastName}
              onChange={(e) => updatePersonalData('lastName', e.target.value)}
            />
          </div>
          <div className="flex items-baseline">
            <label className="text-md font-medium text-gray-900 mr-3 whitespace-nowrap w-10">Email</label>
            <input 
              type="email" 
              className="w-3/4 border text-sm rounded-md px-3 py-2" 
              placeholder="Wprowadź email"
              value={cvData.personalData.email}
              onChange={(e) => updatePersonalData('email', e.target.value)}
            />
          </div>
          <div className="flex items-baseline">
            <label className="text-md font-medium text-gray-900 mr-10 whitespace-nowrap w-10">Telefon</label>
            <input 
              type="tel" 
              className="w-4/6 border text-sm rounded-md px-3 py-2" 
              placeholder="Wprowadź numer telefonu"
              value={cvData.personalData.phone}
              onChange={(e) => updatePersonalData('phone', e.target.value)}
            />
          </div>
          <div className="flex items-baseline">
            <label className="text-md font-medium text-gray-900 mr-3 whitespace-nowrap w-10">Adres</label>
            <input 
              type="text" 
              className="w-3/4 border text-sm rounded-md px-3 py-2" 
              placeholder="Wprowadź adres"
              value={cvData.personalData.address}
              onChange={(e) => updatePersonalData('address', e.target.value)}
            />
          </div>
        </div>
        
        {/* Sekcja linków społecznościowych */}
        {socialLinks.length > 0 && (
          <div className="mt-10">
            <h4 className="text-lg font-semibold mb-0 flex items-center">
              <FaShareAlt className="mr-2 text-blue-500" /> Linki społecznościowe
            </h4>
            <p className="text-gray-600 mb-4 text-sm">Wybierz, które linki chcesz uwzględnić w swoim CV</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {socialLinks.map((link, index) => (
                <div key={index} className={`flex items-center border rounded-md p-2 hover:bg-gray-50 transition-all ${
                  lastToggledLinkIndex === index ? 'bg-blue-50 border-blue-300' : ''
                }`}>
                  {/* Checkbox do uwzględnienia linku w CV */}
                  <button 
                    type="button"
                    onClick={() => toggleSocialLinkInclude(index)}
                    className="mr-2 focus:outline-none"
                    title={link.include ? "Kliknij, aby usunąć z CV" : "Kliknij, aby dodać do CV"}
                  >
                    {link.include ? (
                      <IoMdCheckboxOutline className="w-5 h-5 text-blue-500" />
                    ) : (
                      <IoMdSquareOutline className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {/* Ikona typu linku */}
                  <div className="mr-2">
                    {getSocialIcon(link.type)}
                  </div>
                  
                  {/* Informacje o linku */}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{link.type}</div>
                    <div className="text-xs text-gray-500 truncate">{link.url}</div>
                  </div>
                </div>
              ))}
            </div>
           
          </div>
        )}
        
        {/* Sekcja Zdjęcie Profilowe */}
        <div className="mt-10">
          {/* <h4 className="text-lg font-semibold mb-3">Zdjęcie profilowe</h4> */}
          <div className="flex items-center mb-0">
            <button
              type="button"
              onClick={() => {
                const newValue = !includePhoto;
                setIncludePhoto(newValue);
                updatePersonalData('includePhotoInCV', newValue.toString()); // Aktualizuj dane CV
              }}
              className="mr-2 focus:outline-none flex items-center"
              title={includePhoto ? "Ukryj opcje zdjęcia" : "Pokaż opcje zdjęcia"}
            >
              {includePhoto ? (
                <IoMdCheckboxOutline className="w-5 h-5 text-blue-500" />
              ) : (
                <IoMdSquareOutline className="w-5 h-5 text-gray-400" />
              )}
              <span className="ml-2 text-lg font-semibold ">Dołącz zdjęcie do CV</span>

            </button>
          </div>
              <p className="text-sm mb-2 text-gray-500">
              Zaznacz checkboxy aby dodać zdjęcie do CV.
            </p>
          {includePhoto && (
            <div className="p-4 border rounded-md ">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <label htmlFor="photoScaleRange" className="block text-sm text-gray-600 mb-1">Rozmiar ({currentPhotoScale}%):</label>
                  <input 
                    id="photoScaleRange"
                    type="range" 
                    min="100" 
                    max="200" 
                    step="5" 
                    value={currentPhotoScale}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    onChange={(e) => {
                      const newScale = parseInt(e.target.value);
                      setCurrentPhotoScale(newScale);
                      updatePersonalData('photoScalePercent', newScale.toString()); 
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="borderRadiusRange" className="block text-sm text-gray-600 mb-1">Zaokrąglenie ({currentBorderRadiusPercent}%):</label>
                  <input 
                    id="borderRadiusRange"
                    type="range" 
                    min="0" 
                    max="50" 
                    step="1" 
                    value={currentBorderRadiusPercent}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    onChange={(e) => {
                      const newRadiusPercent = parseInt(e.target.value);
                      setCurrentBorderRadiusPercent(newRadiusPercent);
                      updatePersonalData('photoBorderRadius', newRadiusPercent + '%');
                    }}
                  />
                </div>
              </div>
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

export default PersonalDataSection; 