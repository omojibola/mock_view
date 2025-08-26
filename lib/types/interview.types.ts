export interface Interview {
  id: string;
  title: string;
  description: string;
  type:
    | 'technical'
    | 'behavioral'
    | 'problem-solving'
    | 'case-study'
    | 'situational';
  status: 'completed' | 'in-progress' | 'scheduled';
  createdAt: string;
  score?: number;
  feedback?: string;
}

export interface InterviewCard {
  id: string;
  title: string;
  description: string;
  duration: number;
  type:
    | 'technical'
    | 'behavioral'
    | 'problem-solving'
    | 'case-study'
    | 'situational';
  score?: number;
  completedAt?: string;
}

export type InterviewType =
  | 'technical'
  | 'behavioral'
  | 'problem-solving'
  | 'case-study'
  | 'situational'
  | 'live-coding';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: InterviewType;
}

export interface CreateInterviewRequest {
  jobTitle: string;
  jobDescription: string;
  interviewType: InterviewType;
}

export interface GeneratedInterview {
  id: string;
  jobTitle: string;
  jobDescription: string;
  type: InterviewType;
  questions: InterviewQuestion[];
  createdAt: string;
}
