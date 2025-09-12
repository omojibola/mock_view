'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { InterviewCard } from '@/components/dashboard/interview-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/theme-context';
import { Plus, MessageSquare } from 'lucide-react';
import type { InterviewCard as InterviewCardType } from '@/lib/types/interview.types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      setIsLoading(true);
      const response = await fetch('/api/interviews');
      const data = await response.json();
      setInterviews(data.data || []);
      setIsLoading(false);
    };
    fetchInterviews();
  }, []);

  const handleCreateInterview = () => {
    router.push('/interviews/create');
  };

  const handleRetakeInterview = (id: string) => {
    router.push(`/interviews/${id}/select-interviewer`);
  };

  const handleViewFeedback = (id: string) => {
    router.push(`/interviews/${id}/feedback`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-7xl mx-auto'>
          {/* Welcome Section */}
          <div className='mb-8'>
            <h1
              className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p
              className={`text-md ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Ready to ace your next interview? Let&apos;s practice and improve
              your skills.
            </p>
          </div>

          {/* Call to Action */}
          <div
            className={`bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-6 mb-8 ${
              theme === 'light'
                ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200'
                : ''
            }`}
          >
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between'>
              <div className='mb-4 sm:mb-0'>
                <h2
                  className={`text-md font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Start Your Next Interview
                </h2>
                <p
                  className={
                    theme === 'dark'
                      ? 'text-gray-300 text-sm'
                      : 'text-gray-700 text-sm'
                  }
                >
                  Practice with AI or schedule a session with a real interviewer
                </p>
              </div>
              <div className='flex space-x-3'>
                <Button
                  onClick={handleCreateInterview}
                  className={`font-medium ${
                    theme === 'dark'
                      ? 'bg-white hover:bg-gray-100 text-black'
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Create Interview
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Interviews */}
          <div>
            <div className='flex items-center justify-between mb-6'>
              <h2
                className={`text-md font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Recent Interviews
              </h2>
              <Button
                variant='ghost'
                className='text-cyan-400 hover:text-cyan-300'
                onClick={() => router.push('/interviews')}
              >
                View All
              </Button>
            </div>

            {isLoading ? (
              <div className='flex items-center justify-center min-h-96'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4'></div>
                  <p
                    className={
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }
                  >
                    Loading interviews...
                  </p>
                </div>
              </div>
            ) : interviews.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {interviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onRetake={handleRetakeInterview}
                    onViewFeedback={handleViewFeedback}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                >
                  <MessageSquare
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
