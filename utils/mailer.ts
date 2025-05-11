import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import path from 'path';
// Usunięto readFileSync, bo logo jest obsługiwane inaczej w kontekście Next.js (public folder)

// Importy do generowania PDF
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { spacing } from '@/components/creator/templates/TemplateStyles'; // Załóżmy, że spacing jest tu potrzebny lub w pdfOptions
import type { PaperFormat } from 'puppeteer-core'; // Import PaperFormat

interface SendEmailParams {
  to: string;
  // cvBuffer: Buffer; // Usunięto
  htmlContent: string;
  cssStyles: string;
  pdfFilename?: string; // Opcjonalna nazwa dla generowanego PDF
  // filename?: string; // To było dla załącznika, teraz pdfFilename kontroluje nazwę pliku PDF
}

type Attachment = {
  filename: string;
  content?: any;
  contentType?: string;
  path?: string;
  cid?: string;
};

// Stała do włączenia trybu mockowania - tylko do celów testowych
const MOCK_SMTP = false;

// Funkcja do sanityzacji nazwy pliku - skopiowana z generate-pdf/route.ts
function sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
    .replace(/[^\w.-]/g, '_');
}

// Funkcja do generowania PDF - adaptacja z generate-pdf/route.ts
async function generatePdfBufferInternal(htmlContent: string, cssStyles: string, pdfOptions?: { filename?: string }): Promise<Buffer> {
  console.log("Rozpoczynanie generowania PDF wewnętrznie dla emaila...");

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
            html { margin: 0; padding: 0; height: 100%; }
            body {
              margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact;
              font-family: 'Roboto', sans-serif; line-height: 1.5; min-height: 100%; position: relative;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            #cv-container { position: relative; min-height: 100%; }
            p { margin: 0; padding: 0; }
          </style>
        </head>
        <body><div id="cv-container">${htmlContent}</div></body>
      </html>`;

  let browser;
  try {
    await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: true, // lub chromium.headless
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfConfig = {
      format: 'A4' as PaperFormat, // Użycie PaperFormat
      printBackground: true,
      margin: { top: spacing.document.paddingTop, right: '0px', bottom: '0px', left: '0px' },
      preferCSSPageSize: true,
      ...(pdfOptions || {}),
    };
    
    const pdfInternalBuffer: Buffer = Buffer.from(await page.pdf(pdfConfig)); // Jawne użycie Buffer.from
    console.log("PDF wygenerowany wewnętrznie.");
    return pdfInternalBuffer;
  } catch (error) {
    console.error("Błąd podczas wewnętrznego generowania PDF:", error);
    throw error; // Rzuć błąd dalej, aby sendCvEmail mogło go obsłużyć
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function sendCvEmail({ to, htmlContent, cssStyles, pdfFilename = 'cv.pdf' }: SendEmailParams) {
  console.log('Próba wysłania emaila z dynamicznie generowanym CV do:', to);
  
  // Sprawdź dane dostępowe do SMTP
  const smtpHost = process.env.SMTP_HOST || 'mail1.netim.hosting';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  // Logowanie informacji (bez haseł!)
  console.log(`SMTP konfiguracja: ${smtpHost}:${smtpPort}, użytkownik: ${smtpUser ? 'skonfigurowany' : 'BRAK'}`);
  
  // W trybie mock nie sprawdzamy danych dostępowych
  if (!MOCK_SMTP && (!smtpUser || !smtpPass)) {
    // Jeśli nie ma danych dostępowych, zwracamy błąd
    console.error('BŁĄD: Brak danych dostępowych do SMTP. Ustaw zmienne SMTP_USER i SMTP_PASS');
    throw new Error('Brak konfiguracji serwera SMTP. Proszę skontaktować się z administratorem.');
  }

  // Generowanie PDF przed wysłaniem emaila
  let cvBuffer: Buffer;
  try {
    cvBuffer = await generatePdfBufferInternal(htmlContent, cssStyles, { filename: pdfFilename });
  } catch (pdfError) {
    console.error('Nie udało się wygenerować PDF do emaila:', pdfError);
    // Można zdecydować, czy rzucić błąd dalej, czy np. wysłać email bez załącznika z informacją o błędzie
    throw new Error(`Błąd podczas generowania PDF: ${pdfError instanceof Error ? pdfError.message : 'Nieznany błąd'}`);
  }

  // W wersji testowej zamiast prawdziwego SMTP, używamy "sendmail" do konsoli
  let transporter;
  
  if (MOCK_SMTP) {
    console.log('Używam MOCKOWANEGO transportera - email NIE zostanie wysłany');
    // Tworzymy mockowy transporter, który nie wysyła emaili
    transporter = {
      sendMail: async (options: any) => {
        console.log('======= MOCKOWANE WYSYŁANIE EMAILA =======');
        console.log('Do:', options.to);
        console.log('Temat:', options.subject);
        console.log('Załączniki:', options.attachments?.map((a: any) => a.filename).join(', ') || 'brak');
        console.log('Treść HTML:', options.html.substring(0, 150) + '...');
        console.log('========================================');
        return {
          messageId: 'mock-message-id-' + Date.now(),
          response: 'Mock odpowiedź - wiadomość nie została faktycznie wysłana'
        };
      }
    };
  } else if (process.env.NODE_ENV === 'development' && process.env.SMTP_TEST === 'true') {
    console.log('Używam testowego transportera w trybie deweloperskim');
    // W środowisku deweloperskim używamy testowego transportera
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal_pass'
      }
    });
  } else {
    // Prawdziwa konfiguracja SMTP
    console.log('Używam rzeczywistego transportera SMTP:', smtpHost);
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        // Ignoruj problemy z certyfikatem - używaj tylko do testów!
        rejectUnauthorized: false
      }
    });
  }

  const emailHtmlBody = `
    <html>
        <body style="font-family:'Segoe UI',sans-serif;color:#1a1a1a;">
        <h2>Twoje CV jest gotowe! 📄</h2>
        <p>Dziękujemy za skorzystanie z <strong>JustSend.cv</strong></p>
        <p>Twoje CV znajdziesz w załączniku.</p>
        <p><a href="https://justsend.cv" style="display:inline-block;padding:10px 20px;background-color:#007aff;color:white;border-radius:6px;text-decoration:none;font-weight:600;">Przejdź do aplikacji</a></p>
        
        <div style="margin-top:40px;border-top:1px solid #eee;padding-top:20px;font-size:13px;color:#888; display: flex; align-items: center;">
            <img src="cid:logo" alt="JustSend.cv" style="height:60px; margin-right:15px;" />
            <div>
            <p style="margin: 0;font-size:18px;"><strong>JustSend.cv</strong></p>
            <p style="margin: 0;">Twój asystent kariery</p>
            <p style="margin: 0;">kontakt@justsend.cv</p>
            </div>
        </div>

        <p style="font-size:12px;color:#bbb">© 2025 JustSend.cv</p>
        </body>
    </html>
    `;

  try {
    // Sprawdź dostępność pliku logo przed wysłaniem
    let logoPath: string;
    try {
      logoPath = path.join(process.cwd(), 'public/logo.png'); // Zakładamy, że logo jest w public
      // readFileSync(logoPath); // Nie musimy czytać pliku, wystarczy ścieżka dla nodemailer
    } catch (error) {
      console.warn('Plik logo nie znaleziony, wysyłanie emaila bez załącznika logo');
      logoPath = '';
    }

    // Sanityzacja nazwy pliku PDF
    const finalPdfFilename = sanitizeFilename(pdfFilename);

    // Definiujemy załączniki
    const attachments: Attachment[] = [
      {
        filename: finalPdfFilename, // Używamy zsanitizowanej nazwy
        content: cvBuffer,
        contentType: 'application/pdf',
      }
    ];

    // Dodaj logo tylko jeśli ścieżka jest prawidłowa
    if (logoPath) {
      attachments.push({
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo', // ważne, by pasowało do <img src="cid:logo" />
      });
    }

    // Definiujemy opcje maila
    const mailOptions: SendMailOptions = {
      from: '"JustSend.cv" <kontakt@justsend.cv>',
      to,
      subject: 'Twoje CV z JustSend.cv',
      html: emailHtmlBody, // Użycie zmienionej nazwy stałej
      attachments,
    };

    // W wersji testowej tylko wyświetlamy informacje - nie używamy tego, bo mamy stałą MOCK_SMTP
    if (!MOCK_SMTP && process.env.NODE_ENV === 'development' && (process.env.SMTP_MOCK === 'true' || !smtpUser)) {
      console.log('TRYB TESTOWY - wiadomość nie zostanie wysłana');
      console.log('Adresat:', to);
      console.log('Temat:', 'Twoje CV z JustSend.cv');
      console.log('Załączniki:', attachments.map(a => a.filename).join(', '));
      console.log('--------');
      return; // Zakończ bez faktycznego wysyłania
    }

    console.log('Wysyłam email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email wysłany:', info.response);
    console.log('Email sent successfully to:', to);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
