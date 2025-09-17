export const runtime = 'nodejs';
import { type NextRequest, NextResponse } from 'next/server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { extractDocxText, extractPdfText } from '@/lib/fileExtractors';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided' },
        { status: 400 }
      );
    }

    let fileText = '';

    if (file.type === 'application/pdf') {
      fileText = await extractPdfText(file);
    } else if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      fileText = await extractDocxText(file);
    } else {
      fileText = await file.text(); // fallback for .txt
    }

    // Generate roast using AI
    const { text: roast } = await generateText({
      model: openai('gpt-4o'),
      prompt: `You are a comedian and funny resume critic. In less than 60 words, Roast this resume with humor. Be witty, sarcastic, but ultimately helpful. Point out obvious flaws, clichés, and areas for improvement in an entertaining way.
    Resume content:
    ${fileText}`,
    });

    return NextResponse.json({ roast });
  } catch (error) {
    console.error('Error roasting resume:', error);
    return NextResponse.json(
      { error: 'Failed to roast resume. Our AI critic is having a bad day!' },
      { status: 500 }
    );
  }
}
