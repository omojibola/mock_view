'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/lib/contexts/theme-context';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { CodingQuestion } from '@/lib/types/interview.types';

export default function LiveCodingPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const interviewId = params.id as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<
    Array<{ passed: boolean; message: string }>
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isInterviewEnding, setIsInterviewEnding] = useState(false);

  const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript', extension: 'js' },
    { value: 'python', label: 'Python', extension: 'py' },
    { value: 'java', label: 'Java', extension: 'java' },
    { value: 'cpp', label: 'C++', extension: 'cpp' },
  ];

  const [questions] = useState<CodingQuestion[]>([
    {
      id: '1',
      title: 'Two Sum',
      description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      constraints: [
        '2 ≤ nums.length ≤ 10⁴',
        '-10⁹ ≤ nums[i] ≤ 10⁹',
        '-10⁹ ≤ target ≤ 10⁹',
        'Only one valid answer exists.',
      ],
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
        },
      ],
      difficulty: 'easy',
      testCases: [
        { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', hidden: false },
        { input: '[3,2,4], 6', expectedOutput: '[1,2]', hidden: false },
        { input: '[3,3], 6', expectedOutput: '[0,1]', hidden: true },
      ],
      starterCode: {
        javascript: `function twoSum(nums, target) {
    // Your code here
    
}`,
        python: `def two_sum(nums, target):
    # Your code here
    pass`,
        java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        
    }
};`,
      },
      language: 'javascript',
    },
    {
      id: '2',
      title: 'Valid Parentheses',
      description:
        "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      constraints: [
        '1 ≤ s.length ≤ 10⁴',
        "s consists of parentheses only '()[]{}'.",
      ],
      examples: [
        {
          input: 's = "()"',
          output: 'true',
        },
        {
          input: 's = "()[]{}"',
          output: 'true',
        },
        {
          input: 's = "(]"',
          output: 'false',
        },
      ],
      difficulty: 'easy',
      testCases: [
        { input: '"()"', expectedOutput: 'true', hidden: false },
        { input: '"()[]{}"', expectedOutput: 'true', hidden: false },
        { input: '"(]"', expectedOutput: 'false', hidden: true },
      ],
      starterCode: {
        javascript: `function isValid(s) {
    // Your code here
    
}`,
        python: `def is_valid(s):
    # Your code here
    pass`,
        java: `public class Solution {
    public boolean isValid(String s) {
        // Your code here
        
    }
}`,
        cpp: `#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Your code here
        
    }
};`,
      },
      language: 'javascript',
    },
  ]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleEndInterview = async () => {
    if (isInterviewEnding) return;
    setIsInterviewEnding(true);

    try {
      console.log('[v0] Auto-submitting interview with current progress');

      router.push(`/interviews/${interviewId}/feedback`);
    } catch (error) {
      console.error('[v0] Error ending interview:', error);
      router.push(`/interviews/${interviewId}/feedback`);
    }
  };

  useEffect(() => {
    if (currentQuestion && currentQuestion.starterCode) {
      const starterCode =
        typeof currentQuestion.starterCode === 'string'
          ? currentQuestion.starterCode
          : currentQuestion.starterCode[
              selectedLanguage as keyof typeof currentQuestion.starterCode
            ] || currentQuestion.starterCode.javascript;
      setCode(starterCode);
      setTestResults([]);
    }
  }, [currentQuestion, selectedLanguage]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setTimeout(() => {
      const mockResults = currentQuestion.testCases.map((testCase, index) => ({
        passed: Math.random() > 0.3,
        message: testCase.hidden
          ? 'Hidden test case'
          : `Test case ${index + 1}: ${testCase.input}`,
      }));
      setTestResults(mockResults);
      setIsRunning(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        router.push(`/interviews/${interviewId}/feedback`);
      }
    }, 1500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'medium':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      case 'hard':
        return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div
        className={`border-b ${
          theme === 'dark'
            ? 'border-gray-700 bg-gray-800'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <h1
                className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Live Coding Interview
              </h1>
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <div className='flex items-center space-x-4'>
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  timeLeft <= 300
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                }`}
              >
                <Clock className='w-4 h-4' />
                <span className='font-mono text-sm font-medium'>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleEndInterview}
                disabled={isInterviewEnding}
                className='flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 bg-transparent'
              >
                <LogOut className='w-4 h-4' />
                <span>{isInterviewEnding ? 'Ending...' : 'End Interview'}</span>
              </Button>
              <span
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto p-4'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]'>
          <div className='space-y-4'>
            <Card
              className={
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }
            >
              <CardHeader>
                <CardTitle
                  className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {currentQuestion.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4
                    className={`font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Description
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {currentQuestion.description}
                  </p>
                </div>

                <div>
                  <h4
                    className={`font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Constraints
                  </h4>
                  <ul
                    className={`text-sm space-y-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {currentQuestion.constraints.map((constraint, index) => (
                      <li key={index} className='flex items-start'>
                        <span className='mr-2'>•</span>
                        <span>{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4
                    className={`font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Examples
                  </h4>
                  <div className='space-y-3'>
                    {currentQuestion.examples.map((example, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className='space-y-1'>
                          <div>
                            <span
                              className={`text-xs font-medium ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              Input:
                            </span>
                            <code
                              className={`ml-2 text-xs ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {example.input}
                            </code>
                          </div>
                          <div>
                            <span
                              className={`text-xs font-medium ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              Output:
                            </span>
                            <code
                              className={`ml-2 text-xs ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div>
                              <span
                                className={`text-xs font-medium ${
                                  theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                }`}
                              >
                                Explanation:
                              </span>
                              <span
                                className={`ml-2 text-xs ${
                                  theme === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                }`}
                              >
                                {example.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                }
                disabled={currentQuestionIndex === 0}
                className='flex items-center space-x-2'
              >
                <ChevronLeft className='w-4 h-4' />
                <span>Previous</span>
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(questions.length - 1, currentQuestionIndex + 1)
                  )
                }
                disabled={currentQuestionIndex === questions.length - 1}
                className='flex items-center space-x-2'
              >
                <span>Next</span>
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>

          <div className='space-y-4'>
            <Card
              className={`h-full ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <CardTitle
                      className={`text-lg ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Code Editor
                    </CardTitle>
                    <Select
                      value={selectedLanguage}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className='w-32'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleRunTests}
                      disabled={isRunning}
                      className='flex items-center space-x-2 bg-transparent'
                    >
                      <Play className='w-4 h-4' />
                      <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
                    </Button>
                    <Button
                      size='sm'
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className='flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white'
                    >
                      <Send className='w-4 h-4' />
                      <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-0 h-[calc(100%-80px)]'>
                <div className='h-2/3 border-b border-gray-200 dark:border-gray-700'>
                  <Editor
                    height='100%'
                    defaultLanguage={selectedLanguage}
                    language={selectedLanguage}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                <div className='h-1/3 p-4 overflow-y-auto'>
                  <h4
                    className={`font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Test Results
                  </h4>
                  {testResults.length === 0 ? (
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Run tests to see results
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 p-2 rounded text-sm ${
                            result.passed
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {result.passed ? (
                            <CheckCircle className='w-4 h-4' />
                          ) : (
                            <XCircle className='w-4 h-4' />
                          )}
                          <span>{result.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
