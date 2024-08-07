"use client";

import { XMarkIcon, PlusIcon } from "@heroicons/react/16/solid";
import { useDropzone } from "@uploadthing/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { cn } from "~/lib/cn";
import { currencies } from "~/monetary/math";
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
import { Input, InputField } from "~/ui/input";
import { LoadingDots } from "~/ui/loading-dots";
import { useResponsiveSheet } from "~/ui/responsive-sheet";
import { ScrollArea } from "~/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";
import { useUploadThing } from "~/uploadthing/client";
import { createClient, deleteImageFromUT } from "../_actions";
import { billingPeriods, createClientSchema } from "../_validators";

export function NewClientForm(props: { afterSubmit?: () => void }) {
  const form = useForm({
    schema: createClientSchema,
    defaultValues: {
      name: "",
      currency: "USD",
      defaultBillingPeriod: "monthly",
    },
  });

  const { startUpload, isUploading } = useUploadThing("clientImage", {
    onClientUploadComplete: (files) => {
      if (!files.length) return;
      console.log("Uploaded files", files);
      form.setValue("image", files[0].url);
    },
    onUploadError: (err) => {
      console.error(err);
      toast.error("File upload failed. Please try again.");
      form.setValue("image", undefined);
    },
  });

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const onDrop = useCallback(
    (files: File[]) => {
      void startUpload(files);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    },
    [startUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if ((event.target as HTMLElement).tagName === "INPUT") {
        // Don't override the default paste behavior in inputs
        return;
      }
      const file = event.clipboardData?.items[0];
      if (file?.type?.startsWith("image/")) {
        const asFile = file.getAsFile();
        asFile && onDrop([asFile]);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [onDrop]);

  async function handleImageDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setImageDataUrl(null);
    form.setValue("image", undefined);
    await deleteImageFromUT(form.getValues("image"));
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (data) => {
          // await createClient(data);
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
              <FormLabel>Name *</FormLabel>
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
                className={cn(
                  "relative flex items-center justify-center border border-dashed",
                  isDragActive && "border-primary",
                )}
              >
                <input {...getInputProps()} />
                {imageDataUrl ? (
                  <>
                    <Button
                      onClick={handleImageDelete}
                      type="button"
                      size="icon"
                      className={cn(
                        "absolute top-2 right-2",
                        isUploading && "hidden",
                      )}
                      variant="destructive"
                    >
                      <XMarkIcon className="size-3" />
                    </Button>
                    <img
                      src={imageDataUrl}
                      className="aspect-auto h-32"
                      alt="Preview of the uploaded file"
                    />
                  </>
                ) : (
                  <span className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                    Drop or paste an image here, or click to select.
                  </span>
                )}
                {isUploading && (
                  <LoadingDots className="absolute right-2 bottom-2" />
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

              <InputField
                {...field}
                leading={
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-max rounded-none border-none bg-muted px-3 font-mono">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <ScrollArea className="h-64">
                            {Object.entries(currencies).map(([code, value]) => (
                              <SelectItem key={code} value={code}>
                                {value.code}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    )}
                  />
                }
              />

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultBillingPeriod"
          render={({ field }) => (
            <FormItem className="flex">
              <FormLabel>Billing period</FormLabel>
              <FormDescription>
                The default billing period for this client. How often you send
                invoices to this client.
              </FormDescription>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {billingPeriods.map((period) => (
                    <SelectItem
                      key={period}
                      value={period}
                      className="capitalize"
                    >
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isUploading}>
          {form.formState.isSubmitting && <LoadingDots className="mr-2" />}
          {isUploading ? "Waiting for upload to finish" : "Create"}
        </Button>
      </form>
    </Form>
  );
}

export function NewClientSheet(props: {
  trigger: "full" | "icon";
  afterSubmit?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const { Root, Trigger, Content, Header, Title } = useResponsiveSheet();

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Trigger asChild>
        {props.trigger === "full" ? (
          <Button>Create a client to report time</Button>
        ) : (
          <Button size="icon" variant="outline">
            <PlusIcon className="h-5 w-5" />
          </Button>
        )}
      </Trigger>
      <Content onOpenAutoFocus={(e) => e.preventDefault()}>
        <Header className="mb-4">
          <Title>Create a new client</Title>
        </Header>
        <ScrollArea className="h-[65dvh]">
          <NewClientForm
            afterSubmit={() => {
              setOpen(false);
              props.afterSubmit?.();
            }}
          />
        </ScrollArea>
      </Content>
    </Root>
  );
}
