import type { NextRequest } from "next/server";
import { createNextRouteHandler } from "uploadthing/next";

import { uploadRouter } from "./router";

export const { GET, POST } = createNextRouteHandler({
  router: uploadRouter,
  config: {
    callbackUrl: "https://ut-staging.ngrok.app",
  },
});
