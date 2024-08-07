/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: (req, res) => {
      const scriptNonce = crypto.randomBytes(16).toString('base64');
      const styleNonce = crypto.randomBytes(16).toString('base64');
      res.setHeader('script-nonce', scriptNonce);
      res.setHeader('style-nonce', styleNonce);
      return `
        script-src 'nonce-${scriptNonce}' 'strict-dynamic' https: 'unsafe-eval' blob:;
        img-src 'self' https://*.googleapis.com https://*.gstatic.com *.google.com *.googleusercontent.com data:;
        frame-src *.google.com;
        connect-src 'self' https://*.googleapis.com *.google.com https://*.gstatic.com data: blob:;
        font-src https://fonts.gstatic.com;
        style-src 'nonce-${styleNonce}' https://fonts.googleapis.com;
        worker-src blob:;
      `.replace(/\n/g, '');}
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
