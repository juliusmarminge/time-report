"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { useUploadThing } from "~/uploadthing/client";

import type { User } from "next-auth";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { toast } from "sonner";

import { generateMimeTypes } from "uploadthing/client";
import type { ExpandedRouteConfig } from "uploadthing/types";

import { updateUserImage } from "~/auth/actions";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { PhotoIcon } from "@heroicons/react/24/outline";

type FileWithPreview = File & { preview: string };

export function UpdateProfilePictureCard(props: { user: User }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<FileWithPreview | null>(null);
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedArea, setCroppedArea] = React.useState<Area | null>(null);
  const [newImageLoading, setNewImageLoading] = React.useState(false);

  const router = useRouter();
  const { isUploading, startUpload, routeConfig } = useUploadThing(
    "profilePicture",
    {
      skipPolling: true,
      onClientUploadComplete: async ([uploadedFile]) => {
        if (file) URL.revokeObjectURL(file.preview);
        setFile(null);

        setNewImageLoading(true);
        await Promise.all([
          updateUserImage(uploadedFile.url),
          waitForImageToLoad(uploadedFile.url).catch(toast.error),
        ]);
        setNewImageLoading(false);

        if (output) URL.revokeObjectURL(output.preview);
        setOutput(null);
        router.refresh();
      },
      onUploadError: () => {
        toast.error("Failed to upload profile picture");
      },
    },
  );
  const imageProperties = expandImageProperties(routeConfig);

  const [output, setOutput] = React.useState<FileWithPreview | null>(null);
  React.useEffect(() => {
    if (file && croppedArea) {
      void cropAndScaleImage(file, croppedArea, imageProperties).then(
        (image) => {
          setOutput(image);
        },
      );
    }
  }, [file, croppedArea, imageProperties]);

  const uploadCroppedImage = async () => {
    if (!croppedArea || !output) return;
    await startUpload([output]);
  };

  return (
    <Card>
      <input
        type="file"
        ref={inputRef}
        accept={generateMimeTypes(routeConfig ?? {}).join(",")}
        className="hidden"
        onChange={(e) => {
          if (!e.target.files?.[0]) return;
          const file = e.target.files[0];
          if (file.type.includes("heic")) {
            const promise = import("heic2any").then(({ default: heic2any }) =>
              heic2any({ blob: file }).then((blob) => {
                const preview = URL.createObjectURL(blob as Blob);
                setFile(Object.assign(file, { preview }));
              }),
            );

            toast.promise(promise, {
              loading: "Converting HEIC to JPEG. Please wait...",
            });
          } else {
            const preview = URL.createObjectURL(file);
            setFile(Object.assign(file, { preview }));
          }
        }}
      />

      <div className="flex justify-between">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a profile picture for your account.
          </CardDescription>
        </CardHeader>
        {!file && (
          <div className="relative p-6">
            {newImageLoading && (
              <div className="absolute inset-6 flex animate-pulse items-center justify-center rounded-2xl bg-black/80" />
            )}
            <img
              src={output?.preview ?? props.user.image ?? "/fallback.svg"}
              onClick={() => inputRef.current?.click()}
              alt="Users Profile Picture"
              className={"size-32 cursor-pointer rounded-2xl hover:opacity-75"}
            />
          </div>
        )}
      </div>
      {file && (
        <CardContent>
          <div className="relative h-full min-h-[400px] w-full">
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 z-100"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <XMarkIcon className="size-5" />
            </Button>
            <Cropper
              maxZoom={5}
              image={file?.preview}
              aspect={imageProperties?.aspectRatio}
              crop={crop}
              zoom={zoom}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, area) => setCroppedArea(area)}
            />
          </div>
        </CardContent>
      )}
      <CardFooter className="justify-between border-t px-6 py-4">
        <p className="text-muted-foreground text-sm">
          {file
            ? "Zoom and Drag to crop the image."
            : props.user.image
              ? "Click on the profile picture to upload a new one."
              : "You do not yet have a profile picture, click on the placeholder to upload one."}
        </p>
        <div className="flex items-center gap-2">
          {file && !isUploading && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              <PhotoIcon className="size-5" />
            </Button>
          )}
          {file && (
            <Button
              size="sm"
              onClick={uploadCroppedImage}
              disabled={isUploading}
            >
              Save
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function waitForImageToLoad(src: string) {
  const maxAttempts = 10;
  let attempt = 0;
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve();
    image.onerror = () => {
      console.error("Failed to load image", src);
      if (attempt++ >= maxAttempts) {
        reject(new Error("Failed to load image"));
      }
      setTimeout(() => {
        image.src = src;
      }, 250);
    };
  });
}

function expandImageProperties(config: ExpandedRouteConfig | undefined) {
  const imageProperties = config?.image?.additionalProperties;
  if (!imageProperties) return;
  const { width, height, aspectRatio } = imageProperties;

  if (width && height) {
    return { width, height, aspectRatio: width / height };
  }

  if (width && aspectRatio) {
    return { width, height: width / aspectRatio, aspectRatio };
  }

  if (height && aspectRatio) {
    return { width: height * aspectRatio, height, aspectRatio };
  }

  if (aspectRatio) {
    return { width: undefined, height: undefined, aspectRatio };
  }
}

const canvasToPreviewImage = async (
  canvas: HTMLCanvasElement,
  imageFile: File,
): Promise<FileWithPreview> => {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Could not convert canvas to blob"));
      }
    }, imageFile.type);
  });

  // SVGs rendered to canvas turns into pngs, match extension
  const name = imageFile.name.replace(/\.svg$/, ".png");

  return Object.assign(new File([blob], name, { type: blob.type }), {
    preview: canvas.toDataURL(imageFile.type),
  });
};

/**
 * Draw image onto canvas using the cropped area.
 * The resulting image should be of size `imageSize`, and  be scaled to fit.
 * Account for the device pixel ratio to ensure the image is crisp when scaled.
 */
const cropAndScaleImage = async (
  imageFile: FileWithPreview,
  crop: Area,
  imageSize?: { width?: number; height?: number },
) => {
  const image = new Image();
  image.src = imageFile.preview;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  /**
   * First, lets crop the image to the desired area.
   */
  const cropCanvas = document.createElement("canvas");
  const ctx = cropCanvas.getContext("2d");

  cropCanvas.width = crop.width;
  cropCanvas.height = crop.height;

  ctx?.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  if (!imageSize?.height || !imageSize.width) {
    return canvasToPreviewImage(cropCanvas, imageFile);
  }
  /**
   * Then, let's scale the cropped image to the desired size.
   */
  const scaledCanvas = document.createElement("canvas");
  const scaledCtx = scaledCanvas.getContext("2d");

  scaledCanvas.width = imageSize?.width;
  scaledCanvas.height = imageSize.height;

  scaledCtx?.drawImage(
    cropCanvas,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height,
    0,
    0,
    imageSize.width,
    imageSize.height,
  );

  return canvasToPreviewImage(scaledCanvas, imageFile);
};
