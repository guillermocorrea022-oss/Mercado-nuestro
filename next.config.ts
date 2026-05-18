import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ujvzbyzxfllczvoiywap.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Placeholders usados en seed de desarrollo. Quitar cuando subamos
      // imágenes reales a Supabase Storage.
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Generador público de QR (usado en el botón compartir).
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
};

export default nextConfig;
