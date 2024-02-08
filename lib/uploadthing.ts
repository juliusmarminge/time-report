import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { UploadRouter } from "~/app/api/uploadthing/router";

export const { useUploadThing } = generateReactHelpers<UploadRouter>();