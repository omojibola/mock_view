'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useTheme } from '@/lib/contexts/theme-context';
import { Mic, MicOff, Code, Grid3X3 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import AI_AGENT from '@/components/interviews/ai-agent';
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from '@/constants';
import { InterviewQuestion } from '@/lib/types/interview.types';
import toastService from '@/lib/services/toast.service';

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

export default function StartInterviewPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const interviewId = params.id as string;

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

  const messagesRef = useRef<HTMLDivElement>(null);

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

  const handleStartCall = async () => {
    if (hasInsufficientCredits) {
      toastService.error(
        'Insufficient credits. Please purchase more credits to start the interview.'
      );
      return;
    }

    const deductResponse = await fetch('/api/billing/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewId, amount: 1 }),
    });

    const deductData = await deductResponse.json();

    if (!deductData.success) {
      if (deductResponse.status === 402) {
        toastService.error(
          'Insufficient credits. Please purchase more credits.'
        );
        return;
      }
      console.error(deductData.error || 'Failed to deduct credits');
    }
    setCallStatus(CallStatus.CONNECTING);

    let formattedQuestions = '';
    if (interviewQuestions) {
      formattedQuestions = interviewQuestions
        .map((question) => `- ${question?.question}`)
        .join('\n');
    }

    await vapi.start(interviewer, {
      variableValues: {
        questions: formattedQuestions,
      },
    });
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
    await generateFeedback();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
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
      toastService.error('Unable to start interview session.');
      console.error(error);
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
        <div className='h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-white text-sm font-medium'>
              {session.jobTitle} Interview
            </span>
          </div>

          <Button
            variant='ghost'
            size='sm'
            className='text-white hover:bg-gray-700 flex items-center space-x-1'
            onClick={() => setShowChat(!showChat)}
          >
            <Grid3X3 className='w-4 h-4' />
            <span className='text-sm'>View</span>
          </Button>
        </div>

        <div className='flex-1 flex overflow-hidden'>
          <div className={`flex-1 bg-gray-900 ${showChat ? 'pr-0' : ''}`}>
            <div className='h-full relative'>
              {/* AI Interviewer - smaller video on left */}
              <AI_AGENT
                isSpeaking={isSpeaking}
                userName={user?.fullName || ''}
                userId={user?.id || ''}
                interviewId={interviewId}
                type={session?.type || ''}
                questions={session.questions || []}
                setIsSpeaking={setIsSpeaking}
              />

              {/* User - main large video */}
              <div className='h-full'>
                <div className='h-full overflow-hidden bg-[#040404]'>
                  <CardContent className='p-0 h-full relative'>
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
