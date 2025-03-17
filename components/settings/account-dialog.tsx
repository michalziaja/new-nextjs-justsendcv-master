// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { format } from "date-fns";
// import { pl } from "date-fns/locale";
// import { useUserStore } from "@/store/userStore";
// import { createClient } from "@/utils/supabase/client";
// import {
//   User,
//   Shield,
//   Key,
//   Mail,
//   Calendar,
//   Clock,
//   Globe,
//   Smartphone,
//   AlertTriangle,
//   Trash2,
//   LogOut,
//   RefreshCw,
//   CheckCircle,
//   XCircle,
//   Info,
//   Monitor,
//   MapPin,
// } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// interface AccountDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// // Rozszerzamy typ użytkownika o dodatkowe pola z Supabase
// interface ExtendedUser {
//   id: string;
//   email: string;
//   name?: string;
//   avatar?: string;
//   last_sign_in_at?: string;
//   created_at?: string;
//   updated_at?: string;
//   email_confirmed_at?: string;
//   is_anonymous?: boolean;
//   phone?: string;
//   phone_confirmed_at?: string;
//   banned_until?: string;
//   is_sso_user?: boolean;
//   role?: string;
//   aud?: string;
//   raw_app_meta_data?: any;
//   raw_user_meta_data?: any;
// }

// interface SessionInfo {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   user_agent: string;
//   ip: string;
//   last_active?: string;
//   current?: boolean;
// }

// export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
//   const { user } = useUserStore();
//   const [loading, setLoading] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [sessions, setSessions] = useState<SessionInfo[]>([]);
//   const [loadingSessions, setLoadingSessions] = useState(false);
//   const supabase = createClient();

//   // Pobierz sesje użytkownika
//   useEffect(() => {
//     if (open && user) {
//       fetchSessions();
//     }
//   }, [open, user]);

//   const fetchSessions = async () => {
//     setLoadingSessions(true);
//     try {
//       // W rzeczywistej aplikacji potrzebowałbyś endpointu API lub funkcji Supabase Edge Function
//       // aby pobrać sesje użytkownika, ponieważ nie są one dostępne bezpośrednio z klienta
//       // Poniżej jest przykładowa implementacja
      
//       const { data: { session } } = await supabase.auth.getSession();
//       const currentSessionId = session?.user?.id || 'unknown-session';
      
//       // Symulacja danych sesji - w rzeczywistości pobierz je z API
//       const mockSessions: SessionInfo[] = [
//         {
//           id: currentSessionId || 'current-session',
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//           user_agent: navigator.userAgent,
//           ip: '127.0.0.1', // W rzeczywistości pobierz z API
//           last_active: new Date().toISOString(),
//           current: true
//         }
//       ];
      
//       setSessions(mockSessions);
//     } catch (error) {
//       console.error("Błąd podczas pobierania sesji:", error);
//     } finally {
//       setLoadingSessions(false);
//     }
//   };

//   if (!user) return null;

//   // Rzutujemy user na ExtendedUser
//   const extendedUser = user as unknown as ExtendedUser;

//   const lastSignIn = extendedUser.last_sign_in_at 
//     ? format(new Date(extendedUser.last_sign_in_at), "dd MMMM yyyy 'o' HH:mm", { locale: pl })
//     : "Brak danych";

//   const createdAt = extendedUser.created_at 
//     ? format(new Date(extendedUser.created_at), "dd MMMM yyyy", { locale: pl })
//     : "Brak danych";
    
//   const updatedAt = extendedUser.updated_at
//     ? format(new Date(extendedUser.updated_at), "dd MMMM yyyy", { locale: pl })
//     : "Brak danych";

//   const handleDeleteAccount = async () => {
//     setLoading(true);
//     try {
//       // W rzeczywistej aplikacji potrzebowałbyś endpointu API lub funkcji Supabase Edge Function
//       // aby usunąć konto użytkownika, ponieważ nie jest to dostępne bezpośrednio z klienta
//       // Poniżej jest przykładowa implementacja
      
//       // Wyloguj użytkownika po usunięciu konta
//       await supabase.auth.signOut();
//       onOpenChange(false);
      
//       // Przekieruj do strony głównej
//       window.location.href = "/";
//     } catch (error) {
//       console.error("Błąd podczas usuwania konta:", error);
//     } finally {
//       setLoading(false);
//       setDeleteDialogOpen(false);
//     }
//   };

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <User className="h-5 w-5" />
//               Zarządzanie kontem
//             </DialogTitle>
//             <DialogDescription>
//               Przegląd i zarządzanie informacjami o Twoim koncie
//             </DialogDescription>
//           </DialogHeader>

//           <Tabs defaultValue="info" className="w-full">
//             <TabsList className="grid grid-cols-3 mb-4">
//               <TabsTrigger value="info">Informacje</TabsTrigger>
//               <TabsTrigger value="sessions">Sesje</TabsTrigger>
//               <TabsTrigger value="security">Bezpieczeństwo</TabsTrigger>
//             </TabsList>

