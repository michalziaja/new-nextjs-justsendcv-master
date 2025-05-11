import { sendCvEmail } from '@/utils/mailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('Otrzymano żądanie wysłania CV');
    
    // Pobierz dane z żądania
    const { email, htmlContent, cssStyles, pdfFilename } = await req.json();
    
    console.log(`Wysyłanie do: ${email}, nazwa pliku PDF (sugerowana): ${pdfFilename}`);

    if (!email || !email.includes('@')) {
      console.error('Błąd: Nieprawidłowy adres email');
      return new NextResponse('Nieprawidłowy adres email', { status: 400 });
    }

    if (!htmlContent || !cssStyles) {
      console.error('Błąd: Brak htmlContent lub cssStyles do wygenerowania PDF.');
      return new NextResponse('Brak danych do wygenerowania PDF (htmlContent lub cssStyles).', { status: 400 });
    }

    try {
      await sendCvEmail({ 
        to: email, 
        htmlContent, 
        cssStyles, 
        pdfFilename: pdfFilename || 'cv.pdf' // Domyślna nazwa jeśli nie podano
      });
      console.log('Email z CV wysłany pomyślnie');
      return new NextResponse('Email sent successfully', { status: 200 });
    } catch (err) {
      console.error('Błąd podczas wysyłania emaila:', err);
      // Zwróć bardziej szczegółową informację o błędzie w odpowiedzi
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return new NextResponse(`Error sending email: ${errorMessage}`, { status: 500 });
    }
  } catch (err) {
    console.error('Nieoczekiwany błąd w API:', err);
    return new NextResponse('Server error', { status: 500 });
  }
}
