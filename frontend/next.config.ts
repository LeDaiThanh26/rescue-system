import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Leaflet is incompatible with React 19 Strict Mode's double-invocation
  // of effects in dev (causes "Map container is already initialized" error)
  reactStrictMode: false,
};

export default nextConfig;
