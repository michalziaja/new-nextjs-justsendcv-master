import json
import re
import os
import cloudscraper
from bs4 import BeautifulSoup
from collections import defaultdict
import time
import logging
import random

# letter_files = ["a.json", "b.json", "c.json", "d.json", "e.json", "f.json", "g.json", "h.json", "i.json", "j.json", "k.json", "l.json", "m.json", "n.json", "o.json", "p.json", "q.json", "r.json", "s.json", "t.json", "u.json", "v.json", "w.json", "x.json", "y.json", "z.json"]

letter_files = ["r.json", "ś.json", "s.json", "t.json", "u.json", "v.json", "w.json", "x.json", "y.json", "z.json", "ż.json"]
reset_checked = False

# Konfiguracja podstawowego logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', datefmt='%H:%M:%S')

# --- Funkcje pomocnicze ---
def clean_number(text):
    """Usuwa znaki niedziesiętne i konwertuje na int."""
    if text is None:
        return None
    try:
        # Usuwa spacje, PLN, itp., zachowuje tylko cyfry
        cleaned = re.sub(r'[^\d]', '', str(text))
        return int(cleaned) if cleaned else None
    except (ValueError, TypeError):
        return None

def clean_text(text):
    """Czyści tekst ze znaków kontrolnych i zapewnia poprawne kodowanie UTF-8."""
    if text is None:
        return None
    # Usuń znaki kontrolne oprócz tabulatorów i nowych linii
    cleaned = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', str(text))
    # Zapewnij poprawne kodowanie UTF-8
    cleaned = cleaned.encode('utf-8', 'ignore').decode('utf-8')
    return cleaned.strip()

def split_categories(category_text):
    """Rozdziela kategorie według przecinków lub dwukropków."""
    if not category_text or category_text == "brak kategorii":
        return ["brak kategorii"]
    categories = [clean_text(cat.strip()) for cat in re.split(r'[,:]', category_text) if cat.strip()]
    return categories if categories else ["brak kategorii"]

def fetch_page(url):
    """Pobiera zawartość HTML strony."""
    try:
        scraper = cloudscraper.create_scraper()
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36' # Zaktualizowany UA
        }
        response = scraper.get(url, headers=headers, timeout=20) # Dodano timeout
        response.encoding = 'utf-8'  # Ustawiam jawnie kodowanie na utf-8
        response.raise_for_status() # Sprawdza status HTTP
        return response.text
    except Exception as e:
        logging.error(f"Błąd przy pobieraniu strony {url}: {e}")
        return None

