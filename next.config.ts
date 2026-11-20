import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/config";

// Static export for GitHub Pages. The repo is SU-SWS/WHM-proto, so the site
// lives at https://su-sws.github.io/WHM-proto/.
const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
