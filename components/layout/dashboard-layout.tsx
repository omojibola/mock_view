'use client';

import { useEffect } from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/theme-context';
import authService from '@/lib/services/auth.service';
import toastService from '@/lib/services/toast.service';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Home,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  CreditCard,
  Coins,
} from 'lucide-react';
import Logo from '../logo/logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: MessageSquare, label: 'Interviews', href: '/interviews' },
  { icon: CreditCard, label: 'Billing', href: '/billing' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/billing/credits');
        if (response.ok) {
          const { data } = await response.json();
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      }
    };

    if (user) {
      fetchCredits();
    }
  }, [user]);

  const handleLogout = async () => {
    const result = await authService.logout();
    if (result.success) {
      toastService.success('Logged out successfully');
      router.push('/');
    } else {
      toastService.error('Failed to logout');
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 ${
          theme === 'dark'
            ? 'bg-gray-900'
            : 'bg-gray-50 border-r border-gray-200'
        } transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div
            className={`flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            <Logo />
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden'
              onClick={() => setSidebarOpen(false)}
            >
              <X className='w-5 h-5' />
            </Button>
          </div>

          {/* Navigation */}
          <nav className='flex-1 px-4 py-6 space-y-2'>
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant='ghost'
                className={`w-full justify-start ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
                onClick={() => router.push(item.href)}
              >
                <item.icon className='w-5 h-5 mr-3' />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User section */}
          <div
            className={`p-4 border-t ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            <div className='flex items-center space-x-3 mb-4'>
              <div
                className={`w-10 h-10 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                } rounded-full flex items-center justify-center`}
              >
                <User
                  className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                />
              </div>
              <div className='flex-1 min-w-0'>
                <p
                  className={`text-sm font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}
                >
                  {user?.fullName}
                </p>
                <p
                  className={`text-xs truncate ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant='ghost'
              className={`w-full justify-start ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
              onClick={handleLogout}
            >
              <LogOut className='w-5 h-5 mr-3' />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:pl-64'>
        {/* Top bar */}
        <div
          className={`sticky top-0 z-30 backdrop-blur-sm border-b ${
            theme === 'dark'
              ? 'bg-black/80 border-gray-800'
              : 'bg-white/80 border-gray-200'
          }`}
        >
          <div className='flex items-center justify-between px-6 py-4'>
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden'
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className='w-5 h-5' />
            </Button>
            <div className='flex-1' />
            <div className='flex items-center space-x-4'>
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => router.push('/billing')}
              >
                <Coins
                  className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}
                >
                  {credits} credits
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className='p-6'>{children}</main>
      </div>
    </div>
  );
}
