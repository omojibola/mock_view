import type { NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

const feedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),
  questionAnalysis: z.array(
    z.object({
      question: z.string(),
      userResponse: z.string(),
      feedback: z.string(),
      suggestedImprovement: z.string(),
    })
  ),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

const requestSchema = z.object({
  transcript: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    )
    .min(1, 'Transcript is required'),
  attemptNumber: z.number().int().min(1).optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    const body = await request.json();
    const { transcript, attemptNumber } = requestSchema.parse(body);

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join('');

    let currentAttempt = attemptNumber;
    if (!currentAttempt) {
      const { data: previousAttempts } = await supabase
        .from('feedback')
        .select('attempt_number')
        .eq('user_id', user.id)
        .eq('interview_id', interviewId);
      currentAttempt =
        previousAttempts && previousAttempts?.length > 0
          ? Math.max(...previousAttempts.map((a) => a.attempt_number)) + 1
          : 1;
    }

    const { data: interviewData, error: fetchError } = await supabase
      .from('user_interviews')
      .select(
        `
        *,
        interviews_kv (
          value
        )
      `
      )
      .eq('id', interviewId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !interviewData) {
      console.error('Error fetching interview data:', fetchError);
      return ApiResponseBuilder.error(
        'Interview not found',
        'NOT_FOUND',
        500,
        fetchError?.name
      );
    }

    const { interviews_kv: interviewDetails } = interviewData;
    const { object: feedback } = await generateObject({
      model: openai('gpt-4o'),
      schema: feedbackSchema,
      prompt: `
        Analyze this job interview performance and provide detailed feedback.

        Job Details:
        - Position: ${interviewDetails.value.jobTitle}
        - Type: ${interviewDetails.value.type}
        - Job Description: ${interviewDetails.value.jobDescription}

        Interview Questions:
        ${interviewDetails.value.questions
          .map((q: string, i: number) => `${i + 1}. ${q}`)
          .join('\n')}

        Interview Transcript:
        ${formattedTranscript}


        Please provide:
        1. A total score out of 100
        2. Question by question analysis, returning each interview question, the users response to the question, your feedback for the question and a suggested improved response. Skip questions where no response was priovided
        3. Key strengths demonstrated
        4. Areas for improvement with specific suggestions
        5. A comprehensive final assessment, do not address user by name or gender, just say the candidate

        Base your evaluation on:
        - Relevance and depth of answers
        - Communication clarity and professionalism
        - Technical accuracy (if applicable)
        - Problem-solving approach
        - Cultural fit indicators
        - Overall interview performance
      `,
    });

    const feedbackData = {
      interview_id: interviewId,
      user_id: user.id,
      interview_kv_key: interviewData.interview_kv_key,
      total_score: feedback.totalScore,
      question_analysis: feedback.questionAnalysis,
      strengths: feedback.strengths,
      areas_for_improvement: feedback.areasForImprovement,
      final_assessment: feedback.finalAssessment,
      created_at: new Date().toISOString(),
      interview_title: interviewDetails.value.jobTitle,
      type: interviewDetails.value.type,
      attempt_number: currentAttempt,
    };

    const { error: saveError } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving feedback:', saveError);
      return ApiResponseBuilder.error('Failed to save feedback');
    }

    await supabase
      .from('user_interviews')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score: feedback.totalScore,
      })
      .eq('id', interviewId);

    const responseData = {
      interviewId,
      userId: user.id,
      totalScore: feedback.totalScore,
      questionAnalysis: feedback.questionAnalysis,
      strengths: feedback.strengths,
      areasForImprovement: feedback.areasForImprovement,
      finalAssessment: feedback.finalAssessment,
      createdAt: feedbackData.created_at,
      interviewTitle: interviewDetails.job_title,
      type: interviewDetails.interview_type,
    };

    return ApiResponseBuilder.success(responseData);
  } catch (error) {
    console.error('Error generating feedback:', error);

    if (error instanceof z.ZodError) {
      return ApiResponseBuilder.error(
        'Invalid request data',
        'INVALID_REQUEST',
        400,
        error.message
      );
    }

    return ApiResponseBuilder.error('Failed to generate feedback');
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; attemptNumber?: string }> }
) {
  try {
    const { id: interviewId, attemptNumber } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    let query = supabase
      .from('feedback')
      .select(
        `
    *,
    user_interviews!inner (
      interview_kv_key,
      interviews_kv (
        value
      )
    ),
    interview_sessions (
        vapi_call_id
      )
  `
      )
      .eq('interview_id', interviewId)
      .eq('user_id', user.id) as any;

    if (attemptNumber) {
      query = query.eq('attempt_number', attemptNumber).single();
    } else {
      query = query
        .order('attempt_number', { ascending: false })
        .limit(1)
        .single();
    }

    const { data: feedback, error: fetchError } = await query;

    if (fetchError || !feedback) {
      console.log('Error fetching feedback:', fetchError);
      return ApiResponseBuilder.error(
        'Feedback not found',
        'NOT_FOUND',
        500,
        fetchError
      );
    }

    const responseData = {
      interviewId: feedback?.interview_id,
      userId: feedback.user_id,
      attemptId: feedback.attempt_id,
      totalScore: feedback.total_score,
      question_analysis: feedback.question_analysis,
      strengths: feedback.strengths,
      areasForImprovement: feedback.areas_for_improvement,
      finalAssessment: feedback.final_assessment,
      createdAt: feedback.created_at,
      interviewTitle: feedback.interview_title,
      type: feedback.type,
      callId: feedback.interview_sessions?.vapi_call_id ?? null,
    };

    return ApiResponseBuilder.success(responseData);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return ApiResponseBuilder.error('Failed to fetch feedback');
  }
}
