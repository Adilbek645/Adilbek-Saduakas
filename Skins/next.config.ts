import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Загрузка картин / видео / файлов как вложений блога и обложек скинов.
      bodySizeLimit: "14mb",
    },
  },
};

export default nextConfig;