//             <TabsContent value="info" className="space-y-4">
//               {/* Podstawowe informacje */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Info className="h-5 w-5" />
//                     Informacje podstawowe
//                   </CardTitle>
//                   <CardDescription>Główne dane Twojego konta</CardDescription>
//                 </CardHeader>
//                 <CardContent className="grid gap-4">
//                   <div className="grid grid-cols-2 gap-2">
//                     <div className="text-sm text-muted-foreground flex items-center gap-2">
//                       <Mail className="h-4 w-4" />
//                       Email:
//                     </div>
//                     <div className="text-sm font-medium">{extendedUser.email}</div>
                    
//                     <div className="text-sm text-muted-foreground flex items-center gap-2">
//                       <CheckCircle className="h-4 w-4" />
//                       Status email:
//                     </div>
//                     <div>
//                       {extendedUser.email_confirmed_at ? (
//                         <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
//                           Zweryfikowany
//                         </Badge>
//                       ) : (
//                         <Badge variant="destructive">Niezweryfikowany</Badge>
//                       )}
//                     </div>

//                     {extendedUser.phone && (
//                       <>
//                         <div className="text-sm text-muted-foreground flex items-center gap-2">
//                           <Smartphone className="h-4 w-4" />
//                           Telefon:
//                         </div>
//                         <div className="text-sm font-medium">{extendedUser.phone}</div>
                        
//                         <div className="text-sm text-muted-foreground flex items-center gap-2">
//                           <CheckCircle className="h-4 w-4" />
//                           Status telefonu:
//                         </div>
//                         <div>
//                           {extendedUser.phone_confirmed_at ? (
//                             <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
//                               Zweryfikowany
//                             </Badge>
//                           ) : (
//                             <Badge variant="destructive">Niezweryfikowany</Badge>
//                           )}
//                         </div>
//                       </>
//                     )}

//                     <div className="text-sm text-muted-foreground flex items-center gap-2">
//                       <Clock className="h-4 w-4" />
//                       Ostatnie logowanie:
//                     </div>
//                     <div className="text-sm">{lastSignIn}</div>

//                     <div className="text-sm text-muted-foreground flex items-center gap-2">
//                       <Calendar className="h-4 w-4" />
//                       Data utworzenia:
//                     </div>
//                     <div className="text-sm">{createdAt}</div>

//                     <div className="text-sm text-muted-foreground flex items-center gap-2">
//                       <RefreshCw className="h-4 w-4" />
//                       Ostatnia aktualizacja:
//                     </div>
//                     <div className="text-sm">{updatedAt}</div>

//                     <div className="text-sm text-muted-foreground flex items-center gap-2">
//                       <Shield className="h-4 w-4" />
//                       Rola:
//                     </div>
//                     <div className="text-sm font-medium">{extendedUser.role || "Użytkownik"}</div>

//                     <div className="text-sm text-muted-foreground flex items-center gap-2">
//                       <Globe className="h-4 w-4" />
//                       Typ konta:
//                     </div>
//                     <div className="text-sm">
//                       {extendedUser.is_anonymous ? (
//                         <Badge variant="secondary">Anonimowe</Badge>
//                       ) : extendedUser.is_sso_user ? (
//                         <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
//                           SSO
//                         </Badge>
//                       ) : (
//                         <Badge variant="default">Standardowe</Badge>
//                       )}
//                     </div>

//                     {extendedUser.banned_until && (
//                       <>
//                         <div className="text-sm text-muted-foreground flex items-center gap-2">
//                           <AlertTriangle className="h-4 w-4 text-red-500" />
//                           Blokada do:
//                         </div>
//                         <div className="text-sm text-red-500 font-medium">
//                           {format(new Date(extendedUser.banned_until), "dd MMMM yyyy", { locale: pl })}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Metadane */}
//               {(extendedUser.raw_app_meta_data || extendedUser.raw_user_meta_data) && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Info className="h-5 w-5" />
//                       Dodatkowe informacje
//                     </CardTitle>
//                     <CardDescription>Metadane konta</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     {extendedUser.raw_user_meta_data && (
//                       <div className="mb-4">
//                         <h4 className="text-sm font-medium mb-2">Metadane użytkownika:</h4>
//                         <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">
//                           {JSON.stringify(extendedUser.raw_user_meta_data, null, 2)}
//                         </pre>
//                       </div>
//                     )}
//                     {extendedUser.raw_app_meta_data && (
//                       <div>
//                         <h4 className="text-sm font-medium mb-2">Metadane aplikacji:</h4>
//                         <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">
//                           {JSON.stringify(extendedUser.raw_app_meta_data, null, 2)}
//                         </pre>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               )}
//             </TabsContent>

