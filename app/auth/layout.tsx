import type React from 'react';
import AuthHeader from '@/components/auth-header/auth-header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-black flex'>
      <AuthHeader />

      {/* Left Panel - Gradient Background */}
      <div className='hidden lg:flex lg:w-1/2 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-cyan-900/30 to-black opacity-95' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />

        <div className='absolute inset-0'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-cyan-600/10 rounded-full blur-3xl animate-pulse' />
          <div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000' />
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-300/10 to-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500' />
        </div>

        <div className='relative z-10 flex flex-col justify-center items-start p-16 text-white'>
          <div className='mb-8'>
            <div className='w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-8'>
              <div className='w-6 h-6 bg-white rounded-full' />
            </div>
          </div>

          <h1 className='text-5xl font-bold mb-6 leading-tight'>
            Be a Part of
            <br />
            Something <span className='text-cyan-400'>Beautiful</span>
          </h1>

          <p className='text-xl text-white/80 max-w-md'>
            Join thousands of professionals who are mastering their interview
            skills with AI-powered practice sessions.
          </p>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        {children}
      </div>
    </div>
  );
}
