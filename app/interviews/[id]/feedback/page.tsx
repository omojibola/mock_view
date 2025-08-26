'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import {
  ArrowLeft,
  RotateCcw,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
}

interface FeedbackData {
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
  interviewTitle?: string;
  duration?: number;
  type?: string;
}

export default function FeedbackPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/interviews/${interviewId}/feedback`);
        if (!response.ok) {
          toast.error('Failed to fetch feedback');
        }
        const feedbackData: { success: boolean; data: FeedbackData } =
          await response.json();
        setFeedback(feedbackData?.data);
      } catch (error) {
        setError('Failed to load feedback data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [interviewId]);

  const handleRetakeInterview = () => {
    router.push(`/interviews/${interviewId}/start`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-cyan-400';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-cyan-400';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='flex items-center justify-center min-h-96'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4'></div>
              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Loading feedback...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !feedback) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='text-center py-12'>
            <AlertCircle
              className={`w-16 h-16 mx-auto mb-4 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-500'
              }`}
            />
            <h3
              className={`text-lg font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {error || 'Feedback not found'}
            </h3>

            <Button onClick={() => router.push('/dashboard')} variant='outline'>
              Back to Dashboard
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <Button
                variant='ghost'
                onClick={() => router.back()}
                className='mb-3 text-cyan-400 hover:text-cyan-300 h-8 text-sm'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>
              <h1
                className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Interview Feedback
              </h1>
              <p
                className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {feedback.interviewTitle} •{' '}
                {new Date(feedback.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className='flex space-x-3'>
              <Button
                variant='outline'
                size='sm'
                className='text-sm bg-transparent'
              >
                <Share2 className='w-4 h-4 mr-2' />
                Share
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='text-sm bg-transparent'
              >
                <Download className='w-4 h-4 mr-2' />
                Export
              </Button>
            </div>
          </div>

          {/* Overall Score */}
          <Card
            className={`${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className='p-6'>
              <div className='text-center'>
                <div
                  className={`text-4xl font-bold mb-2 ${getScoreColor(
                    feedback.totalScore
                  )}`}
                >
                  {feedback.totalScore}%
                </div>
                <p
                  className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Overall Performance
                </p>
                <div className='flex items-center justify-center space-x-2 mb-4'>
                  <Badge
                    className={`${
                      feedback.totalScore >= 80
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}
                  >
                    {feedback.totalScore >= 90
                      ? 'Excellent'
                      : feedback.totalScore >= 80
                      ? 'Good'
                      : feedback.totalScore >= 70
                      ? 'Average'
                      : 'Needs Improvement'}
                  </Badge>
                  {feedback.type && (
                    <Badge variant='outline' className='text-xs'>
                      {feedback.type.charAt(0).toUpperCase() +
                        feedback?.type?.slice(1)}{' '}
                      Interview
                    </Badge>
                  )}
                </div>
                <div
                  className={`w-full bg-gray-200 rounded-full h-3 ${
                    theme === 'dark' ? 'bg-gray-700' : ''
                  }`}
                >
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getScoreBgColor(
                      feedback.totalScore
                    )}`}
                    style={{ width: `${feedback.totalScore}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card
            className={`${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className='p-6'>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Performance Breakdown
              </h3>
              <div className='space-y-4'>
                {feedback.categoryScores?.map((category, index) => (
                  <div key={index} className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span
                        className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {category.category}
                      </span>
                      <span
                        className={`text-sm font-semibold ${getScoreColor(
                          category.score
                        )}`}
                      >
                        {category.score}%
                      </span>
                    </div>
                    <div
                      className={`w-full bg-gray-200 rounded-full h-2 ${
                        theme === 'dark' ? 'bg-gray-700' : ''
                      }`}
                    >
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(
                          category.score
                        )}`}
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Areas for Improvement */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Strengths */}
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className='p-6'>
                <div className='flex items-center space-x-2 mb-4'>
                  <TrendingUp className='w-5 h-5 text-green-500' />
                  <h3
                    className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Strengths
                  </h3>
                </div>
                <div className='space-y-3'>
                  {feedback.strengths?.map((strength, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                      <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {strength}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className='p-6'>
                <div className='flex items-center space-x-2 mb-4'>
                  <TrendingDown className='w-5 h-5 text-yellow-500' />
                  <h3
                    className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Areas for Improvement
                  </h3>
                </div>
                <div className='space-y-3'>
                  {feedback.areasForImprovement?.map((area, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                      <AlertCircle className='w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0' />
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {area}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Assessment */}
          <Card
            className={`${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className='p-6'>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Final Assessment
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {feedback.finalAssessment}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 pt-6'>
            <Button
              onClick={handleRetakeInterview}
              className={`flex-1 h-12 text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-white hover:bg-gray-100 text-black'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              <RotateCcw className='w-4 h-4 mr-2' />
              Retake Interview
            </Button>
            <Button
              variant='outline'
              onClick={() => router.push('/dashboard')}
              className='flex-1 h-12 text-sm border-cyan-400 text-cyan-400 hover:bg-cyan-400/10'
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
