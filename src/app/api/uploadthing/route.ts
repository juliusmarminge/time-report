import { createRouteHandler } from "uploadthing/next";

import { uploadRouter } from "~/uploadthing/server";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
  config: { handleDaemonPromise: "await" },
});
