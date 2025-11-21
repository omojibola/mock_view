'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InterviewSuccessCard } from '@/components/interviews/interview-success-card';
import { useTheme } from '@/lib/contexts/theme-context';
import {
  createInterviewSchema,
  type CreateInterviewFormData,
} from '@/lib/utils/validation';
import { toastService } from '@/lib/services/toast.service';
import { ArrowLeft, Sparkles, FileText } from 'lucide-react';
import type {
  GeneratedInterview,
  InterviewType,
} from '@/lib/types/interview.types';

const interviewTypes: { value: InterviewType; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'problem-solving', label: 'Problem Solving' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'situational', label: 'Situational' },
];

const durationOptions = [15, 30, 45, 60, 90, 120];

export default function CreateInterviewPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInterview, setGeneratedInterview] =
    useState<GeneratedInterview | null>(null);

  const form = useForm<CreateInterviewFormData>({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: {
      jobTitle: '',
      jobDescription: '',
      interviewType: 'technical',
    },
  });

  const handleGenerateInterview = async (data: CreateInterviewFormData) => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/interviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  const handleStartInterview = () => {
    if (generatedInterview) {
      router.push(`/interviews/${generatedInterview.id}/start`);
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
        <div className='max-w-4xl mx-auto'>
          <div className='mb-6'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
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
              Create New Interview
            </h1>
            <p
              className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Choose how you&apos;d like to create your interview
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Quick Create Option */}
            <Card
              className={`cursor-pointer transition-all hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 hover:border-cyan-400'
                  : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 hover:border-cyan-400'
              }`}
              onClick={() => router.push('/interviews/create/quick')}
            >
              <CardContent className='p-6'>
                <div className='flex flex-col items-center text-center space-y-4'>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-100'
                    }`}
                  >
                    <Sparkles
                      className={`w-8 h-8 ${
                        theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-md font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Describe Your Interview
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Describe your interview in plain English, our system will
                      create everything for you.
                    </p>
                  </div>
                  <div
                    className={`w-full p-3 rounded-lg text-xs leading-loose ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 text-gray-300'
                        : 'bg-white/50 text-gray-600'
                    }`}
                  >
                    Perfect when you don’t want to fill forms. Just type what
                    you need, and the system builds the interview automatically.
                  </div>
                  <div className='flex items-center gap-2 text-xs text-cyan-500'>
                    <div className='w-2 h-2 rounded-full bg-cyan-500' />
                    Recommended if you can describe your needs briefly
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Form Option */}
            <Card
              className={`cursor-pointer transition-all hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-500'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => router.push('/interviews/create/form')}
            >
              <CardContent className='p-6'>
                <div className='flex flex-col items-center text-center space-y-4'>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    <FileText
                      className={`w-8 h-8 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-md font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Structured Form
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Fill in specific fields to customise every part of your
                      interview.
                    </p>
                  </div>
                  <div
                    className={`w-full p-3 rounded-lg text-xs leading-loose ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 text-gray-300'
                        : 'bg-white/50 text-gray-600'
                    }`}
                  >
                    Great if you know exactly what job title, description or
                    skills you want.
                  </div>
                  <div className='flex items-center gap-2 text-xs text-gray-500'>
                    <div className='w-2 h-2 rounded-full bg-gray-500' />
                    More control. You choose every detail.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
