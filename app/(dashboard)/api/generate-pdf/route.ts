// //api/generate-pdf/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import puppeteer from 'puppeteer';
// import { spacing } from '@/components/creator/templates/TemplateStyles';
// export async function POST(request: NextRequest) {
//   console.log("Otrzymano żądanie generowania PDF");
  
//   try {
//     // Pobierz dane z żądania
//     const data = await request.json();
//     console.log("Dane otrzymane, przetwarzanie...");
    
//     const { htmlContent, cssStyles, options } = data;
    
//     if (!htmlContent) {
//       console.error("Brak treści HTML");
//       return NextResponse.json(
//         { error: 'Brak treści HTML' },
//         { status: 400 }
//       );
//     }

//     // Przygotuj pełną treść HTML dokumentu
//     const fullHtml = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>CV PDF</title>
//           <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
//           <style>
//             ${cssStyles}
//             @page {
//               size: A4;
//               margin: 0;
//               padding: 0;
//             }
//             html {
//               margin: 0;
//               padding: 0;
//               height: 100%;
//             }
//             body {
//               margin: 0;
//               padding: 0;
//               -webkit-print-color-adjust: exact;
//               print-color-adjust: exact;
//               font-family: 'Roboto', sans-serif;
//               line-height: 1.5;
//               min-height: 100%;
//               position: relative;
//             }
//             * {
//               box-sizing: border-box;
//               margin: 0;
//               padding: 0;
//             }
//             #cv-container {
//               position: relative;
//               min-height: 100%;
              
//             }
//             p {
//               margin: 0;
//               padding: 0;
//             }
//           </style>
//         </head>
//         <body>
//           <div id="cv-container">
//             ${htmlContent}
//           </div>
//         </body>
//       </html>
//     `;

//     console.log("Uruchamianie przeglądarki Puppeteer...");
    
//     // Uruchom Puppeteer z odpowiednimi opcjami
//     const browser = await puppeteer.launch({ 
//       headless: true  // Używamy true zamiast 'new', aby uniknąć błędów typowania
//     }).catch(err => {
//       console.error("Błąd podczas uruchamiania przeglądarki:", err);
//       throw err;
//     });
    
//     console.log("Przeglądarka uruchomiona, tworzenie nowej strony...");
    
//     const page = await browser.newPage().catch(err => {
//       console.error("Błąd podczas tworzenia nowej strony:", err);
//       browser.close();
//       throw err;
//     });
    
//     console.log("Strona utworzona, ustawianie zawartości HTML...");
    
//     // Ustaw zawartość strony
//     await page.setContent(fullHtml, { waitUntil: 'networkidle0' }).catch(err => {
//       console.error("Błąd podczas ustawiania zawartości strony:", err);
//       browser.close();
//       throw err;
//     });
    
//     console.log("Zawartość HTML ustawiona, generowanie PDF...");
    
//     // Konfiguracja PDF
//     const pdfConfig = {
//       format: 'A4',
//       printBackground: true,
//       margin: { top: spacing.document.paddingTop, right: '0', bottom: '0', left: '0' },
//       preferCSSPageSize: true,
//       ...options
//     };
    
//     // Generuj PDF
//     const pdfBuffer = await page.pdf(pdfConfig).catch(err => {
//       console.error("Błąd podczas generowania PDF:", err);
//       browser.close();
//       throw err;
//     });
    
//     console.log("PDF wygenerowany, zamykanie przeglądarki...");
    
//     // Zamknij przeglądarkę
//     await browser.close().catch(err => {
//       console.error("Błąd podczas zamykania przeglądarki:", err);
//     });
    
//     console.log("Przeglądarka zamknięta, zwracanie odpowiedzi...");
    
