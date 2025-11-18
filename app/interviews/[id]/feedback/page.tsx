'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/lib/contexts/theme-context';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Star,
  Lightbulb,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import { QuestionFeedback } from '@/lib/types/interviewer.types';

interface FeedbackData {
  interviewId: string;
  userId: string;
  totalScore: number;
  question_analysis: QuestionFeedback[];
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  // useEffect(() => {
  //   const fetchFeedback = async () => {
  //     try {
  //       setIsLoading(true);
  //       await new Promise((resolve) => setTimeout(resolve, 1000));

  //       const mockFeedback: FeedbackData = {
  //         interviewId: interviewId,
  //         userId: 'user123',
  //         totalScore: 82,
  //         questionFeedbacks: [
  //           {
  //             question:
  //               "Can you explain the difference between React's useEffect and useLayoutEffect hooks?",
  //             userResponse:
  //               'useEffect runs after the browser paints, while useLayoutEffect runs before. useLayoutEffect is useful when you need to make DOM measurements or mutations before the browser paints.',
  //             aiScore: 9,
  //             aiFeedback:
  //               'Excellent answer! You correctly identified the key timing difference and provided a practical use case. Your understanding of the execution order is spot-on.',
  //             suggestedResponse:
  //               "useEffect runs asynchronously after the browser has painted the screen, making it suitable for most side effects like data fetching or subscriptions. useLayoutEffect, however, runs synchronously before the browser paints, which is crucial when you need to read layout from the DOM and synchronously re-render. For example, if you're measuring an element's dimensions or animating based on DOM measurements, useLayoutEffect prevents visual flicker by ensuring changes happen before the paint. However, use it sparingly as it can block visual updates.",
  //           },
  //           {
  //             question:
  //               'How would you optimize the performance of a React application with a large list of items?',
  //             userResponse:
  //               'I would use virtualization with libraries like react-window to only render visible items. Also implement proper memoization with useMemo and React.memo.',
  //             aiScore: 7,
  //             aiFeedback:
  //               'Good answer covering two important optimization techniques. However, you could have mentioned additional strategies like pagination, debouncing search inputs, or code splitting.',
  //             suggestedResponse:
  //               "For optimizing large lists in React, I'd implement several strategies: 1) Virtualization using react-window or react-virtualized to render only visible items, reducing DOM nodes significantly. 2) Memoization with React.memo for list items and useMemo for expensive computations. 3) Pagination or infinite scroll to limit initial data load. 4) Debouncing search/filter inputs to reduce re-renders. 5) Key prop optimization to help React's reconciliation. 6) Consider moving list state to a state management library like Redux or Zustand for better performance. 7) Code splitting to lazy load the list component if it's not immediately needed.",
  //           },
  //           {
  //             question:
  //               'Describe your experience with TypeScript and how it improves code quality.',
  //             userResponse:
  //               'TypeScript adds type safety which catches errors during development. It makes code more maintainable and easier to refactor.',
  //             aiScore: 6,
  //             aiFeedback:
  //               'Your answer touches on important benefits but lacks depth and specific examples. Consider mentioning IDE support, documentation value, and real-world scenarios where TypeScript prevented bugs.',
  //             suggestedResponse:
  //               'TypeScript significantly improves code quality through several mechanisms: 1) Type safety catches errors at compile-time rather than runtime, preventing common bugs like undefined property access or incorrect function arguments. 2) Enhanced IDE support with intelligent autocomplete and refactoring tools increases developer productivity. 3) Self-documenting code through type definitions reduces the need for separate documentation. 4) Better refactoring confidence - when changing interfaces, TypeScript immediately shows all affected code. 5) Improved team collaboration as type definitions serve as a contract between different parts of the codebase. In my experience, TypeScript has prevented numerous production bugs, especially in large codebases where understanding all data flows is challenging.',
  //           },
  //         ],
  //         overallStrengths: [
  //           'Strong technical knowledge of React fundamentals',
  //           'Good understanding of performance optimization concepts',
  //           'Clear and concise communication style',
  //         ],
  //         overallImprovements: [
  //           'Provide more specific examples from personal experience',
  //           'Elaborate on answers with additional context and edge cases',
  //           'Demonstrate deeper understanding of advanced concepts',
  //         ],
  //         finalAssessment:
  //           'Overall solid performance demonstrating good foundational knowledge of React and TypeScript. The candidate shows promise with room for growth in providing more comprehensive and detailed responses. With more real-world experience and deeper exploration of advanced topics, this candidate would be well-suited for mid to senior-level positions.',
  //         createdAt: new Date().toISOString(),
  //         interviewTitle: 'Senior Frontend Developer Interview',
  //         duration: 45,
  //         type: 'technical',
  //       };

