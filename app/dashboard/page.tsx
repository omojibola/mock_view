'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { InterviewCard } from '@/components/dashboard/interview-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { Plus, Sparkles, MessageSquare } from 'lucide-react';
import type { InterviewCard as InterviewCardType } from '@/lib/types/interview.types';

// Mock data - replace with actual API calls
const mockInterviews: InterviewCardType[] = [
  {
    id: '1',
    title: 'Frontend Developer Interview',
    description: 'React, TypeScript, and modern web development practices',
    duration: 45,
    type: 'technical',

    score: 85,
  },
  {
    id: '2',
    title: 'Leadership & Communication',
    description:
      'Behavioral questions focusing on team leadership and conflict resolution',
    duration: 30,
    type: 'behavioral',
    score: 92,
  },
  {
    id: '3',
    title: 'System Design Interview',
    description: 'Scalable architecture and distributed systems design',
    duration: 60,
    type: 'technical',
    score: 78,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [interviews] = useState<InterviewCardType[]>(mockInterviews);

  const handleCreateInterview = () => {
    router.push('/interviews/create');
  };

  const handleRetakeInterview = (id: string) => {
    router.push(`/interviews/${id}/retake`);
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
            <h1 className='text-3xl font-bold text-white mb-2'>
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className='text-gray-400 text-lg'>
              Ready to ace your next interview? Let's practice and improve your
              skills.
            </p>
          </div>

          {/* Call to Action */}
          <div className='bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-6 mb-8'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between'>
              <div className='mb-4 sm:mb-0'>
                <h2 className='text-xl font-semibold text-white mb-2'>
                  Start Your Next Interview
                </h2>
                <p className='text-gray-300'>
                  Practice with AI or schedule a session with a real interviewer
                </p>
              </div>
              <div className='flex space-x-3'>
                <Button
                  onClick={handleCreateInterview}
                  className='bg-cyan-400 hover:bg-cyan-500 text-black font-medium'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Create Interview
                </Button>
                <Button
                  variant='outline'
                  onClick={handleCreateInterview}
                  className='border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 bg-transparent'
                >
                  <Sparkles className='w-4 h-4 mr-2' />
                  AI Generate
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Interviews */}
          <div>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-semibold text-white'>
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

            {interviews.length > 0 ? (
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
                <div className='w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <MessageSquare className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='text-lg font-medium text-white mb-2'>
                  No interviews yet
                </h3>
                <p className='text-gray-400 mb-6'>
                  Start your interview practice journey by creating your first
                  interview
                </p>
                <Button
                  onClick={handleCreateInterview}
                  className='bg-cyan-400 hover:bg-cyan-500 text-black font-medium'
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
