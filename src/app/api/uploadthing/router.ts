import type { FileRouter } from "uploadthing/next";
import { createUploadthing } from "uploadthing/next";

import { currentUser } from "~/lib/auth";

const f = createUploadthing();

export const uploadRouter = {
  clientImage: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "2MB",
      acl: "public-read"
    },
  })
    .middleware(async () => {
      const user = await currentUser();
      if (!user) {
        throw new Error("You must be logged in to upload images.");
      }
      console.log(`User ${user.id} is uploading a file`);
      return {};
    })
    .onUploadComplete((file) => {
      console.log("Uploaded file:", file);
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
