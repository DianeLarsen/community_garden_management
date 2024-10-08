/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload-widget.cloudinary.com https://maps.googleapis.com https://*.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' https://res.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://lh3.ggpht.com data:;
    connect-src 'self' https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com;
    font-src 'self' https://fonts.gstatic.com data:;
    frame-src https://*.google.com https://upload-widget.cloudinary.com;
    worker-src blob:;
  `.replace(/\n/g, ' '),
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
