'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import { toastService } from '@/lib/services/toast.service';
import { ArrowLeft, CheckCircle, User, Mic, Plus } from 'lucide-react';
import type { CustomInterviewer } from '@/lib/types/interviewer.types';

interface DefaultInterviewer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  description: string;
  specialties: string[];
  experience: string;
  isDefault: true;
}

const defaultInterviewers: DefaultInterviewer[] = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    avatar: '/professional-woman-glasses.png',
    title: 'Senior Technical Lead',
    description:
      'Specializes in frontend development and system design with 8+ years at top tech companies.',
    specialties: ['React', 'TypeScript', 'System Design'],
    experience: '8+ years',
    isDefault: true,
  },
  {
    id: 'marcus-johnson',
    name: 'Marcus Johnson',
    avatar: '/professional-black-man-suit.png',
    title: 'Engineering Manager',
    description:
      'Expert in behavioral interviews and team leadership with extensive hiring experience.',
    specialties: ['Leadership', 'Team Management', 'Behavioral'],
    experience: '10+ years',
    isDefault: true,
  },
  {
    id: 'elena-rodriguez',
    name: 'Elena Rodriguez',
    avatar: '/professional-latina-woman-smiling.png',
    title: 'Full Stack Architect',
    description:
      'Focuses on full-stack development and problem-solving with startup and enterprise experience.',
    specialties: ['Full Stack', 'Problem Solving', 'Architecture'],
    experience: '7+ years',
    isDefault: true,
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    avatar: '/professional-asian-man-beard.png',
    title: 'Principal Engineer',
    description:
      'Specializes in algorithms, data structures, and coding challenges with FAANG experience.',
    specialties: ['Algorithms', 'Data Structures', 'Coding'],
    experience: '12+ years',
    isDefault: true,
  },
];

type InterviewerOption =
  | DefaultInterviewer
  | (CustomInterviewer & { isDefault?: false });

