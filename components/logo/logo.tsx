import React from 'react';
import { useRouter } from 'next/navigation';

const Logo = () => {
  const router = useRouter();
  return (
    <div
      className='flex items-center space-x-2 group cursor-pointer'
      onClick={() => router.push('/')}
    >
      <div className='w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform'>
        <svg
          className='w-5 h-5 text-white'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      </div>
      <span className='font-semibold text-lg'>InterviewAce</span>
    </div>
  );
};

export default Logo;
