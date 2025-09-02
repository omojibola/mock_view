'use client';

import Link from 'next/link';
import Logo from '../logo/logo';

export default function AuthHeader() {
  return (
    <div className='absolute top-4 left-4 md:top-6 md:left-6 z-20 mb-10'>
      <Link
        href='/'
        className='flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors group'
      >
        <Logo />
      </Link>
    </div>
  );
}
