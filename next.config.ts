import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    // 기존 정적 사이트 URL 보존 (도메인이 그대로 유지되므로 필수)
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/practice-areas.html", destination: "/practice-areas", permanent: true },
      { source: "/staff.html", destination: "/staff", permanent: true },
      { source: "/location.html", destination: "/location", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
