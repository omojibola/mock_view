import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

async function createPdf(transcript: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(`Interview Transcript`, { align: 'center' });
    doc.moveDown();

    if (Array.isArray(transcript.entries)) {
      transcript.entries.forEach((entry: any) => {
        doc.fontSize(12).text(`[${entry.speaker}] ${entry.text}`, {
          paragraphGap: 5,
        });
      });
    } else if (typeof transcript === 'string') {
      doc.fontSize(12).text(transcript, {
        paragraphGap: 5,
      });
    } else {
      doc.fontSize(12).text('No transcript available.');
    }

    doc.end();
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ callId: string }> }
): Promise<NextResponse> {
  const { callId } = await context.params;
  if (!callId) {
    return ApiResponseBuilder.error('Missing callId', 'MISSING_CALL_ID', 400);
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return ApiResponseBuilder.unauthorized('Authentication required');
  }

  const { data: session, error: sessionError } = await supabase
    .from('interview_sessions')
    .select('vapi_call_id')
    .eq('user_id', user.id)
    .eq('vapi_call_id', callId)
    .single();

  if (sessionError || !session) {
    return ApiResponseBuilder.error(
      'Forbidden: Call ID does not belong to this user',
      'FORBIDDEN',
      403
    );
  }

  try {
    const res = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      return ApiResponseBuilder.error(
        'Failed to fetch transcript from Vapi',
        'TRANSCRIPT_FETCH_ERROR',
        res.status,
        errorBody
      );
    }

    const data = await res.json();
    const transcript = data.transcript;

    const pdfBuffer: any = await createPdf(transcript);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="transcript-${callId}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Error fetching transcript:', err);
    return ApiResponseBuilder.error(
      'Failed to fetch transcript',
      'TRANSCRIPT_FETCH_ERROR',
      500,
      err.message
    );
  }
}
