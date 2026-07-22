import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Repo has an outer lockfile (the Solana project); pin the workspace root
  // to this app so Turbopack doesn't infer the parent directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
