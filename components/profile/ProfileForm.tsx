"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, PlusCircle, Trash2, CheckCircle, UserCircle, FileText, Link, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updateUserProfileAction } from '@/app/actions';
import { createClient } from '@/utils/supabase/client';

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
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  email?: string;
  about_me?: string;
  city?: string;
  social_links?: string; // JSON string z linkami społecznościowymi
}

// Komponent formularza profilu
export default function ProfileForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
      // Przygotowanie danych do zapisania (usuwając pole fullName, którego nie ma w tabeli)
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

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Card className="shadow-[2px_4px_10px_rgba(0,0,0,0.3)] rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-20"></div>
              <UserCircle className="h-5 w-5 text-blue-500 relative z-10" />
            </div>
            Dane osobowe
          </CardTitle>
          <CardDescription>
            Uzupełnij swoje podstawowe dane osobowe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Imię</Label>
              <Input 
                id="first_name"
                value={profile.first_name || ''}
                onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                placeholder="Twoje imię"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Nazwisko</Label>
              <Input 
                id="last_name"
                value={profile.last_name || ''}
                onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                placeholder="Twoje nazwisko"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Miasto</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="city"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                  placeholder="Miasto zamieszkania"
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data urodzenia</Label>
              <Input 
                id="birth_date"
                type="date"
                value={profile.birth_date || ''}
                onChange={(e) => setProfile({...profile, birth_date: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-[2px_4px_10px_rgba(0,0,0,0.3)] rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 opacity-20"></div>
              <FileText className="h-5 w-5 text-green-500 relative z-10" />
            </div>
            O mnie
          </CardTitle>
          <CardDescription>
            Opisz krótko swoją osobę, doświadczenie lub zainteresowania
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            id="about_me"
            value={profile.about_me || ''}
            onChange={(e) => setProfile({...profile, about_me: e.target.value})}
            placeholder="Napisz kilka zdań o sobie..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>
      
      <Card className="shadow-[2px_4px_10px_rgba(0,0,0,0.3)] rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-20"></div>
              <Link className="h-5 w-5 text-purple-500 relative z-10" />
            </div>
            Linki społecznościowe
          </CardTitle>
          <CardDescription>
            Dodaj swoje profile społecznościowe, portfolio lub inne ważne linki
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4 sm:col-span-3">
                <Select 
                  value={link.type}
                  onValueChange={(value) => updateSocialLinkType(index, value as SocialLinkType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="dribbble">Dribbble</SelectItem>
                    <SelectItem value="behance">Behance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-7 sm:col-span-8">
                <Input 
                  value={link.url}
                  onChange={(e) => updateSocialLinkUrl(index, e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div className="col-span-1">
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
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={addSocialLink}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Dodaj link
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="w-full md:w-auto">
          {error && (
            <Alert variant="destructive" className="mb-0 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="mb-0 py-2 bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Button>
      </div>
    </form>
  );
} 