export default function SelectInterviewerPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [selectedInterviewer, setSelectedInterviewer] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [customInterviewers, setCustomInterviewers] = useState<
    CustomInterviewer[]
  >([]);
  const [isLoadingCustom, setIsLoadingCustom] = useState(true);
  const [allInterviewers, setAllInterviewers] = useState<InterviewerOption[]>(
    []
  );

  useEffect(() => {
    fetchCustomInterviewers();
  }, []);

  useEffect(() => {
    const combined: InterviewerOption[] = [
      ...defaultInterviewers,
      ...customInterviewers.map((interviewer) => ({
        ...interviewer,
        isDefault: false as const,
      })),
    ];
    setAllInterviewers(combined);
  }, [customInterviewers]);

  const fetchCustomInterviewers = async () => {
    try {
      const response = await fetch('/api/interviewers');
      const result = await response.json();

      if (result.success) {
        setCustomInterviewers(result.data);
      } else {
        console.error('Failed to fetch custom interviewers:', result.error);
      }
    } catch (error) {
      console.error('Fetch custom interviewers error:', error);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  const handleSelectInterviewer = (interviewerId: string) => {
    setSelectedInterviewer(interviewerId);
  };

  const handleContinue = async () => {
   // if (!selectedInterviewer) return;

    setIsLoading(true);
 router.push(`/interviews/${interviewId}/start`);
    setIsLoading(false);
    
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateInterviewer = () => {
    router.push('/interviewers/create');
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
                className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Choose Your Interviewer
              </h1>
              <p
                className={`text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Select an AI interviewer that matches your interview style and
                preferences
              </p>
            </div>
          </div>

          {!isLoadingCustom && customInterviewers.length > 0 && (
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h2
                  className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Your Custom Interviewers
                </h2>
                <Badge variant='outline' className='flex items-center gap-1'>
                  <Mic className='w-3 h-3' />
                  Custom Voice
                </Badge>
              </div>
              <div className='space-y-4'>
                {customInterviewers.map((interviewer) => (
                  <Card
                    key={interviewer.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedInterviewer === interviewer.id
                        ? theme === 'dark'
                          ? 'bg-gray-700 border-cyan-400 ring-2 ring-cyan-400/20'
                          : 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20'
                        : theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectInterviewer(interviewer.id)}
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-start space-x-4'>
                        {/* Avatar */}
                        <div className='relative'>
                          {interviewer.avatar_url ? (
                            <img
                              src={interviewer.avatar_url || '/placeholder.svg'}
                              alt={interviewer.name}
                              className='w-20 h-20 rounded-full object-cover'
                            />
                          ) : (
                            <div
                              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                              }`}
                            >
                              <User
                                className={`w-10 h-10 ${
                                  theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                }`}
                              />
                            </div>
                          )}
                          {selectedInterviewer === interviewer.id && (
                            <div className='absolute -top-2 -right-2'>
                              <CheckCircle className='w-6 h-6 text-cyan-400 bg-white rounded-full' />
                            </div>
                          )}
                          {/* Custom voice indicator */}
                          <div className='absolute -bottom-1 -right-1'>
                            <div
                              className={`p-1 rounded-full ${
                                theme === 'dark'
                                  ? 'bg-green-900 text-green-400'
                                  : 'bg-green-100 text-green-600'
                              }`}
                            >
                              <Mic className='w-3 h-3' />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className='flex-1'>
                          <div className='flex items-start justify-between mb-2'>
                            <div>
                              <h3
                                className={`text-xl font-semibold ${
                                  theme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                }`}
                              >
                                {interviewer.name}
                              </h3>
                              <p
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'text-cyan-400'
                                    : 'text-blue-600'
                                }`}
                              >
                                {interviewer.title}
                              </p>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {interviewer.experience}
                              </Badge>
                              <Badge variant='default' className='text-xs'>
                                Custom
                              </Badge>
                            </div>
                          </div>

                          {interviewer.description && (
                            <p
                              className={`text-sm mb-3 ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-600'
                              }`}
                            >
                              {interviewer.description}
                            </p>
                          )}

                          {/* Specialties */}
                          <div className='flex flex-wrap gap-2'>
                            {interviewer.specialties.map((specialty) => (
                              <Badge
                                key={specialty}
                                variant='secondary'
                                className={`text-xs ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 text-gray-200'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isLoadingCustom && customInterviewers.length < 2 && (
            <div className='mb-8'>
              <Card
                className={`cursor-pointer transition-all duration-200 border-dashed ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-750 hover:border-gray-500'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                }`}
                onClick={handleCreateInterviewer}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-center space-x-4'>
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    >
                      <Plus
                        className={`w-8 h-8 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div className='text-center'>
                      <h3
                        className={`text-lg font-semibold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Create Custom Interviewer
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Design your own AI interviewer with custom voice and
                        expertise
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Default Interviewers */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h2
                className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Default Interviewers
              </h2>
            </div>
            <div className='space-y-4'>
              {defaultInterviewers.map((interviewer) => (
                <Card
                  key={interviewer.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedInterviewer === interviewer.id
                      ? theme === 'dark'
                        ? 'bg-gray-700 border-cyan-400 ring-2 ring-cyan-400/20'
                        : 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20'
                      : theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectInterviewer(interviewer.id)}
                >
                  <CardContent className='p-6'>
                    <div className='flex items-start space-x-4'>
                      {/* Avatar */}
                      <div className='relative'>
                        <img
                          src={interviewer.avatar || '/placeholder.svg'}
                          alt={interviewer.name}
                          className='w-20 h-20 rounded-full object-cover'
                        />
                        {selectedInterviewer === interviewer.id && (
                          <div className='absolute -top-2 -right-2'>
                            <CheckCircle className='w-6 h-6 text-cyan-400 bg-white rounded-full' />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className='flex-1'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h3
                              className={`text-xl font-semibold ${
                                theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {interviewer.name}
                            </h3>
                            <p
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-cyan-400'
                                  : 'text-blue-600'
                              }`}
                            >
                              {interviewer.title}
                            </p>
                          </div>
                          <Badge variant='outline' className='text-xs'>
                            {interviewer.experience}
                          </Badge>
                        </div>

                        <p
                          className={`text-sm mb-3 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {interviewer.description}
                        </p>

                        {/* Specialties */}
                        <div className='flex flex-wrap gap-2'>
                          {interviewer.specialties.map((specialty) => (
                            <Badge
                              key={specialty}
                              variant='secondary'
                              className={`text-xs ${
                                theme === 'dark'
                                  ? 'bg-gray-600 text-gray-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <div className='text-center'>
            <Button
              onClick={handleContinue}
              //disabled={!selectedInterviewer || isLoading}
              className={`px-8 py-3 text-lg font-medium ${
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
