import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { UploadRouter } from "~/app/api/uploadthing/router";

export const { useUploadThing } = generateReactHelpers<UploadRouter>();

export const { UploadButton, UploadDropzone } =
  generateComponents<UploadRouter>();
