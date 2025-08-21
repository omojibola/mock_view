'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/config/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=callback_error');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard or home
          router.push('/dashboard');
        } else {
          // No session, redirect to auth page
          router.push('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4'></div>
        <p className='text-white'>Completing authentication...</p>
      </div>
    </div>
  );
}
