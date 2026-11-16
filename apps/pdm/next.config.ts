import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/project-management',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/project-management/dashboard',
        basePath: false,
        permanent: false,
      },
      {
        source: '/bom',
        destination: '/warehouse',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
