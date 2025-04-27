import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import path from 'path';
import { readFileSync } from 'fs';

interface SendEmailParams {
  to: string;
  cvBuffer: Buffer;
  filename?: string;
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

export async function sendCvEmail({ to, cvBuffer, filename = 'cv.pdf' }: SendEmailParams) {
  console.log('Próba wysłania emaila do:', to);
  
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

  const htmlContent = `
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
      logoPath = path.join(process.cwd(), 'public/logo.png');
      console.log('Ścieżka do logo:', logoPath);
      // Opcjonalnie możemy sprawdzić czy plik istnieje
      // readFileSync(logoPath);
    } catch (error) {
      console.warn('Logo file not found, sending email without logo attachment');
      logoPath = '';
    }

    // Definiujemy załączniki
    const attachments: Attachment[] = [
      {
        filename,
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
      html: htmlContent,
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
