import type { NextConfig } from "next";

// Static export for GitHub Pages. The repo is SU-SWS/WHM-proto, so the site
// lives at https://su-sws.github.io/WHM-proto/.
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/WHM-proto",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
