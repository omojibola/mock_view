'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/lib/contexts/theme-context';
import { ArrowLeft, CheckCircle, User } from 'lucide-react';

const interviewers = [
  {
    id: 'Joseph',
    name: 'Joseph',
    description:
      'Known for his clear communication, structured interviewing style, and confident, no-nonsense approach.',
  },
  {
    id: 'Lulu',
    name: 'Lulu',
    description:
      'Experienced HR manager in talent development, has a warm communication style, supportive guidance, and engaging interview presence.',
  },
];

export default function SelectInterviewerPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [selectedInterviewer, setSelectedInterviewer] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedInterviewer = localStorage.getItem('preferred_interviewer');
    if (
      savedInterviewer &&
      interviewers.some((i) => i.id === savedInterviewer)
    ) {
      setSelectedInterviewer(savedInterviewer);
    }
  }, []);

  const handleSelectInterviewer = (interviewerId: string) => {
    setSelectedInterviewer(interviewerId);
    localStorage.setItem('preferred_interviewer', interviewerId);
  };

  const handleContinue = async () => {
    if (!selectedInterviewer) return;

    setIsLoading(true);

    router.push(
      `/interviews/${interviewId}/start?interviewer=${selectedInterviewer}`
    );
    setIsLoading(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute>
      <div
        className={`min-h-screen ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        } py-12`}
      >
        <div className='max-w-2xl mx-auto px-4'>
          {/* Header */}
          <div className='mb-12'>
            <Button
              variant='ghost'
              onClick={handleBack}
              className={`mb-6 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back
            </Button>

            <div className='text-center'>
              <h1
                className={`text-3xl font-bold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Choose Your Interviewer
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Select your preferred interviewer to guide you through the
                session.
              </p>
            </div>
          </div>

          {/* Interviewer Options */}
          <div className='space-y-4 mb-8'>
            {interviewers.map((interviewer) => (
              <Card
                key={interviewer.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedInterviewer === interviewer.id
                    ? theme === 'dark'
                      ? 'bg-gray-800 border-cyan-400 ring-2 ring-cyan-400/20'
                      : 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20'
                    : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => handleSelectInterviewer(interviewer.id)}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 flex-1'>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedInterviewer === interviewer.id
                            ? theme === 'dark'
                              ? 'bg-cyan-400/20'
                              : 'bg-blue-100'
                            : theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-gray-100'
                        }`}
                      >
                        <User
                          className={`w-6 h-6 ${
                            selectedInterviewer === interviewer.id
                              ? theme === 'dark'
                                ? 'text-cyan-400'
                                : 'text-blue-600'
                              : theme === 'dark'
                              ? 'text-gray-400'
                              : 'text-gray-600'
                          }`}
                        />
                      </div>

                      <div>
                        <h3
                          className={`text-md font-semibold mb-1 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {interviewer.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {interviewer.description}
                        </p>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedInterviewer === interviewer.id && (
                      <div className='ml-4'>
                        <CheckCircle
                          className={`w-6 h-6 ${
                            theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          <div className='text-center'>
            <Button
              onClick={handleContinue}
              disabled={!selectedInterviewer || isLoading}
              className={`w-full py-6 text-md font-medium ${
                theme === 'dark'
                  ? 'bg-white hover:bg-gray-100 text-black disabled:bg-gray-700 disabled:text-gray-500'
                  : 'bg-black hover:bg-gray-800 text-white disabled:bg-gray-300 disabled:text-gray-500'
              }`}
            >
              {isLoading ? 'Starting Interview...' : 'Continue to Interview'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
