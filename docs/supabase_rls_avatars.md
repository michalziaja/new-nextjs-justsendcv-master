# Konfiguracja polityk RLS dla bucketa "avatars" w Supabase

## Wstęp

Ten dokument zawiera dokładne instrukcje dotyczące konfiguracji polityk Row Level Security (RLS) dla bucketa "avatars" w Supabase Storage, aby umożliwić bezpieczne przesyłanie i odczytywanie zdjęć profilowych użytkowników.

## Kroki konfiguracji

### 1. Utworzenie bucketa

Najpierw utwórz bucket o nazwie "avatars" w Supabase Storage:

1. Przejdź do panelu Supabase
2. Przejdź do sekcji "Storage"
3. Kliknij "New Bucket"
4. Wprowadź nazwę "avatars"
5. Wybierz typ "private" (aby kontrolować dostęp za pomocą polityk RLS)
6. Kliknij "Create"

### 2. Konfiguracja polityk RLS

Po utworzeniu bucketa, dodaj polityki RLS:

#### Polityka dla SELECT (odczyt plików)

Ta polityka umożliwia odczyt plików przez wszystkich (zalogowanych i niezalogowanych użytkowników):

1. W sekcji Storage wybierz bucket "avatars"
2. Przejdź do zakładki "Policies"
3. Kliknij "New Policy"
4. Wypełnij formularz:
   - Policy name: "Allow public access to avatars"
   - Allowed operation: SELECT
   - Policy definition: `true`
   - Role (optional): anon, authenticated

#### Polityka dla INSERT (upload plików)

Ta polityka pozwala zalogowanym użytkownikom przesyłać pliki tylko do swojego folderu i z dokładną nazwą pliku "profile.jpg":

1. W sekcji Storage wybierz bucket "avatars"
2. Przejdź do zakładki "Policies"
3. Kliknij "New Policy"
4. Wypełnij formularz:
   - Policy name: "Allow authenticated users to upload their avatar"
   - Allowed operation: INSERT
   - Policy definition: `bucket_id = 'avatars' AND name = '${auth.uid()}/profile.jpg'`
   - Role (optional): authenticated

#### Polityka dla UPDATE (aktualizacja plików)

Ta polityka pozwala zalogowanym użytkownikom aktualizować swoje zdjęcia:

1. W sekcji Storage wybierz bucket "avatars"
2. Przejdź do zakładki "Policies"
3. Kliknij "New Policy"
4. Wypełnij formularz:
   - Policy name: "Allow authenticated users to update their avatar"
   - Allowed operation: UPDATE
   - Policy definition: `bucket_id = 'avatars' AND name = '${auth.uid()}/profile.jpg'`
   - Role (optional): authenticated

#### Polityka dla DELETE (usuwanie plików)

Ta polityka pozwala zalogowanym użytkownikom usuwać swoje zdjęcia:

1. W sekcji Storage wybierz bucket "avatars"
2. Przejdź do zakładki "Policies"
3. Kliknij "New Policy"
4. Wypełnij formularz:
   - Policy name: "Allow authenticated users to delete their avatar"
   - Allowed operation: DELETE
   - Policy definition: `bucket_id = 'avatars' AND name = '${auth.uid()}/profile.jpg'`
   - Role (optional): authenticated

## Testy

Po skonfigurowaniu polityk, możesz sprawdzić czy działają poprawnie:

1. Zaloguj się jako użytkownik
2. Spróbuj przesłać zdjęcie profilowe
3. Sprawdź czy zdjęcie jest dostępne pod ścieżką `/storage/v1/object/public/avatars/${user.id}/profile.jpg`

## Rozwiązywanie problemów

Jeśli masz problemy z politykami RLS:

1. Sprawdź błędy w konsoli przeglądarki
2. Sprawdź logi w Supabase Dashboard (sekcja "Logs")
3. Upewnij się, że użytkownik jest poprawnie zalogowany
4. Upewnij się, że ścieżka pliku jest dokładnie w formacie `${user.id}/profile.jpg`

## Przykładowa polityka INSERT dla wybranego użytkownika

Jeśli chcesz ograniczyć upload tylko do określonego użytkownika (np. podczas testowania), możesz użyć polityki:

```sql
bucket_id = 'avatars' AND name = '${auth.uid()}/profile.jpg' AND (select auth.uid()::text) = 'd7bed83c-44a0-4a4f-925f-efc384ea1e50'
```

Ta polityka pozwoli na upload tylko użytkownikowi o ID 'd7bed83c-44a0-4a4f-925f-efc384ea1e50'. 