  //       setFeedback(mockFeedback);
  //       setTimeout(() => {
  //         setShowFeedbackModal(true);
  //       }, 7000);
  //       setShowFloatingWidget(true);
  //     } catch (error) {
  //       setError('Failed to load feedback data');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchFeedback();
  // }, [interviewId]);

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
        console.log(feedbackData);
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

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
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

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-500';
    if (score >= 7) return 'text-cyan-400';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='flex items-center justify-center min-h-96'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4'></div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
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
              className={`text-md font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Failed to Load Feedback
            </h3>
            <p
              className={`text-sm mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {error || 'Feedback data not found'}
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              variant='outline'
              className='text-sm'
            >
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
        <div className='max-w-5xl mx-auto space-y-6 pb-20'>
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
                className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Interview Feedback Report
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
          </div>

          <Card
            className={`${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className='p-5'>
              <div className='text-center'>
                <div
                  className={`text-3xl font-bold mb-2 ${getScoreColor(
                    feedback.totalScore
                  )}`}
                >
                  {feedback.totalScore}%
                </div>
                <p
                  className={`text-md font-medium mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Overall Performance
                </p>
                <div className='flex items-center justify-center space-x-2 mb-3'>
                  <Badge
                    className={`text-xs ${
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
                  <Badge variant='outline' className='text-xs'>
                    {feedback.type
                      ? feedback.type.charAt(0).toUpperCase() +
                        feedback.type.slice(1)
                      : 'Unknown'}{' '}
                    Interview
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='space-y-4'>
            <h2
              className={`text-md font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Question-by-Question Analysis
            </h2>

            {feedback.question_analysis.map((qf, index) => {
              const isExpanded = expandedQuestions.has(index);
              return (
                <Card
                  key={index}
                  className={`${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  } transition-all`}
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className='w-full text-left p-5 flex items-center justify-between hover:opacity-80 transition-opacity'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span
                          className={`text-xs font-semibold ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Question {index + 1}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {qf.question}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      } transition-transform flex-shrink-0 ml-4 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <CardContent className='px-5 pb-5 pt-0 space-y-4'>
                      <div
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                        } border ${
                          theme === 'dark'
                            ? 'border-gray-600'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className='flex items-center gap-2 mb-2'>
                          <MessageCircle
                            className={`w-3 h-3 ${
                              theme === 'dark'
                                ? 'text-cyan-400'
                                : 'text-cyan-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              theme === 'dark'
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            }`}
                          >
                            Your Response
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {qf.userResponse}
                        </p>
                      </div>

                      <div
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                        } border ${
                          theme === 'dark'
                            ? 'border-blue-800'
                            : 'border-blue-200'
                        }`}
                      >
                        <div className='flex items-center gap-2 mb-2'>
                          <CheckCircle
                            className={`w-3 h-3 ${
                              theme === 'dark'
                                ? 'text-blue-400'
                                : 'text-blue-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              theme === 'dark'
                                ? 'text-blue-300'
                                : 'text-blue-700'
                            }`}
                          >
                            AI Feedback
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-blue-200' : 'text-blue-900'
                          }`}
                        >
                          {qf.feedback}
                        </p>
                      </div>

                      <div
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                        } border ${
                          theme === 'dark'
                            ? 'border-green-800'
                            : 'border-green-200'
                        }`}
                      >
                        <div className='flex items-center gap-2 mb-2'>
                          <Lightbulb
                            className={`w-3 h-3 ${
                              theme === 'dark'
                                ? 'text-green-400'
                                : 'text-green-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              theme === 'dark'
                                ? 'text-green-300'
                                : 'text-green-700'
                            }`}
                          >
                            Suggested Response
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'text-green-200'
                              : 'text-green-900'
                          }`}
                        >
                          {qf.suggestedImprovement}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className='p-5'>
                <h3
                  className={`text-md font-semibold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Overall Strengths
                </h3>
                <div className='space-y-2'>
                  {feedback.strengths.map((strength, index) => (
                    <div key={index} className='flex items-start space-x-2'>
                      <CheckCircle className='w-3 h-3 text-green-500 mt-0.5 flex-shrink-0' />
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

            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className='p-5'>
                <h3
                  className={`text-md font-semibold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Areas for Improvement
                </h3>
                <div className='space-y-2'>
                  {feedback.areasForImprovement.map((area, index) => (
                    <div key={index} className='flex items-start space-x-2'>
                      <AlertCircle className='w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0' />
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

          <Card
            className={`${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className='p-5'>
              <h3
                className={`text-md font-semibold mb-3 ${
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

          <div className='flex flex-col sm:flex-row gap-4 pt-4'>
            <Button
              onClick={handleRetakeInterview}
              className={`flex-1 h-10 text-sm font-medium ${
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
              className='flex-1 h-10 text-sm border-cyan-400 text-cyan-400 hover:bg-cyan-400/10'
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
