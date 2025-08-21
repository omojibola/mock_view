import Link from 'next/link';

export default function AuthHeader() {
  return (
    <div className='absolute top-4 left-4 md:top-6 md:left-6 z-20'>
      <Link
        href='/'
        className='flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors group'
      >
        <div className='w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform'>
          <svg
            className='w-3 h-3 md:w-5 md:h-5 text-white'
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
        <span className='font-semibold text-sm md:text-lg'>InterviewAce</span>
      </Link>
    </div>
  );
}
