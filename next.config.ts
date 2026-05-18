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
    ],
  },
};

export default nextConfig;
