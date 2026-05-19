import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Content-Security-Policy cho phép:
   * - OpenStreetMap tile servers (a/b/c.tile.openstreetmap.org)
   * - Nominatim geocoding API (nominatim.openstreetmap.org)
   * - Leaflet marker icons từ unpkg CDN
   * - GitHub raw (marker icon màu đỏ)
   * - localhost (AI gateway + backend API)
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.openstreetmap.org https://unpkg.com https://raw.githubusercontent.com https://tile.openstreetmap.org",
              "connect-src 'self' http://localhost http://localhost:* https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org",
              "frame-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
