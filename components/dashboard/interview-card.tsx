'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className='bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-cyan-400/50 transition-colors'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-white mb-2'>
            {interview.title}
          </h3>
          <p className='text-gray-400 text-sm mb-3 line-clamp-2'>
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
        <div className='flex items-center space-x-4 text-sm text-gray-400'>
          <div className='flex items-center space-x-1'>
            <Clock className='w-4 h-4' />
            <span>{formatDuration(interview.duration)}</span>
          </div>
        </div>
        {interview.score && (
          <div className='text-sm'>
            <span className='text-gray-400'>Score: </span>
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
          className='flex-1 border-gray-700 hover:border-cyan-400 hover:bg-cyan-400/10 bg-transparent'
          onClick={() => onRetake(interview.id)}
        >
          <RotateCcw className='w-4 h-4 mr-2' />
          Retake
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='flex-1 border-gray-700 hover:border-cyan-400 hover:bg-cyan-400/10 bg-transparent'
          onClick={() => onViewFeedback(interview.id)}
        >
          <Eye className='w-4 h-4 mr-2' />
          View Feedback
        </Button>
      </div>
    </div>
  );
}
