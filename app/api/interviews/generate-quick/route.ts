import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { openai } from '@ai-sdk/openai';
import { ApiResponseBuilder } from '@/lib/utils/response';
import crypto from 'crypto';
import {
  GeneratedInterview,
  InterviewQuestion,
  InterviewType,
} from '@/lib/types/interview.types';

const quickCreateSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description is too long'),
});

const extractionSchema = z.object({
  jobTitle: z.string(),
  companyName: z.string(),
  interviewType: z.enum([
    'technical',
    'behavioral',
    'problem-solving',
    'case-study',
    'situational',
    'live-coding',
  ]),
  experienceLevel: z.enum(['junior', 'mid', 'senior']),
  jobDescription: z.string().optional(),
});

async function storeInterviewData(
  supabase: any,
  userId: string,
  extractedData: z.infer<typeof extractionSchema>,
  questions: string[]
) {
  const {
    jobTitle,
    interviewType,
    experienceLevel,
    jobDescription,
    companyName,
  } = extractedData;
  const hash = crypto
    .createHash('sha256')
    .update(
      JSON.stringify({ jobTitle, interviewType, experienceLevel, companyName })
    )
    .digest('hex')
    .slice(0, 16);
  const kvKey = `interview:${jobTitle}:${interviewType}:${companyName}:${hash}`;

  const { error: kvError } = await supabase.from('interviews_kv').insert({
    key: kvKey,
    value: {
      jobTitle,
      jobDescription,
      type: interviewType,
      experienceLevel,
      questions,
    },
  });

  if (kvError) {
    throw new Error(`Failed to store interview questions: ${kvError.message}`);
  }

  const { data: interviewData, error: interviewError } = await supabase
    .from('user_interviews')
    .insert({
      user_id: userId,
      interview_kv_key: kvKey,
      status: 'generated',
    })
    .select()
    .single();

  if (interviewError) {
    await supabase.from('interviews_kv').delete().eq('kv_key', kvKey);
    throw new Error(`Failed to create interview: ${interviewError.message}`);
  }

  return { interviewData, kvKey };
}

async function generateInterviewQuestions(
  extractedData: z.infer<typeof extractionSchema>
) {
  const questionsPrompt = `Search the web for common interview questions and Prepare questions for a job interview.
The job role is ${extractedData.jobTitle}.
The job experience level is ${extractedData.experienceLevel}.
The job description is: ${extractedData.jobDescription}.
The interview type is: ${extractedData.interviewType}.
return 10 questions.
first question should ask the user to introduce themselves.
Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]`;

  const { text: questions } = await generateText({
    model: openai('gpt-4o'),
    prompt: questionsPrompt,
    temperature: 0.7,
  });

  let questionsArray: string[] = [];
  try {
    questionsArray = JSON.parse(questions);
    if (!Array.isArray(questionsArray)) throw new Error('Response not array');
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    throw new Error('Failed to generate interview questions');
  }

  return questionsArray;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('User not authenticated');
    }

    const body = await request.json();
    const validation = quickCreateSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponseBuilder.error(
        'Invalid request data',
        validation.error?.message || 'VALIDATION_ERROR',
        400
      );
    }

    const { description } = validation.data;

    const extractionPrompt = ` Extract interview details from this description:
    
"${description}"

Analyze the description and extract/infer:
- jobTitle: The job position being interviewed for
- companyName: The company name if mentioned, otherwise use "Company"
- interviewType: Classify as technical, behavioral, problem-solving, case-study, situational, or live-coding
- experienceLevel: Classify as junior, mid, or senior based on context

Be intelligent about inference. Make reasonable assumptions based on context.`;

    const { object: extractedData } = await generateObject({
      model: openai('gpt-4o'),
      schema: extractionSchema,
      prompt: extractionPrompt,
    });

    const questions = await generateInterviewQuestions(extractedData);

    const { interviewData } = await storeInterviewData(
      supabase,
      user.id,
      extractedData,
      questions
    );

    const formattedQuestions: InterviewQuestion[] = (questions as string[]).map(
      (questionText: string, index: number) => ({
        id: `${interviewData.id}-q${index + 1}`,
        question: questionText,
        category: extractedData.interviewType as unknown as InterviewType,
      })
    );

    const generatedInterview: GeneratedInterview = {
      id: interviewData.id,
      jobTitle: extractedData.jobTitle,
      jobDescription: extractedData.jobDescription || '',
      type: extractedData.interviewType as unknown as InterviewType,
      questions: formattedQuestions,
      createdAt: interviewData.created_at,
    };

    return ApiResponseBuilder.success(generatedInterview);
  } catch (error) {
    console.error('Generate quick interview error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate interview';
    return ApiResponseBuilder.error(errorMessage, 'SERVER_ERROR', 500);
  }
}
