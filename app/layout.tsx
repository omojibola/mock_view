import type React from 'react';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { toastConfig } from '@/lib/config/toast.config';
import { ThemeProvider } from '@/lib/contexts/theme-context';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: 'MockView - Master Your Next Interview By Practicing First',
  description:
    'Practice interviews with AI or real humans. Get instant feedback and land your dream job.',
  keywords: [
    'interview practice',
    'AI interview',
    'job interview',
    'interview preparation',
    'career development',
  ],
  authors: [{ name: 'MockView Team' }],
  creator: 'MockView',
  publisher: 'MockView',
  metadataBase: new URL('https://usemockview.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://usemockview.com',
    title: 'MockView - Master Your Next Interview By Practicing First',
    description:
      'Practice interviews with AI or real humans. Get instant feedback and land your dream job.',
    siteName: 'MockView',
    images: [
      {
        url: 'https://usemockview.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MockView - AI-Powered Interview Practice Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MockView - Master Your Next Interview By Practicing First',
    description:
      'Practice interviews with AI or real humans. Get instant feedback and land your dream job.',
    creator: '@usemockview',
    images: ['https://usemockview.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`dark ${plusJakartaSans.variable} antialiased`}>
      <body className='font-sans'>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position={toastConfig.position} />
      </body>
    </html>
  );
}
