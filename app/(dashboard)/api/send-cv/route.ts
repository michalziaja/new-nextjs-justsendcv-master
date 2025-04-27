import { sendCvEmail } from '@/utils/mailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('Otrzymano żądanie wysłania CV');
    
    // Pobierz dane z żądania
    const { email, cvBase64, filename } = await req.json();
    
    console.log(`Wysyłanie do: ${email}, nazwa pliku: ${filename}`);

    if (!email || !email.includes('@')) {
      console.error('Błąd: Nieprawidłowy adres email');
      return new NextResponse('Nieprawidłowy adres email', { status: 400 });
    }

    // W trybie testowym, akceptujemy specjalną wartość 'test'
    let buffer: Buffer;
    if (cvBase64 === 'test') {
      console.log('Tryb testowy - używam testowego bufora PDF');
      // Generujemy prosty plik PDF jako bufor
      buffer = Buffer.from('%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>\nendobj\n4 0 obj\n<</Length 25>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000015 00000 n\n0000000061 00000 n\n0000000114 00000 n\n0000000213 00000 n\ntrailer\n<</Size 5/Root 1 0 R>>\nstartxref\n288\n%%EOF\n');
    } else if (!cvBase64) {
      console.error('Błąd: Brak danych PDF');
      return new NextResponse('Brak danych PDF', { status: 400 });
    } else {
      console.log('Dekodowanie bufora PDF z base64');
      buffer = Buffer.from(cvBase64, 'base64');
    }

    try {
      await sendCvEmail({ to: email, cvBuffer: buffer, filename: filename || 'cv.pdf' });
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
