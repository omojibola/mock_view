'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import authService from '@/lib/services/auth.service';
import toastService from '@/lib/services/toast.service';
import { Button } from '@/components/ui/button';
import {
  Home,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: MessageSquare, label: 'Interviews', href: '/interviews' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

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
    <div className='min-h-screen bg-black text-white'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div className='flex items-center justify-between p-6 border-b border-gray-800'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center'>
                <MessageSquare className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-semibold'>InterviewAce</span>
            </div>
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
                className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800'
                onClick={() => router.push(item.href)}
              >
                <item.icon className='w-5 h-5 mr-3' />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User section */}
          <div className='p-4 border-t border-gray-800'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center'>
                <User className='w-5 h-5 text-gray-300' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-white truncate'>
                  {user?.fullName}
                </p>
                <p className='text-xs text-gray-400 truncate'>{user?.email}</p>
              </div>
            </div>
            <Button
              variant='ghost'
              className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800'
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
        <div className='sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-gray-800'>
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
          </div>
        </div>

        {/* Page content */}
        <main className='p-6'>{children}</main>
      </div>
    </div>
  );
}
