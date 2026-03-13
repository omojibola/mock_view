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
    | 'mixed'
    | '';
  duration: number;
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
    | 'mixed';

  completedAt: string;
  score?: number;
}

export type InterviewType =
  | 'technical'
  | 'behavioral'
  | 'problem-solving'
  | 'case-study'
  | 'situational'
  | 'mixed';

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

export interface DashboardPerformancePoint {
  id: string;
  label: string;
  title: string;
  date: string;
  score: number;
  type?: string;
  attemptNumber?: number;
}

export interface DashboardPerformanceSummary {
  latestInterview: DashboardPerformancePoint | null;
  previousInterview: DashboardPerformancePoint | null;
  history: DashboardPerformancePoint[];
  averageScore: number | null;
  completedCount: number;
  trend: number | null;
}

export interface ConfidenceCheckinStatements {
  knewWhatToSay: number;
  feltUnjudged: number;
  realInterviewReadiness: number;
  recoveredWhenStuck: number;
}

export interface ConfidenceCheckin {
  interviewId: string;
  attemptNumber: number;
  statements: ConfidenceCheckinStatements;
  selfBeliefScore: number;
  createdAt: string;
}

export interface DashboardConfidencePoint {
  id: string;
  label: string;
  title: string;
  date: string;
  performance: number;
  selfBelief: number | null;
  readiness: number | null;
  completion: number | null;
  consistency: number | null;
  challenge: number | null;
  type?: string;
}

export interface DashboardConfidenceSummary {
  latestSession: DashboardConfidencePoint | null;
  history: DashboardConfidencePoint[];
  averagePerformance: number | null;
  floorPerformance: number | null;
  ceilingPerformance: number | null;
  mismatchCount: number;
  mismatchInsight: string | null;
}

export interface InterviewSessionListItem {
  id: string;
  interviewId: string;
  title: string;
  score: number | null;
  completed: boolean;
  safeExited: boolean;
  createdAt: string;
  attemptNumber: number | null;
  type?: string;
}
