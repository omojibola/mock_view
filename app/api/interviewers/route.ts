import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { ApiResponseBuilder } from '@/lib/utils/response';

const createInterviewerSchema = z.object({
  name: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  specialties: z.string(), // JSON string array
  experience: z.string().min(1),
});

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

async function createVoiceWithElevenLabs(
  name: string,
  audioFiles: File[]
): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) {
    console.error('ElevenLabs API key not configured');
    return null;
  }

  try {
    // Create FormData for ElevenLabs voice creation
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', `Custom voice for interviewer ${name}`);

    // Add audio files
    audioFiles.forEach((file, index) => {
      formData.append('files', file, `sample_${index}.wav`);
    });

    // Add labels for each file (optional but recommended)
    const labels = audioFiles.map((_, index) => `Sample ${index + 1}`);
    formData.append('labels', JSON.stringify(labels));

    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result.voice_id;
  } catch (error) {
    console.error('Error creating voice with ElevenLabs:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return ApiResponseBuilder.unauthorized();
    }

    // Check if user already has 2 custom interviewers (limit)
    const { data: existingInterviewers, error: countError } = await supabase
      .from('custom_interviewers')
      .select('id')
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error checking existing interviewers:', countError);
      return ApiResponseBuilder.error('Database Error', 'SERVER_ERROR', 500);
    }

    if (existingInterviewers && existingInterviewers.length >= 2) {
      return ApiResponseBuilder.error(
        'You can only create a maximum of 2 custom interviewers',
        '',
        400
      );
    }

    // Parse form data
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const specialtiesJson = formData.get('specialties') as string;
    const experience = formData.get('experience') as string;

    // Validate basic data
    const validationResult = createInterviewerSchema.safeParse({
      name,
      title,
      description,
      specialties: specialtiesJson,
      experience,
    });

    if (!validationResult.success) {
      return ApiResponseBuilder.error(
        validationResult.error.message,
        'Invalid form data',
        400
      );
    }

    // Parse specialties
    let specialties: string[];
    try {
      specialties = JSON.parse(specialtiesJson);
    } catch {
      return ApiResponseBuilder.error('Invalid specialties format', '', 400);
    }

    // Extract voice files
    const voiceFiles: File[] = [];
    for (let i = 0; i < 4; i++) {
      // We expect 4 voice prompts
      const file = formData.get(`voicePrompt${i}`) as File;
      if (file) {
        voiceFiles.push(file);
      }
    }

    if (voiceFiles.length !== 4) {
      return ApiResponseBuilder.error(
        'All 4 voice prompts are required',
        '',
        400
      );
    }

    // Create voice with ElevenLabs
    const voiceId = await createVoiceWithElevenLabs(name, voiceFiles);
    if (!voiceId) {
      return ApiResponseBuilder.serverError(
        'Failed to create voice with ElevenLabs. Please try again.'
      );
    }

    // Save to database
    const { data: interviewer, error: dbError } = await supabase
      .from('custom_interviewers')
      .insert({
        user_id: user.id,
        name,
        title,
        description: description || null,
        specialties,
        experience,
        voice_id: voiceId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);

      // Try to clean up the created voice if database save fails
      try {
        await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
          method: 'DELETE',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY!,
          },
        });
      } catch (cleanupError) {
        console.error(
          'Failed to cleanup voice after database error:',
          cleanupError
        );
      }

      return ApiResponseBuilder.serverError('Failed to save interviewer');
    }

    return ApiResponseBuilder.success(interviewer);
  } catch (error) {
    console.error('Create interviewer error:', error);
    return ApiResponseBuilder.serverError();
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return ApiResponseBuilder.unauthorized();
    }

    // Fetch user's custom interviewers
    const { data: interviewers, error } = await supabase
      .from('custom_interviewers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return ApiResponseBuilder.error(
        'Failed to fetch interviewers',
        'FAILED_TO_FETCH_INTERVIEWERS',
        500
      );
    }

    return ApiResponseBuilder.success(interviewers);
  } catch (error) {
    console.error('Get interviewers error:', error);

    return ApiResponseBuilder.error(
      'Internal server error',
      'Internal server error',
      500
    );
  }
}
