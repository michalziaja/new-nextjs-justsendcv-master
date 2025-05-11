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

    // Przygotuj pełną treść HTML dokumentu
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
            @page {
              size: A4;
              margin: 0;
              padding: 0;
            }
            html {
              margin: 0;
              padding: 0;
              height: 100%;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: 'Roboto', sans-serif;
              line-height: 1.5;
              min-height: 100%;
              position: relative;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            #cv-container {
              position: relative;
              min-height: 100%;
              
            }
            p {
              margin: 0;
              padding: 0;
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
    
    // Uruchom Puppeteer z odpowiednimi opcjami dla środowisk serverless
    const browser = await puppeteer.launch({ 
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: true, // lub chromium.headless
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
    
    console.log("Strona utworzona, ustawianie zawartości HTML...");
    
    // Ustaw zawartość strony
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' }).catch(err => {
      console.error("Błąd podczas ustawiania zawartości strony:", err);
      browser.close();
      throw err;
    });
    
    console.log("Zawartość HTML ustawiona, generowanie PDF...");
    
    // Konfiguracja PDF
    const pdfConfig = {
      format: 'A4',
      printBackground: true,
      margin: { top: spacing.document.paddingTop, right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
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
    
    // Zwróć PDF jako odpowiedź
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${options?.filename || 'dokument'}.pdf"`,
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