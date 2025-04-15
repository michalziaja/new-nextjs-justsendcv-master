import json
import os
import logging
from pathlib import Path

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', datefmt='%H:%M:%S')

def combine_all_letter_files(data_dir="data", output_file="position_salary.json"):
    """
    Łączy wszystkie pliki {litera}.json z folderów literowych do jednego pliku.
    
    Args:
        data_dir (str): Ścieżka do katalogu z danymi.
        output_file (str): Nazwa pliku wyjściowego.
    """
    # Ustalamy ścieżkę do katalogu data
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, data_dir)
    output_path = os.path.join(base_dir, output_file)
    
    if not os.path.exists(data_path):
        logging.error(f"Katalog {data_path} nie istnieje!")
        return False
    
    # Lista na wszystkie pozycje
    all_positions = []
    total_letters = 0
    total_positions = 0
    
    # Przeszukiwanie wszystkich katalogów w folderze data
    for letter_dir in sorted(os.listdir(data_path)):
        dir_path = os.path.join(data_path, letter_dir)
        
        # Sprawdzamy czy to katalog
        if os.path.isdir(dir_path):
            letter = letter_dir  # Nazwa katalogu to litera
            letter_file = os.path.join(dir_path, f"{letter.lower()}.json")
            
            if os.path.exists(letter_file):
                try:
                    with open(letter_file, 'r', encoding='utf-8') as f:
                        letter_data = json.load(f)
                    
                    # Sprawdzamy strukturę pliku
                    if isinstance(letter_data, list):
                        # Dodajemy każdy element z listy
                        for item in letter_data:
                            if "letter" in item and "positions" in item:
                                positions_count = len(item["positions"])
                                all_positions.append(item)
                                total_positions += positions_count
                                logging.info(f"Dodano {positions_count} pozycji z litery {letter}")
                    else:
                        logging.warning(f"Nieprawidłowa struktura pliku {letter_file} - oczekiwano listy")
                    
                    total_letters += 1
                    
                except json.JSONDecodeError:
                    logging.error(f"Błąd dekodowania JSON w pliku: {letter_file}")
                except Exception as e:
                    logging.error(f"Błąd podczas przetwarzania pliku {letter_file}: {e}")
            else:
                logging.warning(f"Plik {letter.lower()}.json nie istnieje w katalogu {dir_path}")
    
    # Zapisujemy wszystkie pozycje do jednego pliku
    if all_positions:
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(all_positions, f, ensure_ascii=False, indent=2)
            
            logging.info(f"Zapisano {total_positions} pozycji z {total_letters} liter do pliku {output_file}")
            return True
        except Exception as e:
            logging.error(f"Błąd podczas zapisywania do pliku {output_file}: {e}")
            return False
    else:
        logging.warning("Brak pozycji do zapisania")
        return False

def main():
    """
    Główna funkcja programu.
    """
    logging.info("Rozpoczynam łączenie plików z literami do jednego pliku...")
    
    # Łączenie plików
    success = combine_all_letter_files()
    
    if success:
        logging.info("Zakończono łączenie plików - wszystkie dane zostały zapisane.")
    else:
        logging.error("Wystąpił błąd podczas łączenia plików.")
    
if __name__ == "__main__":
    main() 