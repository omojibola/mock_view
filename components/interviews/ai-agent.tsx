import { CardContent } from '../ui/card';

import { Bot } from 'lucide-react';

interface AI_AGENTProps {
  isSpeaking: 'user' | 'ai' | null;
  userName: string;
  userId: string;
  interviewId: string;
  type:
    | 'technical'
    | 'behavioral'
    | 'problem-solving'
    | 'case-study'
    | 'situational'
    | 'live-coding'
    | '';
  questions: string[];
  setIsSpeaking: (isSpeaking: 'user' | 'ai' | null) => void;
  interviewer: string;
}

const AI_AGENT = ({ isSpeaking, interviewer }: AI_AGENTProps) => {
  return (
    <div className='absolute top-4 left-4 w-64 h-48 z-10'>
      <div className='h-full bg-gray-800 border-gray-600 overflow-hidden rounded-lg'>
        <CardContent className='p-0 h-full relative'>
          <div className='h-full bg-gray-700 flex items-center justify-center'>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpeaking === 'ai'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse scale-110'
                  : 'bg-gray-600'
              }`}
            >
              <Bot
                className={`w-8 h-8 ${
                  isSpeaking === 'ai' ? 'text-white' : 'text-cyan-400'
                }`}
              />
            </div>
          </div>
          <div className='absolute bottom-2 left-2'>
            <div className='px-2 py-1 bg-black/70 text-white rounded text-xs font-medium'>
              {interviewer}
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default AI_AGENT;
