import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import { mergeEnvLocalFromDisk } from "./src/lib/server/merge-env-local";

const projectRoot = process.cwd();
loadEnvConfig(projectRoot);
mergeEnvLocalFromDisk(projectRoot);

const nextConfig: NextConfig = {};

export default nextConfig;
