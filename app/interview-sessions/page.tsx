'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useTheme } from '@/lib/contexts/theme-context';
import { Clock, Eye, Trash2, History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { InterviewSessionListItem } from '@/lib/types/interview.types';

export default function InterviewSessionsPage() {
  const ITEMS_PER_PAGE = 6;
  const { theme } = useTheme();
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    title: string;
  }>({
    isOpen: false,
    sessionId: '',
    title: '',
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/interview-sessions');
        const data = await response.json();
        setSessions(data?.data || []);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        toast.error('Failed to fetch interview sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const totalPages = Math.max(1, Math.ceil(sessions.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedSessions = useMemo(
    () =>
      sessions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [currentPage, sessions],
  );

  const handleDelete = async (sessionId: string) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/interview-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete session');
        return;
      }

      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      setDeleteModal({
        isOpen: false,
        sessionId: '',
        title: '',
      });
      toast.success('Session deleted');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (sessionId: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      sessionId,
      title,
    });
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModal({
      isOpen: false,
      sessionId: '',
      title: '',
    });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='flex min-h-96 items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400'></div>
              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Loading sessions...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-8'>
            <h1
              className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Interview Sessions
            </h1>
            <p
              className={`text-md ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Review every session you have completed or safely exited.
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className='py-12 text-center'>
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              >
                <History
                  className={`h-8 w-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
              </div>
              <h2
                className={`text-lg font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                No interview sessions yet
              </h2>
            </div>
          ) : (
            <>
              <div className='space-y-4'>
                {paginatedSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`rounded-lg border p-6 ${
                      theme === 'dark'
                        ? 'border-gray-800 bg-gray-900'
                        : 'border-gray-200 bg-white shadow-sm'
                    }`}
                  >
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                      <div className='min-w-0'>
                        <div className='mb-2 flex flex-wrap items-center gap-2'>
                          <h2
                            className={`text-md font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {session.title}
                          </h2>
                          {session.safeExited ? (
                            <Badge className='bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'>
                              Safe exited
                            </Badge>
                          ) : session.completed || session.score ? (
                            <Badge className='bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'>
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant='outline'>Not completed</Badge>
                          )}
                        </div>

                        <div
                          className={`flex flex-wrap items-center gap-4 text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          <div className='flex items-center gap-1'>
                            <Clock className='h-4 w-4' />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <span>
                            Score:{' '}
                            <span className='font-semibold text-cyan-400'>
                              {session.score !== null
                                ? `${session.score}%`
                                : 'N/A'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className='flex gap-3'>
                        <Button
                          variant='outline'
                          disabled={
                            session.score === null ||
                            session.attemptNumber === null
                          }
                          onClick={() =>
                            router.push(
                              `/interviews/${session.interviewId}/feedback?attemptNumber=${session.attemptNumber}`,
                            )
                          }
                          className={`${
                            theme === 'dark'
                              ? 'border-gray-700 text-gray-300'
                              : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View Result
                        </Button>
                        <Button
                          variant='ghost'
                          onClick={() => openDeleteModal(session.id, session.title)}
                          className='text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sessions.length > ITEMS_PER_PAGE ? (
                <div className='mt-8'>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href='#'
                          onClick={(event) => {
                            event.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage((page) => page - 1);
                            }
                          }}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : undefined
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href='#'
                            isActive={page === currentPage}
                            onClick={(event) => {
                              event.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href='#'
                          onClick={(event) => {
                            event.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage((page) => page + 1);
                            }
                          }}
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : undefined
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              ) : null}
            </>
          )}
        </div>
        <Dialog open={deleteModal.isOpen} onOpenChange={closeDeleteModal}>
          <DialogContent
            className={`max-w-md ${
              theme === 'dark'
                ? 'border-gray-800 bg-black text-white'
                : 'border-gray-200 bg-white text-gray-900'
            }`}
          >
            <DialogHeader>
              <DialogTitle>Delete session</DialogTitle>
            </DialogHeader>
            <div className='space-y-6'>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Are you sure you want to delete "{deleteModal.title}"? This will
                also remove any saved result tied to that session.
              </p>
              <div className='flex justify-end gap-3'>
                <Button
                  variant='outline'
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className={`${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-300'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(deleteModal.sessionId)}
                  disabled={deleting}
                  className='bg-red-600 text-white hover:bg-red-700'
                >
                  {deleting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