# --- Główna funkcja scrapująca ---
def scrape_position(url, title_from_json=None):
    """Scrapuje dane dla pojedynczego stanowiska."""
    html_content = fetch_page(url)
    if not html_content:
        logging.warning(f"Pusto. Zwracam 'empty'.")
        return "empty"

    soup = BeautifulSoup(html_content, 'html.parser')

    # === KROK 1: Sprawdzenie istnienia sekcji "próba" i pobranie rozmiaru ===
    sample_size = None
    try:
        number_desc_elements = soup.select('div.number-desc div.hidden-xs')
        found_próba = False
        for element in number_desc_elements:
            element_text_lower = element.text.lower()
            # Szukamy wzorca "próba: <liczba>"
            sample_match = re.search(r'próba:\s*(\d+)', element_text_lower)
            if sample_match:
                sample_size = int(sample_match.group(1))
                logging.info(f"Próba: {sample_size}.")
                found_próba = True
                break # Znaleziono, wychodzimy z pętli
        if not found_próba:
             logging.warning(f"Pusto. Zwracam 'empty'.")
             return "empty" # Kluczowy warunek - brak próby = strona pusta/nieprawidłowa
    except Exception as e:
        logging.error(f"Błąd podczas szukania sekcji 'próba' dla {url}: {e}. Zwracam 'empty'.")
        return "empty"

    # === KROK 2: Ekstrakcja podstawowych informacji (Tytuł, Kategoria, Data aktualizacji) ===
    # Tytuł - używamy wartości z pliku JSON, jeśli została podana
    title = clean_text(title_from_json) if title_from_json else None
    
    # Jeżeli z jakiegoś powodu nie mamy tytułu z JSON, próbujemy znaleźć na stronie (jako fallback)
    if not title:
        try:
            title_element = soup.find('h1')
            if title_element:
                title = clean_text(title_element.text.replace("Ile zarabia ", "").replace("?", "").strip())
            else:
                # Spróbuj znaleźć w h2 w .heading lub podobnym, jeśli h1 brak
                h2_heading = soup.select_one('div.heading h2')
                if h2_heading:
                    # Często ma format "Zarobki [nazwa stanowiska]"
                     title_match = re.match(r"Zarobki\s+(.+)", h2_heading.text.strip(), re.IGNORECASE)
                     if title_match:
                         title = clean_text(title_match.group(1).strip())
                     else:
                         title = clean_text(h2_heading.text.strip()) # Weź cały tekst h2 jak nie pasuje wzorzec
                else:
                    logging.warning(f"Nie znaleziono elementu h1 ani h2 w div.heading dla {url}. Próbuję wygenerować z URL.")

        except Exception as e:
            logging.error(f"Błąd przy ekstrakcji tytułu dla {url}: {e}")

        if not title:
            try:
                # Fallback - generowanie tytułu z URL
                title_part = url.split('/')[-1]
                if title_part.startswith("ile-zarabia-"):
                    title_part = title_part[len("ile-zarabia-"):]
                title = clean_text(title_part.replace("-", " ").title())
                logging.info(f"Wygenerowano tytuł z URL: '{title}' dla {url}")
            except Exception as e:
                logging.error(f"Nie udało się wygenerować tytułu z URL {url}: {e}")
                title = "Brak tytułu" # Ostateczny fallback

    # Kategoria
    category_text = "brak kategorii"
    try:
        # Ponownie przeszukujemy number_desc
        for element in number_desc_elements: # Używamy już pobranych elementów
            if "grupa stanowisk:" in element.text.lower():
                category_span = element.select_one('span.primary-color')
                if category_span:
                    category_text = clean_text(category_span.text.strip())
                    break # Znaleziono, wychodzimy
        if category_text == "brak kategorii":
             logging.warning(f"Brak 'grupa stanowisk'.")
    except Exception as e:
        logging.warning(f"Błąd podczas szukania kategorii dla {url}: {e}")

    # Data aktualizacji
    update_date = "N/A"
    try:
        # Ponownie przeszukujemy number_desc
        for element in number_desc_elements: # Używamy już pobranych elementów
            if "ostatnia aktualizacja:" in element.text.lower():
                update_date_span = element.select_one('span.primary-color')
                if update_date_span:
                    update_date = update_date_span.text.strip()
                    break # Znaleziono, wychodzimy
    except Exception as e:
         logging.warning(f"Błąd podczas szukania daty aktualizacji dla {url}: {e}")

    # === KROK 3: Wykrywanie struktury strony (z poziomami vs bez) ===
    has_levels = soup.select_one('div.levels') is not None
    if has_levels:
        logging.info(f"Stanowisko z poziomami.")
    else:
        logging.info(f"Stanowisko bez poziomów.")

    # === KROK 4: Ekstrakcja danych zależnie od struktury ===
    levels_data = []
    salary_data = {"gross": {"median": None, "p25": None, "p75": None}, "net": {"median": None, "p25": None, "p75": None}}
    gender_data = {"women": {"count": None, "percentage": None}, "men": {"count": None, "percentage": None}}
    benefits_data = []

    # Funkcje pomocnicze do bezpiecznego pobierania danych
    def get_data_attr_value(soup_context, selector, attribute='data-value', is_numeric=True):
        """Bezpiecznie pobiera wartość z atrybutu data-* elementu."""
        try:
            element = soup_context.select_one(selector)
            if element and attribute in element.attrs:
                value = element[attribute]
                return clean_number(value) if is_numeric else value.strip()
            # logging.warning(f"Nie znaleziono elementu/atrybutu dla selektora: '{selector}' atrybut: '{attribute}'")
            return None
        except Exception as e:
            logging.error(f"Błąd pobierania atrybutu dla '{selector}': {e}")
            return None

    def get_element_text_value(soup_context, selector, is_numeric=True):
        """Bezpiecznie pobiera tekst z elementu."""
        try:
            element = soup_context.select_one(selector)
            if element:
                value = element.text
                return clean_number(value) if is_numeric else value.strip()
            # logging.warning(f"Nie znaleziono elementu dla selektora: '{selector}'")
            return None
        except Exception as e:
            logging.error(f"Błąd pobierania tekstu dla '{selector}': {e}")
            return None

    if has_levels:
        # --- Ekstrakcja dla strony Z POZIOMAMI ---
        level_names = {"1": "młodszy specjalista", "2": "specjalista", "3": "starszy specjalista"}
        # Dane są przechowywane w <div class="data"> wewnątrz <div class="levels">
        data_container = soup.select_one('div.levels div.data')
        if not data_container:
             logging.error(f"Nie znaleziono kontenera 'div.levels div.data' mimo wykrycia poziomów dla {url}. Dane poziomów będą puste.")
        else:
            for level in ["1", "2", "3"]:
                current_level_data = {
                    "level": level_names.get(level, f"poziom {level}"),
                    "salaries": {"gross": {"median": None, "p25": None, "p75": None}, "net": {"median": None, "p25": None, "p75": None}},
                    "gender_distribution": {"women": {"count": None, "percentage": None}, "men": {"count": None, "percentage": None}},
                    "benefits": []
                }
                
                # Wynagrodzenia dla poziomu
                current_level_data["salaries"]["gross"]["median"] = get_data_attr_value(data_container, f'div.salary[data-level="{level}"][data-type="median-gross"]')
                current_level_data["salaries"]["gross"]["p25"] = get_data_attr_value(data_container, f'div.salary[data-level="{level}"][data-type="p25-gross"]')
                current_level_data["salaries"]["gross"]["p75"] = get_data_attr_value(data_container, f'div.salary[data-level="{level}"][data-type="p75-gross"]')
                current_level_data["salaries"]["net"]["median"] = get_data_attr_value(data_container, f'div.salary[data-level="{level}"][data-type="median-net"]')
                current_level_data["salaries"]["net"]["p25"] = get_data_attr_value(data_container, f'div.salary[data-level="{level}"][data-type="p25-net"]')
                current_level_data["salaries"]["net"]["p75"] = get_data_attr_value(data_container, f'div.salary[data-level="{level}"][data-type="p75-net"]') # Poprawiono pomyłkę

                # Płeć dla poziomu
                current_level_data["gender_distribution"]["women"]["count"] = get_data_attr_value(data_container, f'div.gender-value[data-level="{level}"][data-type="women-value"]')
                current_level_data["gender_distribution"]["women"]["percentage"] = get_data_attr_value(data_container, f'div.gender-percent[data-level="{level}"][data-type="women-percent"]')
                current_level_data["gender_distribution"]["men"]["count"] = get_data_attr_value(data_container, f'div.gender-value[data-level="{level}"][data-type="man-value"]')
                current_level_data["gender_distribution"]["men"]["percentage"] = get_data_attr_value(data_container, f'div.gender-percent[data-level="{level}"][data-type="man-percent"]')

                # Benefity dla poziomu (szukamy div.benefit z odpowiednim data-level)
                level_benefits = data_container.select(f'div.benefit[data-level="{level}"][data-type="benefit-label"]')
                for benefit_elem in level_benefits:
                    try:
                        name = benefit_elem.get('data-label-value', '').strip()
                        percentage = clean_number(benefit_elem.get('data-percent-value'))
                        if name and percentage is not None:
                            current_level_data["benefits"].append({"name": name, "percentage": percentage})
                    except Exception as e:
                        logging.warning(f"Błąd przetwarzania benefitu dla poziomu {level} ({url}): {e}")

                # Dodaj dane poziomu tylko jeśli znaleziono cokolwiek sensownego (np. medianę)
                if current_level_data["salaries"]["gross"]["median"] is not None or current_level_data["gender_distribution"]["women"]["count"] is not None:
                    levels_data.append(current_level_data)
                    # logging.info(f"Przetworzono dane dla poziomu {level} dla {url}")
                else:
                     logging.warning(f"Brak istotnych danych dla poziomu {level} dla {url}. Pomijam ten poziom.")

    else:
        # --- Ekstrakcja dla strony BEZ POZIOMÓW ---
        logging.info(f"Pobieranie danych ogólnych.")

        # Wynagrodzenia (z sekcji div.view)
        salary_data["gross"]["median"] = get_element_text_value(soup, 'div.view span.js-median-gross')
        salary_data["gross"]["p25"] = get_element_text_value(soup, 'div.view span.js-p25-gross')
        salary_data["gross"]["p75"] = get_element_text_value(soup, 'div.view span.js-p75-gross')
        salary_data["net"]["median"] = get_element_text_value(soup, 'div.view span.js-median-net')
        salary_data["net"]["p25"] = get_element_text_value(soup, 'div.view span.js-p25-net')
        salary_data["net"]["p75"] = get_element_text_value(soup, 'div.view span.js-p75-net')

        # Płeć (z sekcji div.chart wewnątrz div.gender)
        gender_box = soup.select_one('div.box.gender div.chart')
        if gender_box:
            gender_data["women"]["count"] = get_element_text_value(gender_box, 'div.woman p.js-women-value')
            gender_data["women"]["percentage"] = get_data_attr_value(gender_box, 'div.woman div.circle.js-circle', attribute='js-value')
            gender_data["men"]["count"] = get_element_text_value(gender_box, 'div.man p.js-man-value')
            gender_data["men"]["percentage"] = get_data_attr_value(gender_box, 'div.man div.circle.js-circle', attribute='js-value')
        else:
            logging.warning(f"Nie znaleziono sekcji 'div.box.gender div.chart' dla {url}. Dane płci będą puste.")

        # Benefity (z sekcji div.box.benefit div.slider)
        benefit_slider = soup.select_one('div.box.benefit div.slider')
        if benefit_slider:
            # Benefity są wewnątrz bezpośrednich dzieci div.slider
            benefit_items = benefit_slider.select(':scope > div') # :scope wybiera tylko bezpośrednie dzieci
            for item in benefit_items:
                try:
                    name_elem = item.select_one('p.text-center.key-benefit')
                    circle_elem = item.select_one('div.circle.js-circle')
                    if name_elem and circle_elem and 'js-value' in circle_elem.attrs:
                        name = clean_text(name_elem.text.strip())
                        percentage = clean_number(circle_elem['js-value'])
                        if name and percentage is not None:
                            benefits_data.append({"name": name, "percentage": percentage})
                except Exception as e:
                    logging.warning(f"Błąd przetwarzania benefitu w sliderze dla {url}: {e}")
        else:
            logging.info(f"Dane benefitów - puste.")


    # === KROK 5: Ekstrakcja pozostałych danych (Zakres obowiązków, Źródło, Podobne) ===

    # Zakres obowiązków (Responsibilities)
    responsibilities = []
    try:
        # Sprawdźmy, czy jest sekcja 'Zakres obowiązków na stanowisku...'
        task_section_h4 = soup.find('h4', string=lambda text: text and 'zakres obowiązków na stanowisku' in text.lower())
        if task_section_h4:
             # Szukaj listy 'ul' w tym samym 'div.box' co h4 lub w następnym elemencie
             task_list = task_section_h4.find_next_sibling('ul')
             if not task_list: # Czasem jest w divie obok
                 parent_box = task_section_h4.find_parent(class_='box')
                 if parent_box:
                     task_list = parent_box.find('ul')

             if task_list:
                 # Czasami li nie mają klasy 'agree', bierzemy wszystkie
                 items = task_list.find_all('li')
                 responsibilities = [clean_text(li.get_text().strip().lstrip('•').strip()) for li in items if li.text.strip()]
                 if not responsibilities:
                     # Czasem tekst jest w <p> wewnątrz <li>
                     responsibilities = [clean_text(li.find('p').get_text().strip().lstrip('•').strip()) for li in items if li.find('p') and li.find('p').text.strip()]

        # Fallback na stary selektor, jeśli powyższe nie zadziała
        if not responsibilities:
             task_elements = soup.select('div.task ul li.agree') # Stary selektor
             responsibilities = [clean_text(li.get_text().strip().lstrip('•').strip()) for li in task_elements if li.text.strip()]

        if not responsibilities:
            logging.info(f"Obowiązki - puste.")

    except Exception as e:
        logging.warning(f"Błąd podczas ekstrakcji zakresu obowiązków dla {url}: {e}")


    # Dane o źródle (Ogólnopolskie Badanie Wynagrodzeń)
    # source_data = {"total_respondents": None, "positions_covered": None, "surveyed_individuals": None}
    # try:
    #     # Liczba ankietowanych w badaniu (często w .inquiry-count)
    #     inquiry_count_b = soup.select_one('p.inquiry-count b')
    #     if inquiry_count_b:
    #         source_data["total_respondents"] = clean_number(inquiry_count_b.text)

    #     # Liczba stanowisk i osób objętych badaniem (czasem w tekście przed listą stanowisk)
    #     # Przykładowy tekst: "Sedlak & Sedlak przeanalizował wynagrodzenia 581 tysięcy osób na 1136 stanowiskach."
    #     # Szukamy takiego tekstu np. w div przed sekcją 'distribution' lub 'additional-information'
    #     potential_source_texts = soup.select('div.container > p, div.box > p, h2.fs17') # Szersze poszukiwania
    #     found_details = False
    #     for p_text in potential_source_texts:
    #         text_content = p_text.get_text(separator=" ", strip=True).lower()
    #         surveyed_match = re.search(r'(\d+)\s*tysięcy\s*osób', text_content)
    #         positions_match = re.search(r'(\d+)\s*stanowisk', text_content)
    #         if surveyed_match and positions_match:
    #             source_data["surveyed_individuals"] = clean_number(surveyed_match.group(1)) * 1000
    #             source_data["positions_covered"] = clean_number(positions_match.group(1))
    #             found_details = True
    #             break # Znaleziono, przerywamy
    #     if not found_details:
    #          logging.warning(f"Nie udało się znaleźć szczegółów źródła (liczba stanowisk, osób) dla {url}")

    # except Exception as e:
    #     logging.warning(f"Błąd podczas ekstrakcji danych źródła dla {url}: {e}")


    # Podobne stanowiska (Related Positions)
    related_positions = []
    try:
        # Szukamy <p class="similar-position">
        similar_position_p = soup.select_one('p.similar-position')
        if similar_position_p:
            links = similar_position_p.find_all('a')
            for link in links:
                href = link.get('href')
                link_title = clean_text(link.text.strip().rstrip(','))
                if href and link_title:
                    # Poprawka budowania URL, jeśli jest względny
                    full_url = href
                    if href.startswith('/'):
                        # Budowanie pełnego URL z base URL strony
                        from urllib.parse import urljoin
                        base_url = "https://wynagrodzenia.pl" # Zakładamy base URL
                        full_url = urljoin(base_url, href)

                    related_positions.append({
                        "title": link_title,
                        # "url": full_url
                    })
        if not related_positions:
             logging.info(f"Podobne stanowiska - puste.")

    except Exception as e:
        logging.warning(f"Błąd podczas ekstrakcji podobnych stanowisk dla {url}: {e}")

    # === KROK 6: Złożenie wyniku ===
    result = {
        "title": title,
        "url": url,
        "category": split_categories(category_text),
        "update_date": update_date,
        "sample_size": sample_size,
        "related_positions": related_positions if related_positions else None,
        # Inicjalizujemy klucze, które będą wypełniane warunkowo
        "salaries": None,
        "levels": None,
        # NIE dodajemy tutaj top-level gender_distribution ani benefits
        "responsibilities": responsibilities if responsibilities else None,
        
    }

    # Wypełnianie danych zależnie od wykrytej struktury
    if has_levels:
        # Jeśli są poziomy, przypisujemy je do klucza 'levels'
        # a 'salaries' na głównym poziomie zostaje None
        result["levels"] = levels_data if levels_data else None
        # result["salaries"] pozostaje None (zgodnie z inicjalizacją)
        logging.info(f"Struktura z poziomami. Wynik będzie zawierał klucz 'levels'.")
    else:
        # Jeśli NIE ma poziomów, tworzymy nowy obiekt 'salaries',
        # który zawiera gross, net, gender_distribution i benefits.
        # Klucz 'levels' pozostaje None.
        combined_salaries_data = {
            "gross": salary_data.get("gross"), # Używamy .get() dla bezpieczeństwa
            "net": salary_data.get("net"),
            "gender_distribution": gender_data, # Przypisujemy zebrane dane gender
            "benefits": benefits_data if benefits_data else [] # Przypisujemy zebrane benefity (lub pustą listę)
        }
        result["salaries"] = combined_salaries_data
        # result["levels"] pozostaje None (zgodnie z inicjalizacją)


    logging.info(f"Zakończono scrapowanie.")
    return result


