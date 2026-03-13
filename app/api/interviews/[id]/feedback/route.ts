import type { NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

const styleFeedbackPatterns = [
  /\bcommunication style\b/gi,
  /\bcommunication skills?\b/gi,
  /\bdelivery\b/gi,
  /\bpresentation\b/gi,
  /\btone of voice\b/gi,
  /\bbody language\b/gi,
  /\beye contact\b/gi,
  /\bspeaking pace\b/gi,
  /\bpace\b/gi,
  /\bfluency\b/gi,
  /\bconfidence in speaking\b/gi,
  /\bverbal\b/gi,
  /\bnon-verbal\b/gi,
  /\bprofessionalism\b/gi,
  /\barticulate\b/gi,
  /\beloquent\b/gi,
  /\bfiller words?\b/gi,
  /\bvocal confidence\b/gi,
  /\bspeech pace\b/gi,
  /\bpause length\b/gi,
  /\bdisfluency\b/gi,
  /\bhesitation\b/gi,
  /\bstammer(?:ing)?\b/gi,
  /\bstutter(?:ing)?\b/gi,
  /\bvoice quality\b/gi,
  /\bmonotone\b/gi,
  /\bintonation\b/gi,
  /\bprosody\b/gi,
  /\baudio bias(?:es)?\b/gi,
];

const deficitPatterns = [
  /\bneeds to\b/gi,
  /\bneed to\b/gi,
  /\blacks?\b/gi,
  /\bweak(?:ness|nesses)?\b/gi,
  /\bpoor\b/gi,
  /\bstruggled to\b/gi,
  /\bfailed to\b/gi,
  /\bnot good at\b/gi,
  /\bdeficit\b/gi,
  /\bfix\b/gi,
];

const plainEnglishReplacements: Array<[RegExp, string]> = [
  [/\bleverage\b/gi, 'use'],
  [/\barticulate\b/gi, 'explain'],
  [/\butilize\b/gi, 'use'],
  [/\brobust\b/gi, 'strong'],
  [/\bdemonstrated\b/gi, 'showed'],
  [/\bfacilitate\b/gi, 'help'],
  [/\bshowcased\b/gi, 'showed'],
  [/\bmultifaceted\b/gi, 'wide-ranging'],
  [/\bnuanced\b/gi, 'clear'],
  [/\bstakeholder alignment\b/gi, 'agreement with others'],
  [/\bcross-functional\b/gi, 'across teams'],
  [/\bactionable insights?\b/gi, 'useful next steps'],
  [/\bbandwidth\b/gi, 'time'],
  [/\bsynergy\b/gi, 'working well together'],
];

function toPlainEnglish(text: string) {
  return plainEnglishReplacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text
  );
}

function stripStyleFeedback(text: string) {
  return styleFeedbackPatterns.reduce(
    (current, pattern) => current.replace(pattern, ''),
    text
  );
}

