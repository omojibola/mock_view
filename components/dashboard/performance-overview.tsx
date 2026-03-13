'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, HeartHandshake, Sparkles } from 'lucide-react';
import { useTheme } from '@/lib/contexts/theme-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DashboardConfidenceSummary } from '@/lib/types/interview.types';

interface PerformanceOverviewProps {
  data: DashboardConfidenceSummary | null;
  isLoading?: boolean;
}

const strandMeta = {
  completion: {
    label: 'Completion',
    color: '#f59e0b',
    icon: Activity,
    description: 'Sessions finished without exit',
  },
  consistency: {
    label: 'Consistency',
    color: '#60a5fa',
    icon: Sparkles,
    description: 'Performance stability across sessions',
  },
  selfBelief: {
    label: 'Self-belief',
    color: '#f472b6',
    icon: HeartHandshake,
    description: 'How you rated your own experience',
  },
} as const;

type StrandKey = keyof typeof strandMeta;

const defaultStrands: Record<StrandKey, boolean> = {
  completion: true,
  consistency: true,
  selfBelief: true,
};

export function PerformanceOverview({
  data,
  isLoading = false,
}: PerformanceOverviewProps) {
  const { theme } = useTheme();
  const [visibleStrands, setVisibleStrands] = useState(defaultStrands);

  const overlayData = useMemo(
    () =>
      data?.history.map((item) => ({
        ...item,
        confidenceGap:
          item.selfBelief !== null ? item.performance - item.selfBelief : null,
      })) || [],
    [data]
  );

  const toggleStrand = (key: StrandKey) => {
    setVisibleStrands((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  if (isLoading) {
    return (
      <Card
        className={
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200 shadow-sm'
        }
      >
        <CardContent className='flex min-h-72 items-center justify-center'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-cyan-400'></div>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Building your confidence view...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.latestSession) {
    return (
      <Card
        className={
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200 shadow-sm'
        }
      >
        <CardHeader>
          <CardTitle
            className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
          >
            Confidence Builder
          </CardTitle>
          <CardDescription
            className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          >
            Finish an interview and save your confidence check-in to unlock the
            strands view.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const latest = data.latestSession;

  return (
    <Card
      className={`overflow-hidden ${
        theme === 'dark'
          ? 'border-gray-800 bg-gray-950'
          : 'border-gray-200 bg-white shadow-sm'
      }`}
    >
      <CardContent className='space-y-8 p-6 lg:p-8'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400'>
              Confidence Builder
            </p>
            <h2
              className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Confidence has strands, not one score
            </h2>
            <p
              className={`mt-2 max-w-3xl text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              This view separates self-belief, behaviour, and performance so one
              hard session does not flatten your progress into a single number.
            </p>
          </div>

          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            <MetricPill
              label='Latest performance'
              value={`${latest.performance}%`}
              helper={latest.title}
              theme={theme}
            />
            <MetricPill
              label='Average'
              value={`${data.averagePerformance ?? latest.performance}%`}
              helper='Across recent sessions'
              theme={theme}
            />
            <MetricPill
              label='Floor'
              value={`${data.floorPerformance ?? latest.performance}%`}
              helper='Your current lower bound'
              theme={theme}
            />
            <MetricPill
              label='Ceiling'
              value={`${data.ceilingPerformance ?? latest.performance}%`}
              helper='Your current best evidence'
              theme={theme}
            />
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          {(Object.keys(strandMeta) as StrandKey[]).map((key) => {
            const meta = strandMeta[key];
            const Icon = meta.icon;
            return (
              <Button
                key={key}
                type='button'
                variant='outline'
                size='sm'
                onClick={() => toggleStrand(key)}
                className={`gap-2 ${
                  visibleStrands[key]
                    ? 'border-transparent text-white'
                    : theme === 'dark'
                    ? 'border-gray-700 text-gray-400'
                    : 'border-gray-300 text-gray-600'
                }`}
                style={
                  visibleStrands[key]
                    ? {
                        backgroundColor: meta.color,
                      }
                    : undefined
                }
              >
                <Icon className='h-3.5 w-3.5' />
                {meta.label}
              </Button>
            );
          })}
        </div>

        <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
          <div
            className={`rounded-2xl border p-5 ${
              theme === 'dark'
                ? 'border-gray-800 bg-gray-900'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className='mb-4'>
              <h3
                className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Strand trends
              </h3>
              <p
                className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Each line moves independently so growth can show up in more than
                one way.
              </p>
            </div>

            <div className='h-[320px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={data.history}
                  margin={{ top: 8, right: 24, bottom: 20, left: 8 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='label'
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    padding={{ left: 12, right: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    width={42}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(148,163,184,0.2)',
                      background:
                        theme === 'dark' ? 'rgba(2,6,23,0.95)' : 'rgba(255,255,255,0.96)',
                    }}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      if (!item) return label;
                      return `${item.title} • ${new Date(item.date).toLocaleDateString(
                        'en-GB',
                        { day: 'numeric', month: 'short' }
                      )}`;
                    }}
                  />
                  {(Object.keys(strandMeta) as StrandKey[]).map((key) =>
                    visibleStrands[key] ? (
                      <Line
                        key={key}
                        type='monotone'
                        dataKey={key}
                        name={strandMeta[key].label}
                        stroke={strandMeta[key].color}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    ) : null
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='space-y-6'>
            <div
              className={`rounded-2xl border p-5 ${
                theme === 'dark'
                  ? 'border-gray-800 bg-gray-900'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className='mb-4 flex items-start justify-between gap-4'>
                <div>
                  <h3
                    className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Confidence vs performance
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Evidence and self-belief can move differently. Seeing the
                    gap matters.
                  </p>
                </div>
                {data.mismatchCount > 0 ? (
                  <Badge className='bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400'>
                    {data.mismatchCount} low-confidence high-performance
                  </Badge>
                ) : null}
              </div>

              <div className='h-[220px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart
                    data={overlayData}
                    margin={{ top: 8, right: 24, bottom: 20, left: 8 }}
                  >
                    <defs>
                      <linearGradient
                        id='confidenceGapFill'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#22d3ee'
                          stopOpacity={0.35}
                        />
                        <stop
                          offset='95%'
                          stopColor='#22d3ee'
                          stopOpacity={0.04}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    <XAxis
                      dataKey='label'
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      padding={{ left: 12, right: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      width={42}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid rgba(148,163,184,0.2)',
                        background:
                          theme === 'dark' ? 'rgba(2,6,23,0.95)' : 'rgba(255,255,255,0.96)',
                      }}
                    />
                    <Area
                      type='monotone'
                      dataKey='confidenceGap'
                      name='Performance minus self-belief'
                      stroke='#22d3ee'
                      fill='url(#confidenceGapFill)'
                      strokeWidth={3}
                      connectNulls
                    />
                    <Line
                      type='monotone'
                      dataKey='confidenceGap'
                      name='Gap'
                      stroke='#22d3ee'
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className='grid gap-3'>
              {(Object.keys(strandMeta) as StrandKey[]).map((key) => (
                <div
                  key={key}
                  className={`rounded-2xl border p-4 ${
                    theme === 'dark'
                      ? 'border-gray-800 bg-gray-900'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: strandMeta[key].color }}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {strandMeta[key].label}
                      </p>
                      <p
                        className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {strandMeta[key].description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {data.mismatchInsight ? (
          <div
            className={`rounded-2xl border px-5 py-4 ${
              theme === 'dark'
                ? 'border-cyan-400/20 bg-cyan-400/10'
                : 'border-cyan-200 bg-cyan-50'
            }`}
          >
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500'>
              Notice the gap
            </p>
            <p
              className={`mt-2 text-sm ${
                theme === 'dark' ? 'text-cyan-50' : 'text-cyan-900'
              }`}
            >
              {data.mismatchInsight}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MetricPill({
  label,
  value,
  helper,
  theme,
}: {
  label: string;
  value: string;
  helper: string;
  theme: string;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        theme === 'dark'
          ? 'border-gray-800 bg-gray-900'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-500'>
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {helper}
      </p>
    </div>
  );
}
