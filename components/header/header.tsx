'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../logo/logo';

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Logo />
        </div>
        <nav className='hidden md:flex items-center space-x-6'>
          <a
            href='#features'
            className='text-sm font-medium hover:text-primary transition-colors'
          >
            Features
          </a>
          <a
            href='#testimonials'
            className='text-sm font-medium hover:text-primary transition-colors'
          >
            Reviews
          </a>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.push('/auth')}
          >
            Sign In
          </Button>
          <Button
            size='sm'
            className='bg-white text-black hover:bg-gray-100 rounded-full'
            onClick={() => router.push('/auth')}
          >
            Get Started
          </Button>
        </nav>
        <button
          className='md:hidden p-2'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className='h-6 w-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className='bg-background border-t px-4 py-4 space-y-4 transform transition-transform duration-300 ease-in-out'
          style={{
            transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          <a
            href='#features'
            className='block text-sm font-medium hover:text-primary transition-colors py-2'
          >
            Features
          </a>
          <a
            href='#testimonials'
            className='block text-sm font-medium hover:text-primary transition-colors py-2'
          >
            Reviews
          </a>
          <div className='space-y-2 pt-2'>
            <Button
              variant='outline'
              size='sm'
              className='w-full bg-transparent'
              onClick={() => router.push('/auth')}
            >
              Sign In
            </Button>
            <Button
              size='sm'
              className='w-full bg-white text-black hover:bg-gray-100 rounded-full'
              onClick={() => router.push('/auth')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
