"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Badge 
} from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Typ dla powiadomienia
interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function NotificationBell() {
  const [supabase] = useState(() => createClient());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Funkcja do animacji dzwonka
  const animateBell = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Pobierz wszystkie powiadomienia (odczytane i nieodczytane)
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (data && !error) {
          setNotifications(data);
          // Policz tylko nieodczytane powiadomienia
          const unread = data.filter(n => !n.read).length;
          setUnreadCount(unread);
        }

        // Konfiguracja kanału realtime
        const channel = supabase.channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`
            },
            (payload: { new: Notification }) => {
              setNotifications(prev => {
                const newNotifications = [payload.new, ...prev].slice(0, 5);
                return newNotifications;
              });
              
              if (!payload.new.read) {
                setUnreadCount(prev => prev + 1);
                animateBell(); // Animuj dzwonek przy nowym powiadomieniu
              }
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Błąd podczas pobierania powiadomień:", error);
      }
    };

    fetchNotifications();
  }, [supabase]);

  const markAsRead = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (!error) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Błąd podczas oznaczania jako przeczytane:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      animateBell(); // Animuj dzwonek przy oznaczaniu wszystkich jako przeczytane

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (!error) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Błąd podczas oznaczania wszystkich jako przeczytane:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="icon"
          className={cn(
            "relative overflow-hidden h-10 w-10 transition-all duration-300 hover:scale-115 active:scale-105 dark:text-cyan-500",
            isAnimating && "animate-bell"
          )}
        >
          <Bell className="h-5 w-5 transition-transform duration-300" />
          {unreadCount > 0 && (
            <Badge 
              className={cn(
                "absolute -top-0 -right-0 h-4 w-4 flex items-center justify-center p-0",
                "bg-red-500 text-white transition-transform duration-300",
                isAnimating && "animate-bounce"
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Powiadomienia</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-120 mr-2 overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Powiadomienia</h3>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Oznacz wszystkie jako przeczytane
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Brak powiadomień</div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-4 border-b last:border-b-0 cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  !notification.read && "bg-accent/30 border-l-4 border-l-blue-500"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "font-medium",
                    !notification.read && "text-blue-600"
                  )}>
                    {notification.type}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </div>
                </div>
                <div className={cn(
                  "text-sm mt-1",
                  !notification.read && "font-medium"
                )}>
                  {notification.message}
                </div>
                {!notification.read && (
                  <div className="mt-2 text-xs text-blue-500">
                    Kliknij, aby oznaczyć jako przeczytane
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 