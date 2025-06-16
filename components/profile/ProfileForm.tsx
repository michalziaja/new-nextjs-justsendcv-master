"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, PlusCircle, Trash2, CheckCircle, UserCircle, FileText, Link, MapPin, Phone, Facebook, Linkedin, Github, Instagram, Twitter, Globe, Dribbble, Figma } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updateUserProfileAction } from '@/app/actions';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

// Typy linków społecznościowych
type SocialLinkType = 'linkedin' | 'github' | 'portfolio' | 'twitter' | 'facebook' | 'instagram' | 'dribbble' | 'behance';

// Interfejs dla pojedynczego linku społecznościowego
interface SocialLink {
  type: SocialLinkType;
  url: string;
}

// Interfejs dla profilu użytkownika
interface UserProfile {
  user_id: string;
  prefix?: string;
  first_name?: string;
  last_name?: string;
  age?: string;
  email?: string;
  about_me?: string;
  address?: string;
  phone?: string;
  social_links?: string; // JSON string z linkami społecznościowymi
}

interface ProfileFormProps {
  showOnlyPersonalData?: boolean;
  showOnlyAboutMe?: boolean;
  showOnlySocialLinks?: boolean;
}

export default function ProfileForm({ 
  showOnlyPersonalData,
  showOnlyAboutMe,
  showOnlySocialLinks 
}: ProfileFormProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Pobieranie danych profilu użytkownika
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const supabase = createClient();
        
        // Pobierz ID zalogowanego użytkownika
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/sign-in');
          return;
        }
        
        setUserId(user.id);
        
        // Pobierz profil użytkownika
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Błąd podczas pobierania profilu:', error.message);
          setError('Wystąpił błąd podczas ładowania danych profilu');
          return;
        }
        
        if (data) {
          // Mapowanie z city na address jeśli potrzebne
          if (data.city && !data.address) {
            data.address = data.city;
          }
          
          setProfile(data);
          
          // Parsowanie linków społecznościowych jeśli istnieją
          if (data.social_links) {
            try {
              const links = JSON.parse(data.social_links);
              setSocialLinks(Array.isArray(links) ? links : []);
            } catch (e) {
              console.error('Błąd parsowania linków społecznościowych:', e);
              setSocialLinks([]);
            }
          }
        } else {
          // Jeśli profil nie istnieje, ustaw pusty profil
          setProfile({ user_id: user.id });
        }
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
        setError('Wystąpił nieoczekiwany błąd podczas ładowania danych');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [router]);

  // Dodawanie nowego linku społecznościowego
  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { type: 'linkedin', url: '' }]);
  };

  // Usuwanie linku społecznościowego
  const removeSocialLink = (index: number) => {
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    setSocialLinks(newLinks);
  };

  // Aktualizacja typu linku społecznościowego
  const updateSocialLinkType = (index: number, type: SocialLinkType) => {
    const newLinks = [...socialLinks];
    newLinks[index].type = type;
    setSocialLinks(newLinks);
  };

  // Aktualizacja URL linku społecznościowego
  const updateSocialLinkUrl = (index: number, url: string) => {
    const newLinks = [...socialLinks];
    newLinks[index].url = url;
    setSocialLinks(newLinks);
  };

  // Obsługa zapisu formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !userId) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Przygotowanie danych do zapisania
      const profileData = {
        ...profile,
        social_links: JSON.stringify(socialLinks),
      };
      
      // Aktualizacja metadanych użytkownika odbywa się osobno w auth
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      if (fullName) {
        await createClient().auth.updateUser({
          data: { name: fullName }
        });
      }
      
      // Wywołanie akcji aktualizacji profilu
      const result = await updateUserProfileAction(userId, profileData);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.message || 'Profil został zaktualizowany');
        router.refresh();
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania profilu:', error);
      setError('Wystąpił nieoczekiwany błąd podczas zapisywania profilu');
    } finally {
      setIsLoading(false);
    }
  };

  // Komponent Skeleton do wyświetlania podczas ładowania
  const ProfileFormSkeleton = () => (
    <div className="space-y-8">
      {/* Skeleton danych osobowych */}
      <div className="p-2 -mt-1 bg-gray-50/50 rounded-sm border border-gray-200">
        <div className="p-2">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 rounded-full mr-2" />
            <Skeleton className="h-7 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lewa kolumna */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={`left-${i}`} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
            
            {/* Prawa kolumna */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={`right-${i}`} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Skeleton sekcji O mnie */}
      <div className="p-2 -mt-2 bg-gray-50/50 rounded-sm border border-gray-200">
        <div className="p-2">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 rounded-full mr-2" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      
      {/* Skeleton sekcji Linki społecznościowe */}
      <div className="p-2 -mt-2 bg-gray-50/50 rounded-sm border border-gray-200">
        <div className="p-2">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 rounded-full mr-2" />
            <Skeleton className="h-7 w-48" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={`social-${i}`} className="flex items-center gap-2">
                <div className="w-1/3">
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-8 w-full" />
                </div>
                <div>
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>
      
      {/* Skeleton przycisku zapisu */}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
    </div>
  );

  if (isLoading) {
    return <ProfileFormSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-center">Nie udało się załadować profilu.</p>
        <Button onClick={() => window.location.reload()}>Spróbuj ponownie</Button>
      </div>
    );
  }

  const renderPersonalData = () => (
    <div className="p-2 -mt-1 bg-gray-50/50 dark:bg-slate-800 rounded-sm border border-gray-200 dark:border-gray-600">
      <div className="p-2  ">
        <h3 className="flex items-center text-lg font-semibold mb-4">
          <div className="relative mr-2">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-20"></div>
            <UserCircle className="h-6 w-6 text-blue-500 relative z-10" />
          </div>
          Dane osobowe
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lewa kolumna */}
          <div className="space-y-4">
            {/* Imię */}
            <div className="flex items-center gap-4">
              <Label htmlFor="first_name" className="w-16">Imię</Label>
              <div className="relative flex-1">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="first_name"
                  value={profile.first_name || ''}
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  placeholder="Twoje imię"
                  className="pl-9 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
            
            {/* Nazwisko */}
            <div className="flex items-center gap-4">
              <Label htmlFor="last_name" className="w-16">Nazwisko</Label>
              <div className="relative flex-1">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="last_name"
                  value={profile.last_name || ''}
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  placeholder="Twoje nazwisko"
                  className="pl-9 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-4">
              <Label htmlFor="email" className="w-16">Email</Label>
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="Twój adres email"
                  className="pl-9 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
          
          {/* Prawa kolumna */}
          <div className="space-y-4">
            {/* Adres */}
            <div className="flex items-center gap-4">
              <Label htmlFor="address" className="w-16">Adres</Label>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  placeholder="Twój adres"
                  className="pl-9 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
            
            {/* Telefon */}
            <div className="flex items-center gap-4">
              <Label htmlFor="phone" className="w-16">Telefon</Label>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="Twój numer telefonu"
                  className="pl-9 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
            
            {/* Rocznik */}
            <div className="flex items-center gap-4">
              <Label htmlFor="age" className="w-16">Wiek</Label>
              <div className="relative flex-1">
                <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="age"
                  type="number"
                  
                  max={new Date().getFullYear()}
                  value={profile.age || ''}
                  onChange={(e) => setProfile({...profile, age: e.target.value})}
                  placeholder="Wiek"
                  className="pl-9 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutMe = () => (
    <div className="p-2 -mt-2 bg-gray-50/50 dark:bg-slate-800 rounded-sm border border-gray-200 dark:border-gray-600">
      <div className="p-2">
        <h3 className="flex items-center text-lg font-semibold mb-4">
          <div className="relative mr-2">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 opacity-20"></div>
            <FileText className="h-6 w-6 text-green-500 relative z-10" />
          </div>
          O mnie
        </h3>
        
        <Textarea 
          id="about_me"
          value={profile.about_me || ''}
          onChange={(e) => setProfile({...profile, about_me: e.target.value})}
          placeholder="Napisz kilka zdań o sobie..."
          className="min-h-[120px] border-gray-200 dark:border-gray-600"
        />
      </div>
    </div>
  );

  // Funkcja do renderowania odpowiedniej ikony na podstawie typu linku
  const renderSocialIcon = (type: SocialLinkType) => {
    switch (type) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-blue-600" />;
      case 'github':
        return <Github className="h-4 w-4 text-gray-800" />;
      case 'portfolio':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'twitter':
        return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-700" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'dribbble':
        return <Dribbble className="h-4 w-4 text-pink-500" />;
      case 'behance':
        return <Figma className="h-4 w-4 text-blue-800" />; // Używamy Figma jako zastępstwa dla Behance
      default:
        return <Link className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderSocialLinks = () => (
    <div className="p-2 -mt-2 bg-gray-50/50 dark:bg-slate-800 rounded-sm border border-gray-200 dark:border-gray-600">
      <div className="p-2">
        <h3 className="flex items-center text-lg font-semibold mb-4">
          <div className="relative mr-2">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-20"></div>
            <Link className="h-5 w-5 text-purple-500 relative z-10" />
          </div>
          Linki społecznościowe
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1/3">
                <Select 
                  value={link.type}
                  onValueChange={(value) => updateSocialLinkType(index, value as SocialLinkType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-600 inline mr-2" />LinkedIn
                    </SelectItem>
                    <SelectItem value="github" className="flex items-center gap-2">
                      <Github className="h-4 w-4 text-gray-800 inline mr-2" />GitHub
                    </SelectItem>
                    <SelectItem value="portfolio" className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600 inline mr-2" />Portfolio
                    </SelectItem>
                    <SelectItem value="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-400 inline mr-2" />Twitter
                    </SelectItem>
                    <SelectItem value="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-700 inline mr-2" />Facebook
                    </SelectItem>
                    <SelectItem value="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-600 inline mr-2" />Instagram
                    </SelectItem>
                    <SelectItem value="dribbble" className="flex items-center gap-2">
                      <Dribbble className="h-4 w-4 text-pink-500 inline mr-2" />Dribbble
                    </SelectItem>
                    <SelectItem value="behance" className="flex items-center gap-2">
                      <Figma className="h-4 w-4 text-blue-800 inline mr-2" />Behance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Input 
                  value={link.url}
                  onChange={(e) => updateSocialLinkUrl(index, e.target.value)}
                  placeholder="https://..."
                  className="border-gray-200 dark:border-gray-600"
                />
              </div>
              
              <div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeSocialLink(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addSocialLink}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Dodaj link
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {showOnlyPersonalData && renderPersonalData()}
      {showOnlyAboutMe && renderAboutMe()}
      {showOnlySocialLinks && renderSocialLinks()}
      
      {/* Jeśli nie wybrano żadnej konkretnej sekcji, pokaż wszystkie */}
      {!showOnlyPersonalData && !showOnlyAboutMe && !showOnlySocialLinks && (
        <>
          {renderPersonalData()}
          {renderAboutMe()}
          {renderSocialLinks()}
        </>
      )}

      {/* Komunikaty i przycisk zapisu */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          {error && (
            <Alert variant="destructive" className="mb-0 py-2 dark:bg-slate-800 dark:border-red-600 dark:text-red-600">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="dark:text-gray-200">{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="mb-0 py-2 bg-green-50 border-green-200 text-green-800 dark:bg-slate-800 dark:border-green-600 dark:text-green-600">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="dark:text-gray-200">{success}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-md transition-all"
        >
          {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Button>
      </div>
    </form>
  );
} 