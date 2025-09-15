'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import {
  ArrowLeft,
  RotateCcw,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Star,
  X,
  MessageSquare,
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
  callId?: string | null;
}

export default function FeedbackPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);

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
        setTimeout(() => {
          setShowFeedbackModal(true);
        }, 7000);
        setShowFloatingWidget(true);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setError('Failed to load feedback data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [interviewId]);

  const handleSubmitFeedback = async () => {
    setIsSubmittingFeedback(true);
    try {
      const response = await fetch(`/api/user_feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId,
          rating: feedbackRating,
          feedback: feedbackText,
        }),
      });
      if (!response.ok) {
        toast.error('Failed to submit feedback');
        return;
      }
      setFeedbackRating(0);
      setFeedbackText('');
      setShowFeedbackModal(false);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDownloadTranscript = () => {
    window.open(`/api/transcript/${feedback?.callId}`, '_blank');
  };

  const StarRating = ({
    rating,
    onRatingChange,
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
  }) => {
    return (
      <div className='flex space-x-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => onRatingChange(star)}
            className={`w-8 h-8 transition-colors ${
              star <= rating
                ? 'text-yellow-400'
                : theme === 'dark'
                ? 'text-gray-600'
                : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className='w-full h-full fill-current' />
          </button>
        ))}
      </div>
    );
  };

  const handleRetakeInterview = () => {
    router.push(`/interviews/${interviewId}/start`);
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const scorePercentage = getScorePercentage(score, maxScore);
    if (scorePercentage >= 80) return 'text-green-500';
    if (scorePercentage >= 60) return 'text-cyan-400';
    if (scorePercentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number, maxScore: number) => {
    const scorePercentage = getScorePercentage(score, maxScore);
    if (scorePercentage >= 90) return 'bg-green-500';
    if (scorePercentage >= 70) return 'bg-cyan-400';
    if (scorePercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScorePercentage = (score: number, maxScore: number) => {
    return (score / maxScore) * 100;
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
                onClick={handleDownloadTranscript}
              >
                <Download className='w-4 h-4 mr-2' />
                Download Transcript
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
                    feedback.totalScore,
                    100
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
                      feedback.totalScore,
                      100
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
                          category.score,
                          category.maxScore
                        )}`}
                      >
                        {category.score}/{category.maxScore}
                      </span>
                    </div>
                    <div
                      className={`w-full bg-gray-200 rounded-full h-2 ${
                        theme === 'dark' ? 'bg-gray-700' : ''
                      }`}
                    >
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(
                          category.score,
                          category.maxScore
                        )}`}
                        style={{
                          width: `${getScorePercentage(
                            category.score,
                            category.maxScore
                          )}%`,
                        }}
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

        {showFloatingWidget && !showFeedbackModal && (
          <div className='fixed bottom-6 right-6 z-50'>
            <Button
              onClick={() => setShowFeedbackModal(true)}
              className={`rounded-full shadow-lg px-4 py-3 text-sm font-medium transition-all hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}
            >
              <MessageSquare className='w-4 h-4 mr-2' />
              Give us a rating
            </Button>
          </div>
        )}

        <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
          <DialogContent
            className={`sm:max-w-md ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <DialogHeader>
              <div className='flex items-center justify-between'>
                <DialogTitle
                  className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  How was your experience?
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className='space-y-6 pt-4'>
              <div className='space-y-3'>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Please rate your overall experience
                </p>
                <StarRating
                  rating={feedbackRating}
                  onRatingChange={setFeedbackRating}
                />
              </div>

              <div className='space-y-2'>
                <label
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Additional feedback (optional)
                </label>
                <Textarea
                  placeholder='Tell us more about your experience...'
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className={`min-h-20 text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                  }`}
                />
              </div>

              <div className='flex space-x-3'>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={feedbackRating === 0 || isSubmittingFeedback}
                  className={`flex-1 text-sm ${
                    theme === 'dark'
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  }`}
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
