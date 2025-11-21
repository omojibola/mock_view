'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InterviewSuccessCard } from '@/components/interviews/interview-success-card';
import { useTheme } from '@/lib/contexts/theme-context';
import { toastService } from '@/lib/services/toast.service';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { GeneratedInterview } from '@/lib/types/interview.types';

const MAX_WORDS = 50;

export default function QuickCreateInterviewPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInterview, setGeneratedInterview] =
    useState<GeneratedInterview | null>(null);

  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
  const isOverLimit = wordCount > MAX_WORDS;

  const handleGenerateInterview = async () => {
    if (!description.trim()) {
      toastService.error('Please describe your interview');
      return;
    }

    if (isOverLimit) {
      toastService.error(
        `Please keep your description under ${MAX_WORDS} words`
      );
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/interviews/generate-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedInterview(result.data);
        toastService.success('Interview generated successfully!');
      } else {
        toastService.error(result.error || 'Failed to generate interview');
      }
    } catch (error) {
      console.error('Generate interview error:', error);
      toastService.error('Failed to generate interview');
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedInterview) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <InterviewSuccessCard interview={generatedInterview} />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-2xl mx-auto'>
          <div className='mb-4'>
            <Button
              variant='ghost'
              onClick={() => router.push('/interviews/create')}
              className='mb-3 text-cyan-400 hover:text-cyan-300 h-8 text-xs'
            >
              <ArrowLeft className='w-3 h-3 mr-1' />
              Back
            </Button>
            <h1
              className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Quick Create Interview
            </h1>
            <p
              className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Describe your interview in your own words and let our system do
              the rest
            </p>
          </div>

          <Card
            className={`${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='description'
                    className={`text-sm font-medium block mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Describe Your Interview
                  </label>
                  <textarea
                    id='description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='Example: I need a technical interview for a Senior React Developer position at TechCorp. Focus on hooks, state management, and performance optimization.'
                    rows={6}
                    className={`w-full p-3 text-sm rounded-md border resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 placeholder-gray-400'
                    } ${isOverLimit ? 'border-red-500' : ''}`}
                  />
                  <div className='flex justify-between items-center mt-2'>
                    <p
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      Include: job title, company name, key skills, or any
                      specific requirements
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        isOverLimit
                          ? 'text-red-500'
                          : wordCount > MAX_WORDS * 0.8
                          ? 'text-yellow-500'
                          : theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {wordCount}/{MAX_WORDS} words
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-cyan-900/20 border-cyan-700/30'
                      : 'bg-cyan-50 border-cyan-200'
                  }`}
                >
                  <div className='flex items-start space-x-3'>
                    <Sparkles
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                      }`}
                    />
                    <div>
                      <h3
                        className={`text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        How It Works
                      </h3>
                      <p
                        className={`text-xs leading-loose ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Our system will analyze your description and
                        automatically create a customized interview with
                        relevant questions, appropriate difficulty level, and
                        optimal duration. Just write naturally!
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateInterview}
                  disabled={isGenerating || !description.trim() || isOverLimit}
                  className={`w-full h-9 text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-white hover:bg-gray-100 text-black'
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  {isGenerating ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2' />
                      Creating Your Interview...
                    </div>
                  ) : (
                    <div className='flex items-center'>
                      <Sparkles className='w-4 h-4 mr-2' />
                      Create Interview
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
