import type { FileRouter } from "uploadthing/next";
import { createUploadthing } from "uploadthing/next";
import { UTApi, UploadThingError } from "uploadthing/server";

import { auth, currentUser } from "~/auth";
import { db, e } from "~/edgedb";

export const utapi = new UTApi({
  // logLevel: "debug",
});

export const deleteImageIfExists = async (image?: string | null) => {
  const imageKey = image?.split("/f/")[1];
  if (imageKey) {
    await utapi.deleteFiles([imageKey]);
  }
};

const f = createUploadthing({
  errorFormatter: (err) => {
    console.log("Error", err);
    return { message: err.message };
  },
});

export const uploadRouter = {
  clientImage: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "2MB",
      acl: "public-read",
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
  profilePicture: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
      additionalProperties: {
        width: 200,
        aspectRatio: 1,
      },
    },
  })
    .middleware(async () => {
      const user = (await auth())?.user;
      if (!user) throw new UploadThingError("Unauthorized");

      const currentImageKey = user.image?.split("/f/")[1];

      return { userId: user.id, currentImageKey };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      /**
       * Update the user's image in the database
       */
      await e
        .update(e.User, () => ({
          set: { image: file.url },
          filter_single: e.op(e.User.id, "=", e.uuid(metadata.userId)),
        }))
        .run(db);

      /**
       * Delete the old image if it exists
       */
      if (metadata.currentImageKey) {
        await utapi.deleteFiles(metadata.currentImageKey);
      }
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
