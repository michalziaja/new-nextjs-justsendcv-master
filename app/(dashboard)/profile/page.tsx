import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountManagement } from "@/components/account-managment";
import AccountManagementClient from "./account-management-client";
import { updateUserProfileAction } from "@/app/actions";
import ProfileForm from "./profile-form";

// Komponent do wyświetlania profilu użytkownika
export default async function ProfilePage() {
  // Pobieranie danych użytkownika
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Pobieranie danych profilu
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("subscription, first_name, last_name, social_links, about_me")
    .eq("user_id", user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Błąd pobierania profilu:", profileError);
  }
  
  // Pobieranie liczby CV użytkownika
//   const { count: resumeCount, error: resumeError } = await supabase
//     .from("resumes")
//     .select("id", { count: "exact", head: true })
//     .eq("user_id", user.id);
    
//   if (resumeError) {
//     console.error("Błąd pobierania liczby CV:", resumeError);
//   }

  const userData = {
    id: user.id,
    name: user.user_metadata?.name || "Użytkownik",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || "",
    isSubscribed: profile?.subscription || false,
    createdAt: user.created_at || new Date().toISOString(),
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
   
    social_links: profile?.social_links || "",
    about_me: profile?.about_me || "",
    // resumeCount: resumeCount || 0,

  };

  return (
    <div className="container mx-auto py-6 mt-8">
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Dane osobowe</TabsTrigger>
          <TabsTrigger value="system">Dane systemowe</TabsTrigger>
          <TabsTrigger value="settings">Ustawienia konta</TabsTrigger>
        </TabsList>
        
        {/* Zakładka z danymi osobowymi */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Dane osobowe</CardTitle>
              <CardDescription>
                Uzupełnij swoje dane, które będą wykorzystywane w CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm userId={userData.id} initialData ={userData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Zakładka z danymi systemowymi */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Dane systemowe</CardTitle>
              <CardDescription>
                Informacje o Twoim koncie w systemie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Konto założone</h3>
                  <p className="text-muted-foreground">{new Date(userData.createdAt).toLocaleDateString('pl-PL')}</p>
                </div>
                <div>
                  <h3 className="font-medium">Adres email</h3>
                  <p className="text-muted-foreground">{userData.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status subskrypcji</h3>
                  <p className="text-muted-foreground">{userData.isSubscribed ? "Premium" : "Darmowa"}</p>
                </div>
                <div>
                  <h3 className="font-medium">Ostatnia aktywność</h3>
                  {/* <p className="text-muted-foreground">{new Date(userData.lastActive).toLocaleDateString('pl-PL')}</p> */}
                </div>
                <div>
                  <h3 className="font-medium">Ilość zapisanych CV</h3>
                  {/* <p className="text-muted-foreground">{userData.resumeCount}</p> */}
                </div>
                <div>
                  <h3 className="font-medium">ID użytkownika</h3>
                  <p className="text-muted-foreground text-xs">{userData.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Zakładka z ustawieniami konta */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia konta</CardTitle>
              <CardDescription>
                Zarządzaj swoim kontem i subskrypcją
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Zmiana hasła i usunięcie konta</h3>
                  <p className="text-muted-foreground mb-2">Zarządzaj swoim kontem i dostępem do systemu</p>
                  <AccountManagementClient userData={userData} />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium">Preferencje powiadomień</h3>
                  <p className="text-muted-foreground mb-2">Zarządzaj powiadomieniami email</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notif-updates" className="h-4 w-4" />
                      <Label htmlFor="notif-updates">Aktualizacje systemu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notif-tips" className="h-4 w-4" />
                      <Label htmlFor="notif-tips">Porady dotyczące CV</Label>
                    </div>
                  </div>
                  <Button className="mt-2">Zapisz preferencje</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
