// import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/*",
      },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

// export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(
//   nextConfig,
// );

export default nextConfig;
