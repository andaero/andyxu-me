import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Allows a second parallel `next dev` (e.g. NEXT_DIST_DIR=.next-claude next dev --port 4000)
  // without fighting over the .next/dev lock.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