//             <TabsContent value="sessions" className="space-y-4">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Monitor className="h-5 w-5" />
//                     Aktywne sesje
//                   </CardTitle>
//                   <CardDescription>
//                     Urządzenia, na których jesteś zalogowany
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {loadingSessions ? (
//                     <div className="text-center py-4">Ładowanie sesji...</div>
//                   ) : sessions.length === 0 ? (
//                     <div className="text-center py-4">Brak aktywnych sesji</div>
//                   ) : (
//                     <div className="space-y-4">
//                       {sessions.map((session) => (
//                         <div key={session.id} className="border rounded-lg p-4">
//                           <div className="flex justify-between items-start mb-2">
//                             <div className="font-medium flex items-center gap-2">
//                               <Monitor className="h-4 w-4" />
//                               {session.current ? "Aktualna sesja" : "Inna sesja"}
//                               {session.current && (
//                                 <Badge variant="secondary" className="ml-2">Aktywna</Badge>
//                               )}
//                             </div>
//                             {!session.current && (
//                               <Button 
//                                 variant="outline" 
//                                 size="sm"
//                                 className="text-red-500"
//                                 onClick={() => {
//                                   // Implementacja zakończenia sesji
//                                 }}
//                               >
//                                 Zakończ
//                               </Button>
//                             )}
//                           </div>
//                           <div className="grid grid-cols-2 gap-2 text-sm">
//                             <div className="text-muted-foreground">Przeglądarka:</div>
//                             <div>{session.user_agent?.split(' ')[0] || "Nieznana"}</div>
                            
//                             <div className="text-muted-foreground flex items-center gap-1">
//                               <MapPin className="h-3 w-3" />
//                               Adres IP:
//                             </div>
//                             <div>{session.ip || "Nieznany"}</div>
                            
//                             <div className="text-muted-foreground">Ostatnia aktywność:</div>
//                             <div>
//                               {session.last_active 
//                                 ? format(new Date(session.last_active), "dd MMM yyyy HH:mm", { locale: pl })
//                                 : "Nieznana"}
//                             </div>
                            
//                             <div className="text-muted-foreground">Utworzono:</div>
//                             <div>
//                               {format(new Date(session.created_at), "dd MMM yyyy", { locale: pl })}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//                 <CardFooter>
//                   <Button 
//                     variant="destructive" 
//                     onClick={async () => {
//                       setLoading(true);
//                       await supabase.auth.signOut({ scope: 'global' });
//                       setLoading(false);
//                       onOpenChange(false);
//                       window.location.href = "/sign-in";
//                     }}
//                     disabled={loading}
//                     className="w-full"
//                   >
//                     <LogOut className="mr-2 h-4 w-4" />
//                     {loading ? "Wylogowywanie..." : "Wyloguj ze wszystkich urządzeń"}
//                   </Button>
//                 </CardFooter>
//               </Card>
//             </TabsContent>

//             <TabsContent value="security" className="space-y-4">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Key className="h-5 w-5" />
//                     Bezpieczeństwo
//                   </CardTitle>
//                   <CardDescription>
//                     Ustawienia zabezpieczeń Twojego konta
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <h3 className="text-sm font-medium mb-2">Zmiana hasła</h3>
//                     <p className="text-sm text-muted-foreground mb-4">
//                       Wyślemy Ci email z linkiem do zmiany hasła.
//                     </p>
//                     <Button 
//                       variant="outline"
//                       onClick={async () => {
//                         const { error } = await supabase.auth.resetPasswordForEmail(
//                           extendedUser.email,
//                           { redirectTo: `${window.location.origin}/auth/callback` }
//                         );
//                         if (!error) {
//                           // TODO: Dodaj powiadomienie o wysłaniu maila
//                           console.log("Email z resetem hasła został wysłany");
//                         }
//                       }}
//                     >
//                       <Mail className="mr-2 h-4 w-4" />
//                       Wyślij link do zmiany hasła
//                     </Button>
//                   </div>

//                   <div className="pt-4 border-t">
//                     <h3 className="text-sm font-medium mb-2 text-red-500 flex items-center gap-2">
//                       <Trash2 className="h-4 w-4" />
//                       Usunięcie konta
//                     </h3>
//                     <p className="text-sm text-muted-foreground mb-4">
//                       Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.
//                     </p>
//                     <Button 
//                       variant="destructive"
//                       onClick={() => setDeleteDialogOpen(true)}
//                     >
//                       <Trash2 className="mr-2 h-4 w-4" />
//                       Usuń konto
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </DialogContent>
//       </Dialog>

//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-red-500 flex items-center gap-2">
//               <AlertTriangle className="h-5 w-5" />
//               Usunięcie konta
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna i spowoduje trwałe usunięcie wszystkich Twoich danych.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Anuluj</AlertDialogCancel>
//             <AlertDialogAction 
//               onClick={handleDeleteAccount}
//               className="bg-red-500 hover:bg-red-600"
//             >
//               {loading ? "Usuwanie..." : "Tak, usuń moje konto"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }