"use client";

import { useCallback, useEffect, useState } from "react";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import { useDropzone } from "@uploadthing/react/hooks";

import { LoadingDots } from "~/components/loading-dots";
import { cn } from "~/lib/cn";
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
import { useResponsiveSheet } from "~/ui/responsive-sheet";
import { ScrollArea } from "~/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";
import { createClient, deleteImageFromUT } from "../_actions";
import { createClientSchema } from "../_validators";

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
    onClientUploadComplete: (file) => {
      if (!file) return;
      form.setValue("image", file[0].url);
    },
  });

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const onDrop = useCallback((files: File[]) => {
    void startUpload(files);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(files[0]);
  }, []);

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
    await deleteImageFromUT(form.getValues("image"));
    setImageDataUrl(null);
    form.setValue("image", undefined);
  }

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
                      size="icon"
                      className={cn(
                        "absolute right-2 top-2",
                        isUploading && "hidden",
                      )}
                      variant="destructive"
                    >
                      <Cross1Icon className="h-2 w-2" />
                    </Button>
                    <img src={imageDataUrl} className="aspect-auto h-32" />
                  </>
                ) : (
                  <span className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                    Drop or paste an image here, or click to select.
                  </span>
                )}
                {isUploading && (
                  <LoadingDots className="absolute bottom-2 right-2" />
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
                  {["weekly", "biweekly", "monthly"].map((period) => (
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
        <Header>
          <Title>Create a new client</Title>
        </Header>
        <div className="p-4">
          <NewClientForm
            afterSubmit={() => {
              setOpen(false);
              props.afterSubmit?.();
            }}
          />
        </div>
      </Content>
    </Root>
  );
}
