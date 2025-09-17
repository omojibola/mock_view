import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  serverExternalPackages: ['pdfkit', 'pdf-parse'],
};

export default nextConfig;
