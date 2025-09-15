'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/lib/contexts/theme-context';
import { ArrowLeft } from 'lucide-react';

interface Interviewer {
  id: string;
  name: string;
  avatar: string;
  title?: string;
  description?: string;
  provider?: string;
}

const interviewers: Interviewer[] = [
  {
    id: 'Nala - african female',
    provider: '11labs',
    name: 'Lulu',
    title: 'HR Manager',
    description:
      'Specializes in behavioral interviews and HR-related questions with a friendly approach.',
    avatar: '/professional-woman-glasses.png',
  },
];

export default function SelectInterviewerPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [selectedInterviewer, setSelectedInterviewer] =
    useState<Interviewer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectInterviewer = (interviewer: Interviewer) => {
    setSelectedInterviewer(interviewer);
  };

  const handleContinue = async () => {
    if (!selectedInterviewer) return;

    setIsLoading(true);

    // Simulate a short delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(`/interviews/${interviewId}/start`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute>
      <div
        className={`min-h-screen ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        } py-8`}
      >
        <div className='max-w-4xl mx-auto px-4'>
          {/* Header */}
          <div className='mb-8'>
            <Button
              variant='ghost'
              onClick={handleBack}
              className={`mb-4 ${
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
                className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Choose Your Interviewer
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Select an AI interviewer that matches your interview style and
                preferences
              </p>
            </div>
          </div>

          {/* Interviewers Grid */}
          <div className='space-y-4 mb-8'>
            {interviewers.map((interviewer) => (
              <Card
                key={interviewer.id}
                className={`cursor-pointer transition-all duration-200 p-0 ${
                  selectedInterviewer?.id === interviewer.id
                    ? theme === 'dark'
                      ? 'bg-gray-700 border-cyan-400 ring-2 ring-cyan-400/20'
                      : 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20'
                    : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => handleSelectInterviewer(interviewer)}
              >
                <CardContent className='p-3'>
                  <div className='flex items-start space-x-4'>
                    <div className='relative'>
                      <img
                        src={interviewer.avatar || '/placeholder.svg'}
                        alt={interviewer.name}
                        className='w-10 h-10 rounded-full object-cover'
                      />
                    </div>
                    {/* Content */}
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <h3
                            className={`text-md font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {interviewer.name}
                          </h3>
                          <p
                            className={`text-xs ${
                              theme === 'dark'
                                ? 'text-cyan-400'
                                : 'text-blue-600'
                            }`}
                          >
                            {interviewer.title}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`text-sm mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {interviewer.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          <div className='text-center'>
            <Button
              onClick={handleContinue}
              // disabled={!selectedInterviewer || isLoading}
              className={`px-8 py-3 text-sm font-medium w-full ${
                theme === 'dark'
                  ? 'bg-white hover:bg-gray-100 text-black'
                  : 'bg-black hover:bg-gray-800 text-white'
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
