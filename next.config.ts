import type { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/dist/shared/lib/constants'

export default (phase, { defaultConfig }: { defaultConfig: NextConfig }) => {
  const sharedConfig: NextConfig = {
    productionBrowserSourceMaps: true, // Only for production debugging, use with caution!
    images: {
      remotePatterns: [
        {
          protocol: 'https', // Allows both HTTP and HTTPS protocols
          hostname: '**', // Allows any hostname
          // pathname: "**", // Allows any pathname (optional, and usually implied by hostname: "**")
        },
      ],
    },
    experimental: {
      serverActions: {
        bodySizeLimit: '100mb',
      },
    },
  }

  // Cpnfiguration for development server
  if (phase == PHASE_DEVELOPMENT_SERVER) {
    return {
      ...defaultConfig,
      ...sharedConfig,
      images: {
        remotePatterns: [
          {
            protocol: 'https', // Allows both HTTP and HTTPS protocols
            hostname: '**', // Allows any hostname
            // pathname: "**", // Allows any pathname (optional, and usually implied by hostname: "**")
          },
          {
            protocol: 'http', // Allows both HTTP and HTTPS protocols
            hostname: '**', // Allows any hostname
            // pathname: "**", // Allows any pathname (optional, and usually implied by hostname: "**")
          },
        ],
      },
    } as NextConfig
  }

  // Configuration for production server
  return {
    ...defaultConfig,
    ...sharedConfig,
  }
}
