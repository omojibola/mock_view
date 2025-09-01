export const appConfig = {
  name: 'MockView',
  description: 'Practice interviews with AI or real people',
  url: process.env.NEXT_PUBLIC_APP_URL,
  api: {
    baseUrl: '/api',
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        profile: '/api/auth/profile',
      },
      interviews: {
        create: '/api/interviews',
        list: '/api/interviews',
        get: '/api/interviews/:id',
      },
    },
  },
  auth: {
    sessionCookieName: 'interview-ace-session',
    redirects: {
      afterLogin: '/dashboard',
      afterLogout: '/',
      afterRegister: '/onboarding',
    },
  },
} as const;

export type AppConfig = typeof appConfig;
