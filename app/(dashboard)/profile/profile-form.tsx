"use client";

import { useState } from "react";
import { useTransition } from "react";
import { updateUserProfileAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  userId: string;
  initialData: {
    id?: string;
    name: string;
    email: string;
    first_name?: string;
    last_name?: string;
    social_links?: string;
    about_me?: string;
    avatar?: string;
    isSubscribed?: boolean;
    createdAt?: string;
  };
}

// Komponent formularza danych profilu
export default function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState({
    fullName: initialData.name,
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
    social_links: initialData.social_links || "",
    about_me: initialData.about_me || ""
  });
  
  // Obsługa zmiany pól formularza
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Obsługa wysłania formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = await updateUserProfileAction(userId, formData);
      
      if (result.error) {
        ({
          title: "Błąd",
          description: result.error,
          variant: "destructive"
        });
      } else if (result.warning) {
        ({
          title: "Sukces z ostrzeżeniem",
          description: result.warning,
          variant: "default"
        });
      } else {
        ({
          title: "Sukces",
          description: result.message,
          variant: "default"
        });
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Imię i nazwisko</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            value={initialData.email} 
            disabled 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="first_name">Imię</Label>
          <Input 
            id="first_name" 
            name="first_name" 
            value={formData.first_name} 
            onChange={handleChange} 
            placeholder="Podaj imię" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nazwisko</Label>
          <Input 
            id="last_name" 
            name="last_name" 
            value={formData.last_name} 
            onChange={handleChange} 
            placeholder="Podaj nazwisko" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social_links">Linki społecznościowe</Label>
          <Input 
            id="social_links" 
            name="social_links" 
            value={formData.social_links} 
            onChange={handleChange} 
            placeholder="Linki oddzielone przecinkami" 
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="about_me">O mnie</Label>
          <textarea 
            id="about_me" 
            name="about_me" 
            value={formData.about_me} 
            onChange={handleChange} 
            placeholder="Napisz coś o sobie..."
            className="w-full min-h-[100px] px-3 py-2 rounded-md border"
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Zapisywanie..." : "Zapisz dane"}
      </Button>
      {/* Dodajemy informację o statusie aktualizacji */}
      {isPending && (
        <p className="text-sm text-muted-foreground">
          Zapisywanie danych...
        </p>
      )}
    </form>
  );
} 