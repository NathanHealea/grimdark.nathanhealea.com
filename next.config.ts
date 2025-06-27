import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: true, // Only for production debugging, use with caution!
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows any hostname
        // pathname: "**", // Allows any pathname (optional, and usually implied by hostname: "**")
      },
    ],
  },
}

export default nextConfig
