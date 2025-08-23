'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/contexts/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={toggleTheme}
      className={`${
        theme === 'dark'
          ? 'text-white hover:bg-gray-800 hover:text-white'
          : 'text-black hover:bg-gray-100 hover:text-black'
      }`}
    >
      {theme === 'dark' ? (
        <Sun className='w-5 h-5' />
      ) : (
        <Moon className='w-5 h-5' />
      )}
    </Button>
  );
}
