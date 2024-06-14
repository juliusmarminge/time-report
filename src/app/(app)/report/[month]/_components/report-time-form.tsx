"use client";

import { Temporal } from "@js-temporal/polyfill";
import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import { useAtom } from "jotai";

import { isFuture } from "~/lib/temporal";
import { currencies } from "~/monetary/math";
import type { Client } from "~/trpc/router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/ui/alert-dialog";
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
import { Textarea } from "~/ui/textarea";
import { reportTimeSchema } from "../_validators";
import { reportTimeSheetOpen } from "~/lib/atoms";
import { trpc } from "~/trpc/client";
import { useRouter } from "next/navigation";

export function ReportTimeForm(
  props: Readonly<{
    clients: Client[];
    date?: Temporal.PlainDate;
    afterSubmit?: () => void;
  }>,
) {
  const form = useForm({
    schema: reportTimeSchema,
    defaultValues: {
      date: props.date?.toString(),
      clientId: props.clients[0].id,
      currency: props.clients[0].currency,
      chargeRate: props.clients[0].defaultCharge / 100,
    },
  });

  const router = useRouter();
  const utils = trpc.useUtils();
  const { mutateAsync: reportTime } = trpc.reportTime.useMutation();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await reportTime({
            ...values,
            date: Temporal.PlainDate.from(values.date as string).toString(),
          });
          await utils.invalidate();

          form.reset();
          props.afterSubmit?.();
          router.refresh();
        })}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormDescription>
                Select the client you're reporting time for
              </FormDescription>

              <Select
                onValueChange={(value) => {
                  const client = props.clients.find((c) => c.id === value);
                  field.onChange(value);

                  // Update the default charge and currency to match with the client
                  client?.defaultCharge &&
                    form.setValue("chargeRate", client.defaultCharge / 100);
                  client?.currency &&
                    form.setValue("currency", client.currency);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {props.clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chargeRate"
          render={({ field }) => (
            <FormItem className="flex">
              <FormLabel>Charge rate</FormLabel>
              <FormDescription>
                Your hourly charge for this session.
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
                          <SelectTrigger className="w-24 rounded-none border-none bg-muted px-3 font-mono">
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
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormDescription>
                The duration of the work in hours.
              </FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormDescription>
                A short description of the work you did.
              </FormDescription>
              <FormControl>
                <Textarea {...field} className="h-24" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {form.formState.isSubmitting && <LoadingDots className="mr-2" />}
          Report time
        </Button>
      </form>
    </Form>
  );
}

export function ReportTimeSheet(
  props: Readonly<{
    date: Temporal.PlainDate;
    clients: Client[];
  }>,
) {
  const [open, setOpen] = useAtom(reportTimeSheetOpen);

  const { Root, Trigger, Content, Header, Title } = useResponsiveSheet();

  return (
    <AlertDialog>
      <Root open={open} onOpenChange={setOpen}>
        {props.date && isFuture(props.date) ? (
          <AlertDialogTrigger asChild>
            <Button>Report time</Button>
          </AlertDialogTrigger>
        ) : (
          <Trigger asChild>
            <Button>Report time</Button>
          </Trigger>
        )}
        <Content>
          <Header className="mb-4">
            <Title>Report time</Title>
          </Header>
          <ScrollArea className="h-[65dvh] 2xl:h-auto">
            <ReportTimeForm
              clients={props.clients}
              date={props.date}
              afterSubmit={() => setOpen(false)}
            />
          </ScrollArea>
        </Content>
      </Root>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ExclamationTriangleIcon className="size-5" />
            Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            {"You're about to report time for a future date "}
            <b>({props.date.toString()})</b>.
            {" Are you sure you want to continue?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => setOpen(true)}>
            Yes, continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
