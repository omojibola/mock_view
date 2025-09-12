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
import { useTheme } from '@/lib/contexts/theme-context';
import {
  createInterviewSchema,
  type CreateInterviewFormData,
} from '@/lib/utils/validation';
import { toastService } from '@/lib/services/toast.service';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type {
  GeneratedInterview,
  InterviewType,
} from '@/lib/types/interview.types';
import { Textarea } from '@/components/ui/textarea';
import { InterviewSuccessCard } from '@/components/interviews/interview-success-card';
import { JOB_ROLES } from '@/constants/job-roles';
import { Typeahead } from '@/components/ui/typeahead';

const interviewTypes: { value: InterviewType; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'problem-solving', label: 'Problem Solving' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'situational', label: 'Situational' },
  { value: 'mixed', label: 'Mixed' },
];

const experienceLevelOptions = [
  { value: 'entry-level', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid-level', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

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
      interviewType: '',
      experienceLevel: '',
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
      if (!response.ok || !result.success) {
        toastService.error(
          result.error?.message || 'Failed to generate interview'
        );
      } else {
        setGeneratedInterview(result.data);
        toastService.success('Interview generated successfully!');
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
              Generate AI-powered interview questions tailored to your job
              requirements
            </p>
          </div>

          <Card
            className={`${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className='p-4'>
              <form
                onSubmit={form.handleSubmit(handleGenerateInterview)}
                className='space-y-4'
              >
                <div className='space-y-1'>
                  <Label
                    htmlFor='jobTitle'
                    className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Job Position
                  </Label>
                  <Typeahead
                    value={form.watch('jobTitle')}
                    onChange={(val) => form.setValue('jobTitle', val)}
                    options={JOB_ROLES}
                    theme={theme}
                    placeholder='e.g. Senior Frontend Developer'
                  />
                  {form.formState.errors.jobTitle && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.jobTitle.message}
                    </p>
                  )}
                </div>

                <div className='space-y-1'>
                  <Label
                    htmlFor='jobDescription'
                    className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Job Description
                  </Label>
                  <Textarea
                    id='jobDescription'
                    placeholder='Enter detailed job description...'
                    {...form.register('jobDescription')}
                    rows={3}
                    className={`w-full p-2 text-sm rounded-md border resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className='space-y-1'>
                  <Label
                    className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Experience Level
                  </Label>
                  <Select
                    value={form.watch('experienceLevel').toString()}
                    onValueChange={(value) =>
                      form.setValue('experienceLevel', value)
                    }
                  >
                    <SelectTrigger
                      className={`w-full h-10 text-xs ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white '
                          : 'bg-white border-gray-300 '
                      }`}
                    >
                      <SelectValue placeholder='Select experience level' />
                    </SelectTrigger>
                    <SelectContent
                      className={
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                      }
                    >
                      {experienceLevelOptions.map((level) => (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                          className={`text-xs ${
                            theme === 'dark'
                              ? 'text-white hover:bg-gray-600'
                              : 'text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1'>
                  <Label
                    className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Interview Type
                  </Label>
                  <Select
                    value={form.watch('interviewType')}
                    onValueChange={(value) =>
                      form.setValue('interviewType', value as InterviewType)
                    }
                  >
                    <SelectTrigger
                      className={`w-full h-10 text-xs ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white '
                          : 'bg-white border-gray-300  '
                      }`}
                    >
                      <SelectValue placeholder='Select interview type' />
                    </SelectTrigger>
                    <SelectContent
                      className={
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                      }
                    >
                      {interviewTypes.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className={`text-xs ${
                            theme === 'dark'
                              ? 'text-white hover:bg-gray-600'
                              : 'text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type='submit'
                  disabled={isGenerating}
                  className={`w-full h-10 text-xs font-medium ${
                    theme === 'dark'
                      ? 'bg-white hover:bg-gray-100 text-black'
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  {isGenerating ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1' />
                      Generating Interview...
                    </div>
                  ) : (
                    <div className='flex items-center'>
                      <Sparkles className='w-3 h-3 mr-1' />
                      Generate Interview
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
