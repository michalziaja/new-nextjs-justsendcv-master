#!/usr/bin/env python
import os
import json
import glob
from collections import defaultdict
import re

"""
Skrypt do łączenia plików JSON z poszczególnymi stanowiskami
w jeden plik dla każdej litery alfabetu.

Przykład:
- dane/data/A/account_director.json 
- dane/data/A/account_executive.json 
=> dane/data/A/a.json
"""

def combine_json_files(data_dir="dane/data"):
    """
    Główna funkcja łącząca pliki JSON dla każdej litery alfabetu.
    
    Args:
        data_dir (str): Ścieżka do katalogu z danymi.
    """
    # Sprawdzenie, czy katalog istnieje
    if not os.path.exists(data_dir):
        print(f"Katalog {data_dir} nie istnieje!")
        return
    
    # Przeszukiwanie katalogów alfabetycznych (A-Z)
    for letter_dir in sorted(glob.glob(os.path.join(data_dir, "[A-Ż]"))):
        letter = os.path.basename(letter_dir)
        output_file = os.path.join(letter_dir, letter.lower() + ".json")
        
        print(f"Przetwarzanie katalogu {letter_dir}...")
        
        # Pobranie wszystkich plików JSON w tym katalogu (oprócz już istniejącego łączonego pliku)
        json_files = [f for f in glob.glob(os.path.join(letter_dir, "*.json")) 
                      if os.path.basename(f).lower() != letter.lower() + ".json"]
        
        # Jeśli nie ma plików do łączenia, pomijamy tę literę
        if not json_files:
            print(f"Brak plików do połączenia w katalogu {letter_dir}")
            continue
        
        # Struktura na łączone dane
        combined_data = []
        positions_data = {}
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Sprawdzamy czy dane są już w tym formacie (list), czy to pojedyncze stanowisko
                if isinstance(data, list) and len(data) > 0:
                    # Jeśli mamy format [{"letter": "X", "positions": [...]}]
                    for item in data:
                        if "letter" in item and "positions" in item:
                            if item["letter"] not in positions_data:
                                positions_data[item["letter"]] = []
                            
                            # Usuwamy pole "url" z każdej pozycji
                            cleaned_positions = []
                            for position in item["positions"]:
                                position_copy = position.copy()
                                if "url" in position_copy:
                                    del position_copy["url"]
                                cleaned_positions.append(position_copy)
                            
                            positions_data[item["letter"]].extend(cleaned_positions)
            except Exception as e:
                print(f"Błąd podczas przetwarzania pliku {json_file}: {str(e)}")
        
        # Tworzenie finalnej struktury
        for letter_key, positions in positions_data.items():
            combined_data.append({
                "letter": letter_key,
                "positions": positions
            })
        
        # Zapisanie połączonych danych do pliku
        if combined_data:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(combined_data, f, ensure_ascii=False, indent=2)
            print(f"Utworzono plik {output_file} z {sum(len(item['positions']) for item in combined_data)} stanowiskami")
        else:
            print(f"Brak danych do zapisania dla litery {letter}")

def main():
    # Główny katalog z danymi
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "dane", "data")
    
    print(f"Rozpoczynam łączenie plików JSON w katalogu: {data_dir}")
    combine_json_files(data_dir)
    print("Zakończono łączenie plików JSON.")

if __name__ == "__main__":
    main() 