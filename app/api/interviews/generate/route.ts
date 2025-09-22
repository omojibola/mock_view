import { type NextRequest } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createInterviewSchema } from '@/lib/utils/validation';
import { ApiResponseBuilder } from '@/lib/utils/response';
import { createClient } from '@/utils/supabase/server';
import type {
  CreateInterviewRequest,
  GeneratedInterview,
  InterviewQuestion,
} from '@/lib/types/interview.types';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body: CreateInterviewRequest = await request.json();

    const validationResult = createInterviewSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseBuilder.error(
        'Invalid request data',
        validationResult.error?.message || 'VALIDATION_ERROR',
        400
      );
    }

    const { jobTitle, jobDescription, interviewType, experienceLevel } =
      validationResult.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('User not authenticated');
    }

    // -----------------------------
    // 1. Build KV key
    // -----------------------------
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ jobTitle, interviewType, experienceLevel }))
      .digest('hex')
      .slice(0, 16);
    const kvKey = `interview:${jobTitle}:${interviewType}:${hash}`;

    // -----------------------------
    // 2. Check if KV exists
    // -----------------------------
    let { data: kvData } = await supabase
      .from('interviews_kv')
      .select('*')
      .eq('key', kvKey)
      .maybeSingle();

    // -----------------------------
    // 3. If not cached, call AI
    // -----------------------------
    if (!kvData) {
      const prompt = `Prepare questions for a job interview.
The job role is ${jobTitle}.
The job experience level is ${experienceLevel}.
The job description is: ${jobDescription}.
The interview type is: ${interviewType}.
return 10 questions.
first question should ask the user to introduce themselves.
Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]`;

      const { text } = await generateText({
        model: openai('gpt-4o'),
        prompt,
        temperature: 0.7,
      });

      let questionsArray: string[];
      try {
        questionsArray = JSON.parse(text);
        if (!Array.isArray(questionsArray))
          throw new Error('Response not array');
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return ApiResponseBuilder.error(
          'Failed to generate interview questions',
          'PARSE_ERROR',
          500
        );
      }

      const { data: newKV, error: insertKVError } = await supabase
        .from('interviews_kv')
        .insert({
          key: kvKey,
          value: {
            jobTitle,
            jobDescription,
            type: interviewType,
            experienceLevel,
            questions: questionsArray,
          },
        })
        .select()
        .single();

      if (insertKVError) {
        console.error('Failed to insert KV:', insertKVError);
        return ApiResponseBuilder.error(
          'Failed to save global interview',
          'UNKNOWN_ERROR',
          500,
          insertKVError.message
        );
      }

      kvData = newKV;
    }

    // -----------------------------
    // 4. Link user to KV (user_interviews)
    // -----------------------------
    const { data: userInterview, error: insertUserError } = await supabase
      .from('user_interviews')
      .insert({
        user_id: user.id,
        interview_kv_key: kvData.key,
        status: 'generated',
      })
      .select()
      .single();

    if (insertUserError) {
      console.error(
        'Failed to insert user_interview attempt:',
        insertUserError
      );
      return ApiResponseBuilder.error(
        'Failed to save user interview attempt',
        'UNKNOWN_ERROR',
        500,
        insertUserError.message
      );
    }

    const questions: InterviewQuestion[] = (
      kvData.value.questions as string[]
    ).map((questionText: string, index: number) => ({
      id: `${userInterview.id}-q${index + 1}`,
      question: questionText,
      category: kvData.value.type,
    }));

    const generatedInterview: GeneratedInterview = {
      id: userInterview.id,
      jobTitle: kvData.value.jobTitle,
      jobDescription: kvData.value.jobDescription,
      type: kvData.value.type,
      questions,
      createdAt: userInterview.created_at,
    };

    return ApiResponseBuilder.success(generatedInterview);
  } catch (error) {
    console.error('Interview generation error:', error);
    return ApiResponseBuilder.error(
      'Internal server error',
      'SERVER_ERROR',
      500
    );
  }
}
