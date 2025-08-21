'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Shield,
  Clock,
  Award,
  BarChart3,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import Header from '@/components/header/header';
import Logo from '@/components/logo/logo';

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.fade-in-element');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className='min-h-screen bg-background'>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .fade-in-element {
          opacity: 0;
          transform: translateY(30px);
        }

        .scroll-animation {
          animation: scroll 30s linear infinite;
        }
      `}</style>

      <Header />
      {/* Hero Section */}
      <section className='relative overflow-hidden py-20 md:py-32 bg-background'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative'>
          <div className='mx-auto max-w-4xl text-center'>
            <Badge
              variant='secondary'
              className='mb-6 px-4 py-2 fade-in-element'
            >
              <Sparkles className='mr-2 h-4 w-4' />
              AI-Powered Interview Practice
            </Badge>
            <h1 className='text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl fade-in-element'>
              Master Your Next <span className='text-cyan-400'>Interview</span>
            </h1>
            <p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl fade-in-element'>
              Practice with AI interviewers or connect with real professionals.
              Get instant feedback, build confidence, and land your dream job.
            </p>
            <div className='mt-10 flex flex-col sm:flex-row gap-4 justify-center fade-in-element'>
              <Button
                size='lg'
                className='bg-white text-black hover:bg-gray-100 rounded-full text-lg px-8 py-6'
              >
                Start Free Practice
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='text-lg px-8 py-6 bg-transparent rounded-full'
              >
                Watch Demo
              </Button>
            </div>
            <div className='mt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground fade-in-element'>
              <div className='flex items-center'>
                <CheckCircle className='mr-2 h-4 w-4 text-secondary' />
                No credit card required
              </div>
              <div className='flex items-center'>
                <CheckCircle className='mr-2 h-4 w-4 text-secondary' />
                Free forever plan
              </div>
            </div>
          </div>
        </div>
        <div className='absolute top-1/2 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl float-animation'></div>
        <div
          className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl float-animation'
          style={{ animationDelay: '1s' }}
        ></div>
      </section>

      <section className='py-12 border-b'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <p className='text-center text-sm text-muted-foreground mb-8 fade-in-element'>
            Trusted by professionals from leading companies
          </p>
          <div className='relative overflow-hidden'>
            <div className='flex space-x-12 scroll-animation'>
              {/* First set of logos */}
              <div className='flex items-center space-x-12 min-w-max'>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Google
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Microsoft
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Apple
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Meta
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Netflix
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Amazon
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Tesla
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Spotify
                </div>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className='flex items-center space-x-12 min-w-max'>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Google
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Microsoft
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Apple
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Meta
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Netflix
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Amazon
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Tesla
                </div>
                <div className='text-2xl font-bold text-muted-foreground/60'>
                  Spotify
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-20 md:py-32'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center mb-16 fade-in-element'>
            <h2 className='text-3xl font-bold sm:text-4xl'>
              Everything you need to ace your interview
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              Choose your practice style and get personalized feedback to
              improve your performance
            </p>
          </div>
          <div className='grid gap-8 md:grid-cols-3'>
            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4'>
                  <Brain className='h-6 w-6 text-white' />
                </div>
                <CardTitle>AI-Powered Interviews</CardTitle>
                <CardDescription>
                  Practice with our advanced AI that adapts to your responses
                  and provides realistic interview scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Unlimited practice sessions
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Industry-specific questions
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Real-time feedback
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-4'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <CardTitle>Real Human Interviewers</CardTitle>
                <CardDescription>
                  Connect with experienced professionals from your industry for
                  authentic interview practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Verified industry experts
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Personalized coaching
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Network building
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4'>
                  <Zap className='h-6 w-6 text-white' />
                </div>
                <CardTitle>Instant Feedback</CardTitle>
                <CardDescription>
                  Get detailed analysis of your performance with actionable
                  insights to improve your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Speech analysis
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Body language tips
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Progress tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interview Types Section */}
      <section className='py-20 md:py-32 bg-muted/30'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center mb-16 fade-in-element'>
            <h2 className='text-3xl font-bold sm:text-4xl'>
              Practice Any Interview Type
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              From technical coding interviews to behavioral questions, we've
              got you covered
            </p>
          </div>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='text-center hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 fade-in-element'>
              <CardContent className='pt-6'>
                <div className='h-12 w-12 flex items-center justify-center mx-auto mb-4'>
                  <Target className='h-6 w-6 text-white' />
                </div>
                <h3 className='font-semibold mb-2'>Technical Interviews</h3>
                <p className='text-sm text-muted-foreground'>
                  Coding challenges, system design, and technical problem
                  solving
                </p>
              </CardContent>
            </Card>
            <Card className='text-center hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 fade-in-element'>
              <CardContent className='pt-6'>
                <div className='h-12 w-12 flex items-center justify-center mx-auto mb-4'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <h3 className='font-semibold mb-2'>Behavioral Interviews</h3>
                <p className='text-sm text-muted-foreground'>
                  STAR method, leadership scenarios, and culture fit questions
                </p>
              </CardContent>
            </Card>
            <Card className='text-center hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 fade-in-element'>
              <CardContent className='pt-6'>
                <div className='h-12 w-12 flex items-center justify-center mx-auto mb-4'>
                  <TrendingUp className='h-6 w-6 text-white' />
                </div>
                <h3 className='font-semibold mb-2'>Case Studies</h3>
                <p className='text-sm text-muted-foreground'>
                  Business cases, consulting scenarios, and analytical thinking
                </p>
              </CardContent>
            </Card>
            <Card className='text-center hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 fade-in-element'>
              <CardContent className='pt-6'>
                <div className='h-12 w-12 flex items-center justify-center mx-auto mb-4'>
                  <Shield className='h-6 w-6 text-white' />
                </div>
                <h3 className='font-semibold mb-2'>Executive Interviews</h3>
                <p className='text-sm text-muted-foreground'>
                  C-level positions, board presentations, and strategic thinking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance Analytics Section */}
      <section className='py-20 md:py-32'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-12 lg:grid-cols-2 items-center'>
            <div className='fade-in-element'>
              <h2 className='text-3xl font-bold sm:text-4xl mb-6'>
                Track Your Progress with Advanced Analytics
              </h2>
              <p className='text-lg text-muted-foreground mb-8'>
                Get detailed insights into your interview performance with our
                comprehensive analytics dashboard. Monitor your improvement over
                time and identify areas that need more practice.
              </p>
              <div className='space-y-4'>
                <div className='flex items-center'>
                  <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3'>
                    <BarChart3 className='h-4 w-4 text-primary' />
                  </div>
                  <span className='text-sm'>
                    Performance scoring across different question types
                  </span>
                </div>
                <div className='flex items-center'>
                  <div className='h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center mr-3'>
                    <Clock className='h-4 w-4 text-white' />
                  </div>
                  <span className='text-sm'>
                    Response time analysis and optimization tips
                  </span>
                </div>
                <div className='flex items-center'>
                  <div className='h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center mr-3'>
                    <Award className='h-4 w-4 text-accent' />
                  </div>
                  <span className='text-sm'>
                    Confidence level tracking and improvement metrics
                  </span>
                </div>
              </div>
            </div>
            <div className='relative fade-in-element'>
              <div className='bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      Overall Performance
                    </span>
                    <span className='text-2xl font-bold text-primary'>87%</span>
                  </div>
                  <div className='space-y-3'>
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Technical Questions</span>
                        <span>92%</span>
                      </div>
                      <div className='w-full bg-gray-800 rounded-full h-2'>
                        <div
                          className='bg-primary h-2 rounded-full'
                          style={{ width: '92%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Behavioral Questions</span>
                        <span>85%</span>
                      </div>
                      <div className='w-full bg-gray-800 rounded-full h-2'>
                        <div
                          className='bg-white h-2 rounded-full'
                          style={{ width: '85%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Communication Skills</span>
                        <span>78%</span>
                      </div>
                      <div className='w-full bg-gray-800 rounded-full h-2'>
                        <div
                          className='bg-accent h-2 rounded-full'
                          style={{ width: '78%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id='testimonials' className='py-20 md:py-32 bg-muted/30'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center mb-16 fade-in-element'>
            <h2 className='text-3xl font-bold sm:text-4xl'>
              Loved by job seekers worldwide
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              Join thousands who have landed their dream jobs with InterviewAce
            </p>
          </div>
          <div className='grid gap-8 md:grid-cols-3'>
            <Card className='border-0 shadow-lg fade-in-element'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-4 w-4 fill-accent text-accent' />
                  ))}
                </div>
                <p className='text-sm mb-4'>
                  "InterviewAce helped me prepare for my Google interview. The
                  AI feedback was incredibly detailed and helped me identify
                  areas I never knew I needed to work on."
                </p>
                <div className='flex items-center'>
                  <div className='h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold'>
                    S
                  </div>
                  <div className='ml-3'>
                    <p className='font-semibold text-sm'>Sarah Chen</p>
                    <p className='text-xs text-muted-foreground'>
                      Software Engineer at Google
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg fade-in-element'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-4 w-4 fill-accent text-accent' />
                  ))}
                </div>
                <p className='text-sm mb-4'>
                  "The human interviewer feature is amazing! I got to practice
                  with a real hiring manager from my target company. It made all
                  the difference."
                </p>
                <div className='flex items-center'>
                  <div className='h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-semibold'>
                    M
                  </div>
                  <div className='ml-3'>
                    <p className='font-semibold text-sm'>Marcus Johnson</p>
                    <p className='text-xs text-muted-foreground'>
                      Product Manager at Meta
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg fade-in-element'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-4 w-4 fill-accent text-accent' />
                  ))}
                </div>
                <p className='text-sm mb-4'>
                  "I was nervous about interviews, but InterviewAce built my
                  confidence. The progress tracking showed me how much I
                  improved over time."
                </p>
                <div className='flex items-center'>
                  <div className='h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-semibold'>
                    A
                  </div>
                  <div className='ml-3'>
                    <p className='font-semibold text-sm'>Aisha Patel</p>
                    <p className='text-xs text-muted-foreground'>
                      Data Scientist at Netflix
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 md:py-32 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center fade-in-element'>
            <h2 className='text-3xl font-bold sm:text-4xl'>
              Ready to ace your next interview?
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              Join thousands of successful job seekers who trust InterviewAce
            </p>
            <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                size='lg'
                className='bg-white text-black hover:bg-gray-100 rounded-full text-lg px-8 py-6'
              >
                Start Free Today
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='text-lg px-8 py-6 bg-transparent rounded-full'
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t bg-muted/30'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
          <div className='grid gap-8 md:grid-cols-4'>
            <div>
              <Logo />
              <p className='text-sm text-muted-foreground'>
                Master your interviews with AI-powered practice and real human
                feedback.
              </p>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Product</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    AI Interviews
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Human Interviews
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Feedback
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Analytics
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Company</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Support</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t mt-8 pt-8 text-center text-sm text-muted-foreground'>
            <p>&copy; 2024 InterviewAce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
