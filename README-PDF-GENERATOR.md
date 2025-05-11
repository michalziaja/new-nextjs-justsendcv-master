# Generator PDF

## Konfiguracja
Generator PDF używa biblioteki `@sparticuz/chromium` i `puppeteer-core` do renderowania stron HTML do plików PDF.

### Zależności
```bash
npm install @sparticuz/chromium puppeteer-core
```

### Kompatybilność z Netlify/Vercel
Generator został zoptymalizowany do działania w środowiskach serverless, takich jak Netlify Functions czy Vercel Serverless Functions.

## Rozwiązywanie problemów

### Błąd z chrome-aws-lambda
Jeśli napotkasz błąd dotyczący niekompatybilnych wersji `chrome-aws-lambda` i `puppeteer-core`, wykonaj następujące kroki:

1. Odinstaluj `chrome-aws-lambda`:
```bash
npm uninstall chrome-aws-lambda
```

2. Zainstaluj `@sparticuz/chromium`:
```bash
npm install @sparticuz/chromium
```

3. Zaktualizuj swoją konfigurację w pliku generatora PDF:

```javascript
// Zmień import z
import chromium from 'chrome-aws-lambda';
// na
import chromium from '@sparticuz/chromium';

// Dodaj inicjalizację czcionek
await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

// Pobierz ścieżkę do executable
const executablePath = await chromium.executablePath();

// Zaktualizuj opcje uruchamiania
const browser = await puppeteer.launch({ 
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: executablePath,
  headless: true, // zamiast chromium.headless
});
```

## Uwagi dotyczące wydajności
- Generator PDF może wymagać znacznej ilości pamięci, szczególnie przy generowaniu dokumentów z dużą ilością grafik.
- W środowiskach serverless zaleca się zwiększenie limitu pamięci dla funkcji (np. w Netlify: minimum 1024 MB).
- Wersja lokalnie używana do testów może różnić się od wersji działającej w chmurze. 