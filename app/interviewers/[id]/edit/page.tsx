'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import { toastService } from '@/lib/services/toast.service';
import {
  updateCustomInterviewerSchema,
  type UpdateCustomInterviewerFormData,
} from '@/lib/utils/validation';
import { ArrowLeft, Save, User } from 'lucide-react';
import type { CustomInterviewer } from '@/lib/types/interviewer.types';

const experienceLevels = [
  '3-5 years',
  '5-7 years',
  '7-10 years',
  '10+ years',
  '15+ years',
];

const commonSpecialties = [
  'React',
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'Node.js',
  'System Design',
  'Algorithms',
  'Data Structures',
  'Frontend',
  'Backend',
  'Full Stack',
  'DevOps',
  'Machine Learning',
  'Mobile Development',
  'Leadership',
  'Team Management',
  'Behavioral',
  'Problem Solving',
];

export default function EditInterviewerPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const interviewerId = params.id as string;

  const [interviewer, setInterviewer] = useState<CustomInterviewer | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState('');

  const form = useForm<UpdateCustomInterviewerFormData>({
    resolver: zodResolver(updateCustomInterviewerSchema),
  });

  useEffect(() => {
    fetchInterviewer();
  }, [interviewerId]);

  const fetchInterviewer = async () => {
    try {
      const response = await fetch(`/api/interviewers/${interviewerId}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setInterviewer(data);
        setSelectedSpecialties(data.specialties || []);

        // Set form values
        form.setValue('name', data.name);
        form.setValue('title', data.title);
        form.setValue('description', data.description || '');
        form.setValue('experience', data.experience);
        form.setValue('specialties', data.specialties || []);
      } else {
        toastService.error('Failed to fetch interviewer');
        router.push('/interviewers');
      }
    } catch (error) {
      console.error('Fetch interviewer error:', error);
      toastService.error('Failed to fetch interviewer');
      router.push('/interviewers');
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecialty = (specialty: string) => {
    if (selectedSpecialties.length >= 5) {
      toastService.error('Maximum 5 specialties allowed');
      return;
    }
    if (!selectedSpecialties.includes(specialty)) {
      const newSpecialties = [...selectedSpecialties, specialty];
      setSelectedSpecialties(newSpecialties);
      form.setValue('specialties', newSpecialties);
    }
  };

  const removeSpecialty = (specialty: string) => {
    const newSpecialties = selectedSpecialties.filter((s) => s !== specialty);
    setSelectedSpecialties(newSpecialties);
    form.setValue('specialties', newSpecialties);
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim()) {
      addSpecialty(customSpecialty.trim());
      setCustomSpecialty('');
    }
  };

  const handleUpdateInterviewer = async (
    data: UpdateCustomInterviewerFormData
  ) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/interviewers/${interviewerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          specialties: JSON.stringify(data.specialties),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toastService.success('Interviewer updated successfully!');
        router.push('/interviewers');
      } else {
        toastService.error(result.error || 'Failed to update interviewer');
      }
    } catch (error) {
      console.error('Update interviewer error:', error);
      toastService.error('Failed to update interviewer');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400' />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!interviewer) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='text-center py-12'>
            <p
              className={`text-lg ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Interviewer not found
            </p>
          </div>
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
              onClick={() => router.push('/interviewers')}
              className={`mb-4 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Interviewers
            </Button>
            <h1
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Edit {interviewer.name}
            </h1>
            <p
              className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Update your custom interviewer's information and expertise
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Basic Information */}
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='name'
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Interviewer Name *
                  </Label>
                  <Input
                    id='name'
                    {...form.register('name')}
                    className={`${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  {form.formState.errors.name && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='title'
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Professional Title *
                  </Label>
                  <Input
                    id='title'
                    {...form.register('title')}
                    className={`${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  {form.formState.errors.title && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='description'
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Description (Optional)
                  </Label>
                  <textarea
                    id='description'
                    {...form.register('description')}
                    rows={3}
                    className={`w-full p-3 text-sm rounded-md border resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                  />
                  {form.formState.errors.description && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Experience Level *
                  </Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {experienceLevels.map((level) => (
                      <Button
                        key={level}
                        type='button'
                        variant={
                          form.watch('experience') === level
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() => form.setValue('experience', level)}
                        className='text-xs'
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  {form.formState.errors.experience && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.experience.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Specialties & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Selected Specialties ({selectedSpecialties.length}/5)
                  </Label>
                  <div className='flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md'>
                    {selectedSpecialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant='secondary'
                        className='cursor-pointer hover:bg-red-100 hover:text-red-800'
                        onClick={() => removeSpecialty(specialty)}
                      >
                        {specialty} ×
                      </Badge>
                    ))}
                    {selectedSpecialties.length === 0 && (
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        No specialties selected
                      </span>
                    )}
                  </div>
                  {form.formState.errors.specialties && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.specialties.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Common Specialties
                  </Label>
                  <div className='flex flex-wrap gap-2 max-h-32 overflow-y-auto'>
                    {commonSpecialties.map((specialty) => (
                      <Button
                        key={specialty}
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => addSpecialty(specialty)}
                        disabled={
                          selectedSpecialties.includes(specialty) ||
                          selectedSpecialties.length >= 5
                        }
                        className='text-xs'
                      >
                        {specialty}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Add Custom Specialty
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      placeholder='Enter custom specialty'
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      className={`flex-1 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300'
                      }`}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && addCustomSpecialty()
                      }
                    />
                    <Button
                      type='button'
                      onClick={addCustomSpecialty}
                      disabled={
                        !customSpecialty.trim() ||
                        selectedSpecialties.length >= 5
                      }
                      size='sm'
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voice Info Card */}
          <Card
            className={`mt-6 ${
              theme === 'dark'
                ? 'bg-blue-900/20 border-blue-800'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <User
                  className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />
                <div>
                  <h4
                    className={`font-medium ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-800'
                    }`}
                  >
                    Voice Settings
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}
                  >
                    Voice settings cannot be edited after creation. To change
                    the voice, you'll need to create a new interviewer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Button */}
          <div className='mt-8 text-center'>
            <Button
              onClick={form.handleSubmit(handleUpdateInterviewer)}
              disabled={isUpdating || !form.formState.isValid}
              className={`px-8 py-3 text-lg font-medium ${
                theme === 'dark'
                  ? 'bg-white hover:bg-gray-100 text-black'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              {isUpdating ? (
                <div className='flex items-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2' />
                  Updating Interviewer...
                </div>
              ) : (
                <div className='flex items-center'>
                  <Save className='w-4 h-4 mr-2' />
                  Update Interviewer
                </div>
              )}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
