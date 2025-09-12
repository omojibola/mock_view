'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Zap, Flame, ArrowLeft } from 'lucide-react';

export default function ResumeRoasterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [roast, setRoast] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === 'application/pdf' ||
        droppedFile.type.includes('word') ||
        droppedFile.name.endsWith('.doc') ||
        droppedFile.name.endsWith('.docx')
      ) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRoast = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/resume-roaster', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to roast resume');

      const data = await response.json();
      setRoast(data.roast);
    } catch (error) {
      console.error('Error roasting resume:', error);
      setRoast(
        'Oops! Our AI roaster is taking a coffee break. Try again in a moment! ☕'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetRoaster = () => {
    setFile(null);
    setRoast('');
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-14 items-center'>
          <Link href='/' className='flex items-center space-x-2'>
            <ArrowLeft className='h-4 w-4' />
            <span className='text-sm font-medium'>Back to Home</span>
          </Link>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <div className='flex items-center justify-center mb-4'>
            <Flame className='h-8 w-8 text-orange-500 mr-2' />
            <h1 className='text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
              Resume Roaster
            </h1>
            <Flame className='h-8 w-8 text-orange-500 ml-2' />
          </div>
          <p className='text-md text-muted-foreground mb-2'>
            Get your resume brutally honest feedback from our AI
          </p>
          <p className='text-sm text-muted-foreground'>
            Upload your resume and prepare for some annoying feedback!
          </p>
          <div className='flex items-center justify-center gap-2 mt-4'>
            <Badge variant='secondary' className='text-xs'>
              <Zap className='h-3 w-3 mr-1' />
              AI-Powered
            </Badge>
            <Badge variant='secondary' className='text-xs'>
              100% Honest
            </Badge>
            <Badge variant='secondary' className='text-xs'>
              Brutally Funny
            </Badge>
          </div>
        </div>

        <div className='grid gap-8 md:grid-cols-2'>
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Upload className='h-5 w-5' />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Drop your PDF or Word document here for a reality check
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                {/* Full-cover invisible input */}
                <input
                  id='resume-upload'
                  type='file'
                  accept='.pdf,.doc,.docx'
                  onChange={handleFileChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />

                {file ? (
                  <div className='space-y-2'>
                    <FileText className='h-12 w-12 mx-auto text-primary' />
                    <p className='font-medium'>{file.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={resetRoaster}
                      className='mt-2 bg-transparent'
                    >
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-2 pointer-events-none'>
                    <Upload className='h-12 w-12 mx-auto text-muted-foreground' />
                    <p className='text-lg font-medium'>Drop your resume here</p>
                    <p className='text-sm text-muted-foreground'>
                      or click to browse files
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleRoast}
                disabled={!file || isLoading}
                className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                size='lg'
              >
                {isLoading ? (
                  <>
                    <Zap className='h-4 w-4 mr-2 animate-spin' />
                    Roasting Your Resume...
                  </>
                ) : (
                  <>
                    <Flame className='h-4 w-4 mr-2' />
                    Roast My Resume!
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Flame className='h-5 w-5 text-orange-500' />
                The Roast
              </CardTitle>
              <CardDescription>
                Brace yourself for some brutal honesty
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roast ? (
                <div className='space-y-4'>
                  <Textarea
                    value={roast}
                    readOnly
                    className='min-h-[300px] resize-none bg-muted/50'
                    placeholder='Your roast will appear here...'
                  />
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      onClick={resetRoaster}
                      className='flex-1 bg-transparent'
                    >
                      Roast Another Resume
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => navigator.clipboard.writeText(roast)}
                      className='flex-1'
                    >
                      Copy Roast
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='min-h-[300px] flex items-center justify-center text-center'>
                  <div className='space-y-2'>
                    <FileText className='h-12 w-12 mx-auto text-muted-foreground/50' />
                    <p className='text-muted-foreground'>
                      Upload your resume to get roasted!
                    </p>
                    <p className='text-sm text-muted-foreground/70'>
                      Our AI is ready to serve some funny feedback
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className='mt-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'>
          <CardContent className='pt-6'>
            <p className='text-sm text-center text-orange-700 dark:text-orange-300'>
              <strong>Disclaimer:</strong> This is for entertainment purposes
              only! While our AI provides genuine feedback, remember to take it
              with a grain of salt (and maybe some humor). Your resume might be
              better than our AI thinks! 😄
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
