export interface QuestionFeedback {
  question: string;
  userResponse: string;
  aiScore: number;
  feedback: string;
  suggestedImprovement: string;
}

export interface FeedbackData {
  interviewId: string;
  userId: string;
  totalScore: number;
  questionFeedbacks: QuestionFeedback[];
  overallStrengths: string[];
  overallImprovements: string[];
  finalAssessment: string;
  createdAt: string;
  interviewTitle?: string;
  duration?: number;
  type?: string;
}
