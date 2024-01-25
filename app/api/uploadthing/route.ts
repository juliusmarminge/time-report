import { createNextRouteHandler } from "uploadthing/next";

import { uploadRouter } from "./router";

export const { GET, POST } = createNextRouteHandler({
  router: uploadRouter,
  config: {
    logLevel: "debug",
  },
});