//     // Zwróć PDF jako odpowiedź
//     return new NextResponse(pdfBuffer, {
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename="CV_${options?.filename || 'dokument'}.pdf"`,
//       },
//     });
//   } catch (error) {
//     console.error('Błąd podczas generowania PDF:', error);
    
//     // Zwróć szczegółowy błąd
//     return NextResponse.json(
//       { error: `Wystąpił błąd podczas generowania PDF: ${error instanceof Error ? error.message : 'Nieznany błąd'}` },
//       { status: 500 }
//     );
//   }
// } 


//api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Importujemy specjalne wersje bibliotek do środowisk serverless
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { spacing } from '@/components/creator/templates/TemplateStyles';

// Funkcja do sanityzacji nazwy pliku - usuwa znaki specjalne i diakrytyczne
function sanitizeFilename(filename: string): string {
  // Usuwamy znaki diakrytyczne (np. ą -> a, ć -> c, itd.)
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Zamiana polskich znaków na łacińskie
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
    // Usuwamy inne znaki specjalne, które mogą powodować problemy
    .replace(/[^\w.-]/g, '_');
}

export async function POST(request: NextRequest) {
  console.log("Otrzymano żądanie generowania PDF");
  
  try {
    // Pobierz dane z żądania
    const data = await request.json();
    console.log("Dane otrzymane, przetwarzanie...");
    
    const { htmlContent, cssStyles, options } = data;
    
    if (!htmlContent) {
      console.error("Brak treści HTML");
      return NextResponse.json(
        { error: 'Brak treści HTML' },
        { status: 400 }
      );
    }

    // Przygotuj pełną treść HTML dokumentu z ulepszonymi stylami dla PDF
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CV PDF</title>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
          <style>
            ${cssStyles}
            
            /* Dodatkowe style dla poprawy zgodności PDF */
            @page {
              size: A4;
              margin: 0;
              padding: 0;
            }
            
            html {
              margin: 0;
              padding: 0;
              height: 100%;
              font-size: 16px; /* Bazowy rozmiar czcionki dla jednostek rem/em */
            }
            
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              font-family: 'Roboto', sans-serif;
              line-height: 1.5;
              min-height: 100%;
              position: relative;
              width: 210mm; /* Explicite ustawiamy szerokość A4 */
              background-color: white;
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            #cv-container {
              position: relative;
              min-height: 100%;
              width: 100%;
            }
            
            p {
              margin: 0;
              padding: 0;
              line-height: inherit;
            }
            
            /* Poprawa renderowania flexbox w PDF */
            [style*="display: flex"] {
              display: -webkit-flex !important;
              display: flex !important;
            }
            
            /* Poprawa renderowania kolorów tła */
            [style*="background"] {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Stabilizacja borderów */
            [style*="border"] {
              border-collapse: separate;
              border-spacing: 0;
            }
            
            /* Poprawa renderowania obrazów */
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            
            /* Zapobieganie łamaniu wierszy w niewłaściwych miejscach */
            .no-break {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div id="cv-container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    console.log("Uruchamianie przeglądarki Puppeteer...");
    
    // Instalujemy chromium, jeśli potrzeba
    await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
    // W środowisku produkcyjnym używamy wersji serverless, lokalnie używamy normalnej instalacji
    const executablePath = await chromium.executablePath();
    
    // Uruchom Puppeteer z ulepszonymi opcjami dla lepszej zgodności
    const browser = await puppeteer.launch({ 
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--font-render-hinting=none', // Lepsze renderowanie czcionek
        '--force-color-profile=srgb', // Stabilny profil kolorów
        '--disable-font-subpixel-positioning' // Stabilne pozycjonowanie czcionek
      ],
      defaultViewport: {
        width: 794, // A4 width w pikselach (210mm * 3.779)
        height: 1123, // A4 height w pikselach (297mm * 3.779)
        deviceScaleFactor: 1, // Stały współczynnik skali
      },
      executablePath: executablePath,
      headless: true,
    }).catch(err => {
      console.error("Błąd podczas uruchamiania przeglądarki:", err);
      throw err;
    });
    
    console.log("Przeglądarka uruchomiona, tworzenie nowej strony...");
    
    const page = await browser.newPage().catch(err => {
      console.error("Błąd podczas tworzenia nowej strony:", err);
      browser.close();
      throw err;
    });
    
    // Ustawienia strony dla lepszej zgodności
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });
    
    // Emulacja mediów druku
    await page.emulateMediaType('print');
    
    console.log("Strona utworzona, ustawianie zawartości HTML...");
    
    // Ustaw zawartość strony z dłuższym timeout
    await page.setContent(fullHtml, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    }).catch(err => {
      console.error("Błąd podczas ustawiania zawartości strony:", err);
      browser.close();
      throw err;
    });
    
    // Dodaj krótkie opóźnienie dla stabilizacji renderowania
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("Zawartość HTML ustawiona, generowanie PDF...");
    
    // Ulepszona konfiguracja PDF z lepszymi marginami
    const pdfConfig = {
      format: 'A4' as const,
      printBackground: true,
      margin: { 
        top: '0mm', 
        right: '0mm', 
        bottom: '0mm', 
        left: '0mm' 
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      scale: 1, // Stała skala 1:1
      width: '210mm', // Explicite ustawiamy wymiary A4
      height: '297mm',
      ...options
    };
    
    // Generuj PDF
    const pdfBuffer = await page.pdf(pdfConfig).catch(err => {
      console.error("Błąd podczas generowania PDF:", err);
      browser.close();
      throw err;
    });
    
    console.log("PDF wygenerowany, zamykanie przeglądarki...");
    
    // Zamknij przeglądarkę
    await browser.close().catch(err => {
      console.error("Błąd podczas zamykania przeglądarki:", err);
    });
    
    console.log("Przeglądarka zamknięta, zwracanie odpowiedzi...");
    
    // Sanityzujemy nazwę pliku, aby uniknąć problemów z kodowaniem
    const sanitizedFilename = sanitizeFilename(options?.filename || 'dokument');
    
    // Zwróć PDF jako odpowiedź
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${sanitizedFilename}.pdf"`,
        'Cache-Control': 'no-cache', // Zapobiegamy cache'owaniu
      },
    });
  } catch (error) {
    console.error('Błąd podczas generowania PDF:', error);
    
    // Zwróć szczegółowy błąd
    return NextResponse.json(
      { error: `Wystąpił błąd podczas generowania PDF: ${error instanceof Error ? error.message : 'Nieznany błąd'}` },
      { status: 500 }
    );
  }
} 