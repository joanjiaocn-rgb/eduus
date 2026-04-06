/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        https: false,
        http: false,
        path: false,
        os: false,
        stream: false,
        zlib: false,
        crypto: false,
      };
      // Handle node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:fs': false,
        'node:fs/promises': false,
        'node:path': false,
        'node:os': false,
        'node:crypto': false,
        'node:stream': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:net': false,
        'node:tls': false,
        'node:url': false,
        'node:util': false,
        'node:buffer': false,
        'node:events': false,
        'node:assert': false,
        'node:process': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
