'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/contexts/theme-context';
import { toastService } from '@/lib/services/toast.service';
import { ArrowLeft, Mic, Square, Play, User } from 'lucide-react';

const createInterviewerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 500,
      'Description must be less than 500 characters'
    ),
  specialties: z
    .array(z.string())
    .min(1, 'At least one specialty is required')
    .max(5, 'Maximum 5 specialties allowed'),
  experience: z.string().min(1, 'Experience level is required'),
});

type CreateInterviewerFormData = z.infer<typeof createInterviewerSchema>;

const experienceLevels = [
  '3-5 years',
  '5-7 years',
  '7-10 years',
  '10+ years',
  '15+ years',
];

const commonSpecialties = [
  'React',
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'Node.js',
  'System Design',
  'Algorithms',
  'Data Structures',
  'Frontend',
  'Backend',
  'Full Stack',
  'DevOps',
  'Machine Learning',
  'Mobile Development',
  'Leadership',
  'Team Management',
  'Behavioral',
  'Problem Solving',
];

const voicePrompts = [
  "Hello, I'm excited to be your interviewer today. Let's start with a brief introduction about yourself.",
  "That's a great answer. Can you walk me through your thought process on how you approached this problem?",
  "I'd like to dive deeper into your technical experience. Tell me about a challenging project you've worked on recently.",
  "Thank you for sharing that. Now let's move on to our next question about system design and scalability.",
];

