import bundleAnalyzer from "@next/bundle-analyzer";
import nextMdx from "@next/mdx";

// @ts-expect-error - no types
import { remarkRehypeWrap } from "remark-rehype-wrap";

const withMdx = nextMdx({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      [
        remarkRehypeWrap,
        {
          node: { type: "element", tagName: "article" },
          start: "element[tagName=hr]",
          transform: (
            /** @type {{ children: any[]; properties: any; }} */ article,
          ) => {
            article.children.splice(0, 1);
            const heading = article.children.find((n) => n.tagName === "h2");
            article.properties = {
              ...heading.properties,
              title: String(heading),
            };
            heading.properties = {};
            return article;
          },
        },
      ],
    ],
  },
});

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

export default withBundleAnalyzer(
  withMdx({
    eslint: { ignoreDuringBuilds: true },
    pageExtensions: ["ts", "tsx", "mdx"],
    serverExternalPackages: ["@trpc/server"],
    experimental: {
      reactCompiler: true,
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
        config.ignoreWarnings = [{ module: /opentelemetry/ }];
      }
      return config;
    },
  }),
);
