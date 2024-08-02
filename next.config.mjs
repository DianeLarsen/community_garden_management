/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    BASE_URL: process.env.NODE_ENV === 'production'
      ? 'https://community-garden-management-975d65cae5d8.herokuapp.com'
      : 'http://localhost:3000',
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
