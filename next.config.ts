import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  /* config options here */
   turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
