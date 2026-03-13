'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import authService from '@/lib/services/auth.service';
import { ND_TYPE_OPTIONS } from '@/lib/constants/nd-types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [showNdTypeDialog, setShowNdTypeDialog] = useState(false);
  const [selectedNdType, setSelectedNdType] = useState('');
  const [isSavingNdType, setIsSavingNdType] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const {
          data: { user },
          error: getUserError,
        } = await supabase.auth.getUser();

        if (getUserError || !user) {
          console.error('Failed to fetch user', getUserError);
          return;
        }

        const { data: existingUser } = await supabase
          .from('users')
          .select('id, nd_type')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingUser) {
          const { error: insertError } = await supabase.from('users').insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              credits: 3,
            },
          ]);

          if (insertError) {
            console.error('Failed to create user profile', insertError);
            router.push('/auth?error=callback_error');
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=callback_error');
          return;
        }

        if (data.session) {
          const ndType = existingUser?.nd_type ?? null;

          if (!ndType) {
            setShowNdTypeDialog(true);
            return;
          }

          router.push('/dashboard');
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth?error=callback_error');
      } finally {
        setIsCheckingProfile(false);
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  const handleNdTypeSave = async () => {
    if (!selectedNdType) {
      setSaveError('Select an option to continue.');
      return;
    }

    setIsSavingNdType(true);
    setSaveError('');

    try {
      const result = await authService.updateProfile({
        ndType: selectedNdType,
      });

      if (!result.success) {
        setSaveError(result.error || 'Unable to save your selection.');
        return;
      }

      setShowNdTypeDialog(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save ND type', error);
      setSaveError('Unable to save your selection.');
    } finally {
      setIsSavingNdType(false);
    }
  };

  return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4'></div>
        <p className='text-white'>
          {isCheckingProfile
            ? 'Completing authentication...'
            : 'One final step before we continue.'}
        </p>
      </div>

      <Dialog open={showNdTypeDialog} onOpenChange={() => undefined}>
        <DialogContent
          showCloseButton={false}
          className='bg-gray-950 border-gray-800 text-white'
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Tell us how you identify</DialogTitle>
            <DialogDescription className='text-gray-400'>
              We use this information to help make interview feedback fairer by
              accounting for neurodiversity and reducing avoidable bias in how
              results are interpreted. Your selection is stored on your profile
              and can be updated later in settings.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3'>
            <p className='text-sm font-medium text-gray-200'>
              NeuroDivergent type
            </p>
            <Select value={selectedNdType} onValueChange={setSelectedNdType}>
              <SelectTrigger className='w-full bg-gray-900 border-gray-700 text-white'>
                <SelectValue placeholder='Select an option' />
              </SelectTrigger>
              <SelectContent className='bg-gray-950 border-gray-800 text-white'>
                {ND_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {saveError ? (
              <p className='text-sm text-red-400'>{saveError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type='button'
              onClick={handleNdTypeSave}
              disabled={isSavingNdType}
              className='bg-cyan-500 text-black hover:bg-cyan-400'
            >
              {isSavingNdType ? 'Saving...' : 'Save and continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
