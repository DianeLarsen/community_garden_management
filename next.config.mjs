/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://upload-widget.cloudinary.com https://maps.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' https://res.cloudinary.com https://maps.gstatic.com;
    connect-src 'self' https://maps.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    frame-ancestors 'none';
  `,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer",
  },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=()",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.gettyimages.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
