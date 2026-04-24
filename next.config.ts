import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
	allowedDevOrigins: ["192.168.15.105"],
	turbopack: {
		root: projectRoot,
	},
};

export default nextConfig;
