'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/lib/contexts/theme-context';
import {
  Brain,
  Code,
  DoorOpen,
  Grid3X3,
  Lightbulb,
  ListTree,
  Mic,
  MicOff,
  NotebookPen,
  PauseCircle,
  Wind,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import AI_AGENT from '@/components/interviews/ai-agent';
import { vapi } from '@/lib/vapi.sdk';
import { Joseph, Lulu } from '@/constants';
import { InterviewQuestion } from '@/lib/types/interview.types';
import toastService from '@/lib/services/toast.service';
import { InfoIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InterviewSession {
  id: string;
  jobTitle: string;
  currentQuestion: number;
  totalQuestions: number;
  isActive: boolean;
  startTime?: Date;
  questions?: string[];
  type?:
    | 'technical'
    | 'behavioral'
    | 'problem-solving'
    | 'case-study'
    | 'situational'
    | 'live-coding'
    | '';
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const STAR_PROMPT = [
  { label: 'Situation', text: 'What was happening?' },
  { label: 'Task', text: 'What needed to be done?' },
  { label: 'Action', text: 'What did you do?' },
  { label: 'Result', text: 'What changed because of your actions?' },
];

const STOPWORDS = new Set([
  'about',
  'after',
  'before',
  'being',
  'could',
  'describe',
  'during',
  'from',
  'give',
  'have',
  'into',
  'should',
  'tell',
  'that',
  'their',
  'there',
  'they',
  'this',
  'time',
  'what',
  'when',
  'where',
  'which',
  'with',
  'would',
  'your',
]);

function explainQuestion(question: string) {
  const lower = question.toLowerCase();

  if (lower.startsWith('tell me about') || lower.startsWith('describe')) {
    return 'This is asking for one concrete example. Keep it specific: what happened, what you did, and what changed.';
  }

  if (lower.includes('how would you')) {
    return 'This is asking for your approach. Explain how you would think through it, not just the final answer.';
  }

  if (lower.includes('why')) {
    return 'This is asking for your reasoning. Show the logic behind your decision or opinion.';
  }

  if (lower.includes('challenge') || lower.includes('conflict')) {
    return 'This is looking for how you handled pressure or difficulty. Choose one clear example and walk through it calmly.';
  }

  return 'This question is asking what you understood, how you approached it, and what outcome or lesson came from it.';
}

function extractKeywords(question: string) {
  return Array.from(
    new Set(
      question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 3 && !STOPWORDS.has(word))
    )
  ).slice(0, 3);
}

function normalizeQuestion(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s?]/g, '')
    .trim();
}

function getLastQuestionSentence(text: string) {
  const questionSentences = text.match(/[^?]+\?/g);
  if (questionSentences && questionSentences.length > 0) {
    return questionSentences[questionSentences.length - 1].trim();
  }

  return text.includes('?') ? text.trim() : '';
}

