'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import { toastService } from '@/lib/services/toast.service';
import { Plus, Edit, Trash2, User, Mic, AlertCircle } from 'lucide-react';
import type { CustomInterviewer } from '@/lib/types/interviewer.types';

export default function InterviewersPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [interviewers, setInterviewers] = useState<CustomInterviewer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      const response = await fetch('/api/interviewers');
      const result = await response.json();

      if (result.success) {
        setInterviewers(result.data);
      } else {
        toastService.error('Failed to fetch interviewers');
      }
    } catch (error) {
      console.error('Fetch interviewers error:', error);
      toastService.error('Failed to fetch interviewers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/interviewers/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setInterviewers((prev) =>
          prev.filter((interviewer) => interviewer.id !== id)
        );
        toastService.success('Interviewer deleted successfully!');
      } else {
        toastService.error(result.error || 'Failed to delete interviewer');
      }
    } catch (error) {
      console.error('Delete interviewer error:', error);
      toastService.error('Failed to delete interviewer');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/interviewers/${id}/edit`);
  };

  const handleCreateNew = () => {
    if (interviewers.length >= 2) {
      toastService.error(
        'You can only create a maximum of 2 custom interviewers'
      );
      return;
    }
    router.push('/interviewers/create');
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                My Custom Interviewers
              </h1>
              <p
                className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Manage your personalized AI interviewers with custom voices and
                expertise
              </p>
            </div>
            <Button
              onClick={handleCreateNew}
              disabled={interviewers.length >= 2}
              className={`flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-white hover:bg-gray-100 text-black'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              <Plus className='w-4 h-4' />
              Create New Interviewer
            </Button>
          </div>

          {/* Stats Card */}
          <Card
            className={`mb-6 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <User
                      className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Custom Interviewers
                    </p>
                    <p
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {interviewers.length} of 2 created
                    </p>
                  </div>
                </div>
                <Badge
                  variant={interviewers.length >= 2 ? 'destructive' : 'default'}
                >
                  {interviewers.length >= 2
                    ? 'Limit Reached'
                    : `${2 - interviewers.length} Remaining`}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Interviewers Grid */}
          {interviewers.length === 0 ? (
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className='p-12 text-center'>
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <User
                    className={`w-8 h-8 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  No Custom Interviewers Yet
                </h3>
                <p
                  className={`text-sm mb-6 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Create your first personalized AI interviewer with custom
                  voice and expertise
                </p>
                <Button
                  onClick={handleCreateNew}
                  className={`${
                    theme === 'dark'
                      ? 'bg-white hover:bg-gray-100 text-black'
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Create Your First Interviewer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {interviewers.map((interviewer) => (
                <Card
                  key={interviewer.id}
                  className={`${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  } hover:shadow-lg transition-shadow`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          {interviewer.avatar_url ? (
                            <img
                              src={interviewer.avatar_url || '/placeholder.svg'}
                              alt={interviewer.name}
                              className='w-12 h-12 rounded-full object-cover'
                            />
                          ) : (
                            <User
                              className={`w-6 h-6 ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            />
                          )}
                        </div>
                        <div>
                          <CardTitle
                            className={`text-lg ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {interviewer.name}
                          </CardTitle>
                          <p
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-cyan-400'
                                : 'text-cyan-600'
                            }`}
                          >
                            {interviewer.title}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {interviewer.experience}
                        </Badge>
                        <div
                          className={`p-1 rounded ${
                            theme === 'dark'
                              ? 'bg-green-900 text-green-400'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          <Mic className='w-3 h-3' />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='pt-0'>
                    {interviewer.description && (
                      <p
                        className={`text-sm mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {interviewer.description}
                      </p>
                    )}

                    {/* Specialties */}
                    <div className='mb-4'>
                      <p
                        className={`text-xs font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Specialties
                      </p>
                      <div className='flex flex-wrap gap-1'>
                        {interviewer.specialties.map((specialty) => (
                          <Badge
                            key={specialty}
                            variant='secondary'
                            className={`text-xs ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Created Date */}
                    <p
                      className={`text-xs mb-4 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      Created{' '}
                      {new Date(interviewer.created_at).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className='flex gap-2'>
                      <Button
                        onClick={() => handleEdit(interviewer.id)}
                        variant='outline'
                        size='sm'
                        className='flex-1'
                      >
                        <Edit className='w-4 h-4 mr-2' />
                        Edit
                      </Button>
                      <Button
                        onClick={() =>
                          handleDelete(interviewer.id, interviewer.name)
                        }
                        variant='outline'
                        size='sm'
                        disabled={deletingId === interviewer.id}
                        className={`flex-1 ${
                          theme === 'dark'
                            ? 'hover:bg-red-900 hover:text-red-400 hover:border-red-700'
                            : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                        }`}
                      >
                        {deletingId === interviewer.id ? (
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current' />
                        ) : (
                          <>
                            <Trash2 className='w-4 h-4 mr-2' />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card
            className={`mt-8 ${
              theme === 'dark'
                ? 'bg-blue-900/20 border-blue-800'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <CardContent className='p-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />
                <div>
                  <h4
                    className={`font-medium mb-1 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-800'
                    }`}
                  >
                    Custom Interviewer Limits
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}
                  >
                    You can create up to 2 custom interviewers with personalized
                    voices using ElevenLabs technology. Each interviewer
                    requires voice samples and will be available for all your
                    future interviews.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