# --- Główna funkcja do przetwarzania wielu stanowisk ---
def scrape_multiple_positions(json_files=letter_files, data_folder="data"):
    """Przetwarza listę stanowisk z plików JSON."""
    if isinstance(json_files, str):
        # Jeśli podano pojedynczy plik, przekształć na listę
        json_files = [json_files]
    
    # Przetwarzanie każdego pliku z listy
    for json_file in json_files:
        try:
            logging.info(f"\n\n=== Rozpoczynam przetwarzanie pliku: {json_file} ===\n")
            
            # Wczytanie pliku JSON
            if not os.path.exists(json_file):
                logging.error(f"Plik {json_file} nie został znaleziony. Przechodzę do następnego.")
                continue
                
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f) # Wczytuje JEDEN słownik

            # Sprawdzenie, czy struktura jest słownikiem z wymaganymi kluczami
            if not isinstance(data, dict) or "letter" not in data or "positions" not in data:
                logging.error(f"Nieprawidłowa struktura pliku {json_file}. Oczekiwano słownika z kluczami 'letter' i 'positions'. Przechodzę do następnego.")
                continue

            letter = data.get("letter")
            positions = data.get("positions", [])

            if not isinstance(positions, list):
                logging.error(f"Klucz 'positions' w pliku {json_file} nie zawiera listy. Przechodzę do następnego.")
                continue

            logging.info(f"Przetwarzanie litery: '{letter}' z {len(positions)} pozycjami.")

            # Sprawdzenie, czy wszystkie pozycje są już przetworzone
            all_checked = all("checked" in pos and pos.get("checked") in ["yes", "empty"] for pos in positions)

            needs_saving = False # Flaga do kontroli zapisu pliku JSON

            # Jeśli wszystkie mają "checked": "yes" lub "empty", resetujemy statusy tylko gdy reset_checked = True
            if all_checked and positions and reset_checked: 
                logging.info(f"Wszystkie stanowiska dla litery '{letter}' zostały już sprawdzone. Resetowanie statusu (reset_checked=True).")
                for pos in positions:
                    if "checked" in pos:
                        del pos["checked"]
                needs_saving = True # Zaznacz, że trzeba zapisać zmiany po resecie
            elif all_checked and positions and not reset_checked:
                logging.info(f"Wszystkie stanowiska dla litery '{letter}' zostały już sprawdzone. Pomijam cały plik (reset_checked=False).")
                continue # Przejdź do następnego pliku

            # Tworzenie folderu data/{litera}, jeśli nie istnieje
            letter_data_folder = os.path.join(data_folder, letter)
            os.makedirs(letter_data_folder, exist_ok=True)

            # Liczniki dla statystyk
            skipped_count = 0
            processed_count = 0
            empty_count = 0
            success_count = 0

            # Przetwarzanie każdego stanowiska dla danej litery
            for i, position in enumerate(positions):
                # Sprawdzenie, czy pozycja ma wymagane klucze
                if not isinstance(position, dict) or "url" not in position or "title" not in position:
                    logging.warning(f"Pominięto nieprawidłowy wpis w pozycji {i} dla litery '{letter}': {position}")
                    continue

                pos_title = position["title"]
                pos_url = position["url"]
                checked_status = position.get("checked")

                # Gdy reset_checked = False, pomijamy już sprawdzone stanowiska
                if not reset_checked and checked_status in ["yes", "empty"]:
                    skipped_count += 1
                    continue # Pomijamy już sprawdzone stanowisko

                if checked_status not in ["yes", "empty"]:
                    logging.info(f"[{letter} - {i+1}/{len(positions)}] Scrapowanie: ")
                    processed_count += 1
                    position_data = scrape_position(pos_url, pos_title) # Przekazujemy tytuł z pliku JSON do funkcji scrapującej

                    if position_data == "empty":
                        # Oznacz jako "empty" w słowniku 'data'
                        position["checked"] = "empty"
                        empty_count += 1
                        # logging.info(f"Oznaczono jako 'empty' w pamięci dla: {pos_title}")
                        logging.info("--------------------------------")
                        needs_saving = True
                    elif position_data and isinstance(position_data, dict):
                        # Zapis do pliku data/{litera}/{nazwastanowiska}.json
                        # Czyszczenie nazwy pliku
                        safe_filename = re.sub(r'[\\/*?:"<>|]', "", pos_title).replace(' ', '_').lower()
                        filename = os.path.join(letter_data_folder, f"{safe_filename}.json")
                        try:
                            # Zapisujemy tylko dane scrapowanego stanowiska, opakowane w strukturę
                            output_structure = [{"letter": letter, "positions": [position_data]}]
                            with open(filename, "w", encoding="utf-8") as f:
                                json.dump(output_structure, f, ensure_ascii=False, indent=2)
                            logging.info(f"Zapisano dane do JSON")

                            # Oznacz jako "yes" w słowniku 'data'
                            position["checked"] = "yes"
                            success_count += 1
                            # logging.info(f"Oznaczono jako 'yes' w pamięci dla: {pos_title}")
                            logging.info("--------------------------------")
                            needs_saving = True
                        except IOError as e:
                            logging.error(f"Błąd zapisu do pliku {filename}: {e}")
                        except Exception as e:
                            logging.error(f"Nieoczekiwany błąd podczas zapisu pliku {filename}: {e}")
                    else:
                        # Jeśli scrape_position zwróciło coś innego niż słownik lub "empty"
                        logging.error(f"Scrapowanie dla {pos_title} ({pos_url}) zwróciło nieoczekiwany wynik: {position_data}. Nie zmieniono statusu 'checked'.")

                    # Zapis pliku JSON po każdej *zmianie* statusu (dla bezpieczeństwa)
                    if needs_saving:
                        try:
                            # Zapisujemy cały zmodyfikowany słownik 'data'
                            with open(json_file, "w", encoding="utf-8") as f:
                                json.dump(data, f, ensure_ascii=False, indent=2)
                            needs_saving = False # Reset flagi po zapisie
                            logging.debug(f"Zapisano zaktualizowany plik {json_file}")
                        except IOError as e:
                            logging.error(f"Krytyczny błąd: Nie można zapisać postępu do {json_file}: {e}")
                        except Exception as e:
                            logging.error(f"Nieoczekiwany błąd podczas zapisu pliku {json_file}: {e}")

                    # Krótka przerwa, aby uniknąć blokady
                    # sleep_time = abs(2.5 + (random.random() - 1) * 2.5) # np. 1.25 do 2.75 sekundy
                    # logging.info(f"Pauza na {sleep_time:.2f}s")
                    # time.sleep(sleep_time)
                    # sleep_time = 1 + random.uniform(1, 3)
                    sleep_time = 1 + random.uniform(1, 2)
                    logging.info(f"Pauza na {sleep_time:.2f}s")
                    time.sleep(sleep_time)

                else:
                    if reset_checked:
                        # Jeśli reset_checked=True, przetwarzamy wszystkie stanowiska bez względu na status
                        logging.info(f"[{letter} - {i+1}/{len(positions)}] Przetwarzam ponownie: {pos_title} (poprzedni status: {checked_status})")
                        processed_count += 1
                        # ... kod z góry ...
                    else:
                        # To nie powinno się zdarzyć przy logice pomijania, ale na wszelki wypadek
                        skipped_count += 1
                        logging.debug(f"[{letter} - {i+1}/{len(positions)}] Pominięto: {pos_title} (już sprawdzone: {checked_status})")

            # Wyświetl statystyki po przetworzeniu wszystkich stanowisk dla danej litery
            logging.info(f"Statystyki dla litery '{letter}':")
            logging.info(f"- Łącznie stanowisk: {len(positions)}")
            logging.info(f"- Przetworzono: {processed_count}")
            logging.info(f"- Pominięto (już sprawdzone): {skipped_count}")
            logging.info(f"- Sukces: {success_count}")
            logging.info(f"- Puste: {empty_count}")

            logging.info(f"Przetworzono wszystkie stanowiska dla litery '{letter}'.")

        except FileNotFoundError:
            logging.error(f"Plik {json_file} nie istnieje. Przechodzę do następnego.")
        except json.JSONDecodeError:
            logging.error(f"Błąd dekodowania pliku JSON: {json_file}. Sprawdź jego poprawność.")
        except Exception as e:
            logging.exception(f"Wystąpił nieoczekiwany błąd podczas przetwarzania pliku {json_file}: {e}")
            
        logging.info(f"=== Zakończono przetwarzanie pliku: {json_file} ===\n")
        sleep_time = 3 + random.uniform(1, 3)
        logging.info(f"Pauza na {sleep_time:.2f}s")
        time.sleep(sleep_time)


# Uruchomienie scrapera
if __name__ == "__main__":
    # Przetwarzanie wszystkich plików z litery letter_files
    scrape_multiple_positions(letter_files)