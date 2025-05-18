"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Upload, Camera, UserCircle, X, Check, CropIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import imageCompression from 'browser-image-compression';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Funkcja do generowania przyciętego obrazu
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Funkcja do przycinania zdjęcia
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Ustawienie wymiarów płótna
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Rysowanie przyciętego obrazu na płótnie
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Konwersja płótna na Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Canvas is empty');
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

export default function ProfileAvatar() {
  // Stan dla błędów, uploadu itp.
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Stan dla przycinania zdjęcia
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Funkcja do pobierania avatara użytkownika
  const fetchUserAvatar = async () => {
    try {
      console.log("Rozpoczynam pobieranie avatara...");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Błąd: Nie znaleziono zalogowanego użytkownika");
        return;
      }
      
      console.log("Pobieranie danych profilu dla użytkownika:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Błąd pobierania profilu:", error);
        return;
      }
        
      if (data?.avatar) {
        console.log("Znaleziono avatar w profilu:", data.avatar);
        
        // Jeśli URL avatara jest już podpisanym URL (zawiera token)
        if (data.avatar.includes('token=')) {
          console.log('Avatar używa podpisanego URL');
          setAvatar(data.avatar);
        } else {
          // Spróbuj pobrać najnowsze pliki użytkownika
          const { data: files } = await supabase.storage
            .from('avatars')
            .list(user.id);
            
          if (files && files.length > 0) {
            // Sortuj pliki według czasu modyfikacji (od najnowszego)
            files.sort((a, b) => 
              new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
            );
            
            // Weź najnowszy plik
            const latestFile = files[0];
            const filePath = `${user.id}/${latestFile.name}`;
            
            console.log('Znaleziono najnowszy plik:', filePath);
            
            // Spróbuj stworzyć podpisany URL
            try {
              const { data: signedData, error: signedError } = await supabase.storage
                .from('avatars')
                .createSignedUrl(filePath, 60 * 60 * 24); // URL ważny przez 1 dzień
                
              if (signedData && !signedError) {
                console.log('Utworzono nowy podpisany URL dla avatara');
                // Aktualizuj profil z nowym URL
                await supabase
                  .from('profiles')
                  .update({ avatar: signedData.signedUrl })
                  .eq('user_id', user.id);
                  
                setAvatar(signedData.signedUrl);
                return;
              }
            } catch (signError) {
              console.error('Błąd podczas tworzenia podpisanego URL:', signError);
            }
          }
          
          // Jeśli wszystko zawiedzie, użyj oryginalnego URL
          setAvatar(data.avatar);
        }
      } else {
        console.log("Brak avatara w profilu");
        setAvatar(null);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania avatara:', error);
    }
  };
  
  // Funkcja do sprawdzania czy plik istnieje w storage
  const checkFileExists = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data: files, error } = await supabase.storage
        .from('avatars')
        .list(userId);
      
      if (error) {
        console.error("Błąd listowania plików w storage:", error);
        return;
      }
      
      console.log("Pliki w storage dla użytkownika:", userId, files);
    } catch (error) {
      console.error("Błąd sprawdzania plików:", error);
    }
  };
  
  // Pobieranie avatara użytkownika z Supabase
  React.useEffect(() => {
    fetchUserAvatar();
  }, []);
  
  // Obsługa uploadu pliku
  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      
      // Walidacja rozmiaru i typu pliku
      if (file.size > 5 * 1024 * 1024) {
        setError('Plik jest zbyt duży. Maksymalny rozmiar to 5MB.');
        return;
      }
      
      if (!file.type.match('image.*')) {
        setError('Wybrany plik nie jest obrazem.');
        return;
      }
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Nie znaleziono użytkownika. Zaloguj się ponownie.');
        return;
      }
      
      // Kompresja zdjęcia przed wysłaniem
      console.log('Rozpoczynam kompresję zdjęcia...');
      let fileToUpload = file;
      try {
        fileToUpload = await compressImage(file);
        console.log('Kompresja udana, nowy rozmiar:', fileToUpload.size);
      } catch (compressError) {
        console.warn('Błąd kompresji zdjęcia, używam oryginalnego pliku:', compressError);
      }
      
      // Używamy unikalnej nazwy pliku z timestampem, aby uniknąć problemów z cache
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const filePath = `${user.id}/photo_${timestamp}_${random}.jpg`;
      
      console.log('Przesyłanie pliku:', {
        bucket: 'avatars',
        path: filePath,
        size: fileToUpload.size,
        type: fileToUpload.type
      });
      
      // Najpierw usuń stare pliki, aby nie zaśmiecać bucketa
      try {
        const { data: filesList } = await supabase.storage
          .from('avatars')
          .list(user.id);
        
        console.log('Lista istniejących plików:', filesList);
        
        if (filesList && filesList.length > 0) {
          const filesToRemove = filesList.map(f => `${user.id}/${f.name}`);
          console.log('Usuwanie starych plików:', filesToRemove);
          
          await supabase.storage
            .from('avatars')
            .remove(filesToRemove);
        }
      } catch (listError) {
        console.warn('Nie udało się usunąć starych plików:', listError);
      }
      
      // Upload nowego pliku
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileToUpload, {
          upsert: true, // Zezwalamy na nadpisywanie istniejących plików
          contentType: 'image/jpeg' // Zawsze używamy image/jpeg
        });
        
      if (uploadError) {
        console.error('Szczegóły błędu uploadu:', uploadError);
        setError(`Błąd podczas przesyłania pliku: ${uploadError.message}`);
        return;
      }
      
      // Pobieranie publicznego URL z wymuszonym odświeżeniem cache
      let fileUrl = '';
      
      // Próba utworzenia podpisanego URL (dla bucketów prywatnych)
      try {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('avatars')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7); // URL ważny przez 7 dni
          
        if (signedUrlData && !signedUrlError) {
          fileUrl = signedUrlData.signedUrl;
          console.log('Utworzono podpisany URL:', fileUrl);
        } else {
          // Fallback do publicznego URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          fileUrl = publicUrl;
          console.log('Używam publicznego URL:', fileUrl);
        }
      } catch (urlError) {
        // Fallback do publicznego URL w przypadku błędu
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        fileUrl = publicUrl;
        console.log('Błąd przy tworzeniu podpisanego URL, używam publicznego:', fileUrl);
      }
      
      console.log('Plik przesłany pomyślnie, URL:', fileUrl);
        
      // Aktualizacja profilu użytkownika
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: fileUrl })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Błąd aktualizacji profilu:', updateError);
        setError('Błąd podczas aktualizacji profilu.');
        return;
      }
      
      // Odczekaj chwilę przed ustawieniem avatara, aby dać czas na propagację w CDN
      setTimeout(() => {
        console.log('Aktualizuję avatar w interfejsie:', fileUrl);
        setAvatar(fileUrl);
        setSuccess('Zdjęcie profilowe zostało zaktualizowane.');
        
        // Wymuszenie ponownego wyrenderowania avatara po kolejnych 2 sekundach
        setTimeout(() => {
          fetchUserAvatar();
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Nieoczekiwany błąd uploadu:', error);
      setError(`Wystąpił nieoczekiwany błąd. ${error instanceof Error ? error.message : 'Spróbuj ponownie.'}`);
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };
  
  // Funkcja do kompresji zdjęcia
  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Błąd podczas kompresji zdjęcia:', error);
      return file;
    }
  };
  
  // Obsługa usuwania avatara
  const removeAvatar = async () => {
    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Nie znaleziono użytkownika. Zaloguj się ponownie.');
        return;
      }
      
      // Usuwanie plików z magazynu (storage)
      try {
        const { data: filesList } = await supabase.storage
          .from('avatars')
          .list(user.id);
        
        if (filesList && filesList.length > 0) {
          const filesToRemove = filesList.map(f => `${user.id}/${f.name}`);
          console.log('Usuwanie plików ze storage:', filesToRemove);
          
          const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove(filesToRemove);
            
          if (removeError) {
            console.error('Błąd podczas usuwania plików ze storage:', removeError);
          }
        }
      } catch (storageError) {
        console.error('Błąd podczas dostępu do storage:', storageError);
      }
      
      // Aktualizacja profilu użytkownika - usunięcie avatara
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: null })
        .eq('user_id', user.id);
        
      if (updateError) {
        setError('Błąd podczas aktualizacji profilu.');
        console.error('Update error:', updateError);
        return;
      }
      
      setAvatar(null);
      setSuccess('Zdjęcie profilowe zostało usunięte.');
      
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
      setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
    } finally {
      setUploading(false);
    }
  };
  
  // Funkcja do otwierania croppera po wybraniu pliku
  const showCropper = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Funkcja do przygotowania pliku do uploadu
  const prepareFileForUpload = (file: File) => {
    // Zamiast bezpośredniego wysyłania, najpierw pokazujemy narzędzie do przycinania
    showCropper(file);
  };
  
  // Obsługa zakończenia przycinania
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  
  // Funkcja do zatwierdzenia przyciętego zdjęcia
  const handleCropConfirm = async () => {
    try {
      setUploading(true);
      
      if (!imageToCrop || !croppedAreaPixels) {
        console.error('Brak danych do przycinania');
        return;
      }
      
      // Przycinanie zdjęcia
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Konwersja Blob na File
      const croppedFile = new File([croppedImage], 'cropped-image.jpg', { 
        type: 'image/jpeg',
        lastModified: new Date().getTime()
      });
      
      // Zamknięcie okna przycinania
      setCropDialogOpen(false);
      setImageToCrop(null);
      
      // Wysłanie przyciętego zdjęcia
      await uploadAvatar(croppedFile);
      
    } catch (error) {
      console.error('Błąd podczas przycinania zdjęcia:', error);
      setError('Wystąpił błąd podczas przycinania zdjęcia.');
    } finally {
      setUploading(false);
    }
  };
  
  // Funkcja do anulowania przycinania
  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setImageToCrop(null);
    setUploading(false);
  };
  
  // Otwieranie okna wyboru pliku
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  
  // Obsługa zmiany pliku
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      prepareFileForUpload(e.target.files[0]);
    }
  };
  
  // Obsługa przeciągania plików
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Obsługa upuszczenia pliku
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      prepareFileForUpload(e.dataTransfer.files[0]);
    }
  }, []);
  
  return (
    <div className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Camera className="h-5 w-5 mr-2 text-blue-500" />
          Zdjęcie profilowe
        </CardTitle>
        <CardDescription>
          Kliknij w zdjęcie lub przeciągnij nowe, aby je zmienić
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-row gap-6 mt-4 items-start">
          {/* Podgląd avatara z funkcją upload */}
          <div 
            className={`relative group cursor-pointer shrink-0
              ${dragActive ? 'scale-105 transition-transform' : ''}
              ${uploading ? 'opacity-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleSelectFile}
          >
            <div className="h-52 w-52 sm:h-64 sm:w-64 rounded-md border-2 border-primary/20 overflow-hidden transition-all duration-200 group-hover:border-primary/50">
              {avatar ? (
                <div className="relative w-full h-full">
                  <img 
                    src={avatar} 
                    alt="Zdjęcie profilowe" 
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '1/1' }}
                    onError={(e) => {
                      console.error("Błąd ładowania zdjęcia:", avatar);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0yMCA2LjVhMi41IDIuNSAwIDAgMS01IDAgMi41IDIuNSAwIDAgMSA1IDB6Ii8+PHBhdGggZD0iTTE0IDExYTYgNiAwIDAgMC0xMiAwIE00IDE1aDFhMSAxIDAgMCAxIDEgMXY0YTEgMSAwIDAgMS0xIDFINCIvPjxwYXRoIGQ9Ik0yMiAxOWgtNiIvPjxwYXRoIGQ9Ik0yNCAxNWgtMyIvPjwvc3ZnPg==';
                      setTimeout(fetchUserAvatar, 3000);
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <UserCircle className="h-32 w-32 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Overlay z ikoną upload */}
            <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white flex flex-col items-center">
                <Upload className="h-10 w-10 mb-2" />
                <p className="text-sm text-center">
                  {uploading ? 'Przesyłanie...' : 'Zmień zdjęcie'}
                </p>
              </div>
            </div>

            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {/* Panel boczny z przyciskami i informacjami */}
          <div className="flex flex-col gap-4 flex-1 min-w-[200px]">
            <div className="space-y-2">
              <p className="text-sm font-medium">Wymagania dla zdjęcia:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Maksymalny rozmiar: 5MB</li>
                <li>Dozwolone formaty: JPG, PNG</li>
                <li>Zalecany wymiar: min. 400x400 pikseli</li>
              </ul>
              
              {avatar && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive mt-3 w-full"
                  onClick={removeAvatar}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Usuń zdjęcie
                </Button>
              )}
            </div>

            {/* Komunikaty o błędach lub sukcesie */}
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert variant="default" className="py-2 bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Dialog z narzędziem do przycinania zdjęcia */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Przytnij zdjęcie profilowe</DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full h-[400px] my-4">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1} // Proporcja 1:1 dla kwadratu
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                objectFit="contain"
                cropSize={{ width: 300, height: 300 }}
                showGrid={true}
                minZoom={0.5}
                maxZoom={5}
                restrictPosition={false}
              />
            )}
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              <span className="text-sm mr-2">Przybliżenie:</span>
              <input
                type="range"
                value={zoom}
                min={0.5}
                max={5}
                step={0.05}
                aria-labelledby="Poziom przybliżenia"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-48"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCropCancel}
              disabled={uploading}
            >
              Anuluj
            </Button>
            <Button 
              onClick={handleCropConfirm}
              disabled={uploading}
            >
              {uploading ? 'Przetwarzanie...' : 'Zatwierdź'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 