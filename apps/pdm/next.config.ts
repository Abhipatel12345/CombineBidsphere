import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/project-management',
  async redirects() {
    return [
      {
        source: '/bom',
        destination: '/warehouse',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
