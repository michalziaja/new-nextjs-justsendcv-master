import React, { useEffect, useState, useRef } from 'react';
import { IoClose } from "react-icons/io5";
import { CVData, useCV } from '../CVContext';
import { FaLinkedin, FaGithub, FaGlobe, FaTwitter, FaFacebook, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake } from "react-icons/fa";
import { IoMdCheckboxOutline, IoMdSquareOutline } from "react-icons/io";
import { FaUser, FaShareAlt, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

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
  // Stan do kontrolowania modalu potwierdzającego
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Stan do kontrolowania widoczności wieku w CV
  const [showAge, setShowAge] = useState(cvData.personalData.showAgeInCV || false);
  // Stany do kontrolowania widoczności danych kontaktowych w CV
  const [showEmail, setShowEmail] = useState(cvData.personalData.showEmailInCV !== false); // Domyślnie true
  const [showPhone, setShowPhone] = useState(cvData.personalData.showPhoneInCV !== false); // Domyślnie true
  const [showAddress, setShowAddress] = useState(cvData.personalData.showAddressInCV !== false); // Domyślnie true
  
  // Nowe stany do obsługi edycji linków społecznościowych
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [editType, setEditType] = useState('');
  const [editUrl, setEditUrl] = useState('');
  
  // Stany do obsługi edycji danych kontaktowych
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editAddress, setEditAddress] = useState('');
  
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
    // Synchronizuj stan widoczności wieku w CV - konwertuj string na boolean
    if (cvData.personalData.showAgeInCV !== undefined) {
      setShowAge(String(cvData.personalData.showAgeInCV).toLowerCase() === 'true');
    }
    // Synchronizuj stan widoczności email w CV - konwertuj string na boolean
    if (cvData.personalData.showEmailInCV !== undefined) {
      setShowEmail(String(cvData.personalData.showEmailInCV).toLowerCase() !== 'false');
    }
    // Synchronizuj stan widoczności telefonu w CV - konwertuj string na boolean  
    if (cvData.personalData.showPhoneInCV !== undefined) {
      setShowPhone(String(cvData.personalData.showPhoneInCV).toLowerCase() !== 'false');
    }
    // Synchronizuj stan widoczności adresu w CV - konwertuj string na boolean
    if (cvData.personalData.showAddressInCV !== undefined) {
      setShowAddress(String(cvData.personalData.showAddressInCV).toLowerCase() !== 'false');
    }
  }, [cvData.personalData, cvData.showJobTitleInCV]);

  // Funkcja obliczająca wiek na podstawie roku urodzenia
  const calculateAge = (birthYear: string): number => {
    const currentYear = new Date().getFullYear();
    const birth = parseInt(birthYear);
    return isNaN(birth) ? 0 : currentYear - birth;
  };
  
  // Funkcja rozpoczynająca edycję linku
  const startEditingLink = (index: number) => {
    const link = socialLinks[index];
    setEditingLinkIndex(index);
    setEditType(link.type);
    setEditUrl(link.url);
  };

  // Funkcja zapisująca zmiany w linku
  const saveEditedLink = () => {
    if (editingLinkIndex === null) return;
    
    const updatedLinks = [...socialLinks];
    updatedLinks[editingLinkIndex] = {
      ...updatedLinks[editingLinkIndex],
      type: editType.trim(),
      url: editUrl.trim()
    };
    
    setSocialLinks(updatedLinks);
    updatePersonalData('socialLinks', JSON.stringify(updatedLinks));
    
    // Resetuj stan edycji
    setEditingLinkIndex(null);
    setEditType('');
    setEditUrl('');
    
    // Automatyczny zapis CV
    saveCV(true);
  };

  // Funkcja anulująca edycję
  const cancelEditingLink = () => {
    setEditingLinkIndex(null);
    setEditType('');
    setEditUrl('');
  };

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
  
  // Funkcja obsługująca przycisk Wstecz
  const handleBack = () => {
    // Pokaż modal potwierdzający zamiast bezpośredniego powrotu
    setShowConfirmModal(true);
  };
  
  // Funkcja obsługująca potwierdzenie w modalu
  const handleConfirm = () => {
    // Ukryj modal i wywołaj funkcję powrotu
    setShowConfirmModal(false);
    onBack();
  };
  
  // Funkcja obsługująca anulowanie w modalu
  const handleCancel = () => {
    // Ukryj modal
    setShowConfirmModal(false);
  };

  // Funkcje do obsługi edycji danych kontaktowych
  const startEditingField = (field: string) => {
    setEditingField(field);
    switch (field) {
      case 'firstName':
        setEditFirstName(cvData.personalData.firstName);
        break;
      case 'lastName':
        setEditLastName(cvData.personalData.lastName);
        break;
      case 'email':
        setEditEmail(cvData.personalData.email);
        break;
      case 'phone':
        setEditPhone(cvData.personalData.phone);
        break;
      case 'age':
        setEditAge(cvData.personalData.age || '');
        break;
      case 'address':
        setEditAddress(cvData.personalData.address);
        break;
    }
  };

  const saveEditedField = () => {
    if (editingField === null) return;
    
    let newValue = '';
    switch (editingField) {
      case 'firstName':
        newValue = editFirstName.trim();
        break;
      case 'lastName':
        newValue = editLastName.trim();
        break;
      case 'email':
        newValue = editEmail.trim();
        break;
      case 'phone':
        newValue = editPhone.trim();
        break;
      case 'age':
        newValue = editAge.trim();
        break;
      case 'address':
        newValue = editAddress.trim();
        break;
    }
    
    updatePersonalData(editingField, newValue);
    
    // Resetuj stan edycji
    setEditingField(null);
    setEditFirstName('');
    setEditLastName('');
    setEditEmail('');
    setEditPhone('');
    setEditAge('');
    setEditAddress('');
    
    // Automatyczny zapis CV
    saveCV(true);
  };

  const cancelEditingField = () => {
    setEditingField(null);
    setEditFirstName('');
    setEditLastName('');
    setEditEmail('');
    setEditPhone('');
    setEditAge('');
    setEditAddress('');
  };

  return (
    <div className="flex flex-col h-full ">
      {/* Modal potwierdzający zakończenie kreatora - wyświetlany, gdy showConfirmModal jest true */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-3">Czy na pewno chcesz zakończyć kreator?</h3>
            <p className="text-gray-600 mb-4">
              Powrót do ekranu startowego spowoduje utratę wszystkich niezapisanych zmian. 
              Czy chcesz kontynuować?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition"
                onClick={handleCancel}
              >
                Anuluj
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                onClick={handleConfirm}
              >
                Zakończ kreator
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 ml-6 -mt-2">
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
                className="mr-2 h-2 w-2 text-blue-600 border-gray-300 rounded"
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-6">
          {/* Imię */}
          <div className={`flex items-center border rounded-md p-2 hover:bg-gray-50 transition-all`}>
            {/* Checkbox nieaktywny - imię jest zawsze wyświetlane */}
            <button
              type="button"
              className="mr-2 focus:outline-none cursor-not-allowed opacity-50"
              title="Imię jest zawsze wyświetlane w CV"
              disabled
            >
              <IoMdCheckboxOutline className="w-6 h-6 text-gray-400" />
            </button>
            
            {/* Zawartość lub formularz edycji */}
            <div className="flex-1">
              {editingField === 'firstName' ? (
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="Wprowadź imię"
                  className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-sm font-medium">{cvData.personalData.firstName || 'Wprowadź imię'}</div>
              )}
            </div>

            {/* Ikonka edycji po prawej stronie */}
            <div className="ml-2">
              {editingField === 'firstName' ? (
                <div className="flex">
                  <button 
                    type="button"
                    onClick={saveEditedField}
                    className="mr-1 p-1 text-green-600 hover:text-green-800 focus:outline-none"
                    title="Zapisz zmiany"
                  >
                    <FaCheck className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={cancelEditingField}
                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                    title="Anuluj edycję"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => startEditingField('firstName')}
                  className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                  title="Edytuj imię"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Nazwisko */}
          <div className={`flex items-center border rounded-md p-2 hover:bg-gray-50 transition-all`}>
            {/* Checkbox nieaktywny - nazwisko jest zawsze wyświetlane */}
            <button
              type="button"
              className="mr-2 focus:outline-none cursor-not-allowed opacity-50"
              title="Nazwisko jest zawsze wyświetlane w CV"
              disabled
            >
              <IoMdCheckboxOutline className="w-6 h-6 text-gray-400" />
            </button>
            
            {/* Zawartość lub formularz edycji */}
            <div className="flex-1">
              {editingField === 'lastName' ? (
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="Wprowadź nazwisko"
                  className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-sm font-medium">{cvData.personalData.lastName || 'Wprowadź nazwisko'}</div>
              )}
            </div>

            {/* Ikonka edycji po prawej stronie */}
            <div className="ml-2">
              {editingField === 'lastName' ? (
                <div className="flex">
                  <button 
                    type="button"
                    onClick={saveEditedField}
                    className="mr-1 p-1 text-green-600 hover:text-green-800 focus:outline-none"
                    title="Zapisz zmiany"
                  >
                    <FaCheck className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={cancelEditingField}
                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                    title="Anuluj edycję"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => startEditingField('lastName')}
                  className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                  title="Edytuj nazwisko"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Email */}
          <div className={`flex items-center border rounded-md p-2 hover:bg-gray-50 transition-all`}>
            {/* Checkbox do wyświetlania email w CV */}
            <button
              type="button"
              onClick={() => {
                const newValue = !showEmail;
                setShowEmail(newValue);
                updatePersonalData('showEmailInCV', newValue.toString());
                // Automatyczny zapis CV po zmianie
                saveCV(true);
              }}
              className="mr-2 focus:outline-none"
              title={showEmail ? "Ukryj email w CV" : "Pokaż email w CV"}
            >
              {showEmail ? (
                <IoMdCheckboxOutline className="w-6 h-6 text-blue-500" />
              ) : (
                <IoMdSquareOutline className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {/* Ikona email */}
            <div className="mr-3">
              <FaEnvelope className="text-blue-600" />
            </div>
            
            {/* Zawartość lub formularz edycji */}
            <div className="flex-1">
              {editingField === 'email' ? (
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Wprowadź email"
                  className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-xs text-gray-500 truncate">{cvData.personalData.email || 'Wprowadź email'}</div>
              )}
            </div>

            {/* Ikonka edycji po prawej stronie */}
            <div className="ml-2">
              {editingField === 'email' ? (
                <div className="flex">
                  <button 
                    type="button"
                    onClick={saveEditedField}
                    className="mr-1 p-1 text-green-600 hover:text-green-800 focus:outline-none"
                    title="Zapisz zmiany"
                  >
                    <FaCheck className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={cancelEditingField}
                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                    title="Anuluj edycję"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => startEditingField('email')}
                  className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                  title="Edytuj email"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Telefon */}
          <div className={`flex items-center border rounded-md p-2 hover:bg-gray-50 transition-all`}>
            {/* Checkbox do wyświetlania telefonu w CV */}
            <button
              type="button"
              onClick={() => {
                const newValue = !showPhone;
                setShowPhone(newValue);
                updatePersonalData('showPhoneInCV', newValue.toString());
                // Automatyczny zapis CV po zmianie
                saveCV(true);
              }}
              className="mr-2 focus:outline-none"
              title={showPhone ? "Ukryj telefon w CV" : "Pokaż telefon w CV"}
            >
              {showPhone ? (
                <IoMdCheckboxOutline className="w-6 h-6 text-blue-500" />
              ) : (
                <IoMdSquareOutline className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {/* Ikona telefonu */}
            <div className="mr-3">
              <FaPhone className="text-green-600" />
            </div>
            
            {/* Zawartość lub formularz edycji */}
            <div className="flex-1">
              {editingField === 'phone' ? (
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Wprowadź numer telefonu"
                  className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-xs text-gray-500 truncate">{cvData.personalData.phone || 'Wprowadź numer telefonu'}</div>
              )}
            </div>

            {/* Ikonka edycji po prawej stronie */}
            <div className="ml-2">
              {editingField === 'phone' ? (
                <div className="flex">
                  <button 
                    type="button"
                    onClick={saveEditedField}
                    className="mr-1 p-1 text-green-600 hover:text-green-800 focus:outline-none"
                    title="Zapisz zmiany"
                  >
                    <FaCheck className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={cancelEditingField}
                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                    title="Anuluj edycję"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => startEditingField('phone')}
                  className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                  title="Edytuj telefon"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Wiek */}
          <div className={`flex items-center border rounded-md p-2 hover:bg-gray-50 transition-all`}>
            {/* Checkbox do wyświetlania wieku w CV - wyświetlany tylko gdy jest wprowadzony rok */}
            {cvData.personalData.age ? (
              <button
                type="button"
                onClick={() => {
                  const newValue = !showAge;
                  setShowAge(newValue);
                  updatePersonalData('showAgeInCV', newValue.toString());
                  // Automatyczny zapis CV po zmianie
                  saveCV(true);
                }}
                className="mr-2 focus:outline-none"
                title={showAge ? "Ukryj wiek w CV" : "Pokaż wiek w CV"}
              >
                {showAge ? (
                  <IoMdCheckboxOutline className="w-6 h-6 text-blue-500" />
                ) : (
                  <IoMdSquareOutline className="w-6 h-6 text-gray-400" />
                )}
              </button>
            ) : (
              <div className="mr-2 w-6 h-6"></div>
            )}

            {/* Ikona wieku */}
            <div className="mr-3">
              <FaBirthdayCake className="text-pink-600" />
            </div>
            
            {/* Zawartość lub formularz edycji */}
            <div className="flex-1">
              {editingField === 'age' ? (
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  placeholder="np. 1990"
                  className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-xs text-gray-500 truncate">{cvData.personalData.age || 'np. 1990'}</div>
              )}
            </div>

            {/* Ikonka edycji po prawej stronie */}
            <div className="ml-2">
              {editingField === 'age' ? (
                <div className="flex">
                  <button 
                    type="button"
                    onClick={saveEditedField}
                    className="mr-1 p-1 text-green-600 hover:text-green-800 focus:outline-none"
                    title="Zapisz zmiany"
                  >
                    <FaCheck className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={cancelEditingField}
                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                    title="Anuluj edycję"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => startEditingField('age')}
                  className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                  title="Edytuj wiek"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Adres */}
          <div className={`flex items-center border rounded-md p-2 hover:bg-gray-50 transition-all`}>
            {/* Checkbox do wyświetlania adresu w CV */}
            <button
              type="button"
              onClick={() => {
                const newValue = !showAddress;
                setShowAddress(newValue);
                updatePersonalData('showAddressInCV', newValue.toString());
                // Automatyczny zapis CV po zmianie
                saveCV(true);
              }}
              className="mr-2 focus:outline-none"
              title={showAddress ? "Ukryj adres w CV" : "Pokaż adres w CV"}
            >
              {showAddress ? (
                <IoMdCheckboxOutline className="w-6 h-6 text-blue-500" />
              ) : (
                <IoMdSquareOutline className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {/* Ikona adresu */}
            <div className="mr-3">
              <FaMapMarkerAlt className="text-red-600" />
            </div>
            
            {/* Zawartość lub formularz edycji */}
            <div className="flex-1">
              {editingField === 'address' ? (
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Wprowadź adres"
                  className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-xs text-gray-500 truncate">{cvData.personalData.address || 'Wprowadź adres'}</div>
              )}
            </div>

            {/* Ikonka edycji po prawej stronie */}
            <div className="ml-2">
              {editingField === 'address' ? (
                <div className="flex">
                  <button 
                    type="button"
                    onClick={saveEditedField}
                    className="mr-1 p-1 text-green-600 hover:text-green-800 focus:outline-none"
                    title="Zapisz zmiany"
                  >
                    <FaCheck className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={cancelEditingField}
                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                    title="Anuluj edycję"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => startEditingField('address')}
                  className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                  title="Edytuj adres"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sekcja linków społecznościowych */}
        {socialLinks.length > 0 && (
          <div className="mt-10">
            <h4 className="text-lg font-semibold mb-0 flex items-center">
              <FaShareAlt className="mr-2 text-blue-500" /> Linki społecznościowe
            </h4>
            <p className="text-gray-600 mb-4 text-sm">Wybierz, które linki chcesz uwzględnić w swoim CV i edytuj je według potrzeb</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-6">
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
                      <IoMdCheckboxOutline className="w-6 h-6 text-blue-500" />
                    ) : (
                      <IoMdSquareOutline className="w-6 h-6 text-gray-400" />
                    )}
                  </button>

                  {/* Ikona typu linku */}
                  <div className="mr-3">
                    {getSocialIcon(editingLinkIndex === index ? editType : link.type)}
                  </div>
                  
                  {/* Informacje o linku lub formularz edycji */}
                  <div className="flex-1">
                    {editingLinkIndex === index ? (
                      <div className="space-y-2">
                        {/* Dla standardowych linków z profilu pokazujemy tylko pole URL */}
                        {['linkedin', 'github', 'portfolio', 'website', 'twitter', 'facebook', 'instagram'].includes(editType.toLowerCase()) ? (
                          <input
                            type="url"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="URL (np. https://linkedin.com/in/twojprofil)"
                            className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <>
                            <input
                              type="text"
                              value={editType}
                              onChange={(e) => setEditType(e.target.value)}
                              placeholder="Typ linku (np. LinkedIn, GitHub)"
                              className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="url"
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              placeholder="URL (np. https://linkedin.com/in/twojprofil)"
                              className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </>
                        )}
                      </div>
                    ) : (
                      <div>
                        {/* Sprawdzamy czy to standardowy link z profilu - jeśli tak, pokazujemy tylko URL */}
                        {['linkedin', 'github', 'portfolio', 'website', 'twitter', 'facebook', 'instagram'].includes(link.type.toLowerCase()) ? (
                          <div className="text-xs text-gray-500 truncate">{link.url}</div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium">{link.type}</div>
                            <div className="text-xs text-gray-500 truncate">{link.url}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ikonka edycji po prawej stronie */}
                  <div className="ml-2">
                    {editingLinkIndex === index ? (
                      <div className="flex">
                        <button 
                          type="button"
                          onClick={saveEditedLink}
                          className="mr-1 p-1 text-green-600 hover:text-green-800 focus:outline-none"
                          title="Zapisz zmiany"
                        >
                          <FaCheck className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={cancelEditingLink}
                          className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                          title="Anuluj edycję"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => startEditingLink(index)}
                        className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                        title="Edytuj link"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
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
                <IoMdCheckboxOutline className="w-6 h-6 text-blue-500" />
              ) : (
                <IoMdSquareOutline className="w-6 h-6 text-gray-400" />
              )}
              <span className="ml-2 text-lg font-semibold ">Dołącz zdjęcie do CV</span>

            </button>
          </div>
              <p className="text-sm mb-2 text-gray-500">
              Zaznacz checkboxy aby dodać zdjęcie do CV.
            </p>
          {includePhoto && (
            <div className="p-4 border rounded-md mr-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-2">
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
            onClick={handleBack}
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