import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { UploadRouter } from "./server";

export const { useUploadThing } = generateReactHelpers<UploadRouter>();
