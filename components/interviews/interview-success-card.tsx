'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import { Clock, User, Settings, LinkIcon, Play, Copy } from 'lucide-react';
import type { GeneratedInterview } from '@/lib/types/interview.types';
import { toast } from 'sonner';

interface InterviewSuccessCardProps {
  interview: GeneratedInterview;
}

export function InterviewSuccessCard({ interview }: InterviewSuccessCardProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const handleStartInterview = () => {
    router.push(`/interviews/${interview?.id}/start`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/interviews/${interview?.id}/start`
    );
    toast.success('Interview link copied to clipboard!');
  };

  const getDifficultyColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      case 'behavioral':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'problem-solving':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <Card
      className={`max-w-4xl mx-auto ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <CardContent className='p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <User className='w-4 h-4 text-blue-500' />
              <h3
                className={`font-semibold text-md ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Job Summary
              </h3>
            </div>

            <div className='space-y-3'>
              <div>
                <h4
                  className={`font-semibold text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {interview?.jobTitle}
                </h4>
              </div>

              <div className='flex items-center space-x-2 text-xs'>
                <Clock className='w-3 h-3 text-gray-500' />
                <span
                  className={
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }
                >
                  ~30 minutes
                </span>
              </div>

              <div className='text-xs'>
                <p
                  className={`line-clamp-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {interview?.jobDescription}
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Settings className='w-4 h-4 text-purple-500' />
              <h3
                className={`font-semibold text-md ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Interview Configuration
              </h3>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2'>
                <span
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Interview Type
                </span>
                <Badge
                  className={`text-xs ${getDifficultyColor(interview?.type)}`}
                >
                  {interview?.type?.charAt(0).toUpperCase() +
                    interview?.type?.slice(1)}
                </Badge>
              </div>

              <div className='flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2'>
                <span
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Question Count
                </span>
                <span
                  className={`text-xs font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {interview?.questions?.length} Questions
                </span>
              </div>

              <div className='flex justify-between items-center '>
                <span
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Focus Areas
                </span>
                <span
                  className={`text-xs font-semibold capitalize ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {interview?.type} Skills
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center space-x-2'>
              <LinkIcon className='w-4 h-4 text-purple-500' />
              <h3
                className={`font-semibold text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Interview Link
              </h3>
            </div>
            <Badge className='text-xs bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'>
              Active
            </Badge>
          </div>

          <div className='space-y-3'>
            <div>
              <p
                className={`text-xs mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Candidate Access URL
              </p>

              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <code
                  className={`flex-1 text-xs font-mono ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {`${window.location.origin}/interviews/${interview?.id}/start`}
                </code>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleCopyLink}
                  className='h-7 px-3 text-xs bg-cyan-500 hover:text-white text-white '
                >
                  <Copy className='w-3 h-3 mr-1' />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex flex-col sm:flex-row gap-3 justify-between'>
            <Button
              onClick={handleStartInterview}
              className={` h-10 text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-white hover:bg-gray-100 text-black'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              <Play className='w-4 h-4 mr-2' />
              Start Interview
            </Button>
            <Button
              variant='link'
              onClick={() => router.push('/dashboard')}
              className='text-cyan-400 hover:text-cyan-300 text-sm'
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