function cleanSpacing(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function sanitizeText(text: string) {
  return cleanSpacing(toPlainEnglish(stripStyleFeedback(text)));
}

function normalizeGrowthSuggestion(text: string) {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  const withoutDeficitLanguage = deficitPatterns.reduce(
    (current, pattern) => current.replace(pattern, ''),
    firstSentence
  );
  const normalized = sanitizeText(withoutDeficitLanguage)
    .replace(/^even stronger if\b[:,-]?\s*/i, '')
    .replace(/^(consider|try|focus on|work on)\s+/i, '');

  if (!normalized) {
    return 'Even stronger if the answer adds one more concrete detail or example.';
  }

  return `Even stronger if ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
}

function normalizeStrength(text: string) {
  const normalized = sanitizeText(text);
  return normalized || 'The answer includes a clear idea worth building on.';
}

function normalizeFinalAssessment(text: string) {
  const normalized = sanitizeText(text);
  return cleanSpacing(
    normalized.replace(
      /^/,
      'The candidate shows clear strengths in the substance of their answers. '
    )
  );
}

function filterEmptyItems(items: string[], fallback: string) {
  const cleaned = items.map(sanitizeText).filter(Boolean);
  return cleaned.length > 0 ? cleaned : [fallback];
}

function buildNdBiasGuardrail(ndType: string | null) {
  if (!ndType) {
    return 'Ignore audio-based signals that can unfairly penalize neurodivergent candidates, including filler words, vocal confidence, speech pace, disfluency markers, long pauses, hesitation, and atypical prosody.';
  }

  return `The candidate's profile says nd_type is "${ndType}". Adjust the evaluation to strip bias that can affect this profile. Ignore filler words, vocal confidence scoring, speech pace normalcy, disfluency markers, pause-length penalties, hesitation, prosody, monotone delivery, eye contact, body language, and other audio or presentation signals that can unfairly penalize this nd_type.`;
}

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

    const { data: profile } = await supabase
      .from('users')
      .select('nd_type')
      .eq('id', user.id)
      .maybeSingle();

    const ndType = profile?.nd_type ?? null;

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
    const { object: generatedFeedback } = await generateObject({
      model: openai('gpt-4o'),
      schema: feedbackSchema,
      prompt: `
        Analyze this mock interview and return strengths-led, content-only feedback.

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


        Output rules you must follow:
        1. At least 60% of the substance of every feedback response must focus on strengths before any growth point is introduced.
        2. Every growth point must use "Even stronger if..." framing.
        3. Never use deficit language such as "needs to", "lacks", "weak", "poor", "failed to", or "fix".
        4. Allow only one growth suggestion per answer. Never return a list of fixes for one answer.
        5. Do not comment on delivery, presentation, communication style, professionalism, tone, pace, body language, eye contact, or confidence signals. Evaluate content only.
        6. Strip audio bias completely. Do not reward or penalize filler words, vocal confidence, speech pace normalcy, disfluency markers, pause length, hesitation, stammering, stuttering, atypical prosody, monotone speech, or similar audio traits.
        7. Use plain English. Avoid HR jargon, coaching jargon, idioms, and vague language.
        8. If a response is thin, still identify what is working before adding one small content-based growth point.
        9. Do not address the user by name or gender. Use "the candidate".

        Bias guardrail:
        ${buildNdBiasGuardrail(ndType)}

        Return:
        1. totalScore: score out of 100 based only on the substance of the answers
        2. questionAnalysis: for each answered question, include:
           - question
           - userResponse
           - feedback: mostly strengths-led feedback on the content of the answer
           - suggestedImprovement: exactly one sentence, starting with "Even stronger if..."
        3. strengths: short plain-English statements about what the candidate is already doing well
        4. areasForImprovement: short plain-English growth themes, each framed with "Even stronger if..."
        5. finalAssessment: a strengths-led summary where most of the content is affirming before one gentle growth point

        Base the evaluation only on:
        - Relevance of the answer to the question
        - Specificity and evidence
        - Structure of ideas
        - Technical accuracy when relevant
        - Problem-solving substance
        - Whether the content answers the actual prompt

        Explicitly exclude from scoring:
        - filler words
        - vocal confidence
        - speech pace normalcy
        - disfluency markers
        - pause length penalties
        - audio smoothness
        - speaking polish
      `,
    });

    const feedback = {
      ...generatedFeedback,
      questionAnalysis: generatedFeedback.questionAnalysis.map((item) => ({
        ...item,
        feedback: normalizeStrength(item.feedback),
        suggestedImprovement: normalizeGrowthSuggestion(
          item.suggestedImprovement
        ),
      })),
      strengths: filterEmptyItems(
        generatedFeedback.strengths.map(normalizeStrength),
        'The candidate gives content that can be built on in later practice.'
      ),
      areasForImprovement: filterEmptyItems(
        generatedFeedback.areasForImprovement.map(normalizeGrowthSuggestion),
        'Even stronger if the answer adds one more concrete detail or example.'
      ),
      finalAssessment: normalizeFinalAssessment(generatedFeedback.finalAssessment),
    };

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

    const { data: latestSession } = await supabase
      .from('interview_sessions')
      .select('session_id')
      .eq('interview_id', interviewId)
      .eq('user_id', user.id)
      .is('attempt_number', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestSession) {
      await supabase
        .from('interview_sessions')
        .update({
          attempt_number: currentAttempt,
        })
        .eq('session_id', latestSession.session_id);
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await context.params;
    const attemptNumber = request.nextUrl.searchParams.get('attemptNumber');
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
      query = query.eq('attempt_number', Number(attemptNumber)).single();
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
      attemptNumber: feedback.attempt_number,
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
