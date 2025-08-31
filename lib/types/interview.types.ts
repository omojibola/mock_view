export interface Interview {
  id: string;
  title: string;
  description: string;
  type:
    | 'technical'
    | 'behavioral'
    | 'problem-solving'
    | 'case-study'
    | 'situational'
    | 'live-coding';
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
  type:
    | 'technical'
    | 'behavioral'
    | 'problem-solving'
    | 'case-study'
    | 'situational'
    | 'live-coding';
  completedAt: string;
  score?: number;
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
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  followUpQuestions?: string[];
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  difficulty: 'easy' | 'medium' | 'hard';
  testCases: Array<{
    input: string;
    expectedOutput: string;
    hidden: boolean;
  }>;
  starterCode:
    | string
    | {
        javascript: string;
        python: string;
        java: string;
        cpp: string;
      };
  language: string;
}

export interface CreateInterviewRequest {
  jobTitle: string;
  jobDescription: string;
  duration: number;
  interviewType: InterviewType;
}

export interface GeneratedInterview {
  id: string;
  jobTitle: string;
  jobDescription: string;
  duration?: number;
  type: InterviewType;
  questions: (InterviewQuestion | CodingQuestion)[];
  createdAt: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
}

export interface FeedbackData {
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
  interviewTitle?: string;
  duration?: number;
  type?: string;
}
