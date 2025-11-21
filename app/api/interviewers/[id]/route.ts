import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiResponseBuilder } from '@/lib/utils/response';
import { createClient } from '@/utils/supabase/server';

const updateInterviewerSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  specialties: z.string().optional(), // JSON string array
  experience: z.string().min(1).optional(),
});

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

async function deleteVoiceFromElevenLabs(voiceId: string): Promise<boolean> {
  if (!ELEVENLABS_API_KEY) {
    console.error('ElevenLabs API key not configured');
    return false;
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting voice from ElevenLabs:', error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: interviewer, error } = await supabase
      .from('custom_interviewers')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return ApiResponseBuilder.error('Interviewer not found');
      }
      console.error('Database error:', error);
      return ApiResponseBuilder.serverError('Failed to fetch interviewer');
    }

    return NextResponse.json({ success: true, data: interviewer });
  } catch (error) {
    console.error('Get interviewer error:', error);
    return ApiResponseBuilder.serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = updateInterviewerSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseBuilder.error(
        validationResult.error.message,
        'Invalid input data',
        400
      );
    }

    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description || null;
    if (body.experience) updateData.experience = body.experience;

    if (body.specialties) {
      try {
        updateData.specialties = JSON.parse(body.specialties);
      } catch {
        return ApiResponseBuilder.error('Invalid specialties format', '', 400);
      }
    }

    // Update interviewer
    const { data: interviewer, error } = await supabase
      .from('custom_interviewers')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return ApiResponseBuilder.error('Interviewer not found', '', 404);
      }
      console.error('Database error:', error);
      return ApiResponseBuilder.serverError('Failed to update interviewer');
    }
    return ApiResponseBuilder.success(interviewer);
  } catch (error) {
    console.error('Update interviewer error:', error);
    return ApiResponseBuilder.serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get interviewer to retrieve voice_id before deletion
    const { data: interviewer, error: fetchError } = await supabase
      .from('custom_interviewers')
      .select('voice_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return ApiResponseBuilder.error('Interviewer not found');
      }
      console.error('Database error:', fetchError);
      return ApiResponseBuilder.serverError('Failed to fetch interviewer');
    }

    // Delete from database first
    const { error: deleteError } = await supabase
      .from('custom_interviewers')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return ApiResponseBuilder.serverError('Failed to delete interviewer');
    }

    // Try to delete voice from ElevenLabs (don't fail if this fails)
    if (interviewer.voice_id) {
      const voiceDeleted = await deleteVoiceFromElevenLabs(
        interviewer.voice_id
      );
      if (!voiceDeleted) {
        console.warn(
          `Failed to delete voice ${interviewer.voice_id} from ElevenLabs`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Interviewer deleted successfully!',
    });
  } catch (error) {
    console.error('Delete interviewer error:', error);
    return ApiResponseBuilder.serverError();
  }
}
