"use client";

import { useCallback, useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import type { FileWithPath } from "@uploadthing/react-dropzone";
import { useDropzone } from "@uploadthing/react-dropzone";

import { currencies } from "~/lib/currencies";
import { useUploadThing } from "~/lib/uploadthing";
import { Button } from "~/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "~/ui/form";
import { Input } from "~/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/sheet";
import { createClient } from "./_actions";
import { createClientSchema } from "./_validators";

export function NewClientForm(props: { afterSubmit?: () => void }) {
  const form = useForm({
    schema: createClientSchema,
    defaultValues: {
      name: "",
      currency: "USD",
    },
  });

  const { startUpload, isUploading } = useUploadThing("clientImage", {
    onClientUploadComplete: (file) => {
      if (!file) return;
      form.setValue("image", file[0].url);
    },
  });

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const onDrop = useCallback((files: FileWithPath[]) => {
    void startUpload(files);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(files[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  console.log(form.watch());

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (data) => {
          await createClient(data);
          form.reset();
          props.afterSubmit?.();
        })}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormDescription>The name of the client.</FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormDescription>
                Select an image to easily identify your client on the app.
              </FormDescription>
              <div
                {...getRootProps()}
                className="relative flex items-center justify-center border border-dashed"
              >
                <input {...getInputProps()} />
                {imageDataUrl ? (
                  <img src={imageDataUrl} className="aspect-auto h-32" />
                ) : (
                  <span className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                    Drop an image here, or click to select
                  </span>
                )}
                {isUploading && (
                  <svg
                    className="absolute bottom-2 right-2 h-6 w-6 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>loading</title>
                    <circle cx="4" cy="12" r="3">
                      <animate
                        id="a"
                        begin="0;b.end-0.25s"
                        attributeName="r"
                        dur="0.75s"
                        values="3;.2;3"
                      />
                    </circle>
                    <circle cx="12" cy="12" r="3">
                      <animate
                        begin="a.end-0.6s"
                        attributeName="r"
                        dur="0.75s"
                        values="3;.2;3"
                      />
                    </circle>
                    <circle cx="20" cy="12" r="3">
                      <animate
                        id="b"
                        begin="a.end-0.45s"
                        attributeName="r"
                        dur="0.75s"
                        values="3;.2;3"
                      />
                    </circle>
                  </svg>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultCharge"
          render={({ field }) => (
            <FormItem className="flex">
              <FormLabel>Charge rate</FormLabel>
              <FormDescription>
                The default charge rate for this client.
              </FormDescription>
              <div className="flex gap-1">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(currencies).map(([code, value]) => (
                          <SelectItem key={code} value={code}>
                            {value.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} type="number" className="flex-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isUploading}>
          Create
        </Button>
      </form>
    </Form>
  );
}

export function NewClientSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline">
          <PlusIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a new client</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <NewClientForm afterSubmit={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
