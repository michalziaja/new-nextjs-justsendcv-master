import json
import os
import logging
from pathlib import Path

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', datefmt='%H:%M:%S')

def count_files_in_letter_directories(data_dir="data"):
    """
    Liczy ilość plików JSON w każdym katalogu literowym w folderze data.
    
    Args:
        data_dir (str): Ścieżka do katalogu z danymi.
        
    Returns:
        dict: Słownik zawierający liczbę plików dla każdej litery.
    """
    # Ustalamy ścieżkę do katalogu data
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, data_dir)
    
    if not os.path.exists(data_path):
        logging.error(f"Katalog {data_path} nie istnieje!")
        return {}
    
    # Słownik na wyniki
    letter_file_counts = {}
    
    # Przeszukiwanie wszystkich katalogów w folderze data
    for letter_dir in sorted(os.listdir(data_path)):
        dir_path = os.path.join(data_path, letter_dir)
        
        # Sprawdzamy czy to katalog
        if os.path.isdir(dir_path):
            letter = letter_dir  # Nazwa katalogu to litera
            
            # Liczymy pliki JSON (ignorujemy plik {letter}.json)
            json_files = [f for f in os.listdir(dir_path) 
                          if f.endswith('.json') and f.lower() != f"{letter.lower()}.json"]
            file_count = len(json_files)
            
            letter_file_counts[letter] = file_count
            logging.info(f"Litera {letter}: {file_count} plików")
    
    # Sortowanie wyników alfabetycznie
    sorted_results = dict(sorted(letter_file_counts.items()))
    
    return sorted_results

def save_results_to_json(results, output_file="letter_file_counts.json"):
    """
    Zapisuje wyniki do pliku JSON.
    
    Args:
        results (dict): Słownik z liczbą plików dla każdej litery.
        output_file (str): Nazwa pliku wyjściowego.
    """
    try:
        # Oblicz sumę wszystkich plików
        total_files = sum(results.values())
        
        # Przygotuj dane do zapisania
        output_data = {
            "total_files": total_files,
            "letter_counts": results
        }
        
        # Zapisz do pliku JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        logging.info(f"Zapisano wyniki do pliku {output_file}")
        logging.info(f"Łączna liczba plików we wszystkich folderach: {total_files}")
        
    except Exception as e:
        logging.error(f"Błąd podczas zapisywania wyników do pliku {output_file}: {e}")

def main():
    """
    Główna funkcja programu.
    """
    logging.info("Rozpoczynam liczenie plików w katalogach literowych...")
    
    # Liczenie plików
    results = count_files_in_letter_directories()
    
    if results:
        # Wyświetlanie posortowanych wyników
        logging.info("\n--- Podsumowanie ---")
        
        # Sortowanie według liczby plików (malejąco)
        logging.info("\nWyniki posortowane według liczby plików (malejąco):")
        for letter, count in sorted(results.items(), key=lambda x: x[1], reverse=True):
            logging.info(f"Litera {letter}: {count} plików")
        
        # Zapisanie wyników do pliku JSON
        save_results_to_json(results)
    else:
        logging.warning("Brak wyników do zapisania.")
    
    logging.info("Zakończono liczenie plików.")

if __name__ == "__main__":
    main() 