/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: process.env.NG_ALLOWED_HOSTS
    ? process.env.NG_ALLOWED_HOSTS.split(",").map((h) => h.trim())
    : undefined,
};

export default nextConfig;
