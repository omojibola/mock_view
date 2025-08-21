import type React from 'react';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { toastConfig } from '@/lib/config/toast.config';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: 'InterviewAce - Master Your Next Interview',
  description:
    'Practice interviews with AI or real humans. Get instant feedback and land your dream job.',
  generator: 'v0.app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`dark ${plusJakartaSans.variable} antialiased`}>
      <body className='font-sans'>
        {children}
        <Toaster position={toastConfig.position} />
      </body>
    </html>
  );
}
