import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/negocios-locais",
  assetPrefix: "/negocios-locais",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
