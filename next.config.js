import withBundleAnalyzer from "@next/bundle-analyzer";

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
})({
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    ppr: true,
    instrumentationHook: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/*",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /@opentelemetry(.*)/ }];
    }
    return config;
  },
});
