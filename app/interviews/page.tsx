'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import { Plus, Clock, RotateCcw, Eye, Search, Filter } from 'lucide-react';
import type { InterviewCard as InterviewCardType } from '@/lib/types/interview.types';

export default function InterviewsPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewCardType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateInterview = () => {
    router.push('/interviews/create');
  };

  const handleTakeInterview = (id: string) => {
    router.push(`/interviews/${id}/start`);
  };

  const handleViewResults = (id: string) => {
    router.push(`/interviews/${id}/feedback`);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30';
      case 'behavioral':
        return 'bg-purple-400/20 text-purple-400 border-purple-400/30';
      case 'case-study':
        return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      case 'problem-solving':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'situational':
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  useEffect(() => {
    try {
      const fetchInterviews = async () => {
        setLoading(true);
        const response = await fetch('/api/interviews');
        const data = await response.json();
        setInterviews(data?.data);
        setLoading(false);
      };
      fetchInterviews();
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='flex items-center justify-center min-h-96'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4'></div>
              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Loading interviews...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8'>
            <div>
              <h1
                className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                My Interviews
              </h1>
              <p
                className={`text-md ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Track your interview practice progress and performance
              </p>
            </div>
            <Button
              onClick={handleCreateInterview}
              className={`mt-4 sm:mt-0 font-medium ${
                theme === 'dark'
                  ? 'bg-white hover:bg-gray-100 text-black'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              <Plus className='w-4 h-4 mr-2' />
              Create Interview
            </Button>
          </div>

          {/* Interviews List */}
          <div className='space-y-4'>
            {interviews?.map((interview) => (
              <div
                key={interview.id}
                className={`w-full rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800 hover:border-cyan-400/50'
                    : 'bg-white border-gray-200 hover:border-cyan-400/50 shadow-sm'
                }`}
              >
                <div className='p-6'>
                  <div className='flex flex-col items-start lg:justify-between gap-4'>
                    {/* Left section - Interview details */}
                    <div className='min-w-0'>
                      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3'>
                        <h3
                          className={`text-md font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {interview.title}
                        </h3>
                        <Badge className={getBadgeColor(interview.type)}>
                          {interview.type}
                        </Badge>
                      </div>
                      <p
                        className={`text-xs mb-3 line-clamp-2 leading-5 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {interview.description}
                      </p>

                      <div
                        className={`flex flex-wrap items-center gap-4 text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        <div className='flex items-center space-x-1 text-xs'>
                          <Clock className='w-4 h-4' />
                          <span>{formatDuration(interview.duration)}</span>
                        </div>
                        <span>•</span>
                        <span className='text-xs'>
                          Completed {formatDate(interview?.completedAt || '')}
                        </span>
                        {interview.score && (
                          <>
                            <span>•</span>
                            <div className='flex items-center space-x-1 text-xs'>
                              <span>Score:</span>
                              <span className='text-cyan-400 font-semibold'>
                                {interview.score}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right section - Actions */}
                    <div className='flex sm:flex-row gap-3'>
                      <Button
                        onClick={() => handleTakeInterview(interview.id)}
                        className={`font-medium text-xs ${
                          theme === 'dark'
                            ? 'bg-white hover:bg-gray-100 text-black'
                            : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                      >
                        <RotateCcw className='w-2 h-2 mr-2' />
                        Take Interview
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => handleViewResults(interview.id)}
                        className={`hover:border-cyan-400 hover:bg-cyan-400/10 bg-transparent text-xs ${
                          theme === 'dark'
                            ? 'border-gray-700 text-gray-300'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        <Eye className='w-2 h-2 mr-2' />
                        View Results
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state would go here if no interviews */}
          {interviews?.length === 0 && (
            <div className='text-center py-12'>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              >
                <Clock
                  className={`w-8 h-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-medium mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                No interviews yet
              </h3>
              <p
                className={`mb-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Start your interview practice journey by creating your first
                interview
              </p>
              <Button
                onClick={handleCreateInterview}
                className={`font-medium ${
                  theme === 'dark'
                    ? 'bg-white hover:bg-gray-100 text-black'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                <Plus className='w-4 h-4 mr-2' />
                Create Your First Interview
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
