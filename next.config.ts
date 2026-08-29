import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/estetica-saude",
  assetPrefix: "/estetica-saude",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
