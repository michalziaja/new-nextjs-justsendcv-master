# 🔄 Cofnięcie zmian Popup Listy Oczekujących

## Szybkie wyłączenie popup-a

### Opcja 1: Wyłączenie w konfiguracji (ZALECANE)
Edytuj plik `hooks/use-waitlist-popup.ts` i zmień wartości:

```typescript
const WAITLIST_CONFIG = {
  enableOnLandingPage: false,     // ❌ Wyłącz na stronie głównej
  enableOnAuthPages: false,       // ❌ Wyłącz na stronach logowania
  delayMs: 10000,
  oncePerSession: true,
}
```

### Opcja 2: Usunięcie komponentów
1. **Strona główna**: Usuń `<WaitlistPopupWrapper>` z `components/start-page/main.tsx` (linia ~950)
2. **Strony logowania**: Usuń `<WaitlistPopupWrapper>` z `app/(auth-pages)/layout.tsx` (linia ~120)

### Opcja 3: Usunięcie importów
Usuń import z plików:
- `components/start-page/main.tsx`: `import { WaitlistPopupWrapper } from "@/components/WaitlistPopupWrapper"`
- `app/(auth-pages)/layout.tsx`: `import { WaitlistPopupWrapper } from "@/components/WaitlistPopupWrapper"`

## Pełne usunięcie funkcjonalności

Jeśli chcesz całkowicie usunąć popup z projektu:

### 1. Usuń pliki:
```bash
rm components/WaitlistPopup.tsx
rm components/WaitlistPopupWrapper.tsx
rm hooks/use-waitlist-popup.ts
rm WAITLIST_POPUP_ROLLBACK.md
```

### 2. Usuń z bazy danych:
```sql
DROP TABLE IF EXISTS public.waitlist;
```

### 3. Usuń z kodu:
- Usuń `addToWaitlistAction` z `app/actions.ts`
- Usuń `WaitlistEntry` z `types/database.types.ts`
- Usuń importy z layoutów i stron

## Obecna konfiguracja

### 🏠 Strona główna (Landing Page)
- **Opóźnienie**: 10 sekund
- **Lokalizacja**: `components/start-page/main.tsx`
- **Typ**: `pageType="landing"`

### 🔐 Strony autoryzacji (Login/Register)
- **Opóźnienie**: 12 sekund  
- **Lokalizacja**: `app/(auth-pages)/layout.tsx`
- **Typ**: `pageType="auth"`

### 💾 Przechowywanie danych
- **Baza danych**: Tabela `waitlist` w Supabase
- **Kolumny**: `id`, `email`, `created_at`, `source`, `is_notified`
- **Dostęp**: Supabase Dashboard → Table Editor → waitlist

## ⚡ Najszybszy sposób wyłączenia

Edytuj `hooks/use-waitlist-popup.ts` i ustaw:
```typescript
enableOnLandingPage: false,
enableOnAuthPages: false,
```

**✅ To wyłączy popup na wszystkich stronach bez usuwania kodu!** 