export interface CustomInterviewer {
  id: string;
  user_id: string;
  name: string;
  title: string;
  description?: string;
  specialties: string[];
  experience: string;
  voice_id: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomInterviewerRequest {
  name: string;
  title: string;
  description?: string;
  specialties: string[];
  experience: string;
  voiceFiles: File[];
}

export interface DefaultInterviewer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  description: string;
  specialties: string[];
  experience: string;
  isDefault: true;
}

export type InterviewerOption = CustomInterviewer | DefaultInterviewer;

export interface InterviewerStats {
  totalCustom: number;
  maxAllowed: number;
  canCreateMore: boolean;
}