export default function StartInterviewPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const interviewId = params.id as string;
  const searchParams = useSearchParams();
  const interviewer = searchParams.get('interviewer');

  const [showChat, setShowChat] = useState(false);

  const [session, setSession] = useState<InterviewSession>({
    id: interviewId,
    jobTitle: '',
    currentQuestion: 0,
    totalQuestions: 0,
    isActive: false,
    questions: [],
    type: '',
  });
  enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
  }

  const interviewers = {
    Joseph: Joseph,
    Lulu: Lulu,
  };

  const [isMuted, setIsMuted] = useState(false);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<'user' | 'ai' | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [hasInsufficientCredits, setHasInsufficientCredits] = useState(false);
  const [scratchpad, setScratchpad] = useState('');
  const [showScratchpad, setShowScratchpad] = useState(true);
  const [showQuestionIntent, setShowQuestionIntent] = useState(false);
  const [showStarPrompt, setShowStarPrompt] = useState(false);
  const [showKeywordHelper, setShowKeywordHelper] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [isPausedForBreath, setIsPausedForBreath] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const callStartedAtRef = useRef<number | null>(null);
  const firstResponseSecondsRef = useRef<number | null>(null);
  const userMessageCountRef = useRef(0);
  const sessionMetricsSentRef = useRef(false);
  const pauseCountRef = useRef(0);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [interviewResponse, creditsResponse] = await Promise.all([
          fetch(`/api/interviews/${interviewId}`),
          fetch('/api/billing/credits'),
        ]);

        if (!interviewResponse.ok) {
          toastService.error(
            `Failed to fetch interview: ${interviewResponse.status}`
          );
        }

        const interViewData = await interviewResponse.json();
        const creditsData = await creditsResponse.json();

        if (creditsData.success) {
          setHasInsufficientCredits(creditsData.data.credits < 1);
        }

        if (!interViewData.success) {
          toastService.error(
            interViewData.error || 'Failed to load interview data'
          );
        }

        setInterviewQuestions(interViewData.data.questions || []);
        setSession((prev) => ({
          ...prev,
          jobTitle: interViewData.data.jobTitle || 'Interview Session',
          totalQuestions: interViewData.data.questions?.length || 0,
          questions: interViewData.data.questions || [],
          type: interViewData.data.type || 'technical',
        }));
      } catch (error) {
        console.error('Failed to fetch interview data:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to load interview'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewData();
  }, [interviewId]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const transcriptQuestion = useMemo(() => {
    const latestAssistantQuestion = [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === 'assistant' && getLastQuestionSentence(message.content)
      );

    return latestAssistantQuestion
      ? getLastQuestionSentence(latestAssistantQuestion.content)
      : '';
  }, [messages]);

  const inferredQuestionIndex = useMemo(() => {
    if (transcriptQuestion && interviewQuestions.length > 0) {
      const normalizedTranscriptQuestion = normalizeQuestion(transcriptQuestion);
      let bestMatchIndex = -1;
      let bestScore = 0;

      interviewQuestions.forEach((question, index) => {
        const normalizedQuestion = normalizeQuestion(question.question);
        const transcriptWords = normalizedTranscriptQuestion
          .split(/\s+/)
          .filter(Boolean);
        const questionWords = new Set(
          normalizedQuestion.split(/\s+/).filter(Boolean)
        );

        const overlap = transcriptWords.filter((word) =>
          questionWords.has(word)
        ).length;
        const score =
          transcriptWords.length > 0 ? overlap / transcriptWords.length : 0;

        if (score > bestScore) {
          bestScore = score;
          bestMatchIndex = index;
        }
      });

      if (bestMatchIndex >= 0 && bestScore >= 0.35) {
        return bestMatchIndex;
      }
    }

    const answeredCount = messages.filter((message) => message.role === 'user')
      .length;
    return interviewQuestions.length > 0
      ? Math.min(answeredCount, interviewQuestions.length - 1)
      : 0;
  }, [interviewQuestions, messages, transcriptQuestion]);

  const currentQuestion =
    transcriptQuestion ||
    interviewQuestions[inferredQuestionIndex]?.question ||
    interviewQuestions[0]?.question ||
    'Take a breath and answer in your own words.';

  const questionIntent = useMemo(
    () => explainQuestion(currentQuestion),
    [currentQuestion]
  );

  const keywordHelper = useMemo(
    () => extractKeywords(currentQuestion),
    [currentQuestion]
  );

  const handleStartCall = async () => {
    if (hasInsufficientCredits) {
      toastService.error(
        'Insufficient credits. Please purchase more credits to start the interview.',
        'Purchase',
        () => {
          router.push('/billing');
        }
      );
      return;
    }

    // Step 1: Deduct credit
    let deductData;
    try {
      const deductResponse = await fetch('/api/billing/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId, amount: 1 }),
      });
      deductData = await deductResponse.json();

      if (!deductData.success) {
        if (deductResponse.status === 402) {
          toastService.error(
            'Insufficient credits. Please purchase more credits.'
          );
        } else {
          console.error(deductData.error || 'Failed to deduct credits');
        }
        return;
      }
    } catch (error) {
      console.error('Credit deduction failed:', error);
      toastService.error('Failed to deduct credit. Please try again.');
      return;
    }

    setCallStatus(CallStatus.CONNECTING);

    // Format interview questions
    const formattedQuestions = interviewQuestions
      .map((q) => `- ${q?.question}`)
      .join('\n');

    // Step 2: Start the interview call with vapi
    try {
      const call = await vapi.start(interviewers[interviewer || 'Joseph'], {
        variableValues: { questions: formattedQuestions },
      });

      if (!call) {
        throw new Error('Call could not be started');
      }

      // Step 3: Save call ID to DB
      await fetch(`/api/interviews/${interviewId}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: call.id }),
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus(CallStatus.INACTIVE);
      toastService.error('Unable to start interview session.');
      router.back();

      // Step 4: Refund credit if call failed
      try {
        const refundResponse = await fetch('/api/billing/refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewId, amount: 1 }),
        });
        const refundData = await refundResponse.json();

        if (!refundData.success) {
          console.error({
            refundError: refundData.error || 'Unable to refund credits',
          });
        }
      } catch (refundError) {
        console.error('Refund request failed:', refundError);
      }
    }
  };

  const persistSessionMetrics = async (
    endedNormally: boolean,
    endedReason: string
  ) => {
    if (sessionMetricsSentRef.current) {
      return;
    }

    sessionMetricsSentRef.current = true;

    try {
      await fetch(`/api/interviews/${interviewId}/session`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endedNormally,
          endedReason,
          firstResponseSeconds: firstResponseSecondsRef.current ?? undefined,
          userMessageCount: userMessageCountRef.current,
          pauseCount: pauseCountRef.current,
        }),
      });
    } catch (error) {
      console.error('Failed to persist session metrics:', error);
    }
  };

  const persistPauseSnapshot = async () => {
    try {
      await fetch(`/api/interviews/${interviewId}/session`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pauseCount: pauseCountRef.current,
          firstResponseSeconds: firstResponseSecondsRef.current ?? undefined,
          userMessageCount: userMessageCountRef.current,
        }),
      });
    } catch (error) {
      console.error('Failed to persist pause snapshot:', error);
    }
  };

  const handlePauseAndBreathe = () => {
    pauseCountRef.current += 1;
    setIsPausedForBreath(true);
    setShowBreathingExercise(true);
    persistPauseSnapshot();

    if (callStatus === CallStatus.ACTIVE) {
      vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content:
            'I need a moment to think. Please pause briefly and do not rush me.',
        },
      });
      vapi.send({
        type: 'control',
        control: 'mute-assistant',
      });
    }
  };

  const handleResumeInterview = () => {
    setIsPausedForBreath(false);

    if (callStatus === CallStatus.ACTIVE) {
      vapi.send({
        type: 'control',
        control: 'unmute-assistant',
      });
      vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: 'I am ready to continue now.',
        },
      });
    }
  };

  const handleSafeExit = async () => {
    if (
      callStatus === CallStatus.ACTIVE ||
      callStatus === CallStatus.CONNECTING
    ) {
      await persistSessionMetrics(false, 'safe_exit');
      vapi.stop();
    }

    router.push('/dashboard');
  };

  const generateFeedback = async () => {
    setGeneratingFeedback(true);
    try {
      const response = await fetch(`/api/interviews/${interviewId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: messages,
        }),
      });

      if (!response.ok) {
        toastService.error(`Failed to generate feedback: ${response.status}`);
        return;
      }

      const data = await response.json();
      if (!data.success) {
        toastService.error(data.error || 'Failed to generate feedback');
        return;
      }

      router.push(`/interviews/${interviewId}/feedback`);
    } catch (error) {
      console.error('Error generating feedback:', error);
      toastService.error('Failed to generate feedback');
    } finally {
      setGeneratingFeedback(false);
    }
  };
  const handleEndCall = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
    await persistSessionMetrics(true, 'completed');
    await generateFeedback();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      callStartedAtRef.current = Date.now();
      sessionMetricsSentRef.current = false;
      firstResponseSecondsRef.current = null;
      userMessageCountRef.current = 0;
      pauseCountRef.current = 0;
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      if (!sessionMetricsSentRef.current) {
        persistSessionMetrics(false, 'call_ended');
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);

        if (message.role === 'user') {
          userMessageCountRef.current += 1;

          if (
            firstResponseSecondsRef.current === null &&
            callStartedAtRef.current !== null
          ) {
            firstResponseSecondsRef.current = Number(
              (
                (Date.now() - callStartedAtRef.current) /
                1000
              ).toFixed(1)
            );
          }
        }
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking('ai');
    };

    const onSpeechEnd = () => {
      setIsSpeaking(null);
    };

    const onError = (error: Error) => {
      setCallStatus(CallStatus.FINISHED);
      console.error(error);
      persistSessionMetrics(false, 'error');
    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
    };
  }, []);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4'></div>
          <p className='text-white'>Loading Interview...</p>
        </div>
      </div>
    );
  }

  if (generatingFeedback) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4'></div>
          <p className='text-white'>Please wait, Generating Feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    toastService.error(error || 'Unable to load interview');
    router.push('/dashboard');
    return null;
  }

  return (
    <ProtectedRoute>
      <div
        className={`h-screen ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
        } relative flex flex-col overflow-hidden`}
      >
        <div className='h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4'>
          <div className='flex items-center space-x-3'>
            <div className='relative flex items-center justify-center'>
              <span className='absolute inline-flex h-4 w-4 rounded-full bg-cyan-400/20 animate-ping'></span>
              <span className='relative h-2.5 w-2.5 rounded-full bg-cyan-300'></span>
            </div>
            <div>
              <span className='block text-white text-sm font-medium'>
                {session.jobTitle} Interview
              </span>
              <span className='text-xs text-gray-400'>
                Take your time. There is no countdown here.
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='border-amber-400/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
              onClick={
                isPausedForBreath ? handleResumeInterview : handlePauseAndBreathe
              }
            >
              <PauseCircle className='mr-2 h-4 w-4' />
              {isPausedForBreath ? 'Resume' : 'Pause & breathe'}
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20'
              onClick={handleSafeExit}
            >
              <DoorOpen className='mr-2 h-4 w-4' />
              Safe exit
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='text-white hover:bg-gray-700 flex items-center space-x-1'
              onClick={() => setShowChat(!showChat)}
            >
              <Grid3X3 className='w-4 h-4' />
              <span className='text-sm'>Transcript</span>
            </Button>
          </div>
        </div>
        {callStatus !== CallStatus.ACTIVE && (
          <div className='m-5 '>
            <Alert variant={'warning'}>
              <InfoIcon />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                Please do not share any sensitive, personal, or confidential
                information with this AI agent. Conversations may be stored or
                recorded and could be used for quality assurance, research, or
                training purposes. By starting this interview, you acknowledge
                and accept this.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className='flex-1 flex overflow-hidden'>
          <div className={`flex-1 bg-gray-900 ${showChat ? 'pr-0' : ''}`}>
            <div className='h-full relative'>
              <div
                className={`absolute top-56 z-20 flex w-[22rem] max-w-[calc(100%-2rem)] flex-col gap-3 lg:top-4 ${
                  showChat ? 'right-[21rem]' : 'right-4'
                }`}
              >
                <div className='rounded-2xl border border-gray-800 bg-gray-900/90 p-4 backdrop-blur'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400'>
                        Support tools
                      </p>
                      <p className='mt-1 text-sm text-gray-300'>
                        Use what helps. None of this is scored.
                      </p>
                    </div>
                    {showScratchpad ? (
                      <button
                        type='button'
                        onClick={() => setShowScratchpad(false)}
                        className='text-gray-400 hover:text-white'
                        aria-label='Dismiss preparation space'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    ) : null}
                  </div>

                  {showScratchpad ? (
                    <div className='mt-3 space-y-3'>
                      <div className='flex items-center gap-2 text-sm text-white'>
                        <NotebookPen className='h-4 w-4 text-cyan-400' />
                        Preparation space
                      </div>
                      <Textarea
                        value={scratchpad}
                        onChange={(event) => setScratchpad(event.target.value)}
                        placeholder='Private notes, answer structure, or reminders. Never scored.'
                        className='min-h-28 border-gray-700 bg-gray-950 text-white placeholder:text-gray-500'
                      />
                    </div>
                  ) : (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowScratchpad(true)}
                      className='mt-3 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200'
                    >
                      <NotebookPen className='mr-2 h-4 w-4' />
                      Reopen preparation space
                    </Button>
                  )}
                </div>

                <div className='rounded-2xl border border-gray-800 bg-gray-900/90 p-4 backdrop-blur'>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setShowQuestionIntent((value) => !value)}
                      className='border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800'
                    >
                      <Lightbulb className='mr-2 h-4 w-4' />
                      What is this question asking?
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowStarPrompt((value) => !value)}
                      className='text-gray-300 hover:bg-gray-800'
                    >
                      <ListTree className='mr-2 h-4 w-4' />
                      STAR nudge
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowKeywordHelper((value) => !value)}
                      className='text-gray-300 hover:bg-gray-800'
                    >
                      <Brain className='mr-2 h-4 w-4' />
                      Keywords helper
                    </Button>
                  </div>

                  {showQuestionIntent ? (
                    <div className='mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-50'>
                      <p className='mb-2 text-[11px] uppercase tracking-[0.18em] text-cyan-300'>
                        Based on the current interviewer question
                      </p>
                      {questionIntent}
                    </div>
                  ) : null}

                  {showStarPrompt ? (
                    <div className='mt-3 grid gap-2 rounded-xl border border-gray-700 bg-gray-950/80 p-3'>
                      {STAR_PROMPT.map((item) => (
                        <div key={item.label} className='text-sm'>
                          <span className='font-medium text-cyan-300'>
                            {item.label}:
                          </span>{' '}
                          <span className='text-gray-300'>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {showKeywordHelper ? (
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {keywordHelper.length > 0 ? (
                        keywordHelper.map((keyword) => (
                          <Badge
                            key={keyword}
                            className='border border-white/10 bg-white/10 text-white'
                          >
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className='text-sm text-gray-400'>
                          No keywords to pull from this question yet.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {callStatus !== CallStatus.INACTIVE ? (
                    <p className='mt-3 text-xs text-gray-500'>
                      Current question: {currentQuestion}
                    </p>
                  ) : null}

                  {showBreathingExercise ? (
                    <div className='mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3'>
                      <div className='flex items-center gap-2 text-sm font-medium text-emerald-100'>
                        <Wind className='h-4 w-4 text-emerald-300' />
                        Breathing reset
                      </div>
                      <p className='mt-2 text-sm text-emerald-50'>
                        Inhale for 4. Hold for 4. Exhale for 6. Repeat twice,
                        then resume when you are ready.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <AI_AGENT
                isSpeaking={isSpeaking}
                userName={user?.fullName || ''}
                userId={user?.id || ''}
                interviewId={interviewId}
                type={session?.type || ''}
                questions={session.questions || []}
                setIsSpeaking={setIsSpeaking}
                interviewer={interviewer || 'joseph'}
              />

              {/* User - main large video */}
              <div className='h-full'>
                <div className='h-full overflow-hidden bg-[#040404]'>
                  <CardContent className='p-0 h-full relative'>
                    {isPausedForBreath ? (
                      <div className='absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100 backdrop-blur'>
                        Paused. Take the moment you need.
                      </div>
                    ) : null}
                    <div className='h-full flex items-center justify-center'>
                      <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-300 ${
                          isSpeaking === 'user'
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse scale-110'
                            : 'bg-gray-600 text-green-400'
                        }`}
                      >
                        {user?.fullName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className='absolute bottom-4 left-4'>
                      <div className='px-3 py-2 bg-black/70 text-white rounded text-sm font-medium'>
                        {user?.fullName}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`absolute top-0 right-0 h-full w-80 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-20 ${
              showChat ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className='w-full h-full p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-sm text-white'>Transcript</h3>

                <Button
                  variant='ghost'
                  size='sm'
                  className='text-white hover:bg-gray-700 p-1'
                  onClick={() => setShowChat(false)}
                >
                  ✕
                </Button>
              </div>

              <div
                ref={messagesRef}
                className='h-full overflow-y-auto space-y-3 pb-20'
              >
                {messages.map((entry, idx) => (
                  <div
                    key={idx}
                    className='space-y-1 border-b border-gray-700 pb-2'
                  >
                    <div className='flex items-center space-x-2'>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          entry.role === 'assistant'
                            ? 'bg-cyan-400/20 text-cyan-400'
                            : 'bg-green-400/20 text-green-400'
                        }`}
                      >
                        {entry.role === 'assistant'
                          ? 'AI'
                          : user?.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className='text-xs font-medium text-gray-300'>
                        {entry.role === 'assistant'
                          ? 'AI Interviewer'
                          : user?.fullName}
                      </span>
                    </div>
                    <p className='text-xs ml-8 text-gray-300 leading-relaxed'>
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50'>
          <div className='flex items-center justify-center space-x-4 px-6 py-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-full shadow-2xl'>
            <Button
              variant='ghost'
              size='sm'
              className={`w-12 h-12 rounded-full flex flex-col items-center justify-center space-y-1 hover:bg-gray-700 ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'text-white hover:bg-gray-700'
              }`}
              onClick={toggleMute}
              disabled={callStatus !== CallStatus.ACTIVE}
            >
              {isMuted ? (
                <MicOff className='w-5 h-5' />
              ) : (
                <Mic className='w-5 h-5' />
              )}
            </Button>

            {session.type === 'live-coding' && (
              <Button
                variant='ghost'
                size='sm'
                className='w-12 h-12 rounded-full flex flex-col items-center justify-center space-y-1 text-white hover:bg-gray-700'
              >
                <Code className='w-5 h-5' />
              </Button>
            )}

            <Button
              variant='ghost'
              size='sm'
              className={` rounded-full flex items-center justify-center mx-8 ${
                callStatus === CallStatus.ACTIVE
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              onClick={
                callStatus === CallStatus.ACTIVE
                  ? handleEndCall
                  : handleStartCall
              }
            >
              {callStatus === CallStatus.CONNECTING
                ? 'Connecting...'
                : callStatus === CallStatus.ACTIVE
                ? 'End interview'
                : 'Start Interview'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
