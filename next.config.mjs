/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self'; 
      img-src 'self' https://res.cloudinary.com https://*.googleapis.com https://*.gstatic.com *.google.com *.googleusercontent.com data:; 
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload-widget.cloudinary.com https://*.googleapis.com https://*.gstatic.com *.google.com https://*.ggpht.com *.googleusercontent.com blob:;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      connect-src 'self' https://*.googleapis.com *.google.com https://*.gstatic.com data: blob:;
      object-src 'none'; 
      frame-ancestors 'none'; 
      font-src https://fonts.gstatic.com;
      base-uri 'self'; 
      frame-src 'self' https://upload-widget.cloudinary.com *.google.com;
      worker-src blob:;
    `,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'no-referrer',
  },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), microphone=()',
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.gettyimages.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
