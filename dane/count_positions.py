import json
import os
import logging

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def count_positions_in_file(file_path):
    """
    Liczy liczbę pozycji w pliku JSON (wystąpienia "title" w "positions").
    
    Args:
        file_path (str): Ścieżka do pliku JSON
        
    Returns:
        tuple: (liczba pozycji, nazwa litery)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not isinstance(data, dict) or "positions" not in data or "letter" not in data:
            logging.warning(f"Nieprawidłowa struktura pliku {file_path}")
            return 0, None
        
        letter = data.get("letter", "Nieznana")
        positions = data.get("positions", [])
        
        # Zliczanie wystąpień "title" w "positions"
        title_count = sum(1 for pos in positions if "title" in pos)
        
        return title_count, letter
    
    except FileNotFoundError:
        logging.error(f"Plik nie istnieje: {file_path}")
        return 0, None
    except json.JSONDecodeError:
        logging.error(f"Błąd dekodowania JSON w pliku: {file_path}")
        return 0, None
    except Exception as e:
        logging.error(f"Wystąpił błąd podczas przetwarzania pliku {file_path}: {e}")
        return 0, None

def count_positions_in_all_files():
    """
    Liczy liczbę pozycji we wszystkich plikach {litera}.json.
    Wyświetla wyniki posortowane alfabetycznie i według liczby pozycji.
    """
    # Lista plików do przetworzenia (wszystkie litery alfabetu)
    letter_files = [f"{letter}.json" for letter in "abcdefghijklmnopqrstuvwxyz"]
    
    # Zbieranie wyników
    results = []
    total_positions = 0
    
    print("\nLiczenie pozycji w plikach {litera}.json...\n")
    
    for file_name in letter_files:
        if os.path.exists(file_name):
            count, letter = count_positions_in_file(file_name)
            if letter:
                results.append((letter, count))
                total_positions += count
                print(f"Plik {file_name}: {count} pozycji dla litery '{letter}'")
        else:
            print(f"Plik {file_name} nie istnieje")
    
    print("\n--- Podsumowanie ---")
    
    # Wyświetlanie wyników posortowanych alfabetycznie
    print("\nWyniki posortowane alfabetycznie:")
    for letter, count in sorted(results, key=lambda x: x[0]):
        print(f"Litera {letter}: {count} pozycji")
    
    # Wyświetlanie wyników posortowanych według liczby pozycji (malejąco)
    print("\nWyniki posortowane według liczby pozycji (malejąco):")
    for letter, count in sorted(results, key=lambda x: x[1], reverse=True):
        print(f"Litera {letter}: {count} pozycji")
    
    print(f"\nŁączna liczba pozycji we wszystkich plikach: {total_positions}")

def update_count_in_files():
    """
    Aktualizuje pole 'count' w każdym pliku {litera}.json na podstawie
    rzeczywistej liczby pozycji w tablicy 'positions'.
    """
    letter_files = [f"{letter}.json" for letter in "abcdefghijklmnopqrstuvwxyz"]
    
    print("\nAktualizacja pola 'count' w plikach {litera}.json...\n")
    
    for file_name in letter_files:
        if not os.path.exists(file_name):
            print(f"Plik {file_name} nie istnieje - pomijam")
            continue
        
        try:
            # Wczytanie pliku
            with open(file_name, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not isinstance(data, dict) or "positions" not in data:
                print(f"Nieprawidłowa struktura pliku {file_name} - pomijam")
                continue
            
            # Obliczenie aktualnej liczby pozycji
            actual_count = len(data["positions"])
            current_count = data.get("count", 0)
            
            # Aktualizacja pola 'count', jeśli potrzebne
            if actual_count != current_count:
                data["count"] = actual_count
                with open(file_name, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"Zaktualizowano plik {file_name}: zmieniono 'count' z {current_count} na {actual_count}")
            else:
                print(f"Plik {file_name}: liczba pozycji jest już aktualna ({actual_count})")
        
        except Exception as e:
            print(f"Błąd podczas aktualizacji pliku {file_name}: {e}")

if __name__ == "__main__":
    print("Program do liczenia pozycji w plikach {litera}.json")
    print("1. Policz pozycje we wszystkich plikach")
    print("2. Zaktualizuj pole 'count' w plikach")
    choice = input("Wybierz opcję (1/2): ")
    
    if choice == "1":
        count_positions_in_all_files()
    elif choice == "2":
        update_count_in_files()
    else:
        print("Nieprawidłowy wybór. Kończę program.") 