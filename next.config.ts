// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/////////////////////////



// next.config.ts
// import type { NextConfig } from "next";
// /** @type {import('next').NextConfig} */
// const nextConfig: NextConfig = {
//   reactStrictMode: false,
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "", // Pozostaw puste, jeśli nie używasz niestandardowego portu
        pathname: "/**", // Pozwala na wszystkie ścieżki w tej domenie
      },
    ],
  },
};

export default nextConfig;