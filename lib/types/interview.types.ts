export interface Interview {
  id: string;
  title: string;
  description: string;
  type: 'technical' | 'behavioral';
  duration: number; // in minutes
  status: 'completed' | 'in-progress' | 'scheduled';
  createdAt: string;
  completedAt?: string;
  score?: number;
  feedback?: string;
}

export interface InterviewCard {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'technical' | 'behavioral';
  score?: number;
}
