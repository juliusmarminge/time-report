import { generateReactHelpers } from "@uploadthing/react";

import type { UploadRouter } from "./server";

export const { useUploadThing } = generateReactHelpers<UploadRouter>();