export default function CreateInterviewerPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState('');

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [recordedPrompts, setRecordedPrompts] = useState<{
    [key: number]: Blob;
  }>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const form = useForm<CreateInterviewerFormData>({
    resolver: zodResolver(createInterviewerSchema),
    defaultValues: {
      name: '',
      title: '',
      description: '',
      specialties: [],
      experience: '',
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setRecordedPrompts((prev) => ({ ...prev, [currentPromptIndex]: blob }));

        // Clean up stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toastService.error(
        'Failed to start recording. Please check microphone permissions.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = (promptIndex: number) => {
    const blob = recordedPrompts[promptIndex];
    if (!blob) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
    };

    audio.play();
  };

  const addSpecialty = (specialty: string) => {
    if (selectedSpecialties.length >= 5) {
      toastService.error('Maximum 5 specialties allowed');
      return;
    }
    if (!selectedSpecialties.includes(specialty)) {
      const newSpecialties = [...selectedSpecialties, specialty];
      setSelectedSpecialties(newSpecialties);
      form.setValue('specialties', newSpecialties);
    }
  };

  const removeSpecialty = (specialty: string) => {
    const newSpecialties = selectedSpecialties.filter((s) => s !== specialty);
    setSelectedSpecialties(newSpecialties);
    form.setValue('specialties', newSpecialties);
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim()) {
      addSpecialty(customSpecialty.trim());
      setCustomSpecialty('');
    }
  };

  const handleCreateInterviewer = async (data: CreateInterviewerFormData) => {
    // Check if all voice prompts are recorded
    const allPromptsRecorded = voicePrompts.every(
      (_, index) => recordedPrompts[index]
    );
    if (!allPromptsRecorded) {
      toastService.error(
        'Please record all voice prompts before creating the interviewer'
      );
      return;
    }

    setIsCreating(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('specialties', JSON.stringify(data.specialties));
      formData.append('experience', data.experience);

      // Add voice recordings
      voicePrompts.forEach((_, index) => {
        const blob = recordedPrompts[index];
        if (blob) {
          formData.append(`voicePrompt${index}`, blob, `prompt${index}.wav`);
        }
      });

      const response = await fetch('/api/interviewers', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toastService.success('Custom interviewer created successfully!');
        router.push('/interviewers');
      } else {
        toastService.error(result.error || 'Failed to create interviewer');
      }
    } catch (error) {
      console.error('Create interviewer error:', error);
      toastService.error('Failed to create interviewer');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-6'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className={`mb-4 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back
            </Button>
            <h1
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Create Custom Interviewer
            </h1>
            <p
              className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Design your personalized AI interviewer with custom voice and
              expertise
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Basic Information */}
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='name'
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Interviewer Name *
                  </Label>
                  <Input
                    id='name'
                    placeholder='e.g. Alex Thompson'
                    {...form.register('name')}
                    className={`${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  {form.formState.errors.name && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='title'
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Professional Title *
                  </Label>
                  <Input
                    id='title'
                    placeholder='e.g. Senior Software Engineer'
                    {...form.register('title')}
                    className={`${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  {form.formState.errors.title && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='description'
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Description (Optional)
                  </Label>
                  <textarea
                    id='description'
                    placeholder="Brief description of the interviewer's background and expertise..."
                    {...form.register('description')}
                    rows={3}
                    className={`w-full p-3 text-sm rounded-md border resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                  />
                  {form.formState.errors.description && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Experience Level *
                  </Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {experienceLevels.map((level) => (
                      <Button
                        key={level}
                        type='button'
                        variant={
                          form.watch('experience') === level
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() => form.setValue('experience', level)}
                        className='text-xs'
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  {form.formState.errors.experience && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.experience.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Specialties & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Selected Specialties ({selectedSpecialties.length}/5)
                  </Label>
                  <div className='flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md'>
                    {selectedSpecialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant='secondary'
                        className='cursor-pointer hover:bg-red-100 hover:text-red-800'
                        onClick={() => removeSpecialty(specialty)}
                      >
                        {specialty} ×
                      </Badge>
                    ))}
                    {selectedSpecialties.length === 0 && (
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        No specialties selected
                      </span>
                    )}
                  </div>
                  {form.formState.errors.specialties && (
                    <p className='text-red-500 text-xs'>
                      {form.formState.errors.specialties.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Common Specialties
                  </Label>
                  <div className='flex flex-wrap gap-2 max-h-32 overflow-y-auto'>
                    {commonSpecialties.map((specialty) => (
                      <Button
                        key={specialty}
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => addSpecialty(specialty)}
                        disabled={
                          selectedSpecialties.includes(specialty) ||
                          selectedSpecialties.length >= 5
                        }
                        className='text-xs'
                      >
                        {specialty}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Add Custom Specialty
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      placeholder='Enter custom specialty'
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      className={`flex-1 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300'
                      }`}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && addCustomSpecialty()
                      }
                    />
                    <Button
                      type='button'
                      onClick={addCustomSpecialty}
                      disabled={
                        !customSpecialty.trim() ||
                        selectedSpecialties.length >= 5
                      }
                      size='sm'
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voice Recording Section */}
          <Card
            className={`mt-6 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`text-lg ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Voice Recording
              </CardTitle>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Record your voice reading the following prompts to create a
                personalized interviewer voice
              </p>
            </CardHeader>
            <CardContent className='space-y-6'>
              {voicePrompts.map((prompt, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h4
                        className={`font-medium mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Prompt {index + 1}
                      </h4>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        "{prompt}"
                      </p>
                    </div>
                    <Badge
                      variant={recordedPrompts[index] ? 'default' : 'outline'}
                    >
                      {recordedPrompts[index] ? 'Recorded' : 'Not Recorded'}
                    </Badge>
                  </div>

                  <div className='flex items-center gap-3'>
                    {currentPromptIndex === index && (
                      <Button
                        type='button'
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? 'destructive' : 'default'}
                        size='sm'
                        className='flex items-center gap-2'
                      >
                        {isRecording ? (
                          <Square className='w-4 h-4' />
                        ) : (
                          <Mic className='w-4 h-4' />
                        )}
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </Button>
                    )}

                    {currentPromptIndex !== index && (
                      <Button
                        type='button'
                        onClick={() => setCurrentPromptIndex(index)}
                        variant='outline'
                        size='sm'
                      >
                        Select to Record
                      </Button>
                    )}

                    {recordedPrompts[index] && (
                      <Button
                        type='button'
                        onClick={() => playRecording(index)}
                        variant='outline'
                        size='sm'
                        className='flex items-center gap-2'
                      >
                        <Play className='w-4 h-4' />
                        Play Recording
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className='mt-8 text-center'>
            <Button
              onClick={form.handleSubmit(handleCreateInterviewer)}
              disabled={isCreating || !form.formState.isValid}
              className={`px-8 py-3 text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-white hover:bg-gray-100 text-black'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              {isCreating ? (
                <div className='flex items-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2' />
                  Creating Interviewer...
                </div>
              ) : (
                <div className='flex items-center'>
                  <User className='w-4 h-4 mr-2' />
                  Create Custom Interviewer
                </div>
              )}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
