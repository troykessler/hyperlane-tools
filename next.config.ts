import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Polyfill buffer for browser
      buffer: 'buffer',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfill buffer for client-side (fallback for webpack mode)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer'),
      };

      // Add ProvidePlugin to inject Buffer globally
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
