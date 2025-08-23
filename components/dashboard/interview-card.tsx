'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import { Clock, RotateCcw, Eye } from 'lucide-react';
import type { InterviewCard as InterviewCardType } from '@/lib/types/interview.types';

interface InterviewCardProps {
  interview: InterviewCardType;
  onRetake: (id: string) => void;
  onViewFeedback: (id: string) => void;
}

export function InterviewCard({
  interview,
  onRetake,
  onViewFeedback,
}: InterviewCardProps) {
  const { theme } = useTheme();

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div
      className={`rounded-lg p-6 border transition-colors ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800 hover:border-cyan-400/50'
          : 'bg-white border-gray-200 hover:border-cyan-400/50 shadow-sm'
      }`}
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <h3
            className={`text-md font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {interview.title}
          </h3>
          <p
            className={`text-sm mb-3 line-clamp-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {interview.description}
          </p>
        </div>
        <Badge
          variant={interview.type === 'technical' ? 'default' : 'secondary'}
          className={
            interview.type === 'technical'
              ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30'
              : 'bg-purple-400/20 text-purple-400 border-purple-400/30'
          }
        >
          {interview.type}
        </Badge>
      </div>

      <div className='flex items-center justify-between mb-4'>
        <div
          className={`flex items-center space-x-4 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          <div className='flex items-center space-x-1'>
            <Clock className='w-4 h-4' />
            <span className='text-xs'>
              {formatDuration(interview.duration)}
            </span>
          </div>
        </div>
        {interview.score && (
          <div className='text-xs'>
            <span
              className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
            >
              Score:{' '}
            </span>
            <span className='text-cyan-400 font-semibold'>
              {interview.score}%
            </span>
          </div>
        )}
      </div>

      <div className='flex space-x-3'>
        <Button
          variant='outline'
          size='sm'
          className={`flex-1 hover:border-cyan-400 hover:bg-cyan-400/10 bg-transparent ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}
          onClick={() => onRetake(interview.id)}
        >
          <RotateCcw className='w-4 h-4 mr-2' />
          Retake
        </Button>
        <Button
          variant='outline'
          size='sm'
          className={`flex-1 hover:border-cyan-400 hover:bg-cyan-400/10 bg-transparent ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}
          onClick={() => onViewFeedback(interview.id)}
        >
          <Eye className='w-4 h-4 mr-2' />
          View Feedback
        </Button>
      </div>
    </div>
  );
}
