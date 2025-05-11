//api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import { spacing } from '@/components/creator/templates/TemplateStyles';

// Funkcja pomocnicza do sprawdzania środowiska
const isNetlify = () => {
  return process.env.NETLIFY === 'true' || !!process.env.NETLIFY_DEV;
};

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
    
    // Sprawdzenie środowiska i konfiguracja Puppeteer
    let browser;
    
    // Sprawdź, czy jesteśmy w środowisku developerskim czy produkcyjnym
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // W środowisku developerskim używamy standardowej instancji puppeteer
      console.log("Używam standardowego Puppeteer w środowisku developerskim");
      try {
        const puppeteerStandard = await import('puppeteer');
        browser = await puppeteerStandard.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      } catch (error) {
        console.error("Błąd przy próbie użycia standardowego puppeteer:", error);
        throw new Error("Nie można uruchomić przeglądarki. Sprawdź, czy puppeteer jest zainstalowany: npm install puppeteer");
      }
    } else {
      // W środowisku produkcyjnym (Netlify) używamy puppeteer-core z chromium-min
      console.log("Używam puppeteer-core z chromium-min w środowisku produkcyjnym (Netlify)");
      try {
        // Ustawiamy dodatkowe opcje dla Netlify
        const netlifyChromeArgs = [
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
        ];

        // Określamy jawną ścieżkę dla Netlify
        let executablePath;
        if (isNetlify()) {
          executablePath = '/var/task/node_modules/@sparticuz/chromium-min/bin';
          console.log("Używam jawnej ścieżki dla środowiska Netlify:", executablePath);
        } else {
          executablePath = await chromium.executablePath();
          console.log("Używam ścieżki z chromium-min:", executablePath);
        }
        
        browser = await puppeteer.launch({ 
          args: netlifyChromeArgs,
          defaultViewport: chromium.defaultViewport,
          executablePath: executablePath,
          headless: true,
        });
      } catch (error) {
        console.error("Błąd przy próbie użycia chromium-min:", error);
        throw error;
      }
    }
    
    if (!browser) {
      throw new Error("Nie udało się uruchomić przeglądarki.");
    }
    
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