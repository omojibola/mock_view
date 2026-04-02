'use client';

import { useRouter } from 'next/navigation';
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
import { useAuth } from '@/lib/hooks/useAuth';

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

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
              Mock interviews for neurodivergent candidates
            </Badge>
            <h1 className='text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl fade-in-element'>
              Practice interviews in a way that feels{' '}
              <span className='text-cyan-400'>fair, calm, and safe</span>
            </h1>
            <p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl fade-in-element'>
            MockView helps neurodivergent candidates build confidence with fair feedback, low-stress practice, and tools that support them without taking control away.
            </p>
            <div className='mt-10 flex flex-col sm:flex-row gap-4 justify-center fade-in-element'>
              <Button
                size='lg'
                className='bg-white text-black hover:bg-gray-100 rounded-full text-sm px-8 py-6 z-50'
                onClick={() =>
                  isAuthenticated
                    ? router.push('/dashboard')
                    : router.push('/auth')
                }
              >
                Get Started Now
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='text-sm px-8 py-6 bg-transparent rounded-full'
                onClick={() =>
                  window.open(
                    'https://www.loom.com/share/b0f1e42a58e44a65a0b0c38515f6be4d?sid=cec91ce5-6fe7-4be7-9e09-321f0d771ba1',
                    '_blank'
                  )
                }
              >
                Watch Demo
              </Button>
            </div>
            <div className='mt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground fade-in-element'>
              <div className='flex items-center'>
                <CheckCircle className='mr-2 h-4 w-4 text-secondary' />
                Confidence-first practice
              </div>
              <div className='flex items-center'>
                <CheckCircle className='mr-2 h-4 w-4 text-secondary' />
                Sensory-safe by design
              </div>
            </div>
          </div>
        </div>
        <div className='absolute top-1/2 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl float-animation pointer-events-none'></div>
        <div
          className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl float-animation pointer-events-none'
          style={{ animationDelay: '1s' }}
        ></div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-6 md:py-6'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center mb-16 fade-in-element'>
            <h2 className='text-3xl font-bold sm:text-4xl'>
              Built around six principles
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              Every part of the platform is designed to help neurodivergent
              candidates prepare without being pushed into generic interview
              norms that do not fit them.
            </p>
          </div>
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4'>
                  <TrendingUp className='h-6 w-6 text-white' />
                </div>
                <CardTitle>Confidence First</CardTitle>
                <CardDescription>
                  The goal is not to judge one bad session. It is to help users
                  see growth over time and feel safer returning for the next
                  practice round.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Confidence strands instead of one reductive score
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Evidence of progress across sessions
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Feedback that supports, not shames
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-4'>
                  <Shield className='h-6 w-6 text-white' />
                </div>
                <CardTitle>Bias Stripped</CardTitle>
                <CardDescription>
                  Interview feedback is shaped to reduce unfair assumptions and
                  focus on clarity, structure, and substance rather than style
                  conformity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    ND profile signals used to reduce bias in evaluation
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Focus on answer quality over presentation stereotypes
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Fairer comparisons across attempts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4'>
                  <Clock className='h-6 w-6 text-white' />
                </div>
                <CardTitle>Sensory Safe</CardTitle>
                <CardDescription>
                  The interview space avoids unnecessary pressure and gives the
                  user room to regulate, pause, and keep going when ready.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Pause and breathe without penalty
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Safe exit that records progress without guilt
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    A calm “take your time” practice environment
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4'>
                  <Zap className='h-6 w-6 text-white' />
                </div>
                <CardTitle>Autonomy &amp; Control</CardTitle>
                <CardDescription>
                  Users can control how they prepare, how they respond, and how
                  much support they want in the moment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Scratchpad for private preparation
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    On-demand prompts like STAR and keywords
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Plain-English question breakdowns when needed
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4'>
                  <Target className='h-6 w-6 text-white' />
                </div>
                <CardTitle>Strengths-Led</CardTitle>
                <CardDescription>
                  The platform looks for what is working, then helps the user
                  build from that instead of centering only deficits.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Highlights specificity, structure, and insight
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Shows best session, average, and range
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Encourages deserved confidence with evidence
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='relative overflow-hidden border-2 hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 fade-in-element'>
              <CardHeader>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4'>
                  <Brain className='h-6 w-6 text-white' />
                </div>
                <CardTitle>Psychological Safety</CardTitle>
                <CardDescription>
                  Practice should feel survivable. Users need room to try, miss,
                  recover, and come back without feeling punished.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    No leaderboard or public comparison
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    Gentle framing around progress and setbacks
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-white' />
                    A practice flow designed to be returned to
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
              Practice across the interview formats that matter
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              Build familiarity with different interview demands while keeping
              the experience grounded in clarity and support.
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
                  Coding, systems, and technical explanation practice without
                  the usual rush.
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
                  Story-based answers, leadership examples, and structured
                  reflection.
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
                  Analytical thinking, tradeoffs, and communicating a process
                  clearly.
                </p>
              </CardContent>
            </Card>
            <Card className='text-center hover:border-cyan-400/30 hover:bg-purple-500/5 transition-all duration-300 fade-in-element'>
              <CardContent className='pt-6'>
                <div className='h-12 w-12 flex items-center justify-center mx-auto mb-4'>
                  <Shield className='h-6 w-6 text-white' />
                </div>
                <h3 className='font-semibold mb-2'>Situational Interviews</h3>
                <p className='text-sm text-muted-foreground'>
                  Hypothetical scenarios that test judgement, priorities, and
                  decision-making.
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
                Progress tracking that supports belief, not pressure
              </h2>
              <p className='text-lg text-muted-foreground mb-8'>
                Users need evidence that their confidence is deserved. The
                dashboard shows how self-belief, completion, consistency, and
                performance move over time without reducing the person to one
                number.
              </p>
              <div className='space-y-4'>
                <div className='flex items-center'>
                  <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3'>
                    <BarChart3 className='h-4 w-4 text-primary' />
                  </div>
                  <span className='text-sm'>
                    Confidence and performance shown as separate signals
                  </span>
                </div>
                <div className='flex items-center'>
                  <div className='h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center mr-3'>
                    <Clock className='h-4 w-4 text-white' />
                  </div>
                  <span className='text-sm'>
                    Safe exits and pauses treated as useful progress data
                  </span>
                </div>
                <div className='flex items-center'>
                  <div className='h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center mr-3'>
                    <Award className='h-4 w-4 text-accent' />
                  </div>
                  <span className='text-sm'>
                    Floor, average, and best-session context over time
                  </span>
                </div>
              </div>
            </div>
            <div className='relative fade-in-element'>
              <div className='bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Latest confidence view</span>
                    <span className='text-2xl font-bold text-primary'>Steady</span>
                  </div>
                  <div className='space-y-3'>
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Self-belief</span>
                        <span>68%</span>
                      </div>
                      <div className='w-full bg-gray-800 rounded-full h-2'>
                        <div
                          className='bg-primary h-2 rounded-full'
                          style={{ width: '68%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Performance</span>
                        <span>81%</span>
                      </div>
                      <div className='w-full bg-gray-800 rounded-full h-2'>
                        <div
                          className='bg-white h-2 rounded-full'
                          style={{ width: '81%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Completion</span>
                        <span>75%</span>
                      </div>
                      <div className='w-full bg-gray-800 rounded-full h-2'>
                        <div
                          className='bg-accent h-2 rounded-full'
                          style={{ width: '75%' }}
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
              Built for people who need a safer way to practise
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              The goal is not to simulate pressure for its own sake. It is to
              help people prepare well enough that real interviews feel more
              manageable.
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
                  &apos;The most helpful part was that one bad session did not
                  make me feel like I had failed. I could actually see what was
                  improving underneath the nerves.&apos;
                </p>
                <div className='flex items-center'>
                  <div className='h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold'>
                    S
                  </div>
                  <div className='ml-3'>
                    <p className='font-semibold text-sm'>Product designer</p>
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
                  &apos;Being able to pause, take notes, and ask what a question
                  really meant made the platform feel usable for my brain, not
                  just impressive on paper.&apos;
                </p>
                <div className='flex items-center'>
                  <div className='h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-semibold'>
                    D
                  </div>
                  <div className='ml-3'>
                    <p className='font-semibold text-sm'>Frontend engineer</p>
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
                  &apos;I scored well before I felt confident, and the platform
                  helped me notice that gap instead of assuming I was doing
                  badly. That changed how I approached interviews.&apos;
                </p>
                <div className='flex items-center'>
                  <div className='h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-semibold'>
                    A
                  </div>
                  <div className='ml-3'>
                    <p className='font-semibold text-sm'>Data analyst</p>
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
              Start practising in a way that respects how you work
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              Build confidence with bias-aware, sensory-safe mock interviews
              designed for neurodivergent candidates.
            </p>
            <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                size='lg'
                className='bg-white text-black hover:bg-gray-100 rounded-full text-sm px-8 py-6'
                onClick={() => router.push('/auth')}
              >
                Start Free Today
                <ArrowRight className='ml-2 h-5 w-5' />
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
                Mock interviews for neurodivergent candidates, built around
                confidence, fairness, and psychological safety.
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
                    Confidence tracking
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Bias-stripped feedback
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Sensory-safe sessions
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Session history
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
            <p>&copy; 2025 MockView. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
