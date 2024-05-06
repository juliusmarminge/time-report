export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { BaselimeSDK, VercelPlugin, BetterHttpInstrumentation } =
      await import("@baselime/node-opentelemetry");

    const sdk = new BaselimeSDK({
      serverless: true,
      service:
        process.env.NODE_ENV === "production"
          ? "time-report"
          : "time-report-dev",
      instrumentations: [
        new BetterHttpInstrumentation({
          plugins: [
            // Add the Vercel plugin to enable correlation between your logs and traces for projects deployed on Vercel
            new VercelPlugin(),
          ],
        }),
      ],
    });

    sdk.start();
  }
